import { NativeModules, Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { getItem, setItem } from '../../shared/utils';
import { VOIP_TOKEN_KEY } from '../../shared/constant';
import { endCall } from '../home/zoom/api';

export const CALL_SCHEME = 'exp+aioglobal://livekit';

const incomingCalls = new Map();
// meetingId -> time its call ended here. A late push for that meeting must not ring again.
const endedMeetings = new Map();
const ENDED_MEETING_TTL_MS = 10 * 60 * 1000;
const voipTokenListeners = new Set();
const answerListeners = new Set();
const endListeners = new Set();
// meetingIds whose end was already sent to the server. Hanging up, CallKeep's endCall event and
// the other side's "close" can all fire for the same call; only the first one is sent.
const reportedEnds = new Set();
// meetingId -> when both sides were first in the LiveKit room, for the talk time sent on hang-up.
const callStarts = new Map();
// Socket to the call server (init-io.js); null while disconnected.
let callSocket = null;
const END_CALL_ACK_TIMEOUT_MS = 5000;

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

function findCallByMeeting(meetingId) {
  if (!meetingId) return null;
  for (const call of incomingCalls.values()) {
    if (String(call.meetingId) === String(meetingId)) return call;
  }
  return null;
}

function isMeetingEnded(meetingId) {
  if (!meetingId) return false;
  const endedAt = endedMeetings.get(String(meetingId));
  if (!endedAt) return false;
  if (Date.now() - endedAt > ENDED_MEETING_TTL_MS) {
    endedMeetings.delete(String(meetingId));
    return false;
  }
  return true;
}

export function clearCachedCall(callUUID) {
  if (!callUUID) return;
  const call = getCachedCall(callUUID);
  if (call?.meetingId) endedMeetings.set(String(call.meetingId), Date.now());
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
  // The same call can be pushed more than once (Android holds pushes while the phone is locked
  // and delivers them on unlock). The payload has no uuid, so each push would ring a second
  // Telecom call that can't be answered; reuse the one already shown instead.
  const { meetingId } = parseCallPayload(raw);
  if (isMeetingEnded(meetingId)) return null;
  const shown = findCallByMeeting(meetingId);
  if (shown) return cacheIncomingCall({ ...raw, uuid: shown.uuid });

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

// The call was ended from CallKeep (system call UI, or RNCallKeep.endCall). Like answers, this
// can fire on a cold start before React mounts, so buffer it for the first listener.
let pendingEnds = [];

export function subscribeCallEnded(listener) {
  endListeners.add(listener);
  if (pendingEnds.length) {
    const queued = pendingEnds;
    pendingEnds = [];
    queued.forEach((call) => listener(call));
  }
  return () => endListeners.delete(listener);
}

export function notifyCallEnded(call) {
  if (!call) return;
  const ended = { ...call, endedAt: Date.now() };
  if (endListeners.size === 0) {
    pendingEnds.push(ended);
    return;
  }
  endListeners.forEach((listener) => listener(ended));
}

// The server already knows this meeting is over (e.g. the other side hung up): don't send it back.
export function markCallEndReported(meetingId) {
  if (!meetingId) return;
  reportedEnds.add(String(meetingId));
  callStarts.delete(String(meetingId));
}

export function setCallSocket(socket) {
  callSocket = socket;
}

export function getCallSocket() {
  return callSocket;
}

// The other side is in the room: talk time starts now (only the first time counts).
export function markCallStarted(meetingId) {
  if (meetingId && !callStarts.has(String(meetingId))) callStarts.set(String(meetingId), Date.now());
}

// Resolves with the server's ack, or null if the socket is down or doesn't answer in time.
function emitEndCall(payload) {
  const socket = callSocket;
  if (!socket?.connected) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), END_CALL_ACK_TIMEOUT_MS);
    socket.emit('end-call', payload, (ack) => {
      clearTimeout(timer);
      resolve(ack || null);
    });
  });
}

// Hang-up: the server saves the call (talk time) and tells the other side, which ends its call.
// Sent over the socket; the end_call API is the fallback when the socket can't deliver it.
export async function reportCallEnded({ meetingId, counterpartId } = {}, token) {
  if (!meetingId || !token) return null;
  const key = String(meetingId);
  if (reportedEnds.has(key)) return null;
  // Marked before the request so a second path firing meanwhile is skipped.
  reportedEnds.add(key);
  const startedAt = callStarts.get(key);
  callStarts.delete(key);
  const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

  const ack = await emitEndCall({ meetingID: meetingId, counterpartID: counterpartId, duration });
  if (ack?.ok) return { success: true, duration: ack.duration };
  if (ack) console.warn('end-call socket failed', ack.error);

  const result = await endCall({ meeting_id: meetingId, user_id: counterpartId }, token);
  if (result?.success === false) {
    // Let a later path retry.
    reportedEnds.delete(key);
    if (startedAt) callStarts.set(key, startedAt);
    console.warn('end_call failed', result.msg);
  }
  return result;
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
