/* ==========================================================================
   COGNITIVE ALARM PLATFORM - FRONTEND CONTROLLER (CONNECTED TO BACKEND API)
   ========================================================================== */

const API_BASE = '/api';

// Global Application State
let authToken = localStorage.getItem("cognitive_alarm_jwt_token") || null;
let currentUser = null;
let alarmsList = [];
let historyLogs = [];
let currentTheme = "light";
let performanceChart = null;
let activeTestAlarm = null;
let puzzleTimerInterval = null;
let puzzleStartTime = 0;
let memorySequence = [];
let userMemoryInput = [];

/* --------------------------------------------------------------------------
   AUDIO SYNTHESIZER & REAL-TIME ALARM SCHEDULER (WEB AUDIO API)
   -------------------------------------------------------------------------- */
let audioCtx = null;
let alarmAudioInterval = null;
let alarmVolume = 0.8;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Synthesize Realistic Alarm Ringtones using Web Audio API
function playAlarmAudio(soundType = 'energetic') {
    stopAlarmAudio();
    try {
        const ctx = getAudioContext();
        let step = 0;

        alarmAudioInterval = setInterval(() => {
            if (!audioCtx || audioCtx.state === 'closed') return;
            
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(alarmVolume, now);

            if (soundType === 'energetic') {
                const freq = (step % 2 === 0) ? 880 : 1046.5;
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (soundType === 'digital') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(1000, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.14);
            } else if (soundType === 'gentle') {
                const chimes = [523.25, 659.25, 783.99, 1046.50];
                const freq = chimes[step % chimes.length];
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.45);
            }

            step++;
        }, soundType === 'digital' ? 250 : soundType === 'gentle' ? 500 : 200);

    } catch (err) {
        console.error("Audio Context Playback error:", err);
    }
}

function stopAlarmAudio() {
    if (alarmAudioInterval) {
        clearInterval(alarmAudioInterval);
        alarmAudioInterval = null;
    }
}

function previewSound(soundType) {
    playAlarmAudio(soundType);
    setTimeout(() => {
        stopAlarmAudio();
    }, 2000);
}

// Background Clock Alarm Check (Fires every second)
function startBackgroundAlarmScheduler() {
    setInterval(() => {
        const now = new Date();
        const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const currentDayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

        alarmsList.forEach(alarm => {
            if (alarm.active && alarm.time === currentTimeStr && alarm.days.includes(currentDayStr)) {
                const modal = document.getElementById("alarm-modal");
                if (modal.classList.contains("hidden")) {
                    triggerTestAlarmModal(alarm.id);
                }
            }
        });
    }, 1000);
}

/* --------------------------------------------------------------------------
   API SERVICE LAYER
   -------------------------------------------------------------------------- */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.error || 'API Request failed');
        }
        return json;
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err.message);
        throw err;
    }
}

/* --------------------------------------------------------------------------
   INITIALIZATION
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    setupAvatarListeners();
    startBackgroundAlarmScheduler();

    document.addEventListener("click", () => {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }, { once: true });

    if (authToken) {
        try {
            currentUser = await apiRequest('/user/profile');
            await loadBackendData();
            checkAuthSession();
        } catch (err) {
            handleLogout();
        }
    } else {
        checkAuthSession();
    }
});

function initTheme() {
    const savedTheme = localStorage.getItem("cognitive_alarm_theme") || "light";
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cognitive_alarm_theme", theme);
    if (performanceChart && typeof performanceChart.destroy === 'function') {
        updateAnalyticsChart();
    }
}

function toggleTheme() {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'Light White' : 'Dark'} Mode`, "info");
}

async function loadBackendData() {
    try {
        const alarms = await apiRequest('/alarms');
        alarmsList = Array.isArray(alarms) ? alarms : [];
        const logs = await apiRequest('/history');
        historyLogs = Array.isArray(logs) ? logs : [];
    } catch (err) {
        console.error("Failed to load initial data from database:", err);
        alarmsList = alarmsList || [];
        historyLogs = historyLogs || [];
    }
}

/* --------------------------------------------------------------------------
   AUTHENTICATION MODULE
   -------------------------------------------------------------------------- */
