export interface DriveDocument {
  id: string;
  name: string;
  content: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  chunks: DocumentChunk[];
  pageCount?: number;
  processingError?: string | null;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    fileId: string;
    fileName: string;
    chunkIndex: number;
    page: number;
    totalPages: number;
    source: string;
  };
}

export interface PDFExtractText {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontName: string;
}

export interface PDFExtractPage {
  content: PDFExtractText[];
  pageInfo: {
    num: number;
    scale: number;
    width: number;
    height: number;
  };
}

export interface PDFExtractResult {
  pages: PDFExtractPage[];
  meta: {
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsCollectionPresent: boolean;
      IsLinearized: boolean;
      IsXFAPresent: boolean;
    };
    metadata: string[] | null;
  };
}
