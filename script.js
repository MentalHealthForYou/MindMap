document.getElementById("quizForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const form = event.target;
  const results = {
    anxiety: 0,
    depression: 0,
    burnout: 0
  };

  // Add up the scores per category
  const selects = form.querySelectorAll("select");
  selects.forEach(select => {
    const category = select.name;
    results[category] += parseInt(select.value);
  });

  // Interpret each score
  function interpret(category, score) {
    if (category === "anxiety") {
      if (score <= 4) return ["Minimal Anxiety", "You're experiencing normal stress levels."];
      if (score <= 7) return ["Mild Anxiety", "Occasional anxious thoughts. Try grounding exercises."];
      if (score <= 10) return ["Moderate Anxiety", "Frequent anxiety symptoms. Consider talking to someone."];
      return ["Severe Anxiety", "Significant anxiety. Please reach out to a mental health professional."];
    } else if (category === "depression") {
      if (score <= 4) return ["Minimal Depression", "You're emotionally stable most days."];
      if (score <= 7) return ["Mild Depression", "Occasional low mood. Stay connected and check in with yourself."];
      if (score <= 10) return ["Moderate Depression", "Signs of depression. It’s okay to ask for support."];
      return ["Severe Depression", "Frequent symptoms. Please talk to a trusted adult or counselor."];
    } else if (category === "burnout") {
      if (score <= 2) return ["Low Burnout", "You manage stress well. Keep up your self-care!"];
      if (score <= 5) return ["Moderate Burnout", "You're feeling some mental fatigue. Take breaks and rest."];
      return ["High Burnout", "You may be overwhelmed. Prioritize recovery and talk to someone."];
    }
  }

  // Show results
  const resultBox = document.getElementById("results");
  resultBox.innerHTML = `
    <h2>Your Results</h2>
    <p><strong>Anxiety:</strong> ${interpret("anxiety", results.anxiety)[0]}<br>${interpret("anxiety", results.anxiety)[1]}</p>
    <p><strong>Depression:</strong> ${interpret("depression", results.depression)[0]}<br>${interpret("depression", results.depression)[1]}</p>
    <p><strong>Burnout:</strong> ${interpret("burnout", results.burnout)[0]}<br>${interpret("burnout", results.burnout)[1]}</p>
  `;
  resultBox.style.display = "block";
});

document.getElementById("releaseBtn").addEventListener("click", function() {
  const input = document.getElementById("journalInput");
  const release = document.getElementById("releaseAnimation");

  if (input.value.trim() === "") {
    alert("Try writing something first.");
    return;
  }

  release.textContent = `"${input.value}"`;
  release.style.display = "block";
  input.value = ""; // clear journal

  setTimeout(() => {
    release.style.display = "none";
    release.textContent = "";
  }, 3000); // 3 seconds
});


const affirmations = [
  "You are enough just as you are.",
  "This moment is temporary, and you are growing stronger.",
  "Your feelings are valid.",
  "You deserve peace, rest, and kindness.",
  "Progress, not perfection.",
  "You’re doing the best you can — and that’s okay.",
  "You are not alone. You are loved.",
  "Small steps matter. Keep going.",
  "You are more resilient than you think.",
  "It’s okay to ask for help. That’s strength.",
  "You have the power to choose peace today."
];

const affirmationText = document.getElementById("affirmationText");
const newBtn = document.getElementById("newAffirmationBtn");

newBtn.addEventListener("click", () => {
  const random = Math.floor(Math.random() * affirmations.length);
  affirmationText.style.opacity = 0;
  setTimeout(() => {
    affirmationText.textContent = affirmations[random];
    affirmationText.style.opacity = 1;
  }, 400); // smooth transition
});

const moodButtons = document.querySelectorAll('.mood-btn');
const moodNote = document.getElementById('moodNote');
const saveMood = document.getElementById('saveMood');
const moodList = document.getElementById('moodList');

let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
const moodColors = {
  '😊': '#ffd166', // Happy - Sun yellow
  '😔': '#a8dadc', // Sad - Soft teal
  '😠': '#ef476f', // Angry - Bold pink-red
  '😰': '#118ab2', // Anxious - Cool blue
  '😴': '#9d9da1', // Tired - Gray lavender
  '😄': '#06d6a0'  // Energized - Fresh green
};
function saveToLocalStorage() {
  localStorage.setItem('moodData', JSON.stringify(moodData));
}

