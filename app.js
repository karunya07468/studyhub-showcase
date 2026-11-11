"use strict";

const STORAGE = {
  theme: "studyhub-showcase-theme",
  tasks: "studyhub-showcase-tasks",
  students: "studyhub-showcase-students",
  modules: "studyhub-showcase-modules"
};

const seedTasks = [
  { id: "t-1", title: "Review React hooks", priority: "high", completed: true },
  { id: "t-2", title: "Finish the student directory", priority: "medium", completed: false },
  { id: "t-3", title: "Take a five minute break", priority: "low", completed: false }
];

const seedStudents = [
  { id: "s-1", rollNo: "SH-024", name: "Asha Singh", email: "asha@student.edu", course: "BCA", semester: 4, cgpa: 8.8 },
  { id: "s-2", rollNo: "SH-031", name: "Rohan Kumar", email: "rohan@student.edu", course: "BSc CS", semester: 3, cgpa: 8.4 },
  { id: "s-3", rollNo: "SH-018", name: "Maya Iyer", email: "maya@student.edu", course: "BCA", semester: 5, cgpa: 9.1 },
  { id: "s-4", rollNo: "SH-042", name: "Kabir Shah", email: "kabir@student.edu", course: "BCom", semester: 2, cgpa: 7.9 },
  { id: "s-5", rollNo: "SH-027", name: "Nia Patel", email: "nia@student.edu", course: "BSc CS", semester: 4, cgpa: 8.7 },
  { id: "s-6", rollNo: "SH-011", name: "Ishan Rao", email: "ishan@student.edu", course: "BCA", semester: 6, cgpa: 8.2 },
  { id: "s-7", rollNo: "SH-036", name: "Sara Khan", email: "sara@student.edu", course: "BCom", semester: 3, cgpa: 8.6 },
  { id: "s-8", rollNo: "SH-029", name: "Dev Mehta", email: "dev@student.edu", course: "BSc CS", semester: 5, cgpa: 8.3 }
];

const quizQuestions = [
  {
    prompt: "Which React hook is used to run side effects after a render?",
    options: ["useEffect", "useColor", "useStyle", "useRoute"],
    answer: 0,
    note: "useEffect handles side effects such as data fetching or syncing a theme."
  },
  {
    prompt: "Which HTTP method is used to retrieve a student resource?",
    options: ["POST", "GET", "DELETE", "PATCH"],
    answer: 1,
    note: "GET reads a resource. POST creates one, PUT updates one and DELETE removes one."
  },
  {
    prompt: "Which MongoDB aggregation stage groups documents for calculations?",
    options: ["$limit", "$match", "$group", "$unset"],
    answer: 2,
    note: "$group collects matching documents by a key so you can calculate values such as an average."
  }
];

