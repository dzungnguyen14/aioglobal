import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { useGlobal } from '../../state/global';
import { useLang } from '../../shared/hooks';
import { ensureCallPermissionsAndroid } from '../../shared/permissions';
import { answerCall, endCall, getWebviewURL } from '../home/zoom/api';
import { parseCallDeepLink, subscribeIncomingAnswer } from './voip';
import CallLoading from './CallLoading';

// Keeps the loader up while the LiveKit screen slides in.
const HIDE_LOADING_DELAY_MS = 400;
// Safety net so a hung request never leaves the loader covering the app.
const MAX_LOADING_MS = 60000;

async function waitUntil(predicate, tries = 20, delay = 150) {
  for (let i = 0; i < tries; i += 1) {
    if (predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return false;
}

function endCallKeepCall(call) {
  try {
    if (call?.uuid) RNCallKeep.endCall(call.uuid);
  } catch (error) {
    console.warn('endCall failed', error);
  }
}

export default function CallRouter({ navigationRef }) {
  const { state } = useGlobal();
  const { lang } = useLang();
  const pendingRef = useRef(null);
  const joiningRef = useRef(false);
  const [loading, setLoading] = useState(false);
  // Refs so joinCall keeps its identity (re-creating it re-reads the initial deep link).
  const langRef = useRef(lang);
  langRef.current = lang;
  const tokenRef = useRef(state.profile?.token);
  tokenRef.current = state.profile?.token;

  const joinCall = useCallback(async (call) => {
    const token = state.profile?.token;
    if (!call?.roomId || !call?.meetingId) {
      console.warn('joinCall: missing room/meeting id', call);
      return;
    }
    if (!token) {
      // Woken up by the call: wait for Middleware to restore the session.
      pendingRef.current = call;
      setLoading(true);
      return;
    }
    if (joiningRef.current) return;

    joiningRef.current = true;
    setLoading(true);
    let hideDelay = 0;
    try {
      // Before answer_call, so the caller isn't told we picked up a call we can't join.
      const granted = await ensureCallPermissionsAndroid(langRef.current);
      if (!granted) {
        endCallKeepCall(call);
        if (call.counterpartId) {
          await endCall({ meeting_id: call.meetingId, user_id: call.counterpartId }, token);
        }
        return;
      }

      if (call.meetingId && call.counterpartId) {
        await answerCall({ meeting_id: call.meetingId, user_id: call.counterpartId }, token);
      }

      const { livekit } = await getWebviewURL(
        { room_id: call.roomId, meeting_id: call.meetingId },
        token,
      );
      // Logged out (e.g. forced) while joining.
      if (!livekit || tokenRef.current !== token) return;

      const ready = await waitUntil(() => Boolean(navigationRef?.isReady?.()));
      if (ready) {
        navigationRef.navigate('LiveKit', {
          token: livekit.token,
          wsURL: livekit.wsURL,
          calleeID: call.counterpartId,
          callUUID: call.uuid,
        });
        hideDelay = HIDE_LOADING_DELAY_MS;
      }

      if (call.uuid) {
        setTimeout(() => {
          try {
            RNCallKeep.setCurrentCallActive(call.uuid);
          } catch (error) {
            console.warn('setCurrentCallActive failed', error);
          }
        }, 400);
      }
    } catch (error) {
      console.warn('Failed to join VoIP call', error);
    } finally {
      joiningRef.current = false;
      if (hideDelay) {
        setTimeout(() => setLoading(false), hideDelay);
      } else {
        setLoading(false);
      }
    }
  }, [navigationRef, state.profile?.token]);

  useEffect(() => {
    if (pendingRef.current && state.profile?.token) {
      const pending = pendingRef.current;
      pendingRef.current = null;
      joinCall(pending);
    }
  }, [joinCall, state.profile?.token]);

  // No session to restore (or it was revoked): drop the waiting call instead of loading forever.
  useEffect(() => {
    if (!loading) return undefined;
    const dropPendingOnLogin = () => {
      if (!pendingRef.current || navigationRef?.getCurrentRoute?.()?.name !== 'Login') return;
      endCallKeepCall(pendingRef.current);
      pendingRef.current = null;
      setLoading(false);
    };
    dropPendingOnLogin();
    const unsubscribe = navigationRef?.addListener?.('state', dropPendingOnLogin);
    const timer = setTimeout(() => {
      pendingRef.current = null;
      setLoading(false);
    }, MAX_LOADING_MS);
    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [loading, navigationRef]);

  useEffect(() => subscribeIncomingAnswer(joinCall), [joinCall]);

  useEffect(() => {
    const openFromUrl = (url) => {
      const call = parseCallDeepLink(url);
      if (call) joinCall(call);
    };

    Linking.getInitialURL().then((url) => {
      if (url) openFromUrl(url);
    }).catch(() => {});

    const subscription = Linking.addEventListener('url', ({ url }) => openFromUrl(url));
    return () => subscription.remove();
  }, [joinCall]);

  if (!loading) return null;
  return <CallLoading message={lang.joining_call} />;
}
