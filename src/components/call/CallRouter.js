import { useCallback, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { useGlobal } from '../../state/global';
import { answerCall, getWebviewURL } from '../home/zoom/api';
import { parseCallDeepLink, subscribeIncomingAnswer } from './voip';

async function waitUntil(predicate, tries = 20, delay = 150) {
  for (let i = 0; i < tries; i += 1) {
    if (predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return false;
}

export default function CallRouter({ navigationRef }) {
  const { state } = useGlobal();
  const pendingRef = useRef(null);
  const joiningRef = useRef(false);

  const joinCall = useCallback(async (call) => {
    const token = state.profile?.token;
    if (!call?.roomId || !call?.meetingId) {
      console.warn('joinCall: missing room/meeting id', call);
      return;
    }
    if (!token) {
      pendingRef.current = call;
      return;
    }
    if (joiningRef.current) return;

    joiningRef.current = true;
    try {
      if (call.meetingId && call.counterpartId) {
        await answerCall({ meeting_id: call.meetingId, user_id: call.counterpartId }, token);
      }

      const { livekit } = await getWebviewURL(
        { room_id: call.roomId, meeting_id: call.meetingId },
        token,
      );
      if (!livekit) return;

      const ready = await waitUntil(() => Boolean(navigationRef?.isReady?.()));
      if (ready) {
        navigationRef.navigate('LiveKit', {
          token: livekit.token,
          wsURL: livekit.wsURL,
          calleeID: call.counterpartId,
          callUUID: call.uuid,
        });
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
    }
  }, [navigationRef, state.profile?.token]);

  useEffect(() => {
    if (pendingRef.current && state.profile?.token) {
      const pending = pendingRef.current;
      pendingRef.current = null;
      joinCall(pending);
    }
  }, [joinCall, state.profile?.token]);

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

  return null;
}
