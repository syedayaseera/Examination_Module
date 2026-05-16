const db = require("../config/db");

async function createUser({ name, email, passwordHash, role = "student" }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );

  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

async function getStudents() {
  const result = await db.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE role = 'student'
     ORDER BY created_at DESC`
  );

  return result.rows;
}

async function deleteStudent(id) {
  const result = await db.query("DELETE FROM users WHERE id = $1 AND role = 'student' RETURNING id", [id]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  getStudents,
  deleteStudent
};
