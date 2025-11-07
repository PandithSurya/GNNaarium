# Setup Instructions

## Quick Start (Recommended)

### Automated Setup
```bash
start_full_app.bat
```
This batch file automatically starts both the backend and frontend servers.

## Manual Setup

### Backend Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start the backend server:**
```bash
python run.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Access Points

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

## Requirements

- **Python**: 3.8 or higher
- **Node.js**: 14 or higher
- **npm**: 6 or higher

## Troubleshooting

- Ensure both Python and Node.js are installed and accessible from your command line
- Check that ports 3000 and 8000 are not in use by other applications
- If you encounter dependency issues, try updating pip and npm to their latest versions