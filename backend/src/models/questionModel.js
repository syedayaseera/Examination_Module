const db = require("../config/db");

async function createQuestion({ examId, questionText, optionA, optionB, optionC, optionD, correctOption, marks }) {
  const result = await db.query(
    `INSERT INTO questions
      (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [examId, questionText, optionA, optionB, optionC, optionD, correctOption, marks]
  );

  return result.rows[0];
}

async function getQuestionsByExam(examId, includeAnswers = false) {
  const select = includeAnswers
    ? "*"
    : "id, exam_id, question_text, option_a, option_b, option_c, option_d, marks, created_at";

  const result = await db.query(
    `SELECT ${select}
     FROM questions
     WHERE exam_id = $1
     ORDER BY id ASC`,
    [examId]
  );

  return result.rows;
}

async function getQuestionById(id) {
  const result = await db.query("SELECT * FROM questions WHERE id = $1", [id]);
  return result.rows[0];
}

async function updateQuestion(id, { questionText, optionA, optionB, optionC, optionD, correctOption, marks }) {
  const result = await db.query(
    `UPDATE questions
     SET question_text = $1,
         option_a = $2,
         option_b = $3,
         option_c = $4,
         option_d = $5,
         correct_option = $6,
         marks = $7
     WHERE id = $8
     RETURNING *`,
    [questionText, optionA, optionB, optionC, optionD, correctOption, marks, id]
  );

  return result.rows[0];
}

async function deleteQuestion(id) {
  const result = await db.query("DELETE FROM questions WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
}

module.exports = {
  createQuestion,
  getQuestionsByExam,
  getQuestionById,
  updateQuestion,
  deleteQuestion
};
