const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Default initial state
let store = {
    users: [],
    alarms: [],
    history_logs: [],
    solve_times: []
};

// Load data from file
function loadDatabase() {
    if (fs.existsSync(dbPath)) {
        try {
            const raw = fs.readFileSync(dbPath, 'utf8');
            store = JSON.parse(raw);
            if (!store.users) store.users = [];
            if (!store.alarms) store.alarms = [];
            if (!store.history_logs) store.history_logs = [];
            if (!store.solve_times) store.solve_times = [];
        } catch (e) {
            console.error("Error reading database file, using fresh store:", e);
        }
    } else {
        saveDatabase();
    }
}

function saveDatabase() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing database file:", e);
    }
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lnsgcroyrxlwdeyeommn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2djcm95cnhsd2RleWVvbW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzEzNzgsImV4cCI6MjEwNTEwNzM3OH0.dPI7TPVmwAvpzimyTwzWnI1kz6nos-r5rTtjV76_O-o';

// Function to async sync mutations with Supabase
function syncWithSupabase(table, payload, method = 'POST') {
    try {
        const https = require('https');
        const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
        const data = JSON.stringify(payload);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + (url.search || ''),
            method: method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            // response handled silently
        });
        req.on('error', () => {});
        req.write(data);
        req.end();
    } catch (e) {}
}

loadDatabase();


