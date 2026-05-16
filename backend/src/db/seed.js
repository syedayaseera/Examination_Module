const bcrypt = require("bcryptjs");
const { pool, query } = require("../config/db");

async function seed() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const admin = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ["Admin User", "admin@example.com", passwordHash, "admin"]
  );

  const student = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ["Student User", "student@example.com", passwordHash, "student"]
  );

  const exam = await query(
    `INSERT INTO exams (title, description, duration_minutes, total_marks, is_published, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    ["JavaScript Basics", "A short exam covering JavaScript fundamentals.", 30, 10, true, admin.rows[0].id]
  );

  await query(
    `INSERT INTO questions
      (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8),
      ($1, $9, $10, $11, $12, $13, $14, $15)`,
    [
      exam.rows[0].id,
      "Which keyword declares a block-scoped variable?",
      "var",
      "let",
      "function",
      "return",
      "B",
      5,
      "Which method converts JSON text into a JavaScript object?",
      "JSON.stringify",
      "JSON.parse",
      "Object.keys",
      "Array.from",
      "B",
      5
    ]
  );

  console.log("Seed data inserted.");
  console.log("Admin login: admin@example.com / Password@123");
  console.log("Student login: student@example.com / Password@123");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