const modules = [
  {
    id: 1, track: "express", tags: ["EXPRESS", "ROUTING"], title: "Server setup, routing & URL parameters",
    summary: "Build the Express entry point, organize routes and follow a request to a profile.",
    description: "server.js creates the Express app, registers middleware in order and mounts feature routers. Route and query parameters carry values in a URL; redirects build a new URL safely.",
    concepts: ["Express app setup and feature routers", "Route params: /profile/:name", "Query params: ?details=full", "URL building with encodeURIComponent", "Middleware order, environment variables and 404 handling"],
    example: "GET /ssr/profile/Asha?details=full\nreq.params.name → \"Asha\"\nreq.query.details → \"full\"",
    time: "6 min"
  },
  {
    id: 2, track: "express", tags: ["EXPRESS", "REST API"], title: "REST API & HTTP methods",
    summary: "Treat students as a resource and use GET, POST, PUT and DELETE with clear status codes.",
    description: "A REST route names the resource; its HTTP method describes the action. Express parses JSON into req.body and Mongoose persists the student records.",
    concepts: ["GET reads; POST creates; PUT updates; DELETE removes", "JSON body parsing with express.json()", "Status codes: 200, 201, 400, 401, 403, 404", "Filter, sort and limit with query parameters", "Allowlisted sort fields, admin-only writes and central errors"],
    example: "GET /api/students?course=BCA&sort=-cgpa&limit=5\nPOST /api/students → 201 Created",
    time: "8 min"
  },
  {
    id: 3, track: "express", tags: ["EXPRESS", "MIDDLEWARE"], title: "Middleware, request by request",
    summary: "Trace application middleware, route guards, role checks and centralized error handling.",
    description: "Middleware sits between an incoming request and the route. It can log, parse a body, check a session, stop with a response or pass control onward with next().",
    concepts: ["Application logger and response timing", "Route-level requireAuth session check", "requireRole('admin') middleware factory", "Four-argument error middleware", "404 handler after routes; next() continues the chain"],
    example: "request → logger → JSON parser → session → auth → route\nNo session? → 401 and stop",
    time: "5 min"
  },
  {
    id: 4, track: "express", tags: ["EXPRESS", "EJS"], title: "Server-rendered pages with EJS",
    summary: "Render database-backed pages, reusable partials and a feedback form on the server.",
    description: "EJS combines a template with server data. The /ssr area complements the React SPA and demonstrates both rendering data and handling a submitted HTML form.",
    concepts: ["Set EJS as the view engine and render with res.render()", "Escaped <%= %>, raw include <%- %> and logic <% %>", "Reusable header and footer partials", "MongoDB student report with an average CGPA", "GET /ssr/feedback and POST /ssr/feedback"],
    example: "app.set(\"view engine\", \"ejs\")\nres.render(\"report\", { students, avg })",
    time: "6 min"
  },
  {
    id: 5, track: "express", tags: ["EXPRESS", "AUTH"], title: "Cookies, sessions & authentication",
    summary: "Hash passwords, create sessions and remember theme preference with a cookie.",
    description: "The browser stores a random session ID cookie while account and role data stay on the server. Registration validates input and hashes passwords before storage.",
    concepts: ["bcrypt password hashing and comparison", "Regenerate session ID at login; store userId and role", "httpOnly, sameSite, secure and maxAge cookie options", "connect-mongo session store; destroy on logout", "Theme preference cookie shared by React and EJS"],
    example: "Browser cookie: connect.sid = random id\nServer session: { userId, role }",
    time: "7 min"
  },
  {
    id: 6, track: "mongodb", tags: ["MONGODB", "MONGOOSE"], title: "MongoDB Atlas, Mongoose & seed data",
    summary: "Connect the database, describe document rules in schemas and load repeatable demo data.",
    description: "Atlas hosts the cloud database; Compass provides a visual view. Mongoose schemas validate document shapes and models expose database operations to the app.",
    concepts: ["Atlas project, database user, IP access and Compass", "Schemas: required, unique, enum, limits and timestamps", "Models, ObjectId references and related records", "Indexes for common task, course and score queries", "Repeatable seed script; keep .env secrets out of GitHub"],
    example: "Student schema → Student model → students collection\n.env: MONGO_URI + SESSION_SECRET",
    time: "8 min"
  },
  {
    id: 7, track: "mongodb", tags: ["MONGODB", "MONGOSH"], title: "MongoDB Shell: CRUD to aggregation",
    summary: "Practice create, read, update, delete, filters, indexes and aggregation pipelines.",
    description: "The mongosh demonstration repeats database operations in a separate studyhub_demo database, then drops that demo database when finished.",
    concepts: ["createCollection, insertMany, find and projections", "updateOne with $set; deleteOne", "sort(), limit(), createIndex() and getIndexes()", "$group, $avg, $sort, $project and $round", "drop a collection or database; dashboard course stats"],
    example: "db.students.find({ course: \"BCA\" })\n  .sort({ cgpa: -1 }).limit(3)",
    time: "7 min"
  },
  {
    id: 8, track: "react", tags: ["REACT", "VITE"], title: "React foundation: JSX & components",
    summary: "Build a page from nested components, JSX expressions and data-driven lists.",
    description: "Vite serves the React app during development. React renders the App into the root element; small components compose a page from reusable pieces.",
    concepts: ["Vite setup and createRoot entry point", "JSX syntax, className and JavaScript expressions", "Compose nested components", "Render mapped lists with stable keys", "Conditional rendering and Vite API proxy"],
    example: "createRoot(document.getElementById(\"root\"))\n  .render(<App />)",
    time: "6 min"
  },
  {
    id: 9, track: "react", tags: ["REACT", "SASS"], title: "Props, state, events & styling",
    summary: "Pass directory data to a card, update state from events and style with Sass.",
    description: "A parent owns the directory state and passes each student to a reusable card through props. Inputs and buttons call functions that update state and re-render the view.",
    concepts: ["Props are read-only; callbacks request changes", "useState for students, filters, sorts and forms", "onChange, onClick and onSubmit event handlers", "Sass variables, nesting and color functions", "CSS custom properties for light and dark themes"],
    example: "<StudentCard student={student}\n  onDelete={removeStudent} />",
    time: "7 min"
  },
  {
    id: 10, track: "react", tags: ["REACT", "FORMS"], title: "Forms, conditions & lists",
    summary: "Use controlled inputs and state to build registration and login screens.",
    description: "A controlled React form uses state as its source of truth. One change handler covers text, email, password, radio, select, textarea and checkbox fields.",
    concepts: ["Controlled form values with one handleChange", "Checkboxes and radios use checked", "Select, textarea and live character count", "preventDefault() on submit", "Conditional errors, terms checkbox, list keys and navigation"],
    example: "setForm(prev => ({ ...prev,\n  [name]: value }))",
    time: "7 min"
  },
  {
    id: 11, track: "react", tags: ["REACT", "ROUTER"], title: "React Router & screen updates",
    summary: "Navigate without reloads, protect private pages and restore the intended destination.",
    description: "React Router maps URLs to screens in the single-page app. Link and NavLink update the URL client-side; state changes make shared navigation update automatically.",
    concepts: ["BrowserRouter, Routes and Route", "Link / NavLink with active styles", "ProtectedRoute and Navigate redirect", "Remember the requested route after login", "useNavigate, wildcard route and production deep links"],
    example: "<Route path=\"/tasks\"\n  element={<ProtectedRoute><Tasks /></ProtectedRoute>} />",
    time: "6 min"
  },
  {
    id: 12, track: "react", tags: ["REACT", "HOOKS"], title: "Hooks, context & reducers",
    summary: "Share auth state without prop drilling and keep state transitions predictable.",
    description: "AuthProvider makes the current user available to any child. A reducer handles named state transitions; effects load the existing session and synchronize the theme.",
    concepts: ["useState and useEffect hooks", "createContext, Provider and useContext", "Custom useAuth() hook", "useReducer with AUTH_LOADED and LOGOUT", "Lift state to a shared parent; fetch with credentials"],
    example: "dispatch({ type: \"AUTH_LOADED\",\n  user })",
    time: "8 min"
  },
  {
    id: 13, track: "react", tags: ["REACT", "CRUD"], title: "To-do list application",
    summary: "Create, complete, filter and remove tasks that belong to the signed-in student.",
    description: "The React task page calls a REST API and the server stores tasks in MongoDB. Every query is scoped to the current user so another account cannot access the task.",
    concepts: ["POST, GET with status/search, PUT and DELETE", "Per-user filtering on the server", "Escape user search before building a regex", "Functional state updates without a page reload", "Loading, empty and error states; reusable TaskItem"],
    example: "setTasks(previous =>\n  previous.filter(task => task.id !== id))",
    time: "7 min"
  },
  {
    id: 14, track: "react", tags: ["REACT", "QUIZ"], title: "Quiz application & leaderboard",
    summary: "Answer multiple-choice questions, review the result and compare top scores.",
    description: "Questions arrive without correctIndex; the server grades the submitted answers, saves the result and builds a leaderboard from the best attempt per user.",
    concepts: ["Question projection hides correctIndex from the browser", "Pure gradeQuiz helper avoids inflated scores", "quizReducer actions: START, ANSWER, NEXT, PREV, FINISH, RESET", "Question navigation, disabled next and result review", "Leaderboard aggregation: $group, $sort, $limit, $lookup"],
    example: "POST /api/quiz/submit\nResult.aggregate([{ $group: ... }, { $sort: ... }])",
    time: "8 min"
  },
  {
    id: 15, track: "react", tags: ["REACT", "INTEGRATION"], title: "Dashboard & single-page integration",
    summary: "Bring the React front end and Express + MongoDB back end together in one app.",
    description: "A single-page app loads once and exchanges JSON with the server. The dashboard fetches its overview, course statistics and leaderboard together.",
    concepts: ["Promise.all for concurrent dashboard requests", "Overview: students, tasks, quiz attempts", "Task aggregation with $match and $group", "Average CGPA chart from course aggregation", "Vite proxy in development; Express serves the build in production"],
    example: "Promise.all([\n  api(\"/stats/overview\"),\n  api(\"/stats/courses\"),\n  api(\"/quiz/leaderboard\")\n])",
    time: "8 min"
  }
];

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_error) {
    return false;
  }
}

