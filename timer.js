const totalTime = 1; 
let timeLeft = totalTime;       // seconds (2 minutes)
let timerInterval = null;
let onTimeoutCallback = null;

export function startTimer(displayElementId, getStats, onTimeout) {
    const timerEl = document.getElementById(displayElementId);
    if (!timerEl) return;
  
    updateDisplay(timerEl, timeLeft);
  
    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay(timerEl, timeLeft);
  
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        const { totalScore, ordersCompleted } = getStats(); 
        onTimeout(totalScore, ordersCompleted);
      }
    }, 1000);
}

export function stopTimer() {
  clearInterval(timerInterval);
}

export function resetTimer(seconds = totalTime) {
  timeLeft = seconds;
  clearInterval(timerInterval);
}

function updateDisplay(el, seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  el.textContent = `${formatNum(minutes)}:${formatNum(secs)}`;
}

function formatNum(num) {
  return num < 10 ? `0${num}` : num;
}
