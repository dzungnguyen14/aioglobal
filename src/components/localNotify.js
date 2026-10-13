import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';
export const useToast = () => {
  const success = (text1, text2) =>
    Toast.show({ type: 'success', text1, text2 });
  const error = (text1, text2) =>
    Toast.show({ type: 'error', text1, text2 });
  const info = (text1, text2) =>
  {
    Alert.alert(text1, text2);
    Toast.show({ type: 'info', text1, text2 });
  }

  return { success, error, info };
};