// ===================== SUBJECT AND TASK DATA =====================
const subjects = [
  { id: 1, name: "C PROGRAMMING (Pankaj Sir)", icon: "💻", totalLectures: 50 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EoOTr2RJT7hDsNh9F-J0nMkBGA7RY8ltPkfFRAvCMFrVyA?e=tlna1I"},
  { id: 2, name: "DATA STRUCTURES (Pankaj Sir)", icon: "🗃️", totalLectures: 40 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EssD2070u3RCiy6LTKl1llEB14lheJTMI0crRMtLWBrLuQ?e=pOd92M"},
  { id: 3, name: "ALGORITHM (Pankaj Sir)", icon: "🧩", totalLectures: 35 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/Eq5TdOdxHrxNv0zhzEweB08BVEMepDMAkx7x4utJ_okTxQ?e=SIOTPJ"},
  { id: 4, name: "DIGITAL LOGIC (Chandaj Jha Sir)", icon: "🔢", totalLectures: 30 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EhNTZ24LH-NFtwLDpKTd3GoBE8w9fHO6zGcgStqeqkTqPg?e=MJ6jLC"},
  { id: 5, name: "COMPUTER ORGANIZATION & ARCHITECTURE (Vijay Kumar Sir)", icon: "🏗️", totalLectures: 45 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/Eh9UaaGTZYJFug-TCFIGR9oBuYGUgFcRdY_sxSs-w6X2zA?e=DhaROL"},
  { id: 6, name: "ENGINEERING MATHEMATICS (Gurupal Sir)", icon: "📊", totalLectures: 40 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EksCZfMpbTZMkad-Cjf-oEoBlQMddZLRNii6yCTC7wi0CQ?e=VhY480"},
  { id: 7, name: "DISCRETE MATHEMATICS (Satish Yadav Sir)", icon: "📐", totalLectures: 38 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EuJIRMvSCERGgkEfXVhmHKsBYBaQ2EmdrDUHKw6tZShbeQ?e=UeADcG"},
  { id: 8, name: "Theory Of Computation (Sanchit Sir)", icon: "🔍", totalLectures: 25 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EpZLJ7PLUW5OghFhmnTPCKABs0C0o27Xe-gQD-KtyCkhEg?e=5VI1An"},
  { id: 9, name: "COMPILER DESIGN (Vishal Rawat Sir)", icon: "🛠️", totalLectures: 28 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EtDF6-o1vjJNifvU92v78SgByZ1SOn9xkQ3eAjlfu2rRfg?e=6OaisE"},
  { id: 10, name: "COMPUTER NETWORK (Ankit Kumar Sir)", icon: "🌐", totalLectures: 40 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/Ep9jUa6WuxRFuKgSw9iwUnMBLti87rvF5xCB5c5H5eENDA?e=spglbS"},
  { id: 11, name: "OPERATING SYSTEM (Vishwadeep Gothi Sir)", icon: "⚙️", totalLectures: 42 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/Emr91kRd4s1HjH4JwQ65Q44BC21ONJ7DqKtDwlijwnS5BA?e=ayLipf"},
  { id: 12, name: "DATABASE MANAGEMENT SYSTEM (Vijay Kumar Sir)", icon: "🗄️", totalLectures: 35 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/Ehbn8vETsOVApB9w8PTmfccBIzeKNF8yvEu5Q33vsS5w6Q?e=JipYlo"},
  { id: 13, name: "GENERAL APTITUDE (SAURABH THAKUR Sir)", icon: "🧠", totalLectures: 20 ,
    notebookUrl: "https://1drv.ms/o/c/b4accaaad428c888/EheaVVQnWmZEnnoXcQF59xEBtaaB_5ZvXCXa23XTozNkTg?e=CZ7aQQ"},
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
    data[subj.id]["customTasks"] = [];  // New array for added tasks
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
  // Include custom tasks progress as well
  (progressData[subjId]["customTasks"] || []).forEach(ctask => {
    let val = Number(progressData[subjId][ctask]) || 0;
    if (val > 100) val = 100;
    total += val;
    count++;
  });
  return count ? total / count : 0;
}

function formatDate(date) {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

// ===================== COMPLETION DATE LOGIC =====================
function updateCompletionDate(subjectId) {
  // Check all default tasks and custom tasks completed
  const allDefaultDone = taskList.every(task => progressData[subjectId][task] >= 100);
  const allCustomDone = (progressData[subjectId]["customTasks"] || []).every(task => progressData[subjectId][task] >= 100);
  const allDone = allDefaultDone && allCustomDone;

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
    ? `✅ Completed on: \n ${progressData[subjectId]["completionDate"]}`
    : "";
}

// ===================== UI RENDER FUNCTIONS create notebook button =====================

function createNotebookButton(subject) {
  const button = document.createElement("button");
  button.className = "notebook-btn";
  button.textContent = "📒 Open Notebook";

  button.addEventListener("click", () => {
    // Example notebook link, you can customize this as needed per subject
if (subject.notebookUrl) {
  window.open(subject.notebookUrl, "_blank");
} else {
  alert("No notebook link available for this subject.");
}

  });

  const wrapper = document.createElement("div");
  wrapper.className = "notebook-wrapper";
  wrapper.style.marginBottom = "10px";
  wrapper.appendChild(button);
  return wrapper;
}

// ======================notebook end =================

function createCheckboxItem(subjectId, taskName) {
  const container = document.createElement("div");
  container.className = "checkbox-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "glow-checkbox"; // 👈 Yeh line add karo
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
  statusSpan.textContent = checkbox.checked ? " Done" : "Pending";

  checkbox.addEventListener("change", () => {
    progressData[subjectId][taskName] = checkbox.checked ? 100 : 0;
    statusSpan.textContent = checkbox.checked ? " Done" : "Pending";
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

function createAddTaskButton(subjectId) {
  // Create button
  const btn = document.createElement("button");
  btn.className = "add-task-btn";
  btn.innerHTML = `Add Task`;

  // Create wrapper div to center the button
  const wrapper = document.createElement("div");
  wrapper.className = "add-task-container"; // CSS me styling karein
  wrapper.appendChild(btn);

  // Add Task button style end 

  btn.addEventListener("click", () => {
    const taskName = prompt("Enter new task name:");
    if (!taskName || !taskName.trim()) return;

    const cleanName = taskName.trim();

    if (progressData[subjectId].hasOwnProperty(cleanName)) {
      alert("Task already exists!");
      return;
    }

    // Add new task progress
    progressData[subjectId][cleanName] = 0;

    // Add to customTasks array
    if (!Array.isArray(progressData[subjectId]["customTasks"])) {
      progressData[subjectId]["customTasks"] = [];
    }
    progressData[subjectId]["customTasks"].push(cleanName);

    saveProgress(progressData);

    renderSubjects(currentFilter);
  });

  return btn;
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
    const mockProgress = Number(progressData[subj.id]["Mock Test"]) || 0;

    if (filter === "pendingPYQs") return pyqProgress < 100;
    if (filter === "pendinglectures") return lecProgress < 100;
    if (filter === "pendingMockTests") return mockProgress < 100;
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

    // Add notebook button above tasks
    card.appendChild(createNotebookButton(subj));

    // Add default tasks
    taskList.forEach(task => {
      card.appendChild(createCheckboxItem(subj.id, task));
    });

    // Add custom tasks dynamically
    (progressData[subj.id]["customTasks"] || []).forEach(customTask => {
      card.appendChild(createCheckboxItem(subj.id, customTask));
    });

    // Add the "Add Task" button
    card.appendChild(createAddTaskButton(subj.id));

    // Completion date
    const dateDiv = document.createElement("div");

    dateDiv.className = "completion-date";

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
    // Add custom tasks progress
    (progressData[subj.id]["customTasks"] || []).forEach(ctask => {
      const val = Number(progressData[subj.id][ctask]);
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

  countdownElement.textContent = `⏳ ${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
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


// motivation quotes 

const quoteElement = document.getElementById("quoteOfTheDay");
const dateElement = document.getElementById("quoteDate");

const quotes = [
  "Success 🏆 is not for the lazy 😴.",
  "Believe 🙌 you can and you're halfway there 🛤️.",
  "Don't watch the clock ⏰; do what it does. Keep going ➡️.",
  "The harder you work 💪 for something, the greater you'll feel when you achieve it 🎯.",
  "Dream it 💭. Wish it ✨. Do it ✅.",
  "Don't stop ❌ when you're tired 😫. Stop when you're done ✅.",
  "Great things 🏔️ never come from comfort zones 🛋️.",
  "Push yourself 🚀, because no one else is going to do it for you 👊.",
  "Success 🥇 doesn't come from what you do occasionally 🕐. It comes from what you do consistently 🔁.",
  "The key 🔑 to success is to focus 🎯 on goals, not obstacles 🚧.",
  "Discipline ⚔️ is the bridge 🌉 between goals and accomplishment 🏁.",
  "The future 🔮 depends on what you do today 📅.",
  "It's going to be hard 🧱, but hard does not mean impossible 🧗.",
  "Work hard 🛠️ in silence 🤫, let success make the noise 📣.",
  "The pain 😣 you feel today will be the strength 💪 you feel tomorrow 🌅.",
  "Don’t limit 🚫 your challenges 🧠. Challenge your limits 🔄.",
  "The expert 🧑‍🏫 in anything was once a beginner 🐣.",
  "Little by little 🪜, a little becomes a lot 📈.",
  "Success 🥇 is the sum ➕ of small efforts repeated 🔁 day in and day out 🌞.",
  "Don’t wish ✨ it were easier 😌, wish you were better 🧠.",
  "You don’t have to be great 🧠 to start 🚪, but you have to start to be great 🔥.",
  "Your limitation 🚧 — it’s only your imagination 🧠.",
  "Push yourself 🚴 because no one else is going to do it for you 💯.",
  "Success 🏆 is what comes after you stop making excuses 🙅.",
  "Be stronger 💪 than your strongest excuse ❌.",
  "Don’t stop ✋ until you’re proud 👏.",
  "Wake up with determination 💥. Go to bed with satisfaction 😌.",
  "The only way to do great work 🧰 is to love ❤️ what you do.",
  "Success 🥇 usually comes to those who are too busy 📚 to be looking for it 👀.",
  "Failure ❌ will never overtake me if my determination 💪 to succeed is strong enough 💯.",
  "You don’t have to see the whole staircase 🪜, just take the first step 👣.",
  "The difference between ordinary 🧍 and extraordinary 🌟 is that little extra ✨.",
  "What you get 🎁 by achieving your goals 🎯 is not as important as what you become 💎.",
  "The secret 🤫 of getting ahead is getting started 🚀.",
  "It always seems impossible 😵 until it’s done ✅.",
  "You are capable of amazing things 🔥.",
  "Hard work 🛠️ beats talent 🎨 when talent doesn’t work hard 💤.",
  "Don’t be afraid 😨 to give up the good 👍 to go for the great 🌟.",
  "If you want it 💭, work for it 🔨.",
  "Success is not final 🔚, failure is not fatal ⚠️: It is the courage 💪 to continue that counts 🧮.",
  "Believe in yourself 🪞 and all that you are 💫.",
  "Success is a journey 🛣️, not a destination 🏁.",
  "The difference between try 🤞 and triumph 🏆 is a little 'umph' 💥.",
  "You miss ❌ 100% of the shots 🎯 you don’t take 🏹.",
  "The only limit 🚧 to our realization 💡 of tomorrow is our doubts today 🤔.",
  "The way to get started 🏁 is to quit talking 🗣️ and begin doing 🧠.",
  "Your time 🕒 is limited, so don’t waste it living someone else’s life 👤.",
  "Don’t wait for opportunity ⏳. Create it 🛠️.",
  "Work hard 💼. Stay positive 🌞. Get up early 🌄. It’s the best part of the day ⏰.",
  "The expert 🎓 in anything was once a beginner 📘.",
  "Success 🏆 is walking 🚶 from failure to failure with no loss of enthusiasm 💪.",
  "Motivation 🔋 is what gets you started. Habit ♻️ is what keeps you going.",
  "Do something today 📆 that your future self 👤 will thank you for 🙏.",
  "The best way to predict 🔮 the future is to create it 🛠️.",
  "You don’t have to be perfect 🧼 to be amazing ✨.",
  "Success doesn’t come to you 🚪, you go to it 🏃.",
  "Believe in the power ⚡ of yet — you may not be there yet, but you will be 🚀.",
  "Great things 🏔️ take time ⌛.",
  "If it doesn’t challenge you 🧩, it won’t change you 🔄.",
  "Dream bigger 💭. Do bigger 💥.",
  "Success starts with self-discipline 🧘.",
  "The best way to learn 🎓 is by doing 🧪.",
  "Stay focused 🎯 and never give up 🙅.",
  "Mistakes ❌ are proof 📄 that you are trying 🤓.",
  "Work until your idols 🌟 become your rivals 🏆.",
  "Don’t quit 🚫. Suffer now 😓 and live the rest of your life as a champion 🥇.",
  "The harder you work 💪, the luckier 🍀 you get.",
  "You are your only limit 🚧.",
  "The only bad workout 🏋️ is the one that didn’t happen 😴.",
  "The road 🛣️ to success is dotted with many tempting parking spaces 🅿️.",
  "Success is no accident 🎯. It is hard work 🔨, perseverance 🧠, learning 📚, sacrifice 🩸, and love ❤️ of what you do.",
  "Focus on your goals 🎯, not your fears 😱.",
  "The mind 🧠 is everything. What you think 💭 you become 🪞.",
  "Never stop learning 📖.",
  "It’s not about how bad you want it 😤. It’s about how hard you’re willing to work for it 🔥.",
  "Work hard today ⏳ to shine tomorrow 🌟.",
  "To be successful 💯, you must act big 🎭, think big 🧠 and talk big 📢.",
  "Good things 🍀 come to those who hustle 🏃.",
  "Success demands singleness of purpose 🎯.",
  "Be patient ⏳. Great things 🏔️ take time ⌛.",
  "Turn your dreams 🛌 into plans 🗂️.",
  "Set your goals high 🪁, and don’t stop till you get there 🏁.",
  "Strive for progress 🔄, not perfection 🧼.",
  "Success isn’t overnight 🌙. It’s when every day 🌞 you get a little better 📈.",
  "Dream it 💭. Believe it 🙌. Build it 🏗️.",
  "Your passion 🔥 is waiting for your courage 🛡️ to catch up.",
  "Doubt 🤔 kills more dreams 💭 than failure ever will ❌.",
  "Sometimes later 🕰️ becomes never 🚫. Do it now ⏱️.",
  "Success is not in what you have 💰, but who you are 🧘.",
  "Your only limit 🚧 is you 👤.",
  "Don’t stop ✋ until you’re proud 👑."
];


// Get today's date for display
const today = new Date();
const formattedDate = today.toLocaleDateString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric"
});
dateElement.textContent = ` ${formattedDate}`;

// Get quote index based on the current day (rotate daily)
const startDate = new Date("2024-01-01"); // Reference start date
const diffTime = today.getTime() - startDate.getTime();
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
const quoteIndex = diffDays % quotes.length;
const todayQuote = quotes[quoteIndex];

let typingIndex = 0;
let typingInterval;

function startTyping(text) {
  clearInterval(typingInterval);
  quoteElement.textContent = ' " ';
  typingIndex = 0;

  typingInterval = setInterval(() => {
    if (typingIndex < text.length) {
      quoteElement.textContent += text.charAt(typingIndex);
      typingIndex++;
    } else {
        // Add closing double quote
      quoteElement.textContent += ' " ';
      clearInterval(typingInterval);
      setTimeout(() => startTyping(text), 3000); // repeat typing after 5 sec
    }
  }, 60);
}

// Start typing the daily quote
startTyping(todayQuote);
