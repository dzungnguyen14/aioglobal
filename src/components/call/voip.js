import { NativeModules, Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { getItem, setItem } from '../../shared/utils';
import { VOIP_TOKEN_KEY } from '../../shared/constant';

export const CALL_SCHEME = 'exp+aioglobal://livekit';

const incomingCalls = new Map();
const voipTokenListeners = new Set();
const answerListeners = new Set();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeParse(value) {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readHasVideo(value) {
  if (value === false || value === 0 || value === '0' || value === 'false') return false;
  return true;
}

export function isValidCallUUID(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function createCallUUID() {
  return String(uuid.v4()).toLowerCase();
}

export function parseCallPayload(raw = {}) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const counterpart = typeof data.counterpart === 'string'
    ? safeParse(data.counterpart)
    : (data.counterpart || data.payload?.counterpart);

  const roomId = data.room_id || data.roomId || data.room?._id || data.payload?.room_id;
  const meetingId = data.meeting_id || data.meetingID || data.meetingId || data.payload?.meeting_id;
  const counterpartId = data.counterpart_id
    || counterpart?._id
    || data.calleeID
    || data.payload?.counterpart_id;
  const callerName = data.callerName
    || data.localizedCallerName
    || data.title
    || [counterpart?.firstName, counterpart?.lastName].filter(Boolean).join(' ')
    || data.content
    || 'AIOGlobal';
  const handle = data.handle || counterpartId || data.title || 'aio';
  const candidateUUID = data.uuid || data.callUUID || data.call_uuid;

  return {
    uuid: isValidCallUUID(candidateUUID) ? String(candidateUUID).toLowerCase() : createCallUUID(),
    roomId,
    meetingId,
    counterpartId,
    callerName,
    handle: String(handle),
    hasVideo: readHasVideo(data.hasVideo ?? data.has_video),
    counterpart: counterpart && typeof counterpart === 'object' ? counterpart : null,
  };
}

export function cacheIncomingCall(raw) {
  const parsed = parseCallPayload(raw);
  // CallKeep re-emits didDisplayIncomingCall without room/meeting ids; merge so we never
  // lose the data needed to join the room when the user answers.
  const existing = incomingCalls.get(parsed.uuid);
  const call = existing
    ? {
      ...parsed,
      roomId: parsed.roomId || existing.roomId,
      meetingId: parsed.meetingId || existing.meetingId,
      counterpartId: parsed.counterpartId || existing.counterpartId,
      counterpart: parsed.counterpart || existing.counterpart,
      callerName: parsed.callerName === 'AIOGlobal' ? existing.callerName : parsed.callerName,
      handle: parsed.handle === 'aio' ? existing.handle : parsed.handle,
    }
    : parsed;
  incomingCalls.set(call.uuid, call);
  return call;
}

export function getCachedCall(callUUID) {
  if (!callUUID) return null;
  return incomingCalls.get(String(callUUID).toLowerCase()) || incomingCalls.get(callUUID) || null;
}

export function clearCachedCall(callUUID) {
  if (!callUUID) return;
  incomingCalls.delete(String(callUUID).toLowerCase());
  incomingCalls.delete(callUUID);
}

export function buildCallDeepLink(call) {
  const params = new URLSearchParams({
    room_id: call.roomId || '',
    meeting_id: call.meetingId || '',
    counterpart_id: call.counterpartId || '',
    uuid: call.uuid || '',
  });
  return `${CALL_SCHEME}?${params.toString()}`;
}

export function parseCallDeepLink(url) {
  if (!url || typeof url !== 'string' || !url.includes('livekit')) return null;

  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const params = {};
    url.slice(queryIndex + 1).split('&').forEach((pair) => {
      const [key, value = ''] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    if (params.room_id || params.meeting_id) {
      return parseCallPayload({
        room_id: params.room_id,
        meeting_id: params.meeting_id,
        counterpart_id: params.counterpart_id,
        uuid: params.uuid,
      });
    }
  }

  const legacy = url.split('exp+aioglobal://livekit/')[1];
  if (!legacy) return null;
  const parts = legacy.split('-');
  if (parts.length < 3) return null;
  return parseCallPayload({
    room_id: parts[0],
    meeting_id: parts[1],
    counterpart_id: parts.slice(2).join('-'),
  });
}

export function displayIncomingVideoCall(RNCallKeep, raw) {
  if (!RNCallKeep) return null;
  const call = cacheIncomingCall(raw);
  RNCallKeep.displayIncomingCall(
    call.uuid,
    call.handle,
    call.callerName,
    'generic',
    call.hasVideo,
  );
  return call;
}

export async function persistVoipToken(token) {
  if (!token) return;
  await setItem(VOIP_TOKEN_KEY, token);
  voipTokenListeners.forEach((listener) => listener(token));
}

export async function getVoipToken() {
  return getItem(VOIP_TOKEN_KEY);
}

export function subscribeVoipToken(listener) {
  voipTokenListeners.add(listener);
  return () => voipTokenListeners.delete(listener);
}

// Answer events can fire (cold start via CallKit) before any React listener is mounted,
// so buffer them and flush as soon as a listener subscribes.
let pendingAnswers = [];

export function subscribeIncomingAnswer(listener) {
  answerListeners.add(listener);
  if (pendingAnswers.length) {
    const queued = pendingAnswers;
    pendingAnswers = [];
    queued.forEach((call) => listener(call));
  }
  return () => answerListeners.delete(listener);
}

export function notifyIncomingAnswer(call) {
  if (!call) return;
  const cached = incomingCalls.get(String(call.uuid || '').toLowerCase()) || cacheIncomingCall(call);
  if (answerListeners.size === 0) {
    pendingAnswers.push(cached);
    return;
  }
  answerListeners.forEach((listener) => listener(cached));
}

// Android: open the app over the lock screen (and ask to unlock) once a call is answered, so
// React resumes and the call is joined right away instead of after the phone is unlocked.
export function bringCallToForeground(RNCallKeep) {
  if (Platform.OS !== 'android') return;
  try {
    if (NativeModules.CallLockScreen) {
      NativeModules.CallLockScreen.bringToForeground();
    } else if (RNCallKeep) {
      RNCallKeep.backToForeground();
    }
  } catch (e) {
    console.warn('bringCallToForeground failed:', e);
  }
}

// Android: stop showing the app over the lock screen once the call is over.
export function releaseCallLockScreen() {
  if (Platform.OS !== 'android') return;
  try {
    NativeModules.CallLockScreen?.release();
  } catch (e) {
    console.warn('releaseCallLockScreen failed:', e);
  }
}

export function isIOS() {
  return Platform.OS === 'ios';
}

let audioSessionActive = false;
const audioSessionWaiters = new Set();

export function setAudioSessionActive(active) {
  audioSessionActive = Boolean(active);
  if (audioSessionActive) {
    audioSessionWaiters.forEach((resolve) => resolve(true));
    audioSessionWaiters.clear();
  }
}

// Resolves once CallKit has activated the AVAudioSession (or after timeoutMs).
export function waitForCallAudioSession(timeoutMs = 1500) {
  if (audioSessionActive) return Promise.resolve(true);
  return new Promise((resolve) => {
    const done = (value) => {
      clearTimeout(timer);
      audioSessionWaiters.delete(done);
      resolve(value);
    };
    const timer = setTimeout(() => done(false), timeoutMs);
    audioSessionWaiters.add(done);
  });
}
