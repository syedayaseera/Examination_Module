const db = require("../config/db");

async function createExam({ title, description, durationMinutes, isPublished, createdBy }) {
  const result = await db.query(
    `INSERT INTO exams (title, description, duration_minutes, is_published, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, durationMinutes, Boolean(isPublished), createdBy]
  );

  return result.rows[0];
}

async function getAllExams(userId) {
  const result = await db.query(
    `SELECT
       e.*,
       COUNT(q.id)::INTEGER AS question_count,
       EXISTS (
         SELECT 1
         FROM submissions s
         WHERE s.exam_id = e.id AND s.user_id = $1
       ) AS is_submitted
     FROM exams e
     LEFT JOIN questions q ON q.exam_id = e.id
     GROUP BY e.id
     ORDER BY e.created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getExamById(id) {
  const result = await db.query("SELECT * FROM exams WHERE id = $1", [id]);
  return result.rows[0];
}

async function updateExam(id, { title, description, durationMinutes, isPublished }) {
  const result = await db.query(
    `UPDATE exams
     SET title = $1,
         description = $2,
         duration_minutes = $3,
         is_published = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [title, description, durationMinutes, Boolean(isPublished), id]
  );

  return result.rows[0];
}

async function deleteExam(id) {
  const result = await db.query("DELETE FROM exams WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
}

async function refreshTotalMarks(examId) {
  const result = await db.query(
    `UPDATE exams
     SET total_marks = COALESCE((SELECT SUM(marks) FROM questions WHERE exam_id = $1), 0),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING total_marks`,
    [examId]
  );

  return result.rows[0]?.total_marks || 0;
}

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  refreshTotalMarks
};
