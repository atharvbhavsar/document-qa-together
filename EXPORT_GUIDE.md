# Export Functionality - User Guide

## Overview
The Document Q&A Chatbot now includes comprehensive export functionality that allows users to save chat conversations in multiple formats:
- **PDF Export** - Download conversations as formatted PDF documents
- **Word Export** - Save conversations as Microsoft Word documents (.docx)
- **Email Export** - Send conversations via email with optional PDF/Word attachments

## How to Use

### Accessing Export Options
1. Look for the **Export** button in the chat interface header (next to the Clear History button)
2. Click the Export button to see the dropdown menu with three options:
   - Export to PDF
   - Export to Word
   - Send via Email

### PDF Export
- **Quick Export**: Click "Export to PDF" for immediate download with default settings
- **Custom Options**: 
  - Include timestamps
  - Add page numbers
  - Custom page margins
  - Different paper sizes (A4, Letter, Legal)

### Word Export
- **Quick Export**: Click "Export to Word" for immediate download
- **Custom Options**:
  - Include timestamps
  - Custom fonts and styling
  - Document metadata

### Email Export
- **Setup Required**: Configure email settings in `.env.local` file (see setup section below)
- **Options**:
  - Send conversation as email text
  - Attach PDF version
  - Attach Word document
  - Custom recipient and subject
  - Additional message content

## Email Configuration

To enable email functionality, update your `.env.local` file with your email provider settings:

```env
# Email Configuration for Export Feature
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
   - Use this password in `EMAIL_PASS`

### Other Email Providers
Update the `EMAIL_HOST` and `EMAIL_PORT` according to your provider:
- **Outlook/Hotmail**: `smtp.live.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's SMTP settings

## Features

### PDF Export Features
- Clean, professional formatting
- Conversation flow with clear message separation
- User/Assistant message distinction
- Timestamp options
- Page numbering
- Custom margins and paper sizes
- Automatic page breaks

### Word Export Features
- Native .docx format
- Preserves text formatting
- Table-based layout for clear conversation structure
- Custom styling options
- Document metadata
- Compatible with Microsoft Word and Google Docs

### Email Features
- Server-side email processing
- Secure attachment handling
- Multiple attachment formats
- Custom email templates
- Error handling and validation
- Support for HTML and plain text emails

## Technical Implementation

### Client-Side Components
- `ExportButtonAdvanced.tsx` - Main UI component with dropdown and modals
- `export-utils.ts` - Core export logic and document generation

### Server-Side API
- `/api/export/email` - Email processing endpoint
- Attachment generation and sending
- SMTP configuration and error handling

### Dependencies
- **jsPDF** - PDF generation
- **docx** - Word document creation
- **nodemailer** - Email functionality
- **html2canvas** - Supporting library for PDF rendering

## Troubleshooting

### Common Issues
1. **Email not sending**: Check SMTP credentials and network connectivity
2. **Large file attachments**: Consider conversation length limits
3. **PDF formatting**: Ensure proper HTML structure in chat messages
4. **Word compatibility**: Test with different Word versions if needed

### Error Messages
- "Email configuration required": Update `.env.local` with email settings
- "Failed to generate document": Check conversation data format
- "SMTP Authentication failed": Verify email credentials

## Security Notes
- Email credentials are stored server-side only
- Attachments are generated temporarily and not stored
- All exports respect user privacy
- No conversation data is logged during export

## Browser Compatibility
- **PDF Export**: All modern browsers
- **Word Export**: All modern browsers
- **Email Export**: Requires server-side functionality (all browsers supported)

## Usage Tips
1. Test email configuration with a simple conversation first
2. Use shorter conversations for faster export processing
3. PDF exports work best with text-based conversations
4. Word exports preserve more formatting options
5. Email exports are great for sharing conversations with team members
