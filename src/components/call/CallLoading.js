import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Full-screen loader shown while an answered call is being joined. Same background as the
// LiveKit screen so moving from one to the other doesn't flash.
export default function CallLoading({ message }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      {!!message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    opacity: 0.85,
  },
});