function getTasks() {
  const value = readStore(STORAGE.tasks, seedTasks);
  return Array.isArray(value) ? value : seedTasks.slice();
}

function getStudents() {
  const value = readStore(STORAGE.students, seedStudents);
  return Array.isArray(value) ? value : seedStudents.slice();
}

let tasks = getTasks();
let students = getStudents();
let currentTaskFilter = "all";
let currentStudentQuery = "";
let currentCourse = "";
let isAdminDemo = false;
let currentUser = null;
let theme = readStore(STORAGE.theme, "light");
let currentQuizIndex = 0;
let quizAnswers = Array(quizQuestions.length).fill(null);
let quizFinished = false;
let toastTimer = null;

const byId = (id) => document.getElementById(id);
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

function showToast(message) {
  const toast = byId("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setTheme(nextTheme, announce) {
  theme = nextTheme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  writeStore(STORAGE.theme, theme);
  const toggle = byId("theme-toggle");
  if (toggle) {
    const next = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    const label = toggle.querySelector(".theme-label");
    if (label) label.textContent = theme === "dark" ? "Dark" : "Theme";
  }
  const cookieButton = byId("theme-cookie-demo");
  const swatch = byId("theme-cookie-swatch");
  if (cookieButton) cookieButton.innerHTML = theme === "dark" ? "Set to light <span>☼</span>" : "Set to dark <span>◐</span>";
  if (swatch) swatch.dataset.mode = theme;
  updateCourseBars();
  if (announce) showToast("Theme saved on this device.");
}

setTheme(theme, false);

byId("theme-toggle").addEventListener("click", () => setTheme(theme === "dark" ? "light" : "dark", true));
byId("theme-cookie-demo").addEventListener("click", () => {
  setTheme(theme === "dark" ? "light" : "dark", true);
  byId("cookie-label").textContent = "Theme cookie concept · demo stored on this device";
});

const menuToggle = byId("menu-toggle");
const primaryNav = byId("primary-nav");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  primaryNav.classList.toggle("open", open);
});
primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  primaryNav.classList.remove("open");
}));

