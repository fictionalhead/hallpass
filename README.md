# Hall Pass Generator

A simple hall pass generator application built with vanilla JavaScript and Netlify Functions for persistent storage.

## Features

- Generate printable hall passes
- Configurable pass template (school name, locations, styling)
- Persistent storage using Netlify Blobs
- Local storage fallback
- Pass history log
- Automatic printing dialog

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run locally with Netlify Dev:
```bash
npm run dev
```

The app will be available at http://localhost:8888

## Configuration

Edit `public/config.js` to customize:
- School name and pass title
- Available locations
- Pass dimensions (for printing)
- Pass styling (colors, borders, fonts)
- Date and time formats
- Location icons

## Deployment

1. Push to a Git repository
2. Connect to Netlify
3. Deploy will happen automatically

The Netlify Functions will handle:
- Storing passes in Netlify Blobs
- Retrieving pass history
- Archiving passes by date

## Project Structure

```
hallpass-app/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML
│   ├── app.js            # Application logic
│   ├── styles.css        # Styling
│   └── config.js         # Configuration file
├── netlify/
│   └── functions/         # Serverless functions
│       ├── log-pass.js   # Save passes to blob storage
│       └── get-logs.js   # Retrieve pass history
├── netlify.toml          # Netlify configuration
└── package.json          # Dependencies
```

## API Endpoints

- `POST /api/log-pass` - Save a new hall pass
- `GET /api/get-logs` - Retrieve pass history
  - Optional query params: `date`, `limit`

## Local Storage Fallback

If the backend is unavailable, the app will use browser local storage to maintain pass history during the session.