// GlobalState.js
import React, { createContext, useReducer, useContext } from 'react';
import { featureToggle } from '../fetcher/api';

// 1. Initial state
const initialState = {
  zoomToken: null,
  typing: null,
  isCalling: false,
  io: null,
  onlineUsers: [],
  IS_END_CALL: false,
  recentRooms: [],
  currentRoom: null,
  myZoomID: null,
  historyMessages: {},
  isTyping: false,
  INCOMING_CALL: false,
  favoriteList: [],
  featureToggle: {
    android: 0,
    ios: 0,
  },
  profile: {},
  isSocialPage: true,
  autoPlayVideo: true,
  livekit: {
    roomName: 'b9443edf-fd99-4081-8bbc-345c5a489bbd',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6ImI5NDQzZWRmLWZkOTktNDA4MS04YmJjLTM0NWM1YTQ4OWJiZCJ9LCJpc3MiOiJBUElWcHhkRW5nUHlqV0siLCJleHAiOjE3NjA0MjczMDUsIm5iZiI6MCwic3ViIjp7ImlkZW50aXR5IjoiZ3V1dEBnbWFpbC5jb20iLCJuYW1lIjoiSmVmZmVyIiwiYXZhdGFyIjpudWxsfX0.TBZl5qIOdjZEDDINwOSI2HwYB82zVS1o7k39uoqU5RQ',
  },
  newMessage: false,
  FCMData: null,
  forceEndCall: false,
};

// 2. Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'SET_TYPING':
      return { ...state, typing: action.payload };
    case 'SET_CALLING':
      return { ...state, isCalling: action.payload };
    case 'SET_ZOOM_TOKEN':
      return { ...state, zoomToken: action.payload };
    case 'SET_IO':
      return { ...state, io: action.payload };
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    case 'SET_END_CALL':
      return { ...state, IS_END_CALL: action.payload };
    case 'SET_RECENT_ROOMS':
      return { ...state, recentRooms: action.payload };
    case 'SET_MY_ZOOM_ID':
      return { ...state, myZoomID: action.payload };
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'SET_HISTORY_MESSAGES_BY_ROOM_ID':
      return { ...state, historyMessages: { ...state.historyMessages, [action.payload.room_id]: action.payload.messages } };  
    case 'SET_IS_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_FAVORITE_LIST':
      return { ...state, favoriteList: action.payload };
    case 'SET_FEATURE_TOGGLE': 
      return { ...state, featureToggle: action.payload }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    case 'SET_IS_SOCIAL_PAGE':
      return { ...state, isSocialPage: action.payload }
    case 'SET_AUTO_PLAY_VIDEO':
      return { ...state, autoPlayVideo: action.payload }
    case 'SET_LIVEKIT':
      return { ...state, livekit: action.payload }
    case 'SET_NEW_MESSAGE':
      return { ...state, newMessage: action.payload }
    case 'SET_FCM_DATA':
      return { ...state, FCMData: action.payload ? action.payload : null }
    case 'FORCE_END_CALL':
      return { ...state, forceEndCall: action.payload }
    default:
      return state;
  }
}

// 3. Context
const GlobalContext = createContext();

// 4. Provider
export function GlobalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}

// 5. Custom hook
export function useGlobal() {
  return useContext(GlobalContext);
}
