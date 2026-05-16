const API_BASE_URL = window.location.protocol === "file:" ? "http://localhost:5001/api" : `${window.location.origin}/api`;

const state = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  exams: []
};

const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const sessionText = document.getElementById("sessionText");
const topbar = document.getElementById("topbar");
const accountInitial = document.getElementById("accountInitial");
const accountName = document.getElementById("accountName");
const roleText = document.getElementById("roleText");
const logoutBtn = document.getElementById("logoutBtn");
const messageBox = document.getElementById("messageBox");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmText = document.getElementById("confirmText");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmOkBtn = document.getElementById("confirmOkBtn");

function showMessage(message, type = "success") {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
  messageBox.classList.remove("hidden");
  window.setTimeout(() => messageBox.classList.add("hidden"), 4000);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setSession(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  renderSession();
}

function clearSession() {
  state.user = null;
  state.token = null;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  setAppPath("/");
  renderSession();
}

function setAppPath(path) {
  if (window.location.protocol === "file:") {
    window.location.hash = path === "/" ? "" : path;
    return;
  }

  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }
}

function getAppPath() {
  if (window.location.protocol === "file:") {
    return window.location.hash.replace(/^#/, "") || "/";
  }

  return window.location.pathname;
}

function askConfirmation({ title, message, actionText = "Delete" }) {
  confirmTitle.textContent = title;
  confirmText.textContent = message;
  confirmOkBtn.textContent = actionText;
  confirmModal.classList.remove("hidden");

  return new Promise((resolve) => {
    function close(result) {
      confirmModal.classList.add("hidden");
      confirmCancelBtn.removeEventListener("click", onCancel);
      confirmOkBtn.removeEventListener("click", onConfirm);
      resolve(result);
    }

    function onCancel() {
      close(false);
    }

    function onConfirm() {
      close(true);
    }

    confirmCancelBtn.addEventListener("click", onCancel);
    confirmOkBtn.addEventListener("click", onConfirm);
  });
}

function showView(viewId) {
  document.querySelectorAll(".nav-btn").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== viewId);
  });
}

function showAuthScreen(screen) {
  loginForm.classList.toggle("hidden", screen !== "login");
  registerForm.classList.toggle("hidden", screen !== "signup");
  sessionText.textContent = screen === "signup" ? "Create a student account." : "Login to manage and attempt exams.";
}

function renderSession() {
  const isLoggedIn = Boolean(state.token);
  authView.classList.toggle("hidden", isLoggedIn);
  appView.classList.toggle("hidden", !isLoggedIn);
  logoutBtn.classList.toggle("hidden", !isLoggedIn);
  topbar.classList.toggle("auth-centered", !isLoggedIn);

  if (!isLoggedIn) {
    showAuthScreen("login");
    return;
  }

  sessionText.textContent = `${state.user.name} signed in as ${state.user.role}.`;
  accountInitial.textContent = state.user.name.charAt(0).toUpperCase();
  accountName.textContent = state.user.name;
  roleText.textContent = state.user.role === "admin" ? "Administrator" : "Student";
  document.querySelector('[data-view="adminView"]').classList.toggle("hidden", state.user.role !== "admin");
  document.querySelector('[data-view="studentsView"]').classList.toggle("hidden", state.user.role !== "admin");
  showView(state.user.role === "admin" ? "resultsView" : "examsView");
  loadExams();
  loadResults();
  loadStudents();
}

function renderExams() {
  const examList = document.getElementById("examList");
  examList.innerHTML = "";

  if (!state.exams.length) {
    examList.innerHTML = `<p class="muted">No exams found.</p>`;
  }

  state.exams.forEach((exam) => {
    const isSubmitted = state.user?.role !== "admin" && exam.is_submitted;
    const item = document.createElement("article");
    item.className = "item exam-card";
    item.innerHTML = `
      <div class="exam-card-body">
        <h3>${exam.title}</h3>
        <p>${exam.description || "No description added."}</p>
        <div class="meta">
          <span>${exam.duration_minutes} minutes</span>
          <span>${exam.total_marks} marks</span>
          <span>${exam.question_count} questions</span>
        </div>
      </div>
      <div class="exam-card-actions">
        <button class="small-button exam-action-button" type="button" data-exam-id="${exam.id}" ${isSubmitted ? "disabled" : ""}>
          ${isSubmitted ? "Done" : "Open"}
        </button>
        ${state.user?.role === "admin" ? `<button class="danger-button small-button exam-action-button" type="button" data-delete-exam="${exam.id}">Delete</button>` : ""}
      </div>
    `;
    examList.appendChild(item);
  });

  document.getElementById("questionExamSelect").innerHTML = state.exams
    .map((exam) => `<option value="${exam.id}">${exam.title}</option>`)
    .join("");

}

