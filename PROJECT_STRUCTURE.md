# LexiFlow AI - Project Structure

Complete file structure and organization of the LexiFlow AI project.

## 📁 Directory Tree

```
LexiFlow-AI/
│
├── 📄 README.md                          # Main project documentation
├── 📄 BACKEND_SETUP.md                   # Backend quick start guide
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 package-lock.json                  # Root package lock
│
├── 📂 Frontend/                          # React Frontend Application
│   ├── 📂 public/                       # Static assets
│   │   ├── index.html                   # HTML template
│   │   └── manifest.json                # PWA manifest
│   │
│   ├── 📂 src/                          # Source code
│   │   ├── 📂 components/              # React components
│   │   │   ├── Home.js                 # Landing page
│   │   │   ├── Home.css                # Landing page styles
│   │   │   ├── Login.js                # Login component
│   │   │   ├── Login.css               # Login styles
│   │   │   ├── Register.js             # Registration component
│   │   │   ├── Register.css            # Registration styles
│   │   │   ├── Dashboard.js            # Main dashboard
│   │   │   ├── Dashboard.css           # Dashboard styles
│   │   │   ├── OCRProcessing.js        # OCR processing UI
│   │   │   ├── OCRProcessing.css       # OCR styles
│   │   │   ├── PDFChatbot.js           # AI chatbot interface
│   │   │   ├── PDFChatbot.css          # Chatbot styles
│   │   │   ├── Reader.js               # PDF reader
│   │   │   └── Reader.css              # Reader styles
│   │   │
│   │   ├── App.js                      # Main App component
│   │   ├── App.css                     # App styles
│   │   ├── index.js                    # Entry point
│   │   └── index.css                   # Global styles
│   │
│   ├── 📂 build/                        # Production build (generated)
│   ├── 📂 node_modules/                 # Dependencies (generated)
│   ├── package.json                     # Frontend dependencies
│   ├── package-lock.json               # Dependency lock
│   └── README.md                       # Frontend documentation
│
└── 📂 Backend/                          # FastAPI Backend Application
    ├── 📂 routers/                      # API route modules
    │   ├── __init__.py                 # Router package init
    │   └── auth.py                     # Authentication routes
    │
    ├── 📄 main.py                       # Application entry point
    ├── 📄 config.py                     # Configuration management
    ├── 📄 database.py                   # Database setup & operations
    ├── 📄 models.py                     # Pydantic models
    ├── 📄 auth.py                       # Authentication utilities
    │
    ├── 📄 requirements.txt              # Python dependencies
    ├── 📄 .env                          # Environment variables (gitignored)
    ├── 📄 .env.example                  # Environment template
    ├── 📄 .gitignore                    # Git ignore rules
    │
    ├── 📄 setup.sh                      # Setup script (executable)
    ├── 📄 run.sh                        # Run script (executable)
    ├── 📄 test_api.py                   # API testing script
    │
    ├── 📄 README.md                     # Detailed backend docs
    ├── 📄 ARCHITECTURE.md               # Architecture documentation
    ├── 📄 frontend_integration_example.js # Integration guide
    │
    └── 📄 lexiflow.db                   # SQLite database (generated)
```

## 📋 File Descriptions

### Root Level Files

| File | Purpose | Type |
|------|---------|------|
| `README.md` | Main project documentation | Documentation |
| `BACKEND_SETUP.md` | Quick start guide for backend | Documentation |
| `PROJECT_STRUCTURE.md` | This file - project structure | Documentation |

### Frontend Files

#### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `package-lock.json` | Locked dependency versions |
| `public/index.html` | HTML template |
| `public/manifest.json` | PWA configuration |

#### Source Files
| File | Purpose |
|------|---------|
| `src/index.js` | Application entry point |
| `src/App.js` | Root component with routing |
| `src/components/Home.js` | Landing page component |
| `src/components/Login.js` | User login interface |
| `src/components/Register.js` | User registration interface |
| `src/components/Dashboard.js` | Main dashboard after login |
| `src/components/OCRProcessing.js` | OCR processing interface |
| `src/components/PDFChatbot.js` | AI chatbot for PDFs |
| `src/components/Reader.js` | PDF reading interface |

### Backend Files

#### Core Application Files
| File | Purpose | Lines |
|------|---------|-------|
| `main.py` | FastAPI application entry point | ~150 |
| `config.py` | Settings and configuration | ~40 |
| `database.py` | Database connection and setup | ~80 |
| `models.py` | Pydantic models for validation | ~100 |
| `auth.py` | Authentication utilities | ~180 |

#### Routers
| File | Purpose | Endpoints |
|------|---------|-----------|
| `routers/__init__.py` | Router package initialization | - |
| `routers/auth.py` | Authentication endpoints | 4 |

#### Configuration Files
| File | Purpose |
|------|---------|
| `requirements.txt` | Python dependencies |
| `.env` | Environment variables (not in git) |
| `.env.example` | Environment template |
| `.gitignore` | Git ignore patterns |

#### Scripts
| File | Purpose | Executable |
|------|---------|------------|
| `setup.sh` | Automated setup script | ✅ Yes |
| `run.sh` | Quick run script | ✅ Yes |
| `test_api.py` | API testing script | ✅ Yes |

