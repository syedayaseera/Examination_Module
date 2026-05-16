# Video Explanation Script

Use this as a 5-10 minute recording guide.

## 1. Introduction

Hello, my name is Syeda Yaseera. This is my Examination Module assignment for Robokalam. The project includes a Node.js and Express backend, PostgreSQL database integration, JWT authentication, CRUD APIs, automatic score calculation, and a simple frontend built with HTML, CSS, and JavaScript.

## 2. Project Structure

- `backend/src/config` contains the PostgreSQL connection.
- `backend/src/db` contains the SQL schema, database initialization, and seed data.
- `backend/src/models` contains database query functions.
- `backend/src/controllers` contains request and response logic.
- `backend/src/routes` contains API route definitions.
- `backend/src/middleware` contains JWT authentication, admin authorization, and validation.
- `frontend` contains the simple UI.

## 3. Database Design

The database has four main tables:

- `users` stores admins and students.
- `exams` stores exam information such as title, description, duration, total marks, and publish status.
- `questions` stores MCQ questions and correct answers.
- `submissions` stores student answers, calculated score, total marks, and submission time.

## 4. Backend Logic

The backend starts from `server.js`, loads the Express app, and exposes routes under `/api`.

Authentication uses JWT. When a user logs in, the server returns a token. Protected APIs require this token in the `Authorization` header.

Admins can create, update, and delete exams and questions. Students can view exams and submit answers.

## 5. API Flow

First, the user logs in through `/api/auth/login`. The frontend stores the returned token. Then it calls `/api/exams` to display exams. Admin users can add exams and questions. Students open an exam and submit answers to `/api/exams/:examId/submit`.

During submission, the backend loads the correct answers from the database, compares them with selected answers, calculates the score, and saves the final result in the submissions table.

## 6. Frontend Connection

The frontend uses the browser `fetch` API. It sends JSON requests to the backend at `http://localhost:5001/api`. The token is sent as a Bearer token for protected routes.

## 7. Demo

Show these screens:

- Login screen.
- Exam list.
- Admin create exam form.
- Admin add question form.
- Exam attempt screen.
- Result after submission.

## 8. Closing

This completes the Examination Module with backend APIs, database integration, JWT security, simple frontend, auto scoring, validation, and analytics.
