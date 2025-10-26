# LexiFlow AI - PDF Extraction Feature Setup Instructions

This guide will help you set up the PDF extraction and storage feature with MongoDB, PyMuPDF, and Tesseract OCR.

## Prerequisites

1. **Python 3.9+** installed
2. **Node.js 14+** and npm installed
3. **MongoDB** installed and running
4. **Tesseract OCR** installed

## Installation Steps

### 1. Install MongoDB

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Ubuntu/Debian:
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Windows:
Download and install from: https://www.mongodb.com/try/download/community

### 2. Install Tesseract OCR

#### macOS:
```bash
brew install tesseract
```

#### Ubuntu/Debian:
```bash
sudo apt-get install -y tesseract-ocr
sudo apt-get install -y libtesseract-dev
```

#### Windows:
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

**Important for Windows:** Add Tesseract to your PATH or set the path in code:
```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### 3. Install Python Dependencies

Navigate to the Backend directory:
```bash
cd Backend
```

Activate the virtual environment (if not already activated):
```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Install the new dependencies:
```bash
pip install -r requirements.txt
```

### 4. Verify MongoDB Connection

Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh  # or mongo (for older versions)
```

You should see the MongoDB shell. Type `exit` to quit.

### 5. Start the Backend Server

From the Backend directory:
```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend should start and you should see:
```
🚀 Starting LexiFlow AI Backend...
✅ Database initialized successfully
✅ Connected to MongoDB: lexiflow
✅ MongoDB collections initialized
✅ Running in development mode
```

### 6. Start the Frontend

Open a new terminal and navigate to the Frontend directory:
```bash
cd Frontend
npm install  # if not already installed
npm start
```

The frontend should open at http://localhost:3000

## Feature Overview

### What This Feature Does:

1. **PDF Upload**: Users can upload PDF files through the dashboard
2. **Content Extraction**: 
   - Uses PyMuPDF to extract text and embedded images
   - Uses Tesseract OCR for scanned pages or images
   - Preserves document structure and layout
3. **MongoDB Storage**: 
   - Stores extracted content as structured blocks
   - Each block has position, type, order, and editability info
   - Original page images are stored as base64
4. **Editable Display**:
   - Content is displayed in the same order as the PDF
   - Text blocks are clickable and editable
   - Changes are saved back to MongoDB
   - Images are displayed inline with text

### API Endpoints Created:

- `POST /pdf/upload` - Upload and process PDF
- `GET /pdf/documents` - Get all user documents
- `GET /pdf/document/{id}` - Get specific document with full content
- `GET /pdf/document/{id}/page/{page_number}` - Get specific page
- `PUT /pdf/document/{id}/content` - Update content block
- `DELETE /pdf/document/{id}` - Delete document

## Testing the Feature

1. **Upload a PDF**:
   - Click "Upload Document" in the dashboard
   - Select a PDF file
   - Watch the OCR processing animation

2. **View Content**:
   - After processing, you'll see the document in the Reader
   - Toggle between "Original" and "Reflow" views
   - Original shows the rendered page image
   - Reflow shows extracted editable text

3. **Edit Content**:
   - In Reflow mode, click any paragraph
   - Edit the text in the textarea
   - Click "Save" to persist changes
   - Changes are stored in MongoDB

4. **View All Documents**:
   - Return to dashboard to see all uploaded PDFs
   - Each shows title, page count, size, and upload date

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod  # macOS/Linux
tasklist | findstr mongod  # Windows

# Start MongoDB if not running
brew services start mongodb-community  # macOS
sudo systemctl start mongodb  # Linux
```

### Tesseract Not Found
```bash
# Check if Tesseract is installed
tesseract --version

# If not found, install it (see step 2 above)
```

### PyMuPDF Installation Issues
```bash
# If PyMuPDF fails to install, try:
pip install --upgrade pip
pip install PyMuPDF==1.23.8
```

### Backend Not Starting
```bash
# Check all dependencies are installed
pip list | grep pymongo
pip list | grep pymupdf
pip list | grep pytesseract

# Reinstall if needed
pip install -r requirements.txt --force-reinstall
```

## Database Structure

### MongoDB Collection: `documents`

Each document has:
```json
{
  "_id": "ObjectId",
  "title": "Document Title",
  "filename": "document.pdf",
  "user_id": 123,
  "total_pages": 10,
  "file_size": 1048576,
  "uploaded_at": "2024-01-01T00:00:00",
  "processed_at": "2024-01-01T00:01:00",
  "pages": [
    {
      "page_number": 1,
      "content_blocks": [
        {
          "type": "paragraph",
          "content": "Text content",
          "page_number": 1,
          "position": {"x": 50, "y": 100, "width": 500, "height": 50},
          "order": 0,
          "is_editable": true,
          "metadata": {"ocr": false}
        }
      ],
      "original_image": "data:image/png;base64,...",
      "has_ocr": false,
      "ocr_confidence": null
    }
  ],
  "metadata": {
    "original_filename": "document.pdf",
    "content_type": "application/pdf"
  }
}
```

## Configuration

### Backend (.env file)
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=lexiflow
```

### Frontend (api.js)
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Performance Notes

- **OCR Processing**: Can take 1-3 seconds per page depending on complexity
- **Large PDFs**: Files over 50MB may take longer to process
- **Image Storage**: Base64 encoding increases storage size by ~33%
- **MongoDB**: Consider indexing for large document collections

## Next Steps

To enhance this feature, consider:
1. Implementing background job processing for large PDFs
2. Adding PDF download functionality
3. Implementing collaborative editing
4. Adding version history for edits
5. Optimizing image compression
6. Adding full-text search across documents

## Support

If you encounter any issues:
1. Check the backend logs for error messages
2. Verify all dependencies are installed correctly
3. Ensure MongoDB is running and accessible
4. Check browser console for frontend errors