const demoTabs = Array.from(document.querySelectorAll(".demo-tab"));
function openDemo(name, focusTab) {
  demoTabs.forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll(".demo-panel").forEach((panel) => {
    const active = panel.dataset.panel === name;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  if (focusTab) {
    const selected = demoTabs.find((tab) => tab.dataset.tab === name);
    if (selected) selected.focus();
  }
}
demoTabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;
  tab.addEventListener("click", () => openDemo(tab.dataset.tab, false));
  tab.addEventListener("keydown", (event) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % demoTabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + demoTabs.length) % demoTabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = demoTabs.length - 1;
    else return;
    event.preventDefault();
    openDemo(demoTabs[next].dataset.tab, true);
  });
});
document.querySelectorAll("[data-module-link]").forEach((link) => link.addEventListener("click", () => {
  const target = byId("module-" + link.dataset.moduleLink);
  if (target) {
    target.classList.add("open");
    const trigger = target.querySelector(".module-summary");
    trigger.setAttribute("aria-expanded", "true");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}));

function renderTasks() {
  const container = byId("task-items");
  const filtered = tasks.filter((task) => {
    if (currentTaskFilter === "pending") return !task.completed;
    if (currentTaskFilter === "done") return task.completed;
    return true;
  });
  container.replaceChildren();
  byId("task-count").textContent = String(tasks.filter((task) => !task.completed).length);
  byId("task-summary").textContent = tasks.length ? tasks.filter((task) => !task.completed).length + " left" : "";
  byId("task-completed-count").textContent = tasks.filter((task) => task.completed).length + " completed";
  byId("dashboard-tasks").textContent = String(tasks.filter((task) => task.completed).length).padStart(2, "0") + "/" + String(tasks.length).padStart(2, "0");
  if (!filtered.length) {
    container.append(make("div", "task-empty", tasks.length ? "Nothing in this view right now. ✳" : "Your list is clear. Add a task to begin."));
    return;
  }
  filtered.forEach((task) => {
    const row = make("div", "task-row" + (task.completed ? " completed" : ""));
    const check = make("button", "task-check", "✓");
    check.type = "button";
    check.setAttribute("aria-label", (task.completed ? "Mark as not done: " : "Mark as done: ") + task.title);
    check.setAttribute("aria-pressed", String(Boolean(task.completed)));
    check.addEventListener("click", () => {
      task.completed = !task.completed;
      writeStore(STORAGE.tasks, tasks);
      renderTasks();
    });
    const title = make("span", "task-row-title", task.title);
    const priority = make("span", "priority-pill " + task.priority, task.priority.toUpperCase());
    const remove = make("button", "task-delete", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", "Delete task: " + task.title);
    remove.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      writeStore(STORAGE.tasks, tasks);
      renderTasks();
      showToast("Task removed from your demo list.");
    });
    row.append(check, title, priority, remove);
    container.append(row);
  });
}