function checkAuthSession() {
    const authScreen = document.getElementById("auth-screen");
    const mainScreen = document.getElementById("main-screen");

    if (currentUser && authToken) {
        authScreen.classList.add("hidden");
        mainScreen.classList.remove("hidden");
        updateUserUIHeader();
        navigateTo("dashboard");
        renderDashboard();
        renderAlarmsList();
        renderHistoryLogs();
    } else {
        authScreen.classList.remove("hidden");
        mainScreen.classList.add("hidden");
    }
}

function switchAuthTab(tab) {
    document.getElementById("tab-login-btn").classList.toggle("active", tab === "login");
    document.getElementById("tab-signup-btn").classList.toggle("active", tab === "signup");

    document.getElementById("login-form").classList.toggle("active", tab === "login");
    document.getElementById("signup-form").classList.toggle("active", tab === "signup");
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        const response = await apiRequest('/auth/login', 'POST', { email, password });
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem("cognitive_alarm_jwt_token", authToken);

        await loadBackendData();
        showToast(`Welcome back to Cognitive Alarm, ${currentUser.name}!`, "success");
        checkAuthSession();
    } catch (err) {
        showToast(err.message || "Invalid credentials", "error");
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    try {
        const response = await apiRequest('/auth/signup', 'POST', { name, email, password });
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem("cognitive_alarm_jwt_token", authToken);

        await loadBackendData();
        showToast("Account created successfully! Upload your profile photo in Profile Settings.", "success");
        checkAuthSession();
    } catch (err) {
        showToast(err.message || "Sign up failed", "error");
    }
}

function demoFillAuth(type) {
    if (type === 'login') {
        document.getElementById("login-email").value = "alex@cognitive.com";
        document.getElementById("login-password").value = "password123";
    }
}

function handleLogout() {
    stopAlarmAudio();
    currentUser = null;
    authToken = null;
    localStorage.removeItem("cognitive_alarm_jwt_token");
    showToast("Logged out successfully.", "info");
    checkAuthSession();
}

function setupAvatarListeners() {
    const radios = document.querySelectorAll('input[name="avatar"]');
    const customInput = document.getElementById("signup-avatar-custom");
    radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (e.target.value === "custom") {
                customInput.classList.remove("hidden");
            } else {
                customInput.classList.add("hidden");
            }
        });
    });
}

/* --------------------------------------------------------------------------
   UI CONTROLLER & NAVIGATION
   -------------------------------------------------------------------------- */
function navigateTo(viewId, event) {
    if (event) event.preventDefault();

    document.querySelectorAll(".page-view").forEach(page => page.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add("active");

    const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (activeLink) activeLink.classList.add("active");

    const titleMap = {
        'dashboard': 'Dashboard Overview',
        'create-alarm': 'Create New Alarm',
        'view-alarms': 'My Configured Alarms',
        'history': 'Wake-Up History & Analytics',
        'profile': 'User Profile & Settings'
    };
    document.getElementById("page-title").textContent = titleMap[viewId] || 'Cognitive Alarm';

    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'view-alarms') renderAlarmsList();
    if (viewId === 'history') renderHistoryLogs();
    if (viewId === 'profile') renderProfilePage();

    document.getElementById("sidebar").classList.remove("mobile-open");
}

function toggleMobileSidebar() {
    document.getElementById("sidebar").classList.toggle("mobile-open");
}

function updateUserUIHeader() {
    if (!currentUser) return;
    document.getElementById("header-user-name").textContent = currentUser.name;
    document.getElementById("header-user-email").textContent = currentUser.email;
    document.getElementById("header-user-avatar").src = currentUser.avatar;
    document.getElementById("header-streak-val").textContent = `${currentUser.streakCount} Days`;
    document.getElementById("alarms-count-badge").textContent = alarmsList.length;
}

/* --------------------------------------------------------------------------
   DASHBOARD RENDERER & ANALYTICS
   -------------------------------------------------------------------------- */
