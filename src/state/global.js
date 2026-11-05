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
  // The chat tab's conversation list, each room with the user's unreadCount (loaded in pages/home.js).
  recentRooms: [],
  // Bumped to reload recentRooms.
  roomsRefresh: 0,
  // The conversation open on screen (pages/chatbox.js): its messages are read as they come in.
  activeRoomId: null,
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

const authorIdOf = (message) => message.author?._id ?? message.author;

// A message from someone else ('message-in'): shown in its chat if open (newMessage), and its
// conversation moves to the top of recentRooms with the server's unread count, or read when it is
// the one on screen. A conversation not in the list yet reloads the list.
function messageIn(state, { message, unreadCount }) {
  const roomId = String(message.room);
  const room = state.recentRooms.find((item) => item._id === roomId);
  if (!room) return { ...state, newMessage: message, roomsRefresh: state.roomsRefresh + 1 };

  const updated = {
    ...room,
    // the list has lastMessage.author as an ID
    lastMessage: { ...message, author: authorIdOf(message) },
    lastUpdate: message.date,
    lastAuthor: authorIdOf(message),
    unreadCount: state.activeRoomId === roomId ? 0 : unreadCount ?? (room.unreadCount || 0) + 1,
  };
  return {
    ...state,
    newMessage: message,
    recentRooms: [updated, ...state.recentRooms.filter((item) => item !== room)],
  };
}

function markRoomRead(rooms, roomId) {
  if (!rooms.some((room) => room._id === roomId && room.unreadCount)) return rooms;
  return rooms.map((room) => (room._id === roomId ? { ...room, unreadCount: 0 } : room));
}

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
      return { ...state, recentRooms: markRoomRead(action.payload, state.activeRoomId) };
    case 'REFRESH_ROOMS':
      return { ...state, roomsRefresh: state.roomsRefresh + 1 };
    case 'MESSAGE_IN':
      return messageIn(state, action.payload);
    case 'ROOM_READ':
      return { ...state, recentRooms: markRoomRead(state.recentRooms, action.payload) };
    case 'SET_ACTIVE_ROOM':
      return { ...state, activeRoomId: action.payload };
    case 'LEAVE_ACTIVE_ROOM':
      // unless another conversation was opened meanwhile
      return state.activeRoomId === action.payload ? { ...state, activeRoomId: null } : state;
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
