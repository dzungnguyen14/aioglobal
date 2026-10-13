import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Button, Dimensions } from 'react-native';

export default function VideoScreen({ source }) {

  return (
    <View style={styles.contentContainer}>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  video: {
    width: Dimensions.get('screen').width,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});