byId("task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = byId("task-title");
  const title = input.value.trim();
  if (!title) return;
  tasks.unshift({ id: "task-" + Date.now(), title, priority: byId("task-priority").value, completed: false });
  writeStore(STORAGE.tasks, tasks);
  renderTasks();
  input.value = "";
  input.focus();
  showToast("Task added to your list.");
});
document.querySelectorAll("[data-task-filter]").forEach((button) => button.addEventListener("click", () => {
  currentTaskFilter = button.dataset.taskFilter;
  document.querySelectorAll("[data-task-filter]").forEach((filter) => {
    const active = filter === button;
    filter.classList.toggle("active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
  renderTasks();
}));
renderTasks();

function renderQuiz() {
  const question = quizQuestions[currentQuizIndex];
  const body = byId("quiz-app-body");
  const result = byId("quiz-result");
  const scoreChip = byId("quiz-score-chip");
  const score = quizAnswers.reduce((sum, answer, index) => sum + (answer === quizQuestions[index].answer ? 1 : 0), 0);
  scoreChip.textContent = score + " / " + quizQuestions.length;
  if (quizFinished) {
    body.hidden = true;
    result.hidden = false;
    result.replaceChildren();
    result.append(make("div", "result-flower", score === 3 ? "✳" : "✦"));
    result.append(make("h4", "", score === 3 ? "A perfect little streak." : "You got " + score + " of " + quizQuestions.length + "."));
    result.append(make("p", "", "Take a look at each answer, then try again whenever you like."));
    const review = make("div", "result-review");
    quizQuestions.forEach((item, index) => {
      const row = make("div");
      row.append(make("span", "", (index + 1) + ". " + item.options[item.answer]));
      row.append(make("b", "", quizAnswers[index] === item.answer ? "CORRECT" : "REVIEW"));
      review.append(row);
    });
    result.append(review);
    const leaderboard = make("div", "leaderboard-mini");
    leaderboard.append(make("span", "leaderboard-label", "SAMPLE LEADERBOARD · BEST SCORE"));
    [
      ["Maya Iyer", "10 / 10"],
      ["Asha Singh", "9 / 10"],
      ["Rohan Kumar", "8 / 10"]
    ].forEach((entry, index) => {
      const row = make("div", "leaderboard-row");
      row.append(make("span", "", String(index + 1).padStart(2, "0")), make("b", "", entry[0]), make("strong", "", entry[1]));
      leaderboard.append(row);
    });
    result.append(leaderboard);
    return;
  }
  body.hidden = false;
  result.hidden = true;
  byId("quiz-step").textContent = "QUESTION " + String(currentQuizIndex + 1).padStart(2, "0") + " / " + String(quizQuestions.length).padStart(2, "0");
  byId("quiz-progress-line").firstElementChild.style.width = ((currentQuizIndex + 1) / quizQuestions.length * 100) + "%";
  byId("quiz-prompt").textContent = question.prompt;
  const choices = byId("quiz-choices");
  choices.replaceChildren();
  question.options.forEach((option, index) => {
    const choice = make("button", "quiz-choice" + (quizAnswers[currentQuizIndex] === index ? " selected" : ""));
    choice.type = "button";
    choice.setAttribute("aria-pressed", String(quizAnswers[currentQuizIndex] === index));
    choice.append(make("span", "", String.fromCharCode(65 + index)));
    choice.append(make("span", "", option));
    if (quizAnswers[currentQuizIndex] === index) choice.append(make("span", "", "✓"));
    choice.addEventListener("click", () => {
      quizAnswers[currentQuizIndex] = index;
      renderQuiz();
      const correct = index === question.answer;
      byId("quiz-feedback").textContent = correct ? "That's right. " + question.note : "Not quite. " + question.note;
      byId("quiz-feedback").classList.toggle("incorrect", !correct);
    });
    choices.append(choice);
  });
  const feedback = byId("quiz-feedback");
  if (quizAnswers[currentQuizIndex] === null) {
    feedback.textContent = "";
    feedback.classList.remove("incorrect");
  } else {
    const correct = quizAnswers[currentQuizIndex] === question.answer;
    feedback.textContent = (correct ? "That's right. " : "Take another look. ") + question.note;
    feedback.classList.toggle("incorrect", !correct);
  }
  const previous = byId("quiz-prev");
  previous.disabled = currentQuizIndex === 0;
  byId("quiz-next").disabled = quizAnswers[currentQuizIndex] === null;
  byId("quiz-next").innerHTML = currentQuizIndex === quizQuestions.length - 1 ? "See your result <span>↗</span>" : "Next question <span>→</span>";
}
byId("quiz-prev").addEventListener("click", () => {
  if (currentQuizIndex > 0) {
    currentQuizIndex -= 1;
    renderQuiz();
  }
});
byId("quiz-next").addEventListener("click", () => {
  if (quizAnswers[currentQuizIndex] === null) return;
  if (currentQuizIndex === quizQuestions.length - 1) quizFinished = true;
  else currentQuizIndex += 1;
  renderQuiz();
});
byId("quiz-reset").addEventListener("click", () => {
  currentQuizIndex = 0;
  quizAnswers = Array(quizQuestions.length).fill(null);
  quizFinished = false;
  renderQuiz();
});
renderQuiz();

function renderDirectory() {
  const body = byId("student-rows");
  const search = currentStudentQuery.toLowerCase();
  let rows = students.filter((student) => {
    const matchesCourse = !currentCourse || student.course === currentCourse;
    const text = [student.name, student.email, student.rollNo, student.course].join(" ").toLowerCase();
    return matchesCourse && text.includes(search);
  });
  const sort = byId("student-sort").value;
  if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "cgpa-desc") rows.sort((a, b) => b.cgpa - a.cgpa);
  if (sort === "cgpa-asc") rows.sort((a, b) => a.cgpa - b.cgpa);
  if (sort === "roll") rows.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  body.replaceChildren();
  rows.forEach((student) => {
    const tr = make("tr");
    const nameCell = make("td");
    const nameWrap = make("div", "table-student");
    const initials = student.name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
    nameWrap.append(make("span", "table-avatar", initials));
    const nameText = make("span");
    nameText.append(make("b", "", student.name), make("small", "", student.rollNo));
    nameWrap.append(nameText);
    nameCell.append(nameWrap);
    tr.append(nameCell, make("td", "", student.course), make("td", "", String(student.semester)), make("td", "cgpa-value", Number(student.cgpa).toFixed(1)));
    const actionCell = make("td");
    if (isAdminDemo) {
      const remove = make("button", "row-delete", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", "Delete " + student.name + " from the sample directory");
      remove.addEventListener("click", () => {
        students = students.filter((item) => item.id !== student.id);
        writeStore(STORAGE.students, students);
        renderDirectory();
        renderDataLab();
        updateCourseBars();
        showToast("Sample student removed.");
      });
      actionCell.append(remove);
    }
    tr.append(actionCell);
    body.append(tr);
  });
  byId("directory-count").textContent = String(rows.length).padStart(2, "0");
  byId("student-total").textContent = String(students.length);
  byId("dashboard-students").textContent = String(students.length).padStart(2, "0");
  byId("admin-toggle").setAttribute("aria-pressed", String(isAdminDemo));
  byId("admin-toggle").innerHTML = isAdminDemo ? "ADMIN <b>ON</b>" : "ADMIN <b>OFF</b>";
  byId("student-add-form").hidden = !isAdminDemo;
  byId("directory-guard").hidden = isAdminDemo;
}
byId("student-search").addEventListener("input", (event) => {
  currentStudentQuery = event.target.value.trim();
  renderDirectory();
});
byId("course-filter").addEventListener("change", (event) => {
  currentCourse = event.target.value;
  renderDirectory();
});
byId("student-sort").addEventListener("change", renderDirectory);
byId("admin-toggle").addEventListener("click", () => {
  isAdminDemo = !isAdminDemo;
  renderDirectory();
  showToast(isAdminDemo ? "Demo admin controls are on." : "Demo admin controls are off.");
});
byId("student-add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isAdminDemo) return;
  const form = new FormData(event.currentTarget);
  const rollNo = String(form.get("rollNo")).trim();
  if (students.some((student) => student.rollNo.toLowerCase() === rollNo.toLowerCase())) {
    showToast("That sample roll number is already in use.");
    return;
  }
  students.push({
    id: "student-" + Date.now(),
    rollNo,
    name: String(form.get("name")).trim(),
    course: String(form.get("course")),
    semester: Number(form.get("semester")),
    cgpa: Number(form.get("cgpa")),
    email: "sample@student.edu"
  });
  writeStore(STORAGE.students, students);
  event.currentTarget.reset();
  renderDirectory();
  renderDataLab();
  updateCourseBars();
  showToast("Sample student added.");
});

function filteredStudents(course) {
  return students.filter((student) => !course || student.course === course);
}

function renderDataLab() {
  const course = byId("data-course").value;
  const sort = byId("data-sort").value;
  const limit = Number(byId("data-limit").value);
  let rows = filteredStudents(course).slice();
  if (sort === "cgpa-desc") rows.sort((a, b) => b.cgpa - a.cgpa);
  else if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
  else rows.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  const allMatches = rows.length;
  const average = allMatches ? rows.reduce((sum, student) => sum + Number(student.cgpa), 0) / allMatches : 0;
  byId("data-matched").textContent = String(allMatches).padStart(2, "0");
  byId("data-average").textContent = average.toFixed(2);
  const output = byId("data-records");
  output.replaceChildren();
  rows.slice(0, limit).forEach((student) => {
    const row = make("div", "data-record");
    row.append(make("b", "", student.name), make("small", "", student.rollNo), make("small", "", student.course), make("span", "", Number(student.cgpa).toFixed(1)));
    output.append(row);
  });
  if (!rows.length) output.append(make("div", "task-empty", "No sample records match this course."));
}
["data-course", "data-sort", "data-limit"].forEach((id) => byId(id).addEventListener("change", renderDataLab));

function updateCourseBars() {
  const container = byId("course-bars");
  if (!container) return;
  container.replaceChildren();
  const courses = Array.from(new Set(students.map((student) => student.course))).map((course) => {
    const group = students.filter((student) => student.course === course);
    return { course, average: group.reduce((sum, student) => sum + Number(student.cgpa), 0) / Math.max(1, group.length) };
  }).sort((a, b) => b.average - a.average);
  const overall = students.length ? students.reduce((sum, student) => sum + Number(student.cgpa), 0) / students.length : 0;
  document.querySelector(".overview-metrics > div:nth-child(1) b").textContent = String(students.length).padStart(2, "0");
  document.querySelector(".overview-chart-head small").textContent = "AVG CGPA · " + overall.toFixed(2) + " OVERALL";
  courses.forEach((item) => {
    const row = make("div", "course-bar-row");
    row.append(make("span", "", item.course));
    const track = make("div", "course-bar-track");
    const fill = make("div", "course-bar-fill");
    fill.style.width = Math.max(0, Math.min(100, item.average * 10)) + "%";
    track.append(fill);
    row.append(track, make("span", "course-bar-value", item.average.toFixed(1)));
    container.append(row);
  });
}
renderDirectory();
renderDataLab();
updateCourseBars();

function runApiDemo() {
  const method = byId("api-method").value;
  const endpoint = byId("api-endpoint").value;
  const name = byId("api-name").value.trim() || "Student";
  const details = byId("api-details").value;
  let path = "/api/health";
  let status = "200 OK";
  let response = { status: "ok", time: "just now" };
  let text = false;

  if (endpoint === "profile") {
    path = "/ssr/profile/" + encodeURIComponent(name) + "?details=" + encodeURIComponent(details);
    if (method !== "GET") {
      status = "405 METHOD NOT ALLOWED";
      response = { message: "This route accepts GET requests." };
    } else {
      response = "Profile of " + name + " - details: " + details;
      text = true;
    }
  } else if (endpoint === "redirect") {
    path = "/ssr/redirect-to-profile/" + encodeURIComponent(name);
    if (method !== "GET") {
      status = "405 METHOD NOT ALLOWED";
      response = { message: "This route accepts GET requests." };
    } else {
      status = "302 FOUND";
      response = { redirect: "/ssr/profile/" + encodeURIComponent(name) + "?details=full" };
    }
  } else if (endpoint === "students") {
    path = "/api/students";
    if (method === "GET") {
      if (!currentUser) {
        status = "401 UNAUTHORIZED";
        response = { message: "Log in to read the student directory.", middleware: "requireAuth" };
      } else {
        const sample = students.slice(0, 4).map(({ rollNo, name: studentName, course, cgpa }) => ({ rollNo, name: studentName, course, cgpa }));
        response = sample;
      }
    } else if (!currentUser) {
      status = "401 UNAUTHORIZED";
      response = { message: "Log in before using protected student routes.", middleware: "requireAuth" };
    } else if (currentUser.role !== "admin") {
      status = "403 FORBIDDEN";
      response = { message: "Student accounts may read; only an admin may write.", middleware: "requireRole('admin')" };
    } else {
      status = method === "POST" ? "201 CREATED" : method === "DELETE" ? "204 NO CONTENT" : "200 OK";
      response = method === "POST" ? { message: "Sample student created", status: 201 } : method === "DELETE" ? "" : { message: "Sample student updated" };
    }
  } else if (endpoint === "protected") {
    path = "/api/tasks";
    if (!currentUser) {
      status = "401 UNAUTHORIZED";
      response = { message: "This route needs a logged-in session.", middleware: "requireAuth" };
    } else if (method === "GET") {
      response = tasks.map((task) => ({ title: task.title, completed: task.completed }));
    } else if (method === "POST") {
      status = "201 CREATED";
      response = { message: "Task added for the current user", status: 201 };
    } else {
      status = "200 OK";
      response = { message: "Task updated for the current user" };
    }
  } else if (method !== "GET") {
    status = "405 METHOD NOT ALLOWED";
    response = { message: "The health route only accepts GET." };
  }

  byId("api-status").textContent = status;
  byId("api-status").classList.toggle("error", status.startsWith("4") || status.startsWith("5"));
  byId("api-response").textContent = text ? response : response === "" ? "(empty response body)" : JSON.stringify(response, null, 2);
  byId("api-request-label").textContent = method + " " + path;
}
byId("api-run").addEventListener("click", runApiDemo);
["api-method", "api-endpoint", "api-name", "api-details"].forEach((id) => byId(id).addEventListener("change", runApiDemo));
byId("api-name").addEventListener("input", runApiDemo);

byId("feedback-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name")).trim();
  const rating = Number(form.get("rating"));
  const tone = rating >= 4 ? "green" : rating === 3 ? "blue" : "red";
  const message = rating >= 4 ? "Thanks, " + name + " — glad this worked for you!" : rating === 3 ? "Thanks, " + name + " — your feedback helps us improve." : "Thanks, " + name + " — we’ll keep learning from this.";
  const result = byId("feedback-result");
  result.dataset.tone = tone;
  result.querySelector("b").textContent = message;
  result.querySelector("small").textContent = "Rendered response · " + "★".repeat(rating) + "☆".repeat(5 - rating) + " · " + tone + " theme";
});

