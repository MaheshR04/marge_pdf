# MergeMate - PDF Merger (React + Tailwind + Node + MongoDB)

A fast starter project to merge multiple files with a clean UI, working authentication, and a real downloadable merged PDF.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Auth: JWT + bcrypt
- Database: MongoDB Atlas (via Mongoose)
- PDF Merge: `pdf-lib` + `multer` (memory upload)

## Project Structure

```text
merge_pdf/
  client/   -> React UI
  server/   -> API + Auth + PDF merge
```

## 1) Backend Setup

```bash
cd server
npm install
copy .env.example .env
```

Update `server/.env`:

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

## 2) Frontend Setup

```bash
cd client
npm install
copy .env.example .env
```

Update `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend Health: `http://localhost:5000/`

## Working Features

- Component-based React UI with responsive navbar and polished styling
- Functional Register and Login connected to MongoDB Atlas
- JWT-based authenticated sessions
- Upload multiple files (PDF + Word `.docx`) and merge on server
- Download button returns and downloads merged PDF correctly

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/pdf/merge` (requires bearer token)

## Notes

- Merge requires at least 2 files.
- Supported formats: PDF and Word (`.docx`).
- If login/register fails, verify MongoDB URI and backend `.env`.
- If CORS issue appears, ensure `CLIENT_URL` is `http://localhost:5173`.
