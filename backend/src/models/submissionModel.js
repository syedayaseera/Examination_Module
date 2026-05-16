const db = require("../config/db");

async function createSubmission({ examId, userId, answers, score, totalMarks }) {
  const result = await db.query(
    `INSERT INTO submissions (exam_id, user_id, answers, score, total_marks)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [examId, userId, JSON.stringify(answers), score, totalMarks]
  );

  return result.rows[0];
}

async function getSubmissionsByUser(userId) {
  const result = await db.query(
    `SELECT s.*, e.title AS exam_title
     FROM submissions s
     JOIN exams e ON e.id = s.exam_id
     WHERE s.user_id = $1
     ORDER BY s.submitted_at DESC`,
    [userId]
  );

  return result.rows;
}

async function hasSubmittedExam(userId, examId) {
  const result = await db.query(
    `SELECT EXISTS (
       SELECT 1
       FROM submissions
       WHERE user_id = $1 AND exam_id = $2
     ) AS has_submitted`,
    [userId, examId]
  );

  return result.rows[0].has_submitted;
}

async function getAllSubmissions() {
  const result = await db.query(
    `SELECT
       s.*,
       e.title AS exam_title,
       u.name AS student_name,
       u.email AS student_email
     FROM submissions s
     JOIN exams e ON e.id = s.exam_id
     JOIN users u ON u.id = s.user_id
     ORDER BY s.submitted_at DESC`
  );

  return result.rows;
}

async function deleteSubmission(id) {
  const result = await db.query("DELETE FROM submissions WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
}

async function getExamAnalytics(examId) {
  const result = await db.query(
    `SELECT
       COUNT(*)::INTEGER AS attempts,
       COALESCE(ROUND(AVG(score), 2), 0)::FLOAT AS average_score,
       COALESCE(MAX(score), 0)::INTEGER AS highest_score,
       COALESCE(MIN(score), 0)::INTEGER AS lowest_score
     FROM submissions
     WHERE exam_id = $1`,
    [examId]
  );

  return result.rows[0];
}

module.exports = {
  createSubmission,
  getSubmissionsByUser,
  hasSubmittedExam,
  getAllSubmissions,
  deleteSubmission,
  getExamAnalytics
};
