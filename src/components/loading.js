import { WebView } from 'react-native-webview';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLang } from '../hooks';

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems:'center'
    },
    textLoading: { 
        fontSize: 14,
        fontWeight: '600'
    }
})
function LoadingContainer() {
    const { lang } = useLang();
    return (
        <View style={style.container}>
            <Text style={style.textLoading}>{lang.loading}</Text>
        </View>
    )
}

export default LoadingContainer;