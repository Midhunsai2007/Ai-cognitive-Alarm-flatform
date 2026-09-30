'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { alarmAPI } from '../services/api';
import { parse12h, formatTime12h } from '../utils/timeUtils';
import { startAlarmAudio, stopAlarmAudio } from '../services/audio';
import { useAuth } from './AuthContext';
import { PuzzleModal } from '../components/CognitivePuzzles/PuzzleModal';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AlarmMonitorContext = createContext(null);

export function AlarmMonitorProvider({ children }) {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState([]);
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const firedMapRef = useRef(new Set());
  const snoozeQueueRef = useRef([]);

  // Fetch active alarms
  const refreshAlarms = useCallback(async () => {
    try {
      const data = await alarmAPI.getAlarms().catch(() => []);
      if (Array.isArray(data)) {
        setAlarms(data);
      }
    } catch (err) {
      console.warn('Alarm monitor fetch error:', err);
    }
  }, []);

  // Sync alarms on auth and periodic interval
  useEffect(() => {
    refreshAlarms();

    // Listen for alarm updates anywhere in the app
    const handleUpdate = () => refreshAlarms();
    window.addEventListener('alarms-updated', handleUpdate);

    // Refresh every 20s
    const poll = setInterval(refreshAlarms, 20000);

    return () => {
      window.removeEventListener('alarms-updated', handleUpdate);
      clearInterval(poll);
    };
  }, [refreshAlarms, user]);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const requestPerm = () => {
        Notification.requestPermission().catch(() => {});
        window.removeEventListener('click', requestPerm);
      };
      window.addEventListener('click', requestPerm, { once: true });
    }
  }, []);

  // Trigger an alarm
  const triggerAlarm = useCallback((alarm) => {
    console.log('[AlarmMonitor] TRIGGERING ALARM:', alarm);
    setRingingAlarm(alarm);

    // Send browser desktop notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Wake Up! ${alarm.label || 'Alarm'}`, {
          body: `Time: ${formatTime12h(alarm.time)}. Solve your ${alarm.cognitiveType || 'Math'} challenge to disarm!`,
          icon: '/favicon.ico',
          requireInteraction: true,
          tag: `alarm-${alarm.id}`,
        });
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }
  }, []);

  // Snooze handler
  const handleSnoozeAlarm = useCallback((alarm, minutes = 5) => {
    stopAlarmAudio();
    setRingingAlarm(null);
    const snoozeDurationMs = (Number(minutes) || 5) * 60 * 1000;
    const wakeAt = Date.now() + snoozeDurationMs;
    console.log(`[AlarmMonitor] Snoozing alarm ${alarm.id} for ${minutes}m until ${new Date(wakeAt).toLocaleTimeString()}`);
    snoozeQueueRef.current.push({
      alarm,
      wakeAt,
    });
  }, []);

  // Dismiss / solve handler
  const handleDismissAlarm = useCallback(async (alarm, status = 'Success') => {
    stopAlarmAudio();
    setRingingAlarm(null);

    // If alarm is set to 'once', turn it off in database
    if (alarm.frequency === 'once') {
      try {
        await alarmAPI.toggleAlarm(alarm.id);
        refreshAlarms();
      } catch (e) {
        console.warn('Failed to auto-disable once alarm:', e);
      }
    }
  }, [refreshAlarms]);

  // Main 1-second Clock Monitor
  useEffect(() => {
    const timer = setInterval(() => {
      // If an alarm is already ringing, don't trigger another one simultaneously
      if (ringingAlarm) return;

      const now = new Date();
      const currentDay = DAYS_SHORT[now.getDay()]; // e.g. 'Wed'
      const nowH24 = now.getHours();
      const nowM = now.getMinutes();
      const nowMs = now.getTime();

      // 1. Check Snooze Queue first
      for (let i = snoozeQueueRef.current.length - 1; i >= 0; i--) {
        const item = snoozeQueueRef.current[i];
        if (nowMs >= item.wakeAt) {
          snoozeQueueRef.current.splice(i, 1);
          triggerAlarm(item.alarm);
          return;
        }
      }

      // 2. Check Active Scheduled Alarms
      const dateKey = now.toDateString(); // e.g. "Wed Sep 30 2026"

      for (const alarm of alarms) {
        if (!alarm.active) continue;

        // Verify scheduled days
        const days = Array.isArray(alarm.days) && alarm.days.length > 0 ? alarm.days : null;
        if (days && !days.includes(currentDay)) continue;

        // Parse alarm hour & minute into 24-hour format
        const { hour, minute, ampm } = parse12h(alarm.time);
        let alarmH24 = hour % 12;
        if (ampm === 'PM') alarmH24 += 12;

        // Compare hour & minute
        if (alarmH24 === nowH24 && minute === nowM) {
          const triggerKey = `${alarm.id}_${dateKey}_${alarmH24}:${minute}`;
          if (!firedMapRef.current.has(triggerKey)) {
            firedMapRef.current.add(triggerKey);
            triggerAlarm(alarm);
            break; // Ring first matched alarm
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, ringingAlarm, triggerAlarm]);

  return (
    <AlarmMonitorContext.Provider
      value={{
        alarms,
        refreshAlarms,
        ringingAlarm,
        triggerAlarm,
        snoozeAlarm: handleSnoozeAlarm,
        dismissAlarm: handleDismissAlarm,
      }}
    >
      {children}

      {/* Global Wake Challenge Modal (Rings across any page!) */}
      {ringingAlarm && (
        <PuzzleModal
          alarm={ringingAlarm}
          isOpen={true}
          onClose={() => handleDismissAlarm(ringingAlarm, 'Dismissed')}
          onSolveComplete={(status) => {
            if (status === 'Snoozed') {
              handleSnoozeAlarm(ringingAlarm, ringingAlarm.snoozeTime || 5);
            } else {
              handleDismissAlarm(ringingAlarm, status);
            }
          }}
        />
      )}
    </AlarmMonitorContext.Provider>
  );
}

export function useAlarmMonitor() {
  const context = useContext(AlarmMonitorContext);
  if (!context) {
    throw new Error('useAlarmMonitor must be used within an AlarmMonitorProvider');
  }
  return context;
}