function renderMiddleware() {
  const steps = byId("middleware-steps");
  if (!steps) return;
  steps.replaceChildren();
  const sequence = [
    ["REQUEST", "GET /api/students"],
    ["LOGGER", "method + URL + status"],
    ["BODY PARSER", "express.json()"],
    ["COOKIE + SESSION", "session ID → user"],
    ["AUTH CHECK", currentUser ? "user session found" : "no session → stop"],
    [currentUser ? "ROUTE HANDLER" : "401 RESPONSE", currentUser ? "return sample data" : "requireAuth"],
    ["ERROR / 404", "last in route order"]
  ];
  sequence.forEach((item, index) => {
    const step = make("div", "middleware-step" + (currentUser || index < 4 ? " visited" : "") + (index === 5 && !currentUser ? " blocked" : ""));
    step.append(make("span", "", String(index + 1).padStart(2, "0")), make("b", "", item[0]), make("small", "", item[1]));
    steps.append(step);
  });
}
byId("middleware-run").addEventListener("click", () => {
  renderMiddleware();
  byId("middleware-trace-result").textContent = currentUser ? "Request continues to the route." : "Request stops at requireAuth with 401.";
});

function updateSessionUI() {
  const status = byId("session-status");
  const cookieState = byId("cookie-state");
  const login = byId("session-login");
  const logout = byId("session-logout");
  const serverCopy = byId("session-server-copy");
  const serverSmall = byId("session-server-small");
  if (currentUser) {
    status.innerHTML = "<i></i> SIGNED IN · " + currentUser.name.toUpperCase();
    status.classList.add("is-in");
    cookieState.textContent = "SET";
    cookieState.classList.add("is-set");
    login.textContent = "Session active ✓";
    login.disabled = true;
    logout.disabled = false;
    serverCopy.textContent = "userId + role stored";
    serverSmall.textContent = "Session record · MongoDB store";
  } else {
    status.innerHTML = "<i></i> SIGNED OUT";
    status.classList.remove("is-in");
    cookieState.textContent = "EMPTY";
    cookieState.classList.remove("is-set");
    login.innerHTML = "Sign in as Asha <span>↗</span>";
    login.disabled = false;
    logout.disabled = true;
    serverCopy.textContent = "No session stored";
    serverSmall.textContent = "Protected routes return 401";
  }
  renderMiddleware();
}
byId("session-login").addEventListener("click", () => {
  currentUser = { name: "Asha", role: "student" };
  updateSessionUI();
  runApiDemo();
  showToast("Demo session created for Asha.");
});
byId("session-logout").addEventListener("click", () => {
  currentUser = null;
  updateSessionUI();
  runApiDemo();
  showToast("Demo session ended.");
});
updateSessionUI();
runApiDemo();

