// GSCS Bank - Customer Satisfaction Kiosk Script
// Galapitiyagama SANASA Co-operative Society

const DEFAULT_PIN = "1234";
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgBdc2oglmwilsJfKPDnAUPrVwP0roCDXbSVj0Xq0H54THVJPcLV5EdE8zpsusNU6YGA/exec";

const STORAGE_KEYS = {
  SCRIPT_URL: 'gscs_csat_script_url',
  COUNTER_NAME: 'gscs_csat_counter_name',
  SHOW_COUNTER: 'gscs_csat_show_counter',
  BRANCH_NAME: 'gscs_csat_branch_name',
  SOUND_ENABLED: 'gscs_csat_sound_enabled',
  WAKE_LOCK_ENABLED: 'gscs_csat_wake_lock_enabled',
  OFFLINE_QUEUE: 'gscs_csat_offline_queue'
};

// Application State
let config = {
  scriptUrl: localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) || DEFAULT_SCRIPT_URL,
  counterName: localStorage.getItem(STORAGE_KEYS.COUNTER_NAME) || 'Counter 01',
  showCounter: localStorage.getItem(STORAGE_KEYS.SHOW_COUNTER) !== 'false',
  branchName: localStorage.getItem(STORAGE_KEYS.BRANCH_NAME) || 'Galapitiyagama',
  soundEnabled: localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false',
  wakeLockEnabled: localStorage.getItem(STORAGE_KEYS.WAKE_LOCK_ENABLED) !== 'false'
};

// Ensure default script URL is saved if empty
if (!localStorage.getItem(STORAGE_KEYS.SCRIPT_URL)) {
  localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, DEFAULT_SCRIPT_URL);
}

let resetTimer = null;
let isSubmitting = false;
let wakeLockInstance = null;

// Admin secret trigger counters
let logoClickCount = 0;
let logoClickResetTimer = null;

// DOM Elements
const surveyScreen = document.getElementById('surveyScreen');
const thankYouScreen = document.getElementById('thankYouScreen');
const selectedEmojiPreview = document.getElementById('selectedEmojiPreview');
const progressBar = document.getElementById('progressBar');
const counterDisplay = document.getElementById('counterDisplay');
const brandLogo = document.getElementById('brandLogo');
const secretAdminTrigger = document.getElementById('secretAdminTrigger');
const smallFullscreenBtn = document.getElementById('smallFullscreenBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');

const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const fullscreenToggleModalBtn = document.getElementById('fullscreenToggleModalBtn');
const testStatus = document.getElementById('testStatus');

const pinModal = document.getElementById('pinModal');
const pinInput = document.getElementById('pinInput');
const submitPinBtn = document.getElementById('submitPinBtn');
const closePinBtn = document.getElementById('closePinBtn');
const pinError = document.getElementById('pinError');

const scriptUrlInput = document.getElementById('scriptUrlInput');
const counterNameInput = document.getElementById('counterNameInput');
const showCounterToggle = document.getElementById('showCounterToggle');
const branchNameInput = document.getElementById('branchNameInput');
const soundToggle = document.getElementById('soundToggle');
const wakeLockToggle = document.getElementById('wakeLockToggle');

// ==========================================
// 1. SCREEN WAKE LOCK (තිරය නිරන්තරයෙන් On කර තැබීම)
// ==========================================
async function enableScreenWakeLock() {
  if (!config.wakeLockEnabled) return;

  if ('wakeLock' in navigator) {
    try {
      wakeLockInstance = await navigator.wakeLock.request('screen');
      console.log("GSCS Kiosk: Screen Wake Lock active. Screen will NOT sleep.");

      wakeLockInstance.addEventListener('release', () => {
        console.log("GSCS Kiosk: Wake Lock released. Attempting to re-acquire...");
        if (document.visibilityState === 'visible' && config.wakeLockEnabled) {
          setTimeout(enableScreenWakeLock, 1000);
        }
      });
    } catch (err) {
      console.warn("GSCS Kiosk: Wake Lock error:", err.message);
    }
  }
}

// Re-acquire Wake Lock when tab becomes active again
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && config.wakeLockEnabled) {
    await enableScreenWakeLock();
  }
});

// User touch also silently ensures Wake Lock remains active
window.addEventListener('click', () => {
  if (!wakeLockInstance && config.wakeLockEnabled) {
    enableScreenWakeLock();
  }
}, { once: false, passive: true });

