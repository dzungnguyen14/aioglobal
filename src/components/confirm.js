import { useLang } from '../shared/hooks';
import { Alert } from "react-native";
import { useCallback } from 'react';

const useConfirmDialog = () => {
    const { lang } = useLang();

    const onConfirmDialog = useCallback((title, onConfirmText, onConfirm) => {
        Alert.alert(title, onConfirmText, [
            {
                text: lang.confirm,
                onPress: onConfirm
            },
            {
                text: lang.close,
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
        ]);
    }, [lang]);

    return onConfirmDialog;
}

export default useConfirmDialog;