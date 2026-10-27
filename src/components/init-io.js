import IO from 'socket.io-client';
import { useGlobal } from '../state/global';
import { ZOOM_API_HOST } from '../shared/constant';
import * as Haptics from 'expo-haptics';
import { AppState, Linking, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import {
  displayIncomingVideoCall,
  getCallSocket,
  getVoipToken,
  markCallEndReported,
  setCallSocket,
  subscribeVoipToken,
} from './call/voip';
import { getDeviceGUID, getSessionLoginAt } from '../shared/device';
import { APP_VERSION } from '../constants/home';

let activeIO = null;
let teardowns = [];


function socketPromise(socket) {
  return function request(type, data = {}) {
    return new Promise((resolve) => {
      socket.emit(type, data, resolve);
    });
  };
};

// Sent in the socket handshake query (socket.io-client v2 has no `auth` option).
const buildHandshakeQuery = async () => {
  const query = {
    platform: Platform.OS,
    os_version: Device.osVersion || String(Platform.Version),
    app_version: APP_VERSION,
    device_model: Device.modelName,
    device_name: Device.deviceName,
    device_guid: await getDeviceGUID(),
    login_at: await getSessionLoginAt(),
  };
  query.notify_token = await messaging().getToken().catch(() => null);
  if (Platform.OS === 'ios') {
    const voipToken = await getVoipToken().catch(() => null);
    if (voipToken) query.voip_token = voipToken;
  }
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v != null && v !== ''));
};

// Closes the current socket for good (no auto-reconnect), e.g. after a forced logout.
export const disconnectIO = () => {
  teardowns.forEach((teardown) => teardown());
  teardowns = [];
  if (activeIO) {
    if (getCallSocket() === activeIO) setCallSocket(null);
    activeIO.disconnect();
    activeIO = null;
  }
};

const initIO = async (token, dispatch, navigation, { onForceLogout } = {}) => {
  const query = await buildHandshakeQuery();
  // A new session (e.g. after logging in again) replaces the previous socket.
  disconnectIO();
  const io =  IO(`${ZOOM_API_HOST}/`, {
    transports: ['websocket'],
    query,
  });
  activeIO = io;

  // Keep the handshake query current so a reconnect carries newly issued tokens.
  teardowns.push(messaging().onTokenRefresh((notifyToken) => {
    io.io.opts.query = { ...io.io.opts.query, notify_token: notifyToken };
  }));
  if (Platform.OS === 'ios') {
    teardowns.push(subscribeVoipToken((voipToken) => {
      io.io.opts.query = { ...io.io.opts.query, voip_token: voipToken };
    }));
  }

  io.request = socketPromise(io);

  io.on('connect', () => {
    io.emit('authenticate', { token });
    console.warn('IO connected');
  });

  io.on('authenticated', () => {
    console.warn('IO authenticated');
    dispatch({ type: 'SET_IO', payload: io });
    setCallSocket(io);
  });

  io.on('message-in', (data) => {
    dispatch({ type: 'SET_NEW_MESSAGE', payload: data.message });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    const { room, message } = data;
  });

  io.on('newProducer', (data) => {
    console.warn('newProducer', data);
  });

  io.on('leave', (data) => {
    console.warn('leave', data);
  });

  io.on('consumers', (data) => {
    console.warn('consumers', data);
  });

  io.on('newPeer', (data) => {
    console.warn('newPeer', data);
  });

  io.on('call', (data) => {
    dispatch({ type: 'SET_END_CALL', payload: false });
    if (Platform.OS === 'ios') {
      if (AppState.currentState === 'active') {
        navigation.navigate('OnCall', {
          room_id: data.room._id,
          meeting_id: data.meetingID,
          counterpart: data.counterpart,
          incoming: true
        });
      } else {
        displayIncomingVideoCall(RNCallKeep, {
          room_id: data.room._id,
          meeting_id: data.meetingID,
          counterpart: data.counterpart,
          callerName: `${data.counterpart.firstName || ''} ${data.counterpart.lastName || ''}`.trim() || 'Incoming call',
          handle: data.counterpart._id,
          hasVideo: true,
        });
      }
    }
  });

  io.on('close', (data) => {
    try {
      console.warn('close', data);
      // The other side hung up and the server already saved the call: don't report it back.
      markCallEndReported(data?.meetingID);
      dispatch({ type: 'SET_END_CALL', payload: true });
    } catch (error) {
      console.warn('close', error);
    }
  });

  io.on('answer', (data) => {
    console.warn('answer', data);
  });

  io.on('remove', (data) => {
    console.warn('remove', data.producerID);
  });

  io.on('onlineUsers', (data) => {
    dispatch({ type: 'SET_ONLINE_USERS', payload: data });
    // console.warn('onlineUsers', data);
  });

  io.on('refresh-meetings', (data) => {
    console.warn('refresh-meetings', data);
  });

  io.on('user-deleted', async () => {
    console.warn('user-deleted');
  });

  // The server sends this to the sessions of other devices when the account signs in elsewhere.
  io.on('force-logout', (data) => {
    console.warn('force-logout', data);
    if (activeIO !== io) return;
    disconnectIO();
    if (onForceLogout) onForceLogout(data || {});
  });

  io.on('typing', (data) => {
    dispatch({ type: 'SET_IS_TYPING', payload: data });
    setTimeout(() => {
      dispatch({ type: 'SET_IS_TYPING', payload: false });
    }, 2000);
  });

  io.on('disconnected', () => { 
    console.warn('disconnected');
  });


  window.onbeforeunload = () => {
    console.warn('leave');
  };
};

export default initIO;
