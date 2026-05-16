const express = require("express");
const { body, param } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must contain at least 6 characters.")
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validate,
  authController.login
);

router.get("/students", authenticate, requireAdmin, authController.getStudents);
router.delete(
  "/students/:id",
  authenticate,
  requireAdmin,
  [param("id").isInt({ min: 1 }).withMessage("Student id must be valid.")],
  validate,
  authController.deleteStudent
);

module.exports = router;
