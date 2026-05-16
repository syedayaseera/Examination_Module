const examModel = require("../models/examModel");
const questionModel = require("../models/questionModel");
const submissionModel = require("../models/submissionModel");

async function createExam(req, res, next) {
  try {
    const exam = await examModel.createExam({
      title: req.body.title,
      description: req.body.description,
      durationMinutes: req.body.durationMinutes,
      isPublished: req.body.isPublished ?? true,
      createdBy: req.user.id
    });

    return res.status(201).json(exam);
  } catch (error) {
    return next(error);
  }
}

async function getAllExams(req, res, next) {
  try {
    const exams = await examModel.getAllExams(req.user.id);
    return res.json(exams);
  } catch (error) {
    return next(error);
  }
}

async function getExamById(req, res, next) {
  try {
    const exam = await examModel.getExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const hasSubmitted = await submissionModel.hasSubmittedExam(req.user.id, req.params.id);

    if (req.user.role !== "admin" && hasSubmitted) {
      return res.status(409).json({ message: "You have already submitted this exam." });
    }

    const includeAnswers = req.user.role === "admin";
    const questions = await questionModel.getQuestionsByExam(req.params.id, includeAnswers);

    return res.json({ ...exam, questions });
  } catch (error) {
    return next(error);
  }
}

async function updateExam(req, res, next) {
  try {
    const exam = await examModel.updateExam(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      durationMinutes: req.body.durationMinutes,
      isPublished: req.body.isPublished ?? true
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    return res.json(exam);
  } catch (error) {
    return next(error);
  }
}

async function deleteExam(req, res, next) {
  try {
    const deletedExam = await examModel.deleteExam(req.params.id);

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    return res.json({ message: "Exam deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam
};