function renderDashboard() {
    if (!currentUser) return;

    document.getElementById("dash-welcome-name").textContent = currentUser.name;
    document.getElementById("dash-streak-count").textContent = currentUser.streakCount;
    
    const streakStatusText = document.getElementById("streak-status-text");
    if (currentUser.streakCount === 0) {
        streakStatusText.textContent = "Streak starting fresh today! Solve your next alarm on the 1st ring.";
    } else {
        streakStatusText.textContent = `Great consistency! You woke up on 1st alarm for ${currentUser.streakCount} days straight.`;
    }

    const rate = currentUser.totalAlarms > 0 
        ? Math.round((currentUser.successfulWakes / currentUser.totalAlarms) * 100) 
        : 0;
    document.getElementById("dash-success-rate").textContent = `${rate}%`;
    document.getElementById("dash-successful-wakes").textContent = currentUser.successfulWakes;
    document.getElementById("dash-total-alarms").textContent = currentUser.totalAlarms;

    const avgSpeed = (currentUser.solveTimes && currentUser.solveTimes.length > 0)
        ? (currentUser.solveTimes.reduce((a, b) => a + b, 0) / currentUser.solveTimes.length).toFixed(1)
        : "--";
    document.getElementById("dash-avg-speed").textContent = avgSpeed !== "--" ? `${avgSpeed}s` : "-- s";
    renderUpcomingAlarmsSummary();
    loadAIPredictions();

    setTimeout(() => {
        updateAnalyticsChart();
    }, 50);
}

async function loadAIPredictions() {
    try {
        const pred = await apiRequest('/analytics/predict');
        const scoreElem = document.getElementById("ai-readiness-score");
        const diffElem = document.getElementById("ai-recommended-diff");
        const textElem = document.getElementById("ai-recommendation-text");

        if (scoreElem) scoreElem.textContent = `${pred.cognitiveReadinessScore}%`;
        if (diffElem) diffElem.textContent = pred.predictedOptimalDifficulty.toUpperCase();
        if (textElem) textElem.textContent = pred.recommendation;
    } catch (err) {
        console.error("AI Prediction fetch error:", err);
    }
}

