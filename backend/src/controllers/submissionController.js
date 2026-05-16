const examModel = require("../models/examModel");
const questionModel = require("../models/questionModel");
const submissionModel = require("../models/submissionModel");

function calculateScore(questions, answers) {
  const answerMap = new Map(answers.map((answer) => [Number(answer.questionId), answer.selectedOption]));

  return questions.reduce((score, question) => {
    const selectedOption = answerMap.get(question.id);
    return selectedOption === question.correct_option ? score + question.marks : score;
  }, 0);
}

async function submitExam(req, res, next) {
  try {
    const exam = await examModel.getExamById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    if (!exam.is_published && req.user.role !== "admin") {
      return res.status(403).json({ message: "This exam is not published yet." });
    }

    const hasSubmitted = await submissionModel.hasSubmittedExam(req.user.id, req.params.examId);

    if (req.user.role !== "admin" && hasSubmitted) {
      return res.status(409).json({ message: "You have already submitted this exam." });
    }

    const questions = await questionModel.getQuestionsByExam(req.params.examId, true);
    const score = calculateScore(questions, req.body.answers);
    const totalMarks = questions.reduce((total, question) => total + question.marks, 0);
    const submission = await submissionModel.createSubmission({
      examId: req.params.examId,
      userId: req.user.id,
      answers: req.body.answers,
      score,
      totalMarks
    });

    return res.status(201).json({
      id: submission.id,
      examId: submission.exam_id,
      score,
      totalMarks,
      percentage: totalMarks ? Number(((score / totalMarks) * 100).toFixed(2)) : 0,
      submittedAt: submission.submitted_at
    });
  } catch (error) {
    return next(error);
  }
}

async function mySubmissions(req, res, next) {
  try {
    const submissions = await submissionModel.getSubmissionsByUser(req.user.id);
    return res.json(submissions);
  } catch (error) {
    return next(error);
  }
}

async function allSubmissions(req, res, next) {
  try {
    const submissions = await submissionModel.getAllSubmissions();
    return res.json(submissions);
  } catch (error) {
    return next(error);
  }
}

async function deleteSubmission(req, res, next) {
  try {
    const deletedSubmission = await submissionModel.deleteSubmission(req.params.id);

    if (!deletedSubmission) {
      return res.status(404).json({ message: "Result not found." });
    }

    return res.json({ message: "Result deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

async function examAnalytics(req, res, next) {
  try {
    const analytics = await submissionModel.getExamAnalytics(req.params.examId);
    return res.json(analytics);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitExam,
  mySubmissions,
  allSubmissions,
  deleteSubmission,
  examAnalytics
};
