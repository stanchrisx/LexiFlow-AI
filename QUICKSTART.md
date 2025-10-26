# LexiFlow AI - Quick Start Guide

## Fast Setup (5 Minutes)

### Prerequisites Check
```bash
# Check Python version (need 3.9+)
python3 --version

# Check Node.js version (need 14+)
node --version

# Check if MongoDB is installed
mongod --version

# Check if Tesseract is installed
tesseract --version
```

### Install Missing Prerequisites

**MongoDB:**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Tesseract OCR:**
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr libtesseract-dev
```

### Backend Setup
```bash
cd Backend

# Run the installation script
./install_dependencies.sh

# Or manually:
source venv/bin/activate
pip install -r requirements.txt

# Start the backend
python main.py
```

**Expected Output:**
```
🚀 Starting LexiFlow AI Backend...
✅ Database initialized successfully
✅ Connected to MongoDB: lexiflow
✅ MongoDB collections initialized
✅ Running in development mode
```

### Frontend Setup
```bash
# Open a new terminal
cd Frontend

# Install dependencies (if not already done)
npm install

# Start the frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view frontend in the browser.
  Local: http://localhost:3000
```

## Using the Feature

### 1. Login/Register
- Go to http://localhost:3000
- Register a new account or login
- You'll be redirected to the dashboard

### 2. Upload a PDF
- Click "Upload Document" button
- Select a PDF file (any PDF works)
- Wait for processing (shows progress)
- Automatically redirects to Reader

### 3. View Content
- **Original Mode**: Shows the rendered PDF page
- **Reflow Mode**: Shows extracted, editable text
- Toggle between modes using the header buttons

### 4. Edit Content
- Switch to Reflow mode
- Click any paragraph to edit
- Type your changes
- Click "Save" to persist
- Changes are stored in MongoDB

### 5. View All Documents
- Click back arrow to return to dashboard
- See all your uploaded PDFs
- Click any PDF to open it

## Test PDFs

Try with different PDF types:
- **Native PDF**: PDFs created digitally (Word, Pages, etc.)
  - Text extracted directly, very fast
  
- **Scanned PDF**: PDFs from scanners/photos
  - Uses OCR, takes a bit longer
  - Look for "OCR" badge on content
  
- **Mixed PDF**: Both types combined
  - Handles both automatically

## API Testing

Test the API directly:

```bash
# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
  }'
# Save the access_token from response

# Upload a PDF
curl -X POST http://localhost:8000/pdf/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.pdf"

# Get all documents
curl http://localhost:8000/pdf/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Verify MongoDB Data

```bash
# Open MongoDB shell
mongosh

# Use the lexiflow database
use lexiflow

# Check collections
show collections

# View a document
db.documents.findOne()

# Count documents
db.documents.countDocuments()

# Exit
exit
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill the process if needed
kill -9 PID

# Check MongoDB is running
brew services list | grep mongodb
ps aux | grep mongod
```

### Frontend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear npm cache if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Upload Fails
- Check file size (default limit: 50MB)
- Verify file is a valid PDF
- Check backend logs for errors
- Ensure MongoDB is running

### OCR Not Working
```bash
# Verify Tesseract installation
tesseract --version

# Check if it's in PATH
which tesseract

# Test OCR manually
tesseract test-image.png output
```

## Environment Variables

Create/edit `Backend/.env`:
```env
SECRET_KEY=your-secret-key-here
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=lexiflow
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Next Steps

✅ Feature is working? Great! Now you can:

1. **Read the full documentation:**
   - `PDF_EXTRACTION_FEATURE.md` - Technical details
   - `SETUP_INSTRUCTIONS.md` - Detailed setup

2. **Customize:**
   - Adjust OCR settings in `pdf_extraction_service.py`
   - Modify UI in `Dashboard.js` and `Reader.js`
   - Add more API endpoints in `routers/pdf.py`

3. **Deploy:**
   - Set up production MongoDB
   - Configure environment variables
   - Deploy backend to server
   - Deploy frontend to hosting

4. **Extend:**
   - Add more PDF features
   - Implement collaborative editing
   - Add AI-powered features
   - Build mobile app

## Support

Having issues? Check:
1. All services are running (MongoDB, Backend, Frontend)
2. Dependencies are installed correctly
3. Environment variables are set
4. Ports 3000 and 8000 are available

Still stuck? Review the logs:
- Backend: Check terminal output
- Frontend: Check browser console
- MongoDB: Check MongoDB logs

## Summary

You now have a fully functional PDF extraction system that:
- ✅ Uploads PDFs
- ✅ Extracts text with PyMuPDF
- ✅ Performs OCR with Tesseract
- ✅ Stores in MongoDB
- ✅ Displays editables content
- ✅ Saves user edits

**Happy coding! 🚀**