#### Documentation
| File | Purpose | Pages |
|------|---------|-------|
| `README.md` | Detailed backend documentation | ~15 |
| `ARCHITECTURE.md` | System architecture details | ~10 |
| `frontend_integration_example.js` | Integration code examples | ~8 |

#### Generated Files
| File | Purpose | In Git |
|------|---------|--------|
| `lexiflow.db` | SQLite database | ❌ No |
| `__pycache__/` | Python bytecode | ❌ No |

## 🎯 Key Components

### Frontend Components

```
┌─────────────────────────────────────────┐
│           React Application             │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────┐  ┌────────────┐       │
│  │   Home     │→ │   Login    │       │
│  │  Landing   │  │   Auth     │       │
│  └────────────┘  └────────────┘       │
│                         ↓               │
│                  ┌────────────┐        │
│                  │ Dashboard  │        │
│                  │  Main Hub  │        │
│                  └────────────┘        │
│                         ↓               │
│       ┌─────────────────┼─────────────┐│
│       ↓                 ↓             ↓││
│  ┌────────┐      ┌──────────┐  ┌──────┐│
│  │  OCR   │      │   Chat   │  │Reader││
│  │Process │      │   bot    │  │ View ││
│  └────────┘      └──────────┘  └──────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Backend Structure

```
┌─────────────────────────────────────────┐
│         FastAPI Application             │
├─────────────────────────────────────────┤
│                                         │
│  main.py                                │
│    ├─ CORS Middleware                  │
│    ├─ Exception Handlers               │
│    └─ Router Registration              │
│                                         │
│  config.py                              │
│    └─ Environment Settings             │
│                                         │
│  auth.py                                │
│    ├─ Password Hashing                 │
│    ├─ JWT Token Management             │
│    └─ User Authentication              │
│                                         │
│  models.py                              │
│    ├─ UserCreate                       │
│    ├─ UserLogin                        │
│    ├─ UserResponse                     │
│    └─ Token Models                     │
│                                         │
│  database.py                            │
│    ├─ Connection Management            │
│    └─ Schema Initialization            │
│                                         │
│  routers/                               │
│    └─ auth.py                          │
│         ├─ POST /auth/register         │
│         ├─ POST /auth/login            │
│         ├─ GET /auth/me                │
│         └─ GET /auth/verify            │
│                                         │
└─────────────────────────────────────────┘
```

## 📊 Statistics

### Frontend
- **Components**: 7 main components
- **Routes**: 6 routes
- **Dependencies**: ~20 packages
- **Total Lines**: ~2,500 lines

### Backend
- **Modules**: 7 core modules
- **Routers**: 1 (auth)
- **Endpoints**: 6 total (2 public + 4 auth)
- **Dependencies**: 9 packages
- **Total Lines**: ~800 lines
- **Documentation**: ~1,200 lines

### Documentation
- **README files**: 4
- **Documentation pages**: ~50 pages
- **Code examples**: 15+
- **Diagrams**: 5

## 🔄 Data Flow

```
Frontend Request
      ↓
   API Call (axios)
      ↓
Backend Endpoint (FastAPI)
      ↓
   Validation (Pydantic)
      ↓
Authentication Check (JWT)
      ↓
   Business Logic
      ↓
Database Query (SQLite)
      ↓
   Response (JSON)
      ↓
Frontend Update (React State)
```

## 🚀 Deployment Structure

### Development
```
localhost:3000 (Frontend)
      ↓
localhost:8000 (Backend)
      ↓
   lexiflow.db (SQLite)
```

### Production (Future)
```
yourdomain.com (Frontend - Static)
      ↓
api.yourdomain.com (Backend - Server)
      ↓
PostgreSQL/MySQL (Production DB)
```

## 📦 Dependencies

### Frontend Dependencies (package.json)
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x"
}
```

### Backend Dependencies (requirements.txt)
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.0
```

## 🔐 Security Files

| File | Purpose | In Git |
|------|---------|--------|
| `.env` | Actual secrets | ❌ No |
| `.env.example` | Template | ✅ Yes |
| `.gitignore` | Ignore rules | ✅ Yes |
| `lexiflow.db` | Database with user data | ❌ No |

## 📝 Notes

### Files to Customize
1. **Backend/.env** - Update SECRET_KEY for production
2. **Frontend/src/services/api.js** - Add API integration (to be created)
3. **Backend/config.py** - Update CORS origins if needed

### Generated Files (Not in Git)
- `Backend/lexiflow.db` - Database file
- `Backend/__pycache__/` - Python cache
- `Backend/venv/` - Virtual environment
- `Frontend/node_modules/` - NPM packages
- `Frontend/build/` - Production build

### Executable Scripts
- `Backend/setup.sh` - Run to set up backend
- `Backend/run.sh` - Run to start backend server
- `Backend/test_api.py` - Run to test API

## 🎓 Learning Resources

Each major file includes:
- ✅ Inline comments explaining functionality
- ✅ Type hints for better IDE support
- ✅ Docstrings for functions and classes
- ✅ Example usage in comments

---

**Last Updated:** October 2025  
**Total Files**: ~40  
**Total Lines of Code**: ~3,500  
**Documentation Lines**: ~1,200  

