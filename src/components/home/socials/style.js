import { Dimensions, Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    // backgroundColor: '#ddd',
  },
  centeredView: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 35 : 45,
    left: 0,
    width: Dimensions.get('screen').width / 2,
    height: Dimensions.get('screen').height - 40,
    backgroundColor: '#fff',
  },
  navigationContainer: {
    padding: 10,
    backgroundColor: '#ddd',
    height: Platform.OS === 'ios' ? Dimensions.get('screen').height - 20 : Dimensions.get('screen').height - 40,
    backgroundColor: '#fff',
    flexDirection: 'column',
    gap: 15,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 0,
  },
  navigationItemText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#000',
  },
  modalContainer: {
    flex: 1,                  // <-- Makes it full height
    margin: 0,                 // <-- Remove default padding
    justifyContent: 'center',
  },
  navigatorWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 35 : 40,
    left: 0,
    width: Dimensions.get('screen').width * 0.7,
    height: Dimensions.get('screen').height - 40,
    backgroundColor: '#fff',
  },
});