async function loadExams() {
  try {
    state.exams = await request("/exams");
    renderExams();
    handleRoute();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function openExam(examId, updateUrl = true) {
  try {
    if (updateUrl) {
      setAppPath(`/exam/${examId}`);
    }

    const exam = await request(`/exams/${examId}`);
    const detail = document.getElementById("examDetail");
    document.getElementById("examsHeader").classList.add("hidden");
    document.getElementById("examList").classList.add("hidden");
    detail.classList.remove("hidden");
    showView("examsView");

    const questionsHtml = exam.questions
      .map(
        (question) => `
          <div class="question">
            <strong>${question.question_text}</strong>
            <div class="choices">
              ${["A", "B", "C", "D"]
                .map(
                  (option) => `
                    <label>
                      <input type="radio" name="question-${question.id}" value="${option}" required />
                      ${option}. ${question[`option_${option.toLowerCase()}`]}
                    </label>
                  `
                )
                .join("")}
            </div>
          </div>
        `
      )
      .join("");

    detail.innerHTML = `
      <button class="secondary-button back-button" type="button" data-back-to-exams aria-label="Back to exams">&larr;</button>
      <h2>${exam.title}</h2>
      <p>${exam.description || ""}</p>
      <form id="submitExamForm" data-exam-id="${exam.id}">
        ${questionsHtml || `<p class="muted">No questions available for this exam.</p>`}
        <button type="submit" ${exam.questions.length ? "" : "disabled"}>Submit Exam</button>
      </form>
    `;
  } catch (error) {
    setAppPath("/");
    showMessage(error.message, "error");
  }
}

function handleRoute() {
  if (!state.token) {
    return;
  }

  const match = getAppPath().match(/^\/exam\/(\d+)$/);

  if (match) {
    openExam(match[1], false);
    return;
  }

  document.getElementById("examsHeader").classList.remove("hidden");
  document.getElementById("examList").classList.remove("hidden");
  document.getElementById("examDetail").classList.add("hidden");
}

async function loadResults() {
  try {
    const isAdmin = state.user?.role === "admin";
    const results = await request(isAdmin ? "/submissions" : "/submissions/mine");
    const resultsList = document.getElementById("resultsList");
    document.getElementById("resultsTitle").textContent = isAdmin ? "Student Results" : "My Results";

    resultsList.innerHTML = results.length
      ? results
          .map(
            (result) => `
              <article class="item">
                <div class="result-card-header">
                  <h3>${result.exam_title}</h3>
                  ${isAdmin ? `<button class="danger-button small-button delete-result-button" type="button" data-delete-result="${result.id}">Delete</button>` : ""}
                </div>
                <div class="meta">
                  ${isAdmin ? `<span>Student: ${result.student_name} (${result.student_email})</span>` : ""}
                  <span>Score: ${result.score}/${result.total_marks}</span>
                  <span>Percentage: ${result.total_marks ? Math.round((result.score / result.total_marks) * 100) : 0}%</span>
                  <span>Submitted: ${new Date(result.submitted_at).toLocaleString()}</span>
                </div>
              </article>
            `
          )
          .join("")
      : `<p class="muted">No submissions yet.</p>`;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadStudents() {
  if (state.user?.role !== "admin") {
    return;
  }

  try {
    const students = await request("/auth/students");
    const studentsList = document.getElementById("studentsList");
    studentsList.innerHTML = students.length
      ? students
          .map(
            (student) => `
              <article class="item student-card">
                <span class="student-avatar">${student.name.charAt(0).toUpperCase()}</span>
                <div>
                  <h3>${student.name}</h3>
                  <div class="meta">
                    <span>${student.email}</span>
                    <span>Joined: ${new Date(student.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button class="danger-button small-button delete-student-button" type="button" data-delete-student="${student.id}">Delete</button>
              </article>
            `
          )
          .join("")
      : `<p class="muted">No students registered yet.</p>`;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(formToObject(event.target))
    });
    setSession(data.user, data.token);
    showMessage("Login successful.");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(formToObject(event.target))
    });
    setSession(data.user, data.token);
    showMessage("Account created.");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.getElementById("showSignupBtn").addEventListener("click", () => {
  showAuthScreen("signup");
});

document.getElementById("showLoginBtn").addEventListener("click", () => {
  showAuthScreen("login");
});

document.getElementById("examForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = formToObject(event.target);

  try {
    await request("/exams", {
      method: "POST",
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        durationMinutes: Number(formData.durationMinutes),
        isPublished: true
      })
    });
    event.target.reset();
    showMessage("Exam created.");
    loadExams();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.getElementById("questionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = formToObject(event.target);

  try {
    await request(`/exams/${formData.examId}/questions`, {
      method: "POST",
      body: JSON.stringify({
        questionText: formData.questionText,
        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,
        correctOption: formData.correctOption,
        marks: Number(formData.marks)
      })
    });
    event.target.reset();
    showMessage("Question added.");
    loadExams();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.getElementById("examList").addEventListener("click", (event) => {
  const deleteButton = event.target.closest("button[data-delete-exam]");

  if (deleteButton) {
    deleteExam(deleteButton.dataset.deleteExam);
    return;
  }

  const button = event.target.closest("button[data-exam-id]");
  if (button && !button.disabled) {
    openExam(button.dataset.examId);
  }
});

async function deleteExam(examId) {
  const shouldDelete = await askConfirmation({
    title: "Delete Exam",
    message: "This exam, its questions, and related submissions will be removed.",
    actionText: "Delete"
  });

  if (!shouldDelete) {
    return;
  }

  try {
    await request(`/exams/${examId}`, {
      method: "DELETE"
    });
    showMessage("Exam deleted successfully.");
    loadExams();
    loadResults();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

document.getElementById("examDetail").addEventListener("click", (event) => {
  if (event.target.closest("[data-back-to-exams]")) {
    setAppPath("/");
    handleRoute();
  }
});

document.getElementById("examDetail").addEventListener("submit", async (event) => {
  event.preventDefault();
  const examId = event.target.dataset.examId;
  const answers = Array.from(event.target.querySelectorAll(".question")).map((questionBlock) => {
    const input = questionBlock.querySelector("input[type='radio']");
    const selected = questionBlock.querySelector("input[type='radio']:checked");
    return {
      questionId: Number(input.name.replace("question-", "")),
      selectedOption: selected?.value
    };
  });

  if (answers.some((answer) => !answer.selectedOption)) {
    showMessage("Please answer all questions before submitting.", "error");
    return;
  }

  try {
    const result = await request(`/exams/${examId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers })
    });
    showMessage("Test is submitted successfully.");
    state.exams = state.exams.map((exam) =>
      Number(exam.id) === Number(examId) ? { ...exam, is_submitted: true } : exam
    );
    renderExams();
    document.getElementById("examDetail").innerHTML = `
      <button class="secondary-button back-button" type="button" data-back-to-exams aria-label="Back to exams">&larr;</button>
      <div class="item">
        <h3>Test is submitted successfully.</h3>
        <div class="meta">
          <span>Score: ${result.score}/${result.totalMarks}</span>
          <span>Percentage: ${result.percentage}%</span>
        </div>
      </div>
    `;
    loadResults();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "examsView") {
      setAppPath("/");
      handleRoute();
    }
    showView(button.dataset.view);
  });
});

document.getElementById("resultsList").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-delete-result]");

  if (!button) {
    return;
  }

  const shouldDelete = await askConfirmation({
    title: "Delete Result",
    message: "This student result will be removed from the database.",
    actionText: "Delete"
  });

  if (!shouldDelete) {
    return;
  }

  try {
    await request(`/submissions/${button.dataset.deleteResult}`, {
      method: "DELETE"
    });
    showMessage("Result deleted successfully.");
    loadResults();
  } catch (error) {
    showMessage(error.message, "error");
  }
});
document.getElementById("studentsList").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-delete-student]");

  if (!button) {
    return;
  }

  const shouldDelete = await askConfirmation({
    title: "Delete Student",
    message: "This student account and their submissions will be removed.",
    actionText: "Delete"
  });

  if (!shouldDelete) {
    return;
  }

  try {
    await request(`/auth/students/${button.dataset.deleteStudent}`, {
      method: "DELETE"
    });
    showMessage("Student deleted successfully.");
    loadStudents();
    loadResults();
  } catch (error) {
    showMessage(error.message, "error");
  }
});
logoutBtn.addEventListener("click", clearSession);
window.addEventListener("popstate", handleRoute);

renderSession();
