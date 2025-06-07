// Load subjects from localStorage or fallback to default
let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "C Programming (Pankaj Sir)", total: 40 },
  { name: "Data Structure (Pankaj Sir)", total: 30 },
  { name: "DAA (Pankaj Sir)", total: 50 },
  { name: "Digital Logic (Chandaj Jha Sir)", total: 50 },
  { name: "COA (Vijay Kumar Sir)", total: 50 },
  { name: "Engineering Maths (Gurupal Sir)", total: 35 },
  { name: "Discrete Maths (Satish Yadav Sir)", total: 75 },
  { name: "TOC (Ankit Kumar Sir)", total: 60 },
  { name: "Compiler Design (Vishal Rawat Sir)", total: 30 },
  { name: "Operating System (Vishwadeep Gothi Sir)", total: 40 },
  { name: "DBMS (Vijay Kumar Sir)", total: 60 },
  { name: "General Aptitude (Saurabh Thakur Sir)", total: 70 }
];

// Prompt user to update total lectures for existing subjects if needed
subjects = subjects.map(subject => {
  if (!subject.total || subject.total <= 0 || isNaN(subject.total)) {
    const userTotal = prompt(`Enter total lectures for "${subject.name}":`, "40");
    const totalLectures = parseInt(userTotal);
    return {
      ...subject,
      total: totalLectures > 0 ? totalLectures : 40
    };
  }
  return subject;
});

// Save updated subjects back to localStorage
localStorage.setItem("subjects", JSON.stringify(subjects));

const tracker = document.getElementById("tracker");
let globalTotal = 0,
  globalCompleted = 0;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}

function calculateDeadline(startDate, totalLectures) {
  const days = Math.ceil(totalLectures / 10);
  const d = new Date(startDate);
  d.setDate(d.getDate() + days - 1);
  return formatDate(d);
}

// IST date helper function
function getTodayDateIST() {
  const now = new Date();
  const istOffset = 330; // IST offset in minutes
  const istTime = new Date(now.getTime() + istOffset * 60000);
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istTime.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

tracker.innerHTML = "";

subjects.forEach((subject, idx) => {
  const key = subject.name.replace(/\s+/g, "_");

  let completed = 0;
  for (let i = 1; i <= subject.total; i++) {
    if (localStorage.getItem(`${key}_${i}`)) completed++;
  }

  const incomplete = subject.total - completed;
  const percent = Math.round((completed / subject.total) * 100);
  globalTotal += subject.total;
  globalCompleted += completed;

  const startKey = `${key}_start`;
  const endKey = `${key}_end`;

  const startDate = localStorage.getItem(startKey);
  const endDate = localStorage.getItem(endKey);

  const deadline = startDate ? calculateDeadline(startDate, subject.total) : "";

  const startDisplay = startDate
    ? `📅 Started: ${startDate}`
    : `📅 Start when clicking 1st lecture`;
  const deadlineDisplay = startDate ? `⏳ Deadline: ${deadline}` : `⏳ Deadline: --`;
  const endDisplay = endDate ? `✅ Completed: ${endDate}` : "";

  const subjectBox = document.createElement("div");
  subjectBox.className = "subject-box";

  subjectBox.innerHTML = `
    <div class="subject-title">${idx + 1}] ${subject.name} – ${percent}%</div>
    <div class="date-info">
      ${startDisplay}<br>
      ${deadlineDisplay}<br>
      ${endDisplay}<br>
      ✅ Completed Lectures: ${completed} <br>
      ❌ Incomplete Lectures: ${incomplete}
    </div>
    <div class="progress"><div class="progress-fill" style="width: ${percent}%"></div></div>
    <div class="lecture-list">
      ${Array.from({ length: subject.total }, (_, i) => {
        const id = `${key}_${i + 1}`;
        const checked = localStorage.getItem(id) ? "completed" : "";
        return `<div class="lecture-box ${checked}" data-id="${id}" data-subject="${key}" data-index="${i +
          1}">${i + 1}</div>`;
      }).join("")}
    </div>
  `;

  // RESET BUTTON
  const resetBtn = document.createElement("button");
  resetBtn.innerText = "🔄 Reset Progress";
  resetBtn.className = "reset-btn";
  resetBtn.style = `
    margin-top: 10px;
    padding: 6px 12px;
    background: #ff5555;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  resetBtn.onmouseover = () => (resetBtn.style.background = "#ff2222");
  resetBtn.onmouseout = () => (resetBtn.style.background = "#ff5555");
  resetBtn.onclick = () => {
    for (let i = 1; i <= subject.total; i++) {
      localStorage.removeItem(`${key}_${i}`);
    }
    localStorage.removeItem(`${key}_start`);
    localStorage.removeItem(`${key}_end`);
    localStorage.removeItem(`${key}_deadline`);
    location.reload();
  };

  subjectBox.appendChild(resetBtn);
  tracker.appendChild(subjectBox);
});

