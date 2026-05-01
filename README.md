# MergeMate - Smart PDF Merger

MergeMate is a full-stack file utility for merging and converting supported files through a clean authenticated web interface.

Live website: https://marge-pdf.vercel.app/

## Overview

Users can register or log in, upload supported files, merge multiple files into one output, or convert a single supported file into another downloadable format.

The project is deployed with:

- Frontend: Vercel
- Backend API: Render
- Database: MongoDB Atlas

## Features

- User registration and login with JWT authentication
- Merge mode for combining two or more files
- Convert mode for processing one file
- Drag-and-drop file upload
- Supports PDF, Word `.docx`, PNG, JPG, and JPEG uploads
- Download output as PDF or Word `.docx`
- Backend file handling with memory uploads
- CORS configured for the deployed Vercel frontend

## Important Note

PDF output is the best option for preserving PDF pages.

Word output can include extracted text from Word and text-based PDF files, plus uploaded images. Scanned/image-only PDFs need OCR for editable text extraction.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- multer
- pdf-lib
- mammoth

## Project Structure

```text
merge_pdf/
  client/   -> React + Vite frontend
  server/   -> Express API, authentication, file merge/convert routes
```

## Live URLs

Frontend:

```text
https://marge-pdf.vercel.app/
```

Backend:

```text
https://marge-pdf-backend.onrender.com/
```

API base URL used by frontend:

```text
https://marge-pdf-backend.onrender.com/api
```

## Local Setup

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_long_random_secret
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

Backend health check:

```text
http://localhost:5000/
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Deployment Setup

### Render Backend

Deploy the `server` folder as a Render Web Service.

Render settings:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Render environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=https://marge-pdf.vercel.app
```

### Vercel Frontend

Deploy the `client` folder to Vercel.

Vercel settings:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Vercel environment variable:

```env
VITE_API_BASE_URL=https://marge-pdf-backend.onrender.com/api
```

After changing environment variables, redeploy the Vercel project.

## API Endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/pdf/merge
```

`POST /api/pdf/merge` requires a bearer token.

## Usage

1. Open https://marge-pdf.vercel.app/
2. Register or log in.
3. Choose Merge PDFs or Convert PDF.
4. Upload supported files.
5. Select PDF or Word output.
6. Generate and download the final file.
