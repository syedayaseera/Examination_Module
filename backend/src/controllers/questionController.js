const examModel = require("../models/examModel");
const questionModel = require("../models/questionModel");

async function createQuestion(req, res, next) {
  try {
    const exam = await examModel.getExamById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const question = await questionModel.createQuestion({
      examId: req.params.examId,
      questionText: req.body.questionText,
      optionA: req.body.optionA,
      optionB: req.body.optionB,
      optionC: req.body.optionC,
      optionD: req.body.optionD,
      correctOption: req.body.correctOption,
      marks: req.body.marks
    });

    await examModel.refreshTotalMarks(req.params.examId);
    return res.status(201).json(question);
  } catch (error) {
    return next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const existingQuestion = await questionModel.getQuestionById(req.params.questionId);

    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found." });
    }

    const question = await questionModel.updateQuestion(req.params.questionId, {
      questionText: req.body.questionText,
      optionA: req.body.optionA,
      optionB: req.body.optionB,
      optionC: req.body.optionC,
      optionD: req.body.optionD,
      correctOption: req.body.correctOption,
      marks: req.body.marks
    });

    await examModel.refreshTotalMarks(question.exam_id);
    return res.json(question);
  } catch (error) {
    return next(error);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const question = await questionModel.deleteQuestion(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    await examModel.refreshTotalMarks(question.exam_id);
    return res.json({ message: "Question deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion
};
