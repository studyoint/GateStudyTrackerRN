// ===================== SUBJECT AND TASK DATA =====================
const subjects = [
  { id: 1, name: "C PROGRAMMING (Pankaj Sir)", icon: "💻", totalLectures: 50 },
  { id: 2, name: "DATA STRUCTURES (Pankaj Sir)", icon: "🗂️", totalLectures: 40 },
  { id: 3, name: "ALGORITHM (Pankaj Sir)", icon: "📐", totalLectures: 35 },
  { id: 4, name: "DIGITAL LOGIC (Chandaj Jha Sir)", icon: "🔢", totalLectures: 30 },
  { id: 5, name: "COMPUTER ORGANIZATION & ARCHITECTURE (Vijay Kumar Sir)", icon: "🖥️", totalLectures: 45 },
  { id: 6, name: "ENGINEERING MATHEMATICS (Gurupal Sir)", icon: "📊", totalLectures: 40 },
  { id: 7, name: "DISCRETE MATHEMATICS (Satish Yadav Sir)", icon: "🧮", totalLectures: 38 },
  { id: 8, name: "Theory Of Computation (Sanchit Sir)", icon: "🔍", totalLectures: 25 },
  { id: 9, name: "COMPILER DESIGN (Vishal Rawat Sir)", icon: "🛠️", totalLectures: 28 },
  { id: 10, name: "COMPUTER NETWORK (Ankit Kumar Sir)", icon: "🌐", totalLectures: 40 },
  { id: 11, name: "OPERATING SYSTEM (Vishwadeep Gothi Sir)", icon: "⚙️", totalLectures: 42 },
  { id: 12, name: "DATABASE MANAGEMENT SYSTEM (Vijay Kumar Sir)", icon: "🗃️", totalLectures: 35 },
  { id: 13, name: "GENERAL APTITUDE (SAURABH THAKUR Sir)", icon: "🧠", totalLectures: 20 },
];

const taskList = [
  "Lectures",
  "Detailed Notes",
  "Revision",
  "Short Notes",
  "PYQs",
  "Practice Questions",
  "DPP",
  "Mock Test"
];

// ===================== PROGRESS DATA HANDLING =====================
function loadProgress() {
  const saved = localStorage.getItem("gateCSEProgress");
  if (saved) return JSON.parse(saved);

  const data = {};
  subjects.forEach(subj => {
    data[subj.id] = {};
    taskList.forEach(task => {
      data[subj.id][task] = 0;
    });
    data[subj.id]["Notes"] = "";
    data[subj.id]["completionDate"] = "";
  });
  return data;
}

function saveProgress(data) {
  localStorage.setItem("gateCSEProgress", JSON.stringify(data));
}

let progressData = loadProgress();

// ===================== DOM REFERENCES =====================
const subjectsContainer = document.getElementById("subjectsContainer");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");

// ===================== UTILITIES =====================
function averageSubjectProgress(subjId) {
  let total = 0, count = 0;
  taskList.forEach(task => {
    let val = Number(progressData[subjId][task]) || 0;
    if (val > 100) val = 100;
    total += val;
    count++;
  });
  return count ? total / count : 0;
}

