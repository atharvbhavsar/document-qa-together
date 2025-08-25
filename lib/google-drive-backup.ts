import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google Drive OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// OAuth2 Scopes for Google Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
];

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
    
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth2 URL for user authentication
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      include_granted_scopes: true,
      state: 'dev_mode'
    });
  }

  /**
   * Set OAuth2 credentials from authorization code
   */
  async setCredentials(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error setting OAuth2 credentials:', error);
      
      // Handle specific OAuth errors
      if (error instanceof Error) {
        if (error.message.includes('invalid_grant')) {
          throw new Error('invalid_grant');
        }
        if (error.message.includes('access_denied')) {
          throw new Error('access_denied');
        }
        if (error.message.includes('restricted_client')) {
          throw new Error('restricted_client');
        }
        if (error.message.includes('invalid_client')) {
          throw new Error('invalid_client');
        }
      }
      
      throw new Error('auth_failed');
    }
  }

  /**
   * Set OAuth2 credentials from tokens
   */
  setTokens(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get authenticated user information
   */
  async getUserInfo() {
    try {
      const response = await this.drive.about.get({
        fields: 'user'
      });
      return response.data.user;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * List files in Google Drive
   */
  async listFiles(folderId?: string, pageSize = 1000) {
    try {
      const query = folderId 
        ? `'${folderId}' in parents and trashed = false`
        : "trashed = false";
      
      const response = await this.drive.files.list({
        q: query,
        pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, parents, webViewLink)',
        orderBy: 'modifiedTime desc'
      });

      return response.data;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get file content as buffer
   */
  async getFileContent(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error getting file content:', error);
      throw new Error('Failed to get file content');
    }
  }

  /**
   * Export Google Docs/Sheets/Slides to specific format
   */
  async exportFile(fileId: string, mimeType: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.export({
        fileId,
        mimeType
      }, { responseType: 'arraybuffer' });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error exporting file:', error);
      throw new Error('Failed to export file');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string) {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink, parents'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Search files by query
   */
  async searchFiles(query: string, pageSize = 100) {
    try {
      const response = await this.drive.files.list({
        q: `name contains '${query}' and trashed = false`,
        pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, parents, webViewLink)',
        orderBy: 'modifiedTime desc'
      });

      return response.data;
    } catch (error) {
      console.error('Error searching files:', error);
      throw new Error('Failed to search files');
    }
  }

  /**
   * Get file permissions
   */
  async getFilePermissions(fileId: string) {
    try {
      const response = await this.drive.permissions.list({
        fileId,
        fields: 'permissions(id, role, type, emailAddress)'
      });

      return response.data.permissions;
    } catch (error) {
      console.error('Error getting file permissions:', error);
      throw new Error('Failed to get file permissions');
    }
  }

  /**
   * Check if file is accessible
   */
  async isFileAccessible(fileId: string): Promise<boolean> {
    try {
      await this.drive.files.get({
        fileId,
        fields: 'id'
      });
      return true;
    } catch (error) {
      console.error('File not accessible:', error);
      return false;
    }
  }

  /**
   * Get folder structure
   */
  async getFolderStructure(folderId = 'root', depth = 0, maxDepth = 3): Promise<any> {
    if (depth > maxDepth) return null;

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
        orderBy: 'name'
      });

      const items = response.data.files || [];
      const structure = {
        id: folderId,
        children: []
      };

      for (const item of items) {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          const subFolder = await this.getFolderStructure(item.id!, depth + 1, maxDepth);
          structure.children.push({
            ...item,
            children: subFolder?.children || []
          });
        } else {
          structure.children.push(item);
        }
      }

      return structure;
    } catch (error) {
      console.error('Error getting folder structure:', error);
      throw new Error('Failed to get folder structure');
    }
  }
}

export default GoogleDriveService;
