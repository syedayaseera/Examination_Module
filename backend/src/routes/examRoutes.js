const express = require("express");
const { body, param } = require("express-validator");
const examController = require("../controllers/examController");
const questionController = require("../controllers/questionController");
const submissionController = require("../controllers/submissionController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const examRules = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").optional({ nullable: true }).trim(),
  body("durationMinutes").isInt({ min: 1 }).withMessage("Duration must be at least 1 minute."),
  body("isPublished").optional().isBoolean().withMessage("isPublished must be true or false.")
];

const questionRules = [
  body("questionText").trim().notEmpty().withMessage("Question text is required."),
  body("optionA").trim().notEmpty().withMessage("Option A is required."),
  body("optionB").trim().notEmpty().withMessage("Option B is required."),
  body("optionC").trim().notEmpty().withMessage("Option C is required."),
  body("optionD").trim().notEmpty().withMessage("Option D is required."),
  body("correctOption").isIn(["A", "B", "C", "D"]).withMessage("Correct option must be A, B, C, or D."),
  body("marks").isInt({ min: 1 }).withMessage("Marks must be at least 1.")
];

const answerRules = [
  body("answers").isArray({ min: 1 }).withMessage("Answers must be a non-empty array."),
  body("answers.*.questionId").isInt({ min: 1 }).withMessage("Question id must be valid."),
  body("answers.*.selectedOption").isIn(["A", "B", "C", "D"]).withMessage("Selected option must be A, B, C, or D.")
];

router.use(authenticate);

router.get("/", examController.getAllExams);
router.get("/:id", [param("id").isInt({ min: 1 })], validate, examController.getExamById);

router.post("/", requireAdmin, examRules, validate, examController.createExam);
router.put("/:id", requireAdmin, [param("id").isInt({ min: 1 }), ...examRules], validate, examController.updateExam);
router.delete("/:id", requireAdmin, [param("id").isInt({ min: 1 })], validate, examController.deleteExam);

router.post(
  "/:examId/questions",
  requireAdmin,
  [param("examId").isInt({ min: 1 }), ...questionRules],
  validate,
  questionController.createQuestion
);

router.put(
  "/:examId/questions/:questionId",
  requireAdmin,
  [param("examId").isInt({ min: 1 }), param("questionId").isInt({ min: 1 }), ...questionRules],
  validate,
  questionController.updateQuestion
);

router.delete(
  "/:examId/questions/:questionId",
  requireAdmin,
  [param("examId").isInt({ min: 1 }), param("questionId").isInt({ min: 1 })],
  validate,
  questionController.deleteQuestion
);

router.post("/:examId/submit", [param("examId").isInt({ min: 1 }), ...answerRules], validate, submissionController.submitExam);
router.get("/:examId/analytics", requireAdmin, [param("examId").isInt({ min: 1 })], validate, submissionController.examAnalytics);

module.exports = router;
