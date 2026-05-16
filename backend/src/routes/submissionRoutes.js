const express = require("express");
const { param } = require("express-validator");
const submissionController = require("../controllers/submissionController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/mine", authenticate, submissionController.mySubmissions);
router.get("/", authenticate, requireAdmin, submissionController.allSubmissions);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  [param("id").isInt({ min: 1 }).withMessage("Result id must be valid.")],
  validate,
  submissionController.deleteSubmission
);

module.exports = router;
