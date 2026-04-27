const screens = [...document.querySelectorAll(".screen")];
const calmButton = document.getElementById("calmButton");
const childNameInput = document.getElementById("childName");
const childNameSlots = document.querySelectorAll("[data-child-name]");
const starCount = document.getElementById("starCount");
const rewardTotal = document.getElementById("rewardTotal");
const moodCopy = document.getElementById("moodCopy");

let lastScreen = "welcomeScreen";
let stars = 5;

function showScreen(id) {
  const active = document.querySelector(".screen.active");
  if (active && active.id !== "calmScreen") {
    lastScreen = active.id;
  }

  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });

  calmButton.style.display = ["welcomeScreen", "calmScreen"].includes(id) ? "none" : "grid";
}

function syncChildName() {
  const name = childNameInput.value.trim() || "সিমা";
  childNameSlots.forEach((slot) => {
    slot.textContent = name;
  });
}

function addReward(amount) {
  stars += amount;
  starCount.textContent = stars;
  rewardTotal.textContent = stars + 31;
}

document.addEventListener("click", (event) => {
  const next = event.target.closest("[data-next]");
  const back = event.target.closest("[data-back]");
  const reward = event.target.closest("[data-reward]");
  const mood = event.target.closest("[data-mood]");
  const selectable = event.target.closest(".choice-card, .choice-row, .wide-illustration");

  if (selectable && selectable.parentElement) {
    selectable.parentElement.querySelectorAll(".selected").forEach((item) => item.classList.remove("selected"));
    selectable.classList.add("selected");
  }

  if (reward) {
    addReward(Number(reward.dataset.reward || 1));
  }

  if (mood) {
    const value = mood.dataset.mood;
    if (value === "ভালো আছি") {
      moodCopy.textContent = "আজ নতুন কিছু ধীরে ধীরে চেষ্টা করি।";
    } else if (value === "মাঝামাঝি") {
      moodCopy.textContent = "আজ পরিচিত সহজ activity দিয়ে শুরু করি।";
    } else {
      moodCopy.textContent = "আজ শুধু শান্ত activity, কোনো চাপ নেই।";
    }
    showScreen("homeScreen");
    return;
  }

  if (next) {
    syncChildName();
    showScreen(next.dataset.next);
  }

  if (back) {
    showScreen(back.dataset.back);
  }
});

calmButton.addEventListener("click", () => showScreen("calmScreen"));

document.getElementById("calmClose").addEventListener("click", () => {
  showScreen(lastScreen || "homeScreen");
});

childNameInput.addEventListener("input", syncChildName);
syncChildName();
showScreen("welcomeScreen");
