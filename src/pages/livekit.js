import * as React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  AudioSession,
  LiveKitRoom,
  useTracks,
  VideoTrack,
  isTrackReference,
  useLocalParticipant,
} from '@livekit/react-native';
import { Track, LogLevel, setLogLevel } from 'livekit-client';
import { Ionicons } from '@expo/vector-icons';
import { useGlobal } from '../state/global';
import { endCall } from '../components/home/zoom/api';
import { TabRoute } from './home';
import RNCallKeep from 'react-native-callkeep';
import { waitForCallAudioSession } from '../components/call/voip';


setLogLevel(LogLevel.debug);

const RoomView = ({ navigation, profile, calleeID, callUUID }) => {
  const { dispatch, state } = useGlobal();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.Microphone, withPlaceholder: false },
  ]);
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  // Enable camera and microphone on mount
  useEffect(() => {
    const enableDevices = async () => {
      try {
        await localParticipant.setCameraEnabled(true);
        await localParticipant.setMicrophoneEnabled(true);
      } catch (error) {
        console.error('Error enabling devices:', error);
      }
    };
    
    if (localParticipant) {
      enableDevices();
    }
  }, [localParticipant]);
  
  // Separate local and remote tracks - only filter camera tracks for video display
  const cameraTrackRefs = tracks.filter(trackRef => 
    isTrackReference(trackRef) && trackRef.publication.source === Track.Source.Camera
  );
  
  const localTrack = cameraTrackRefs.find(track => 
    track.participant.identity === localParticipant.identity
  );
  const remoteTracks = cameraTrackRefs.filter(track => 
    track.participant.identity !== localParticipant.identity
  );

  useEffect(() => {
    if (state.IS_END_CALL) {
      navigation.navigate("Home", { item: profile });
      dispatch({ type: 'SET_END_CALL', payload: false });
    }
  }, [state.IS_END_CALL]);
  
  const handleLeaveMeeting = async () => {
    try {
      navigation.navigate("Home", { item: profile, screen: TabRoute.TabContact });
      if (callUUID) {
        RNCallKeep.endCall(callUUID);
      } else {
        RNCallKeep.endAllCalls();
      }
      // await endCall({ meeting_id: FCMData.meeting_id, user_id: calleeID }, profile.token);

    } catch (error) {
      console.error('Error leaving meeting:', error);
      navigation.navigate("Home", { item: profile })
    }
  };

  const toggleMute = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(isCameraOff);
      setIsCameraOff(!isCameraOff);
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const renderRemoteTrack = ({ item }) => {
    if (isTrackReference(item)) {
      return (
        <View style={styles.remoteParticipantView}>
          <VideoTrack trackRef={item} style={styles.videoTrack} />
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{item.participant.identity}</Text>
          </View>
        </View>
      )
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Remote participants in full screen */}
      {remoteTracks.length > 0 ? (
        <FlatList
          data={remoteTracks}
          renderItem={renderRemoteTrack}
          keyExtractor={(item, index) => `remote-${index}`}
          style={styles.remoteContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang kết nối...</Text>
        </View>
      )}
      
      {/* Local participant in small overlay */}
      {localTrack && isTrackReference(localTrack) && (
        <View style={styles.localParticipantContainer}>
          <VideoTrack trackRef={localTrack} style={styles.localVideoTrack} />
          <View style={styles.localParticipantInfo}>
            <Text style={styles.localParticipantName}>Bạn</Text>
          </View>
        </View>
      )}
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Ionicons name='mic' size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, isCameraOff && styles.controlButtonActive]} onPress={toggleCamera}>
          <Ionicons name='camera' size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.controlButtonActive]} onPress={handleLeaveMeeting}>
          <Ionicons name='close' size={24} color="#fff" />
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

export default function LiveKitScreen({ route, navigation }) {
  const { state } = useGlobal();
  const { profile } = state;
  const { token, wsURL, calleeID, callUUID } = route.params;
  const [connected, setConnected] = useState(false);

  // Start the audio session first.
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      // On iOS, CallKit owns the audio session; start WebRTC audio only after it is active.
      if (Platform.OS === 'ios' && callUUID) {
        await waitForCallAudioSession();
      }
      if (cancelled) return;
      await AudioSession.startAudioSession();
      if (!cancelled) setConnected(true);
    };
    start().catch((error) => console.warn('startAudioSession failed', error));
    return () => {
      cancelled = true;
      AudioSession.stopAudioSession();
    };
  }, [callUUID]);
  

  if (!token || !wsURL || !connected) return null;
  console.log("Token : " + token, "WS URL : " + wsURL, "Connected : " + connected);

  return (
    <LiveKitRoom
      serverUrl={wsURL}
      token={token}
      connect={true}
      onConnected={() => console.log('✅ Connected to LiveKit')}
      onDisconnected={() => console.log('❌ Disconnected')}
      onConnectionError={(err) => console.log('🚨 Connection error:', err)}
      onConnectionStateChanged={(state) => console.log('📡 State:', state)}
      onParticipantDisconnected={(participant) => console.log('🚨 Participant disconnected:', participant)}
      options={{
        adaptiveStream: { pixelDensity: 'screen' },
        videoCaptureDefaults: {
          resolution: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            frameRate: 30,
          },
        },
      }}
      audio={true}
      video={true}
    >
      <RoomView navigation={navigation} profile={profile} calleeID={calleeID} callUUID={callUUID} />
    </LiveKitRoom>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteContainer: {
    flex: 1,
  },
  remoteParticipantView: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  videoTrack: {
    width: '100%',
    height: '100%',
  },
  participantInfo: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
  localParticipantContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  localVideoTrack: {
    width: '100%',
    height: '100%',
  },
  localParticipantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  localParticipantName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
  },
  controlButton: {
    backgroundColor: 'rgba(51, 51, 51, 0.9)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  controlButtonActive: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    fontSize: 24,
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});