// ==========================================
// 2. AUDIO CHIME
// ==========================================
function playFeedbackChime() {
  if (!config.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Silent catch
  }
}

// ==========================================
// 3. EMOJI SELECTION & KIOSK FLOW
// ==========================================
function attachEmojiEvents() {
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isSubmitting) return;

      const rating = parseInt(btn.dataset.rating, 10);
      const nameSi = btn.dataset.nameSi;
      const nameEn = btn.dataset.nameEn;
      const emoji = btn.dataset.emoji;

      handleRatingSelected({ rating, nameSi, nameEn, emoji });
    });
  });
}

function handleRatingSelected(data) {
  isSubmitting = true;
  playFeedbackChime();

  const record = {
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString('si-LK', { timeZone: 'Asia/Colombo' }),
    counter: config.counterName,
    branch: config.branchName,
    rating: data.rating,
    experienceSinhala: data.nameSi,
    experienceEnglish: data.nameEn,
    emoji: data.emoji
  };

  // 1. Show Thank You Screen
  selectedEmojiPreview.textContent = data.emoji;
  surveyScreen.classList.remove('active');
  thankYouScreen.classList.add('active');

  // Trigger progress bar
  progressBar.style.transition = 'none';
  progressBar.style.transform = 'scaleX(1)';
  setTimeout(() => {
    progressBar.style.transition = 'transform 2.6s linear';
    progressBar.style.transform = 'scaleX(0)';
  }, 50);

  // 2. Submit Data to Google Sheets silently in background
  sendToGoogleSheets(record);

  // 3. Auto-reset back to emoji screen after 2.6 seconds
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    resetToSurveyScreen();
  }, 2600);
}

function resetToSurveyScreen() {
  thankYouScreen.classList.remove('active');
  surveyScreen.classList.add('active');
  isSubmitting = false;
}

// ==========================================
// 4. GOOGLE SHEETS INTEGRATION & OFFLINE QUEUE
// ==========================================
async function sendToGoogleSheets(data) {
  if (!config.scriptUrl) {
    saveToOfflineQueue(data);
    return;
  }

  try {
    await fetch(config.scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data)
    });
    console.log("Feedback recorded successfully to Google Sheet!");
  } catch (err) {
    console.warn("Network offline. Saved to local storage:", err);
    saveToOfflineQueue(data);
  }
}

function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) || [];
  } catch (e) {
    return [];
  }
}

function saveToOfflineQueue(item) {
  const queue = getOfflineQueue();
  queue.push(item);
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

async function processOfflineQueue() {
  if (!navigator.onLine || !config.scriptUrl) return;

  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    try {
      await fetch(config.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(item)
      });
    } catch (e) {
      remaining.push(item);
    }
  }

  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remaining));
  if (remaining.length === 0) {
    console.log("All offline feedback synced to Google Sheets successfully.");
  }
}

window.addEventListener('online', processOfflineQueue);
setInterval(processOfflineQueue, 15000);

// ==========================================
// 5. SECRET ADMIN GESTURE & SETTINGS
// ==========================================
function triggerAdminAccess() {
  logoClickCount++;
  if (logoClickResetTimer) clearTimeout(logoClickResetTimer);
  logoClickResetTimer = setTimeout(() => {
    logoClickCount = 0;
  }, 1200);

  // Triple tap to open admin PIN dialog
  if (logoClickCount >= 3) {
    logoClickCount = 0;
    openPinModal();
  }
}

// Logo triple click/tap
if (brandLogo) {
  brandLogo.addEventListener('click', triggerAdminAccess);
}

// Secret top-right corner triple tap
if (secretAdminTrigger) {
  secretAdminTrigger.addEventListener('click', triggerAdminAccess);
}

// Keyboard shortcut: Press 'S' or 'F2'
window.addEventListener('keydown', (e) => {
  if (e.key === 's' || e.key === 'S' || e.key === 'F2') {
    // Only if not currently typing in an input
    if (document.activeElement.tagName !== 'INPUT') {
      openPinModal();
    }
  }
});

function openPinModal() {
  pinInput.value = '';
  pinError.textContent = '';
  pinModal.classList.add('active');
  setTimeout(() => pinInput.focus(), 150);
}

closePinBtn.addEventListener('click', () => pinModal.classList.remove('active'));

submitPinBtn.addEventListener('click', checkPinAndOpenSettings);
pinInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkPinAndOpenSettings();
});

