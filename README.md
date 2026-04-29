# Campus Complaint Reporting & Management System - Backend

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your values
4. Start the server:
   ```bash
   npm run dev
   ```

## Project Structure
- `controllers/` - Business logic
- `models/` - Mongoose schemas
- `routes/` - API endpoints
- `middleware/` - Auth, validation, etc.
- `services/` - Email, notification, AI/NLP, etc.
- `utils/` - Helper functions
- `config/` - DB and environment config
- `uploads/` - Uploaded images

## Health Check
- `GET /api/health` - Returns API status