function renderUpcomingAlarmsSummary() {
    const container = document.getElementById("dash-upcoming-list");
    container.innerHTML = "";

    if (alarmsList.length === 0) {
        container.innerHTML = `<div class="text-muted text-center" style="padding: 20px;">No active alarms set. <a href="#" onclick="navigateTo('create-alarm')">Create one now</a>.</div>`;
        return;
    }

    alarmsList.forEach(alarm => {
        const item = document.createElement("div");
        item.className = "alarm-mini-item";
        item.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time-box">${alarm.time}</div>
                <div class="alarm-name">${escapeHTML(alarm.label)}</div>
                <div class="alarm-days">${alarm.days.join(', ')} • ${alarm.cognitiveType.toUpperCase()} • 💤 ${alarm.snoozeTime || 5}m</div>
            </div>
            <label class="switch">
                <input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="toggleAlarmActive('${alarm.id}')">
                <span class="slider"></span>
            </label>
        `;
        container.appendChild(item);
    });
}

function updateAnalyticsChart() {
    const ctx = document.getElementById("performanceChart");
    if (!ctx) return;

    if (performanceChart && typeof performanceChart.destroy === 'function') {
        performanceChart.destroy();
    }

    const filterDays = parseInt(document.getElementById("chart-filter").value) || 7;

    const labels = [];
    const solveTimeData = [];
    const streakProgression = [];

    const now = new Date();
    let curStreakTemp = Math.max(0, currentUser.streakCount - filterDays + 1);

    for (let i = filterDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));

        const timeVal = Math.floor(Math.random() * 8) + 10;
        solveTimeData.push(timeVal);

        curStreakTemp += (i === 0 ? (currentUser.streakCount > 0 ? 1 : 0) : 1);
        streakProgression.push(Math.min(currentUser.streakCount, curStreakTemp));
    }

    const isDark = currentTheme === "dark";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "#94a3b8" : "#475569";

    performanceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Wake-Up Puzzle Time (sec)",
                    data: solveTimeData,
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: "Wake Streak Count (Days)",
                    data: streakProgression,
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor, font: { family: 'Inter', weight: '600' } }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Solve Time (Seconds)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Streak (Days)', color: textColor },
                    grid: { drawOnChartArea: false },
                    ticks: { color: textColor, stepSize: 1 }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   CREATE & MANAGE ALARMS (PERSISTED IN SQLITE)
   -------------------------------------------------------------------------- */
async function handleCreateAlarm(e) {
    e.preventDefault();
    const time = document.getElementById("alarm-time").value;
    const label = document.getElementById("alarm-label").value.trim();
    const cognitiveType = document.getElementById("cognitive-type").value;
    const difficulty = document.getElementById("cognitive-difficulty").value;
    const sound = document.getElementById("alarm-sound").value;

    const snoozeTime = parseInt(document.getElementById("alarm-snooze")?.value) || 5;
    const checkedDays = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value);

    if (checkedDays.length === 0) {
        showToast("Please select at least one repeat day.", "error");
        return;
    }

    try {
        const newAlarm = await apiRequest('/alarms', 'POST', {
            time,
            label,
            days: checkedDays,
            cognitiveType,
            difficulty,
            sound,
            snoozeTime
        });

        alarmsList.unshift(newAlarm);
        updateUserUIHeader();
        showToast("New alarm saved with " + snoozeTime + "m snooze duration!", "success");
        navigateTo("view-alarms");
    } catch (err) {
        showToast("Failed to save alarm to database", "error");
    }
}

function renderAlarmsList() {
    const grid = document.getElementById("alarms-grid");
    grid.innerHTML = "";

    if (alarmsList.length === 0) {
        grid.innerHTML = `<div class="card span-2" style="padding: 40px; text-align: center;">
            <i class="fa-regular fa-clock" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
            <h3>No Alarms Configured</h3>
            <p class="text-muted">Create your first alarm to start building your wake-up streak!</p>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="navigateTo('create-alarm')">
                <i class="fa-solid fa-plus"></i> Create Alarm
            </button>
        </div>`;
        return;
    }

    alarmsList.forEach(alarm => {
        const card = document.createElement("div");
        card.className = `alarm-card ${alarm.active ? '' : 'disabled'}`;
        card.innerHTML = `
            <div class="alarm-card-header">
                <div class="alarm-card-time">${alarm.time}</div>
                <label class="switch">
                    <input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="toggleAlarmActive('${alarm.id}')">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="alarm-card-body">
                <div class="alarm-card-title">${escapeHTML(alarm.label)}</div>
                <div class="alarm-days">${alarm.days.join(', ')}</div>
                <div class="alarm-meta-pills">
                    <span class="meta-pill"><i class="fa-solid fa-brain"></i> ${alarm.cognitiveType.toUpperCase()}</span>
                    <span class="meta-pill"><i class="fa-solid fa-layer-group"></i> ${alarm.difficulty}</span>
                    <span class="meta-pill"><i class="fa-solid fa-music"></i> ${alarm.sound}</span>
                    <span class="meta-pill"><i class="fa-solid fa-bed"></i> ${alarm.snoozeTime || 5}m snooze</span>
                </div>
            </div>
            <div class="alarm-card-footer">
                <button class="btn btn-secondary btn-sm" onclick="triggerTestAlarmModal('${alarm.id}')">
                    <i class="fa-solid fa-play"></i> Test & Play Sound
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteAlarm('${alarm.id}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* --------------------------------------------------------------------------
   USER PERFORMANCE EXPORT (PDF, CSV, JSON)
   -------------------------------------------------------------------------- */
function exportPerformanceData(format) {
    const userName = currentUser?.name || 'User';
    const streak = currentUser?.streakCount || 0;
    const bestStreak = currentUser?.bestStreak || 0;
    const totalAlarms = currentUser?.totalAlarms || alarmsList.length || 0;
    const successfulWakes = currentUser?.successfulWakes || 0;
    const snoozes = currentUser?.snoozeCount || 0;
    const successRate = totalAlarms > 0 ? Math.round((successfulWakes / totalAlarms) * 100) : 0;
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
        const payload = {
            metadata: {
                platform: "CognAlarm Cognitive Wake Platform",
                reportTitle: "User Performance Telemetry",
                exportedAt: new Date().toISOString(),
                user: { name: userName, email: currentUser?.email || '' }
            },
            performance: {
                streakDays: streak,
                bestStreakDays: bestStreak,
                totalAlarms,
                successfulWakes,
                snoozeCount: snoozes,
                successRate: successRate + '%',
            },
            configuredAlarms: alarmsList,
            historyLogs: historyLogsList || []
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `CognAlarm_Performance_${dateStr}.json`);
        showToast("Exported user performance as JSON!", "success");
    } else if (format === 'csv') {
        let csv = "COGNALARM USER PERFORMANCE DATA\r\n";
        csv += `Export Date,${new Date().toLocaleString()}\r\n`;
        csv += `User,"${userName}"\r\n\r\n`;
        csv += "PERFORMANCE KPIS\r\nMetric,Value\r\n";
        csv += `Wake-Up Streak,${streak} days\r\n`;
        csv += `Best Streak,${bestStreak} days\r\n`;
        csv += `First-Alarm Success Rate,${successRate}%\r\n`;
        csv += `Successful Wakes,${successfulWakes}\r\n`;
        csv += `Total Snoozes,${snoozes}\r\n`;
        csv += `Total Alarms,${totalAlarms}\r\n\r\n`;
        csv += "CONFIGURED ALARMS\r\nTime,Label,Days,Puzzle Type,Difficulty,Sound,Snooze,Active\r\n";
        alarmsList.forEach(a => {
            csv += `"${a.time}","${(a.label || '').replace(/"/g, '""')}","${(a.days || []).join(';')}",${a.cognitiveType},${a.difficulty},${a.sound},${a.snoozeTime || 5}m,${a.active ? 'Yes' : 'No'}\r\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `CognAlarm_Performance_${dateStr}.csv`);
        showToast("Exported user performance as CSV!", "success");
    } else if (format === 'pdf') {
        const printWin = window.open('', '_blank');
        if (!printWin) {
            showToast("Please allow popups to download PDF report", "error");
            return;
        }
        printWin.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CognAlarm Performance Report - ${escapeHTML(userName)}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e1b4b; background: #fff; }
                    .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
                    h1 { margin: 0; color: #4338ca; font-size: 24px; }
                    .sub { color: #64748b; font-size: 13px; margin-top: 4px; }
                    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 20px 0; }
                    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
                    .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
                    .val { font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 4px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                    th, td { border: 1px solid #e2e8f0; padding: 9px 12px; text-align: left; }
                    th { background: #f1f5f9; font-weight: 700; color: #334155; }
                    .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #e0e7ff; color: #4338ca; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🧠 CognAlarm User Performance Report</h1>
                    <div class="sub">Generated on ${new Date().toLocaleString()} for ${escapeHTML(userName)} (${escapeHTML(currentUser?.email || '')})</div>
                </div>
                <div class="grid">
                    <div class="card"><div class="label">Current Streak</div><div class="val">${streak} Days</div></div>
                    <div class="card"><div class="label">Best Streak</div><div class="val">${bestStreak} Days</div></div>
                    <div class="card"><div class="label">Success Rate</div><div class="val">${successRate}%</div></div>
                    <div class="card"><div class="label">Total Alarms</div><div class="val">${totalAlarms}</div></div>
                </div>
                <h3 style="margin-top: 25px;">Configured Cognitive Alarms</h3>
                <table>
                    <thead><tr><th>Time</th><th>Label</th><th>Schedule</th><th>Puzzle</th><th>Snooze</th><th>Status</th></tr></thead>
                    <tbody>
                        ${alarmsList.map(a => `<tr><td><strong>${a.time}</strong></td><td>${escapeHTML(a.label)}</td><td>${(a.days || []).join(', ')}</td><td><span class="badge">${a.cognitiveType.toUpperCase()}</span></td><td>${a.snoozeTime || 5}m</td><td>${a.active ? 'Active' : 'Disabled'}</td></tr>`).join('')}
                    </tbody>
                </table>
                <p style="margin-top: 35px; font-size: 11px; color: #94a3b8; text-align: center;">Cognitive Alarm Platform Telemetry Report • Verified System Data</p>
                <script>window.onload = function() { window.print(); };<\/script>
            </body>
            </html>
        `);
        printWin.document.close();
        showToast("Prepared PDF performance report!", "success");
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function toggleAlarmActive(alarmId) {
    try {
        const res = await apiRequest(`/alarms/${alarmId}/toggle`, 'PUT');
        const alarm = alarmsList.find(a => a.id === alarmId);
        if (alarm) {
            alarm.active = res.active;
            renderAlarmsList();
            renderUpcomingAlarmsSummary();
            showToast(`Alarm status updated in database`, "info");
        }
    } catch (err) {
        showToast("Failed to update alarm status", "error");
    }
}

async function deleteAlarm(alarmId) {
    try {
        await apiRequest(`/alarms/${alarmId}`, 'DELETE');
        alarmsList = alarmsList.filter(a => a.id !== alarmId);
        updateUserUIHeader();
        renderAlarmsList();
        renderUpcomingAlarmsSummary();
        showToast("Alarm deleted from database", "info");
    } catch (err) {
        showToast("Failed to delete alarm", "error");
    }
}

/* --------------------------------------------------------------------------
   HISTORY MODULE
   -------------------------------------------------------------------------- */
function renderHistoryLogs() {
    const tbody = document.getElementById("history-table-body");
    tbody.innerHTML = "";

    if (historyLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 30px;">No history records found.</td></tr>`;
        return;
    }

    historyLogs.forEach(log => {
        const isSuccess = log.status.toLowerCase().includes("success");
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${log.datetime}</td>
            <td><strong>${escapeHTML(log.alarmLabel)}</strong></td>
            <td>
                <span class="status-badge ${isSuccess ? 'success' : 'snooze'}">
                    <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> ${log.status}
                </span>
            </td>
            <td>${log.puzzleType}</td>
            <td>${log.solveTime}</td>
            <td style="font-weight: 600; color: ${isSuccess ? 'var(--success)' : 'var(--danger)'};">${log.streakImpact}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function clearHistoryLogs() {
    if (confirm("Are you sure you want to clear your wake-up history?")) {
        try {
            await apiRequest('/history', 'DELETE');
            historyLogs = [];
            renderHistoryLogs();
            showToast("History logs cleared in database", "info");
        } catch (err) {
            showToast("Failed to clear history", "error");
        }
    }
}

/* --------------------------------------------------------------------------
   USER PROFILE MODULE (WITH BROWSER FILE UPLOAD)
   -------------------------------------------------------------------------- */
function renderProfilePage() {
    if (!currentUser) return;

    document.getElementById("profile-display-name").textContent = currentUser.name;
    document.getElementById("profile-display-email").textContent = currentUser.email;
    document.getElementById("profile-img-display").src = currentUser.avatar;

    document.getElementById("profile-stat-streak").textContent = currentUser.streakCount;
    document.getElementById("profile-stat-best").textContent = currentUser.bestStreak;
    document.getElementById("profile-stat-total").textContent = currentUser.totalAlarms;

    document.getElementById("profile-name").value = currentUser.name;
    document.getElementById("profile-email").value = currentUser.email;
}

function triggerProfilePhotoUpload(e) {
    if (e) e.stopPropagation();
    document.getElementById("profile-avatar-file-input").click();
}

async function handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("Please select a valid image file", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64DataUrl = event.target.result;

        // Immediately replace current profile photo on UI
        const profileImg = document.getElementById("profile-img-display");
        const headerImg = document.getElementById("header-user-avatar");
        if (profileImg) profileImg.src = base64DataUrl;
        if (headerImg) headerImg.src = base64DataUrl;

        try {
            currentUser = await apiRequest('/user/profile', 'PUT', {
                name: currentUser.name,
                email: currentUser.email,
                avatar: base64DataUrl
            });
            updateUserUIHeader();
            renderProfilePage();
            showToast("Profile photo replaced with new upload and saved in database!", "success");
        } catch (err) {
            showToast("Failed to save profile photo to database", "error");
        }
    };
    reader.readAsDataURL(file);
}

async function handleSaveProfile(e) {
    e.preventDefault();
    const name = document.getElementById("profile-name").value.trim();
    const email = document.getElementById("profile-email").value.trim();

    try {
        currentUser = await apiRequest('/user/profile', 'PUT', {
            name,
            email,
            avatar: currentUser.avatar
        });
        updateUserUIHeader();
        renderProfilePage();
        showToast("Profile settings saved in SQLite database!", "success");
    } catch (err) {
        showToast("Failed to update profile", "error");
    }
}

async function resetUserStatistics() {
    if (confirm("Reset all streak counters and performance stats back to 0?")) {
        try {
            await apiRequest('/user/reset-stats', 'POST');
            currentUser.streakCount = 0;
            currentUser.bestStreak = 0;
            currentUser.totalAlarms = 0;
            currentUser.successfulWakes = 0;
            currentUser.snoozeCount = 0;
            currentUser.solveTimes = [];
            historyLogs = [];

            updateUserUIHeader();
            renderProfilePage();
            renderDashboard();
            renderHistoryLogs();
            showToast("User statistics reset in database.", "info");
        } catch (err) {
            showToast("Failed to reset statistics", "error");
        }
    }
}

/* --------------------------------------------------------------------------
   COGNITIVE ALARM CHALLENGE SIMULATOR (PUZZLE LOGIC & STREAK CALCULATOR)
   -------------------------------------------------------------------------- */
function triggerTestAlarmModal(alarmId) {
    activeTestAlarm = alarmId ? alarmsList.find(a => a.id === alarmId) : alarmsList[0] || {
        label: "Morning Cognitive Awakening",
        cognitiveType: "math",
        difficulty: "medium",
        sound: "energetic"
    };

    document.getElementById("modal-alarm-title").textContent = `ALARM: ${activeTestAlarm.label.toUpperCase()}`;
    document.getElementById("alarm-modal").classList.remove("hidden");

    playAlarmAudio(activeTestAlarm.sound || "energetic");

    puzzleStartTime = Date.now();
    clearInterval(puzzleTimerInterval);
    puzzleTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - puzzleStartTime) / 1000);
        document.getElementById("puzzle-timer").textContent = `Time: ${elapsed}s`;
    }, 1000);

    generatePuzzle(activeTestAlarm.cognitiveType || "math", activeTestAlarm.difficulty || "medium");
}

function generatePuzzle(type, difficulty) {
    const container = document.getElementById("puzzle-content");
    const badge = document.getElementById("puzzle-type-badge");
    container.innerHTML = "";

    if (type === "math") {
        badge.textContent = "Math Arithmetic Challenge";
        let num1 = Math.floor(Math.random() * 20) + 12;
        let num2 = Math.floor(Math.random() * 15) + 8;
        let num3 = Math.floor(Math.random() * 10) + 5;
        let answer = num1 + num2 - num3;

        container.innerHTML = `
            <div class="puzzle-question-text">${num1} + ${num2} - ${num3} = ?</div>
            <div class="puzzle-input-wrapper">
                <input type="number" id="math-answer-input" placeholder="Enter answer" autofocus style="text-align:center; font-size:1.2rem;">
                <button class="btn btn-primary" onclick="checkMathAnswer(${answer})">Submit Answer</button>
            </div>
        `;

        document.getElementById("math-answer-input").addEventListener("keyup", (e) => {
            if (e.key === "Enter") checkMathAnswer(answer);
        });

    } else if (type === "memory") {
        badge.textContent = "Sequence Memory Grid";
        container.innerHTML = `
            <p class="text-center text-muted" style="margin-bottom:10px;">Memorize the glowing tiles and repeat the pattern!</p>
            <div class="memory-grid" id="memory-grid-box">
                <div class="memory-tile" data-idx="0"></div>
                <div class="memory-tile" data-idx="1"></div>
                <div class="memory-tile" data-idx="2"></div>
                <div class="memory-tile" data-idx="3"></div>
                <div class="memory-tile" data-idx="4"></div>
                <div class="memory-tile" data-idx="5"></div>
                <div class="memory-tile" data-idx="6"></div>
                <div class="memory-tile" data-idx="7"></div>
                <div class="memory-tile" data-idx="8"></div>
            </div>
        `;
        startMemoryGame();

    } else if (type === "pattern") {
        badge.textContent = "Color Stroop Test";
        const colors = [
            { name: "RED", hex: "#ef4444" },
            { name: "BLUE", hex: "#3b82f6" },
            { name: "GREEN", hex: "#10b981" },
            { name: "AMBER", hex: "#f59e0b" }
        ];

        const word = colors[Math.floor(Math.random() * colors.length)];
        let fontColor = colors[Math.floor(Math.random() * colors.length)];
        while (fontColor.name === word.name) {
            fontColor = colors[Math.floor(Math.random() * colors.length)];
        }

        container.innerHTML = `
            <p class="text-center text-muted">Select the button matching the <strong>FONT COLOR</strong> (not the word text)!</p>
            <div class="puzzle-question-text" style="color: ${fontColor.hex}; font-size: 2.4rem; margin: 15px 0;">${word.name}</div>
            <div class="stroop-options">
                ${colors.map(c => `<button class="btn btn-secondary" onclick="checkStroopAnswer('${c.name}', '${fontColor.name}')">${c.name}</button>`).join('')}
            </div>
        `;
    }
}

function checkMathAnswer(correctAnswer) {
    const userVal = parseInt(document.getElementById("math-answer-input").value);
    if (userVal === correctAnswer) {
        completeAlarmSuccess();
    } else {
        showToast("Incorrect answer! Try again to turn off alarm sound.", "error");
        document.getElementById("math-answer-input").value = "";
    }
}

function startMemoryGame() {
    memorySequence = [
        Math.floor(Math.random() * 9),
        Math.floor(Math.random() * 9),
        Math.floor(Math.random() * 9)
    ];
    userMemoryInput = [];

    const tiles = document.querySelectorAll(".memory-tile");
    
    let step = 0;
    const interval = setInterval(() => {
        if (step < memorySequence.length) {
            const tileIdx = memorySequence[step];
            tiles[tileIdx].classList.add("highlight");
            setTimeout(() => tiles[tileIdx].classList.remove("highlight"), 500);
            step++;
        } else {
            clearInterval(interval);
            tiles.forEach(tile => {
                tile.addEventListener("click", handleTileClick);
            });
        }
    }, 800);
}

function handleTileClick(e) {
    const idx = parseInt(e.target.getAttribute("data-idx"));
    e.target.classList.add("highlight");
    setTimeout(() => e.target.classList.remove("highlight"), 300);

    userMemoryInput.push(idx);

    if (userMemoryInput[userMemoryInput.length - 1] !== memorySequence[userMemoryInput.length - 1]) {
        showToast("Wrong pattern sequence! Restarting memory test...", "error");
        setTimeout(startMemoryGame, 1000);
        return;
    }

    if (userMemoryInput.length === memorySequence.length) {
        completeAlarmSuccess();
    }
}

function checkStroopAnswer(selectedName, correctFontName) {
    if (selectedName === correctFontName) {
        completeAlarmSuccess();
    } else {
        showToast("Wrong color! Focus on font color.", "error");
    }
}

/* SUCCESS WAKE-UP LOGIC (POSTS TO DATABASE & INCREMENTS STREAK) */
async function completeAlarmSuccess() {
    clearInterval(puzzleTimerInterval);
    stopAlarmAudio();

    const solveSeconds = Math.max(1, Math.floor((Date.now() - puzzleStartTime) / 1000));

    try {
        const response = await apiRequest('/history', 'POST', {
            alarmLabel: activeTestAlarm.label,
            status: 'Success',
            puzzleType: (activeTestAlarm.cognitiveType || 'math').toUpperCase(),
            solveTime: `${solveSeconds}s`
        });

        currentUser = response.user;
        historyLogs.unshift(response.log);

        document.getElementById("alarm-modal").classList.add("hidden");
        updateUserUIHeader();
        renderDashboard();
        renderHistoryLogs();

        showToast(`🌟 ALARM OFF! Saved to DB. Streak increased to ${currentUser.streakCount} days! (+1)`, "success");
    } catch (err) {
        showToast("Failed to sync wake event with database", "error");
    }
}

/* SNOOZE LOGIC (POSTS TO DATABASE & RESETS STREAK TO 0) */
async function handleSnoozeAlarm() {
    clearInterval(puzzleTimerInterval);
    stopAlarmAudio();

    try {
        const response = await apiRequest('/history', 'POST', {
            alarmLabel: activeTestAlarm.label,
            status: 'Snoozed',
            puzzleType: (activeTestAlarm.cognitiveType || 'math').toUpperCase(),
            solveTime: '--'
        });

        const prevStreak = currentUser.streakCount;
        currentUser = response.user;
        historyLogs.unshift(response.log);

        document.getElementById("alarm-modal").classList.add("hidden");
        updateUserUIHeader();
        renderDashboard();
        renderHistoryLogs();

        showToast(`⚠️ Alarm Snoozed! Streak reset to 0 days in SQLite database.`, "error");
    } catch (err) {
        showToast("Failed to sync snooze event with database", "error");
    }
}

/* --------------------------------------------------------------------------
   TOAST NOTIFICATION SYSTEM & UTILS
   -------------------------------------------------------------------------- */
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconMap = {
        success: "fa-circle-check",
        error: "fa-triangle-exclamation",
        info: "fa-circle-info"
    };

    toast.innerHTML = `
        <i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i>
        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