// Database Interface Compatible with SQLite Prepare Statements
const db = {
    prepare: function (sql) {
        const sqlUpper = sql.trim().toUpperCase();

        return {
            get: function (...params) {
                loadDatabase();
                if (sqlUpper.includes('FROM USERS WHERE ID = ?')) {
                    return store.users.find(u => u.id === params[0]) || null;
                }
                if (sqlUpper.includes('FROM USERS WHERE EMAIL = ?')) {
                    return store.users.find(u => u.email === params[0]) || null;
                }
                if (sqlUpper.includes('SELECT COUNT(*) AS COUNT FROM ALARMS WHERE USER_ID = ?')) {
                    const count = store.alarms.filter(a => a.user_id === params[0]).length;
                    return { count };
                }
                if (sqlUpper.includes('FROM ALARMS WHERE ID = ? AND USER_ID = ?')) {
                    return store.alarms.find(a => a.id === params[0] && a.user_id === params[1]) || null;
                }
                return null;
            },
            all: function (...params) {
                loadDatabase();
                if (sqlUpper.includes('FROM ALARMS WHERE USER_ID = ?')) {
                    return store.alarms.filter(a => a.user_id === params[0]).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                }
                if (sqlUpper.includes('FROM HISTORY_LOGS WHERE USER_ID = ?')) {
                    return store.history_logs.filter(h => h.user_id === params[0]).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                }
                if (sqlUpper.includes('FROM SOLVE_TIMES WHERE USER_ID = ?')) {
                    return store.solve_times.filter(s => s.user_id === params[0]).slice(-10);
                }
                return [];
            },
            run: function (...params) {
                loadDatabase();
                let changes = 0;

                if (sqlUpper.startsWith('INSERT INTO USERS')) {
                    const [id, name, email, password_hash, avatar, streak_count, best_streak, total_alarms, successful_wakes, snooze_count] = params;
                    store.users.push({
                        id, name, email, password_hash, avatar,
                        streak_count: streak_count || 0,
                        best_streak: best_streak || 0,
                        total_alarms: total_alarms || 0,
                        successful_wakes: successful_wakes || 0,
                        snooze_count: snooze_count || 0,
                        created_at: new Date().toISOString()
                    });
                    changes = 1;
                } else if (sqlUpper.startsWith('INSERT INTO ALARMS')) {
                    let id, user_id, time, label, days, cognitive_type, difficulty, sound, snooze_time, active;
                    if (params.length >= 10) {
                        [id, user_id, time, label, days, cognitive_type, difficulty, sound, snooze_time, active] = params;
                    } else {
                        [id, user_id, time, label, days, cognitive_type, difficulty, sound, active] = params;
                        snooze_time = 5;
                    }
                    store.alarms.push({
                        id, user_id, time, label, days, cognitive_type, difficulty, sound,
                        snooze_time: snooze_time !== undefined ? Number(snooze_time) : 5,
                        active: active !== undefined ? active : 1,
                        created_at: new Date().toISOString()
                    });
                    changes = 1;
                } else if (sqlUpper.startsWith('INSERT INTO HISTORY_LOGS')) {
                    const [id, user_id, datetime, alarm_label, status, puzzle_type, solve_time, streak_impact] = params;
                    store.history_logs.push({
                        id, user_id, datetime, alarm_label, status, puzzle_type, solve_time, streak_impact,
                        created_at: new Date().toISOString()
                    });
                    changes = 1;
                } else if (sqlUpper.startsWith('INSERT INTO SOLVE_TIMES')) {
                    const [user_id, seconds] = params;
                    store.solve_times.push({
                        id: Date.now(), user_id, seconds, created_at: new Date().toISOString()
                    });
                    changes = 1;
                } else if (sqlUpper.startsWith('UPDATE USERS SET NAME = ?')) {
                    const [name, email, avatar, id] = params;
                    const idx = store.users.findIndex(u => u.id === id);
                    if (idx !== -1) {
                        store.users[idx].name = name;
                        store.users[idx].email = email;
                        store.users[idx].avatar = avatar;
                        changes = 1;
                    }
                } else if (sqlUpper.startsWith('UPDATE USERS SET STREAK_COUNT = ?') || sqlUpper.startsWith('UPDATE USERS\n            SET STREAK_COUNT = ?')) {
                    const [streak_count, best_streak, total_alarms, successful_wakes, snooze_count, id] = params;
                    const idx = store.users.findIndex(u => u.id === id);
                    if (idx !== -1) {
                        store.users[idx].streak_count = streak_count;
                        store.users[idx].best_streak = best_streak;
                        store.users[idx].total_alarms = total_alarms;
                        store.users[idx].successful_wakes = successful_wakes;
                        store.users[idx].snooze_count = snooze_count;
                        changes = 1;
                    }
                } else if (sqlUpper.startsWith('UPDATE USERS SET STREAK_COUNT = 0')) {
                    const [id] = params;
                    const idx = store.users.findIndex(u => u.id === id);
                    if (idx !== -1) {
                        store.users[idx].streak_count = 0;
                        store.users[idx].best_streak = 0;
                        store.users[idx].total_alarms = 0;
                        store.users[idx].successful_wakes = 0;
                        store.users[idx].snooze_count = 0;
                        changes = 1;
                    }
                } else if (sqlUpper.startsWith('UPDATE ALARMS SET ACTIVE = ?')) {
                    const [active, id] = params;
                    const idx = store.alarms.findIndex(a => a.id === id);
                    if (idx !== -1) {
                        store.alarms[idx].active = active;
                        changes = 1;
                    }
                } else if (sqlUpper.startsWith('DELETE FROM ALARMS')) {
                    const [id, user_id] = params;
                    const initialLen = store.alarms.length;
                    store.alarms = store.alarms.filter(a => !(a.id === id && a.user_id === user_id));
                    changes = initialLen - store.alarms.length;
                } else if (sqlUpper.startsWith('DELETE FROM HISTORY_LOGS')) {
                    const [user_id] = params;
                    const initialLen = store.history_logs.length;
                    store.history_logs = store.history_logs.filter(h => h.user_id !== user_id);
                    changes = initialLen - store.history_logs.length;
                } else if (sqlUpper.startsWith('DELETE FROM SOLVE_TIMES')) {
                    const [user_id] = params;
                    const initialLen = store.solve_times.length;
                    store.solve_times = store.solve_times.filter(s => s.user_id !== user_id);
                    changes = initialLen - store.solve_times.length;
                }

                saveDatabase();
                return { changes };
            }
        };
    },
    exec: function () {
        loadDatabase();
    }
};

console.log("Database initialized persistently at:", dbPath);

module.exports = db;