function renderMoodList() {
  moodList.innerHTML = '';
  moodData.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.date} – Mood: ${entry.mood}${entry.note ? ' – ' + entry.note : ''}`;
    moodList.appendChild(li);
  });
}

function updateChart() {
  const moodCounts = {};
  moodData.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  const labels = Object.keys(moodCounts);
const data = labels.map(label => moodCounts[label]);
const backgroundColors = labels.map(label => moodColors[label] || '#ccc');

moodChart.data.labels = labels;
moodChart.data.datasets[0].data = data;
moodChart.data.datasets[0].backgroundColor = backgroundColors;
  moodChart.update();
}

// Save mood entry
saveMood.addEventListener('click', () => {
  const selectedMood = document.querySelector('.mood-btn.selected');
  const note = moodNote.value.trim();
  if (!selectedMood) return alert("Please select a mood!");

  const date = new Date().toLocaleDateString();
  const mood = selectedMood.dataset.mood;

  const entry = { date, mood, note };
  moodData.push(entry);
  saveToLocalStorage();
  renderMoodList();
  updateChart();

  moodNote.value = '';
  selectedMood.classList.remove('selected');
});

// Mood selection
moodButtons.forEach(button => {
  button.addEventListener('click', () => {
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
  });
});

// 📊 Chart setup
const ctx = document.getElementById('moodChart').getContext('2d');
const moodChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Mood Frequency',
      data: [],
      backgroundColor: '#6c5ce7',
      borderRadius: 6
    }]
  },
  options: {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Initial render
renderMoodList();
updateChart();


let breathingInterval = null;
let phase = 0;
let isBreathing = false;

function startBreathing() {
  const circle = document.querySelector('.breathing-circle');
  const instruction = document.getElementById('breathing-instruction');
  const button = document.querySelector('.breathing-section button');
  const phrases = ["Inhale…", "Hold…", "Exhale…"];

  if (!isBreathing) {
    // Start breathing cycle
    isBreathing = true;
    button.textContent = "Pause Breathing";

    function breatheCycle() {
      if (phase === 0) {
        circle.style.transform = "scale(1.5)";
        instruction.textContent = phrases[0];
      } else if (phase === 1) {
        instruction.textContent = phrases[1];
      } else {
        circle.style.transform = "scale(1)";
        instruction.textContent = phrases[2];
      }
      phase = (phase + 1) % 3;
    }

    breatheCycle(); // Start immediately
    breathingInterval = setInterval(breatheCycle, 4000);
  } else {
    // Pause breathing
    isBreathing = false;
    clearInterval(breathingInterval);
    instruction.textContent = "Paused";
    button.textContent = "Resume Breathing";
  }
}

const stressors = ["Homework", "Tests", "Overthinking", "Drama", "Pressure", "Social Media", "Burnout"];
const bubbleContainer = document.getElementById("bubble-container");
const message = document.getElementById("bubble-message");
const popSound = document.getElementById("pop-sound");
const form = document.getElementById("bubble-form");
const input = document.getElementById("bubble-input");

// Function to create a single bubble
function createBubble(text) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  // Random horizontal position and animation speed
  bubble.style.left = Math.random() * 80 + "%";
  bubble.style.animationDuration = (6 + Math.random() * 4) + "s";

  // Pop on click
  bubble.onclick = function () {
    bubble.classList.add("pop");
    popSound.currentTime = 0;
    popSound.play();

    setTimeout(() => bubble.remove(), 400);

    // Check if all bubbles are gone
    setTimeout(() => {
      if (document.querySelectorAll(".bubble").length === 0) {
        message.style.display = "block";
      }
    }, 500);
  };

  bubbleContainer.appendChild(bubble);
}

// Load default stressors
stressors.forEach(createBubble);

// Handle custom bubble submission
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const value = input.value.trim();
  if (value) {
    createBubble(value);
    input.value = "";
    message.style.display = "none";
  }
});