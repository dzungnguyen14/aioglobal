import IO from 'socket.io-client';
import { useGlobal } from '../state/global';
import { ZOOM_API_HOST } from '../shared/constant';
import * as Haptics from 'expo-haptics';
import { AppState, Linking, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { displayIncomingVideoCall } from './call/voip';


function socketPromise(socket) {
  return function request(type, data = {}) {
    return new Promise((resolve) => {
      socket.emit(type, data, resolve);
    });
  };
};

const initIO = (token, dispatch, navigation) => {
  const io =  IO(`${ZOOM_API_HOST}/`, {
    transports: ['websocket'],
  });

  io.request = socketPromise(io);

  io.on('connect', () => {
    io.emit('authenticate', { token });
    console.warn('IO connected');
  });

  io.on('authenticated', () => {
    console.warn('IO authenticated');
    dispatch({ type: 'SET_IO', payload: io });
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