function readCompletedModules() {
  const value = readStore(STORAGE.modules, []);
  return Array.isArray(value) ? value.map(Number).filter((id) => modules.some((item) => item.id === id)) : [];
}
let completedModules = readCompletedModules();

function setModuleComplete(id, done) {
  completedModules = done ? Array.from(new Set(completedModules.concat(id))) : completedModules.filter((item) => item !== id);
  writeStore(STORAGE.modules, completedModules);
  renderModules();
}

function renderModules() {
  const list = byId("module-list");
  const query = byId("module-search").value.trim().toLowerCase();
  const filter = document.querySelector(".module-filter.active").dataset.moduleFilter;
  const found = modules.filter((item) => {
    const matchesTrack = filter === "all" || item.track === filter;
    const text = [item.title, item.summary, item.description, item.tags.join(" "), item.concepts.join(" ")].join(" ").toLowerCase();
    return matchesTrack && text.includes(query);
  });
  list.replaceChildren();
  found.forEach((item) => {
    const card = make("article", "module-card" + (completedModules.includes(item.id) ? " is-complete" : ""));
    card.id = "module-" + item.id;
    const summary = make("button", "module-summary");
    summary.type = "button";
    summary.setAttribute("aria-expanded", "false");
    summary.setAttribute("aria-controls", "module-detail-" + item.id);
    summary.append(make("span", "module-no", String(item.id).padStart(2, "0")));
    const heading = make("span", "module-heading");
    heading.append(make("b", "", item.title), make("small", "", item.summary));
    summary.append(heading);
    const tags = make("span", "module-tags");
    item.tags.forEach((tag) => tags.append(make("span", "", tag)));
    summary.append(tags, make("span", "module-toggle", "+"));
    summary.addEventListener("click", () => {
      const open = !card.classList.contains("open");
      card.classList.toggle("open", open);
      summary.setAttribute("aria-expanded", String(open));
    });

    const detail = make("div", "module-detail");
    detail.id = "module-detail-" + item.id;
    const copy = make("div");
    copy.append(make("p", "", item.description));
    const concepts = make("ul");
    item.concepts.forEach((concept) => concepts.append(make("li", "", concept)));
    copy.append(concepts);
    const example = make("div", "module-example");
    const meta = make("span");
    meta.append(make("span", "", "QUICK LOOK"), make("span", "", item.time + " READ"));
    example.append(meta, make("code", "", item.example));
    const complete = make("button", "module-complete", completedModules.includes(item.id) ? "Module complete" : "Mark module complete");
    complete.type = "button";
    complete.setAttribute("aria-pressed", String(completedModules.includes(item.id)));
    complete.addEventListener("click", () => setModuleComplete(item.id, !completedModules.includes(item.id)));
    example.append(complete);
    detail.append(copy, example);
    card.append(summary, detail);
    list.append(card);
  });
  byId("module-visible-count").textContent = String(found.length).padStart(2, "0");
  byId("no-modules").hidden = found.length > 0;
  byId("module-progress").textContent = completedModules.length + " / 15 DONE";
}
document.querySelectorAll("[data-module-filter]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-module-filter]").forEach((filterButton) => {
    const active = filterButton === button;
    filterButton.classList.toggle("active", active);
    filterButton.setAttribute("aria-pressed", String(active));
  });
  renderModules();
}));
byId("module-search").addEventListener("input", renderModules);
byId("clear-module-search").addEventListener("click", () => {
  byId("module-search").value = "";
  document.querySelector('[data-module-filter="all"]').click();
});
byId("reset-progress").addEventListener("click", () => {
  completedModules = [];
  writeStore(STORAGE.modules, completedModules);
  renderModules();
  showToast("Module progress reset.");
});
renderModules();

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE.theme) setTheme(readStore(STORAGE.theme, "light"), false);
});