function checkPinAndOpenSettings() {
  if (pinInput.value.trim() === DEFAULT_PIN) {
    pinModal.classList.remove('active');
    settingsModal.classList.add('active');
    testStatus.style.display = 'none';
  } else {
    pinError.textContent = '❌ වැරදි PIN අංකයකි! (Default PIN: 1234)';
  }
}

closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));

// Fullscreen toggle logic
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log("Error entering fullscreen:", err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function updateFullscreenIcon() {
  if (!fullscreenIcon) return;
  if (document.fullscreenElement) {
    // Exit fullscreen icon (compress)
    fullscreenIcon.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>';
    smallFullscreenBtn.title = "Exit Fullscreen (සාමාන්‍ය තිරය)";
  } else {
    // Enter fullscreen icon (expand)
    fullscreenIcon.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>';
    smallFullscreenBtn.title = "Fullscreen (සම්පූර්ණ තිරය)";
  }
}

if (smallFullscreenBtn) {
  smallFullscreenBtn.addEventListener('click', toggleFullscreen);
}
document.addEventListener('fullscreenchange', updateFullscreenIcon);

// Fullscreen toggle from settings
fullscreenToggleModalBtn.addEventListener('click', toggleFullscreen);

saveSettingsBtn.addEventListener('click', () => {
  config.scriptUrl = scriptUrlInput.value.trim();
  config.counterName = counterNameInput.value.trim() || 'Counter 01';
  config.showCounter = showCounterToggle.checked;
  config.branchName = branchNameInput.value.trim() || 'Galapitiyagama';
  config.soundEnabled = soundToggle.checked;
  config.wakeLockEnabled = wakeLockToggle.checked;

  localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, config.scriptUrl);
  localStorage.setItem(STORAGE_KEYS.COUNTER_NAME, config.counterName);
  localStorage.setItem(STORAGE_KEYS.SHOW_COUNTER, config.showCounter);
  localStorage.setItem(STORAGE_KEYS.BRANCH_NAME, config.branchName);
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, config.soundEnabled);
  localStorage.setItem(STORAGE_KEYS.WAKE_LOCK_ENABLED, config.wakeLockEnabled);

  applyUIConfig();
  settingsModal.classList.remove('active');
  alert("සැකසුම් සාර්ථකව සුරකින ලදි! (Settings Saved)");

  if (config.wakeLockEnabled) {
    enableScreenWakeLock();
  }
  processOfflineQueue();
});

testConnectionBtn.addEventListener('click', async () => {
  const testUrl = scriptUrlInput.value.trim();
  if (!testUrl) {
    testStatus.className = 'test-status error';
    testStatus.textContent = 'කරුණාකර Google Apps Script Web App URL එක ඇතුළත් කරන්න.';
    return;
  }

  testStatus.className = 'test-status';
  testStatus.style.display = 'block';
  testStatus.style.background = '#fef3c7';
  testStatus.style.color = '#92400e';
  testStatus.textContent = 'පරීක්ෂා කරමින් පවතී... (Sending test row)';

  try {
    await fetch(testUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString('si-LK', { timeZone: 'Asia/Colombo' }),
        counter: counterNameInput.value.trim() || 'Counter 01',
        branch: branchNameInput.value.trim() || 'Galapitiyagama',
        rating: 5,
        experienceSinhala: 'ටෙස්ට් පරීක්ෂාවකි (Test Entry)',
        experienceEnglish: 'System Connection Test',
        emoji: '🧪'
      })
    });

    testStatus.className = 'test-status success';
    testStatus.textContent = '✅ පරීක්ෂාව සාර්ථකයි! ඔබගේ Google Sheet එක පරීක්ෂා කරන්න (Row එකක් එකතු වී ඇත).';
  } catch (err) {
    testStatus.className = 'test-status error';
    testStatus.textContent = '❌ සම්බන්ධතාවය අසාර්ථකයි: ' + err.message;
  }
});

function applyUIConfig() {
  counterDisplay.textContent = config.counterName || 'Counter 01';
  counterDisplay.style.display = config.showCounter ? 'inline-block' : 'none';
}

// ==========================================
// 6. INITIALIZATION
// ==========================================
function init() {
  scriptUrlInput.value = config.scriptUrl;
  counterNameInput.value = config.counterName;
  showCounterToggle.checked = config.showCounter;
  branchNameInput.value = config.branchName;
  soundToggle.checked = config.soundEnabled;
  wakeLockToggle.checked = config.wakeLockEnabled;

  applyUIConfig();
  attachEmojiEvents();
  enableScreenWakeLock();
  processOfflineQueue();
}

init();
