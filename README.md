# Examination Module

This is a practical assignment project for Robokalam. It includes a backend API, PostgreSQL database integration, JWT authentication, CRUD APIs, automatic score calculation, simple analytics, and a frontend UI.

## Tech Stack

- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: JWT with bcrypt password hashing
- Validation: express-validator
- Frontend: HTML, CSS, JavaScript
- Database helper: Docker Compose for local PostgreSQL

## Features

- Register student users and login users.
- Role-based access for admins and students.
- Admin CRUD APIs for exams.
- Admin CRUD APIs for questions.
- Students can view exams and submit answers.
- Automatic score calculation.
- Student result history.
- Simple frontend that calls backend APIs.

## Folder Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── db
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── docs
│   ├── api-examples.http
│   ├── SCREENSHOTS.md
│   └── VIDEO_SCRIPT.md
└── docker-compose.yml
```

## How to Run

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:init
npm run seed
npm run dev
```

Backend runs at:

```text
http://localhost:5001
```

Seed login accounts:

```text
Admin: admin@example.com / Password@123
Student: student@example.com / Password@123
```

### 3. Open Frontend

Open this URL in a browser:

```text
http://localhost:5001
```

The frontend calls:

```text
http://localhost:5001/api
```

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a student user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Exams

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/exams` | Authenticated | List exams |
| GET | `/api/exams/:id` | Authenticated | Get exam with questions |
| POST | `/api/exams` | Admin | Create exam |
| PUT | `/api/exams/:id` | Admin | Update exam |
| DELETE | `/api/exams/:id` | Admin | Delete exam |

### Questions

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/exams/:examId/questions` | Admin | Add question |
| PUT | `/api/exams/:examId/questions/:questionId` | Admin | Update question |
| DELETE | `/api/exams/:examId/questions/:questionId` | Admin | Delete question |

### Submissions

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/exams/:examId/submit` | Authenticated | Submit answers and calculate score |
| GET | `/api/submissions/mine` | Authenticated | View own submissions |
| GET | `/api/submissions` | Admin | View all student submissions |

## Example Submit Request

```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOption": "B"
    },
    {
      "questionId": 2,
      "selectedOption": "A"
    }
  ]
}
```

## Screenshots 

Check docs/screenshots for Screenshots

## Video
Video Link : https://drive.google.com/file/d/1eKzcoJyPWQgm3u1-WxbP0PQWiBleYM3Y/view?usp=drive_link