function formatDate(date) {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// ===================== COMPLETION DATE LOGIC =====================
function updateCompletionDate(subjectId) {
  const allDone = taskList.every(task => progressData[subjectId][task] >= 100);

  if (allDone && !progressData[subjectId]["completionDate"]) {
    progressData[subjectId]["completionDate"] = formatDate(new Date());
    saveProgress(progressData);
  } else if (!allDone && progressData[subjectId]["completionDate"]) {
    progressData[subjectId]["completionDate"] = "";
    saveProgress(progressData);
  }

  const card = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
  if (!card) return;

  let dateDiv = card.querySelector(".completion-date");
  if (!dateDiv) {
    dateDiv = document.createElement("div");
    dateDiv.classList.add("completion-date");
    dateDiv.style.marginTop = "12px";
    dateDiv.style.fontStyle = "italic";
    dateDiv.style.color = "#ffd700cc";
    card.appendChild(dateDiv);
  }

  dateDiv.textContent = progressData[subjectId]["completionDate"]
    ? `✅ Completed on: ${progressData[subjectId]["completionDate"]}`
    : "";
}

// ===================== UI RENDER FUNCTIONS =====================
function createCheckboxItem(subjectId, taskName) {
  const container = document.createElement("div");
  container.className = "checkbox-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `chk_${subjectId}_${taskName.replace(/\s/g, "")}`;
  checkbox.checked = progressData[subjectId][taskName] >= 100;

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = taskName;
  label.style.marginLeft = "8px";

  const statusSpan = document.createElement("span");
  statusSpan.style.marginLeft = "8px";
  statusSpan.style.fontWeight = "bold";
  statusSpan.style.color = checkbox.checked ? "limegreen" : "orangered";
  statusSpan.textContent = checkbox.checked ? "✅ Done" : "Pending";

  checkbox.addEventListener("change", () => {
    progressData[subjectId][taskName] = checkbox.checked ? 100 : 0;
    statusSpan.textContent = checkbox.checked ? "✅ Done" : "Pending";
    statusSpan.style.color = checkbox.checked ? "limegreen" : "orangered";
    saveProgress(progressData);
    updateCompletionDate(subjectId);
    renderOverallProgressChart();
    renderSubjects(currentFilter);

  });
  

  container.appendChild(checkbox);
  container.appendChild(label);
  container.appendChild(statusSpan);

  return container;
}

function renderSubjects(filter = "all") {
  subjectsContainer.innerHTML = "";
  const query = searchInput.value.toLowerCase();

  const filteredSubjects = subjects.filter(subj => {
    const avgProg = averageSubjectProgress(subj.id);
    const matchesSearch = subj.name.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    const pyqProgress = Number(progressData[subj.id]["PYQs"]) || 0;
    const lecProgress = Number(progressData[subj.id]["Lectures"]) || 0;

    if (filter === "pendingPYQs") return pyqProgress < 100;
    if (filter === "pendinglectures") return lecProgress < 100;
    if (filter === "completed") return avgProg >= 100;

    return true;
  });

  filteredSubjects.forEach(subj => {
    const avgProg = averageSubjectProgress(subj.id);
    let badgeClass = "badge-red";
    if (avgProg >= 100) badgeClass = "badge-green";
    else if (avgProg >= 30) badgeClass = "badge-yellow";

    const card = document.createElement("div");
    card.className = "subject-card";
    card.setAttribute("data-subject-id", subj.id);

    const badge = document.createElement("div");
    badge.className = `subject-badge ${badgeClass}`;
    card.appendChild(badge);

    const title = document.createElement("div");
    title.className = "subject-title";
    title.title = subj.name;

    const iconSpan = document.createElement("span");
    iconSpan.className = "icon";
    iconSpan.textContent = subj.icon;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = `[${subj.id}] ${subj.name}`;

    title.appendChild(iconSpan);
    title.appendChild(nameSpan);
    card.appendChild(title);

    taskList.forEach(task => {
      card.appendChild(createCheckboxItem(subj.id, task));
    });

    const dateDiv = document.createElement("div");
    dateDiv.className = "completion-date";
    dateDiv.style.marginTop = "12px";
    dateDiv.style.fontStyle = "italic";
    dateDiv.style.color = "#ffd700cc";
    dateDiv.textContent = progressData[subj.id]["completionDate"]
      ? `✅ Completed on: ${progressData[subj.id]["completionDate"]}`
      : "";
    card.appendChild(dateDiv);

    subjectsContainer.appendChild(card);
  });
}

// ===================== CHART RENDERING =====================
function calculateOverallProgress() {
  let total = 0, count = 0;
  subjects.forEach(subj => {
    taskList.forEach(task => {
      const val = Number(progressData[subj.id][task]);
      total += isNaN(val) ? 0 : val;
      count++;
    });
  });
  return count ? total / count : 0;
}

const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    ctx.restore();
    const fontSize = (height / 5).toFixed(2);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(Math.round(calculateOverallProgress()) + "%", width / 2, height / 2);
    ctx.save();
  }
};

let overallChart = null;

function renderOverallProgressChart() {
  const ctx = document.getElementById("overallProgressChart").getContext("2d");
  const progressPercent = calculateOverallProgress();

  const data = {
    datasets: [{
      data: [progressPercent, 100 - progressPercent],
      backgroundColor: ["#ffd700", "#3a3a3a"],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  const options = {
    cutout: "80%",
    responsive: false,
    animation: {
      animateRotate: true,
      duration: 1500,
      easing: "easeOutCubic",
    },
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
      centerText: true,
    },
  };

  Chart.register(centerTextPlugin);

  if (overallChart) {
    overallChart.data = data;
    overallChart.options = options;
    overallChart.update();
  } else {
    overallChart = new Chart(ctx, {
      type: "doughnut",
      data,
      options,
    });
  }
}

// ===================== EVENT LISTENERS =====================
let currentFilter = "all";

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderSubjects(currentFilter);
  });
});

searchInput.addEventListener("input", () => {
  renderSubjects(currentFilter);
});

// ===================== COUNTDOWN TIMER =====================
function updateCountdown() {
  const countdownElement = document.getElementById("countdown");
  const targetDate = new Date("2026-01-01T00:00:00");
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    countdownElement.textContent = "🎉 GATE Day!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ===================== TYPING + GLITCH EFFECT =====================
document.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector("h1");
  const fullText = "GATE CSE Study Tracker";
  let i = 0;

  function typeEffect() {
    if (i < fullText.length) {
      heading.childNodes[0].nodeValue = fullText.slice(0, i + 1);
      i++;
      setTimeout(typeEffect, 100);
    }
  }

  function glitchEffect() {
    heading.classList.add("glitch");
    setTimeout(() => heading.classList.remove("glitch"), 500);
  }

  typeEffect();
  setInterval(glitchEffect, 5000);
});



// ===================== INIT =====================
renderSubjects();
renderOverallProgressChart();