// Update summary: total progress, total lectures, completed & incomplete lectures, estimated time
const percentGlobal = globalTotal === 0 ? 0 : Math.round((globalCompleted / globalTotal) * 100);
const incompleteGlobal = globalTotal - globalCompleted;
document.getElementById("overall-percentage").innerText = `Total Progress: ${percentGlobal}%`;
document.getElementById("total-lectures").innerText = `📚 Total Lectures: ${globalTotal}`;
document.getElementById("completed-lectures").innerText = `✅ Completed Lectures: ${globalCompleted}`;
document.getElementById("incomplete-lectures").innerText = `❌ Incomplete Lectures: ${incompleteGlobal}`;

const daysNeeded = Math.ceil(incompleteGlobal / 10);
document.getElementById("estimated-time").innerText = `📅 Completion Estimate: ${daysNeeded} days (at 10 lectures/day)`;

// TOGGLE BOX LOGIC
tracker.addEventListener("click", function (e) {
  if (e.target.classList.contains("lecture-box")) {
    const id = e.target.getAttribute("data-id");
    const subject = e.target.getAttribute("data-subject");

    const startKey = `${subject}_start`;
    const endKey = `${subject}_end`;

    const allLectures = document.querySelectorAll(`[data-subject='${subject}']`);

    if (e.target.classList.contains("completed")) {
      e.target.classList.remove("completed");
      localStorage.removeItem(id);

      const anyRemaining = [...allLectures].some(box => box.classList.contains("completed"));
      if (!anyRemaining) {
        localStorage.removeItem(startKey);
        localStorage.removeItem(`${subject}_deadline`);
        localStorage.removeItem(endKey);
      }

    } else {
      e.target.classList.add("completed");
      localStorage.setItem(id, true);

      if (!localStorage.getItem(startKey)) {
        const completedCount = [...allLectures].filter(box => localStorage.getItem(box.dataset.id)).length;
        if (completedCount === 1) {
          localStorage.setItem(startKey, getTodayDateIST());
        }
      }

      const allChecked = [...allLectures].every(box => box.classList.contains("completed"));
      if (allChecked) {
        localStorage.setItem(endKey, getTodayDateIST());
      }
    }

    location.reload();
  }
});

// DYNAMIC SUBJECT ADD FORM LOGIC
document.getElementById("add-subject").addEventListener("click", () => {
  const nameInput = document.getElementById("subject-name");
  const totalInput = document.getElementById("subject-total");

  const name = nameInput.value.trim();
  const total = parseInt(totalInput.value);

  if (name && total > 0) {
    if (subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      alert("Subject already exists!");
      return;
    }
    subjects.push({ name, total });
    localStorage.setItem("subjects", JSON.stringify(subjects));
    location.reload();
  } else {
    alert("Please enter a valid subject name and total lectures.");
  }
});
