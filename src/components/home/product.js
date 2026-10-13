import { View, Platform, Dimensions, KeyboardAvoidingView, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/global";
import IframeScreen from "../webview";
import BackButton from "./backButton";
import { useState, useEffect } from "react";
import { fetchShoppingUrl } from "../../fetcher/api";
import HomeHeader from "./components/header";
import { Ionicons } from "@expo/vector-icons";

function HomeProduct({ token, lang, onSwitchToBrowser }) {
    const [url, setUrl] = useState();

    const fetchUrl = async () => {
        const resp = await fetchShoppingUrl(token, lang);
        if (resp.url) {
            setUrl(resp.url)
            console.log(lang, resp.url)
        }
    }
    useEffect(() => {
        fetchUrl();
    }, [])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            {url && (
                <View style={{ position: 'absolute', top: Platform.OS == 'ios' ? 70 : 30, left: 0, height: Dimensions.get('screen').height - (Platform.OS == 'ios' ? 140 : 130), width: Dimensions.get('screen').width }}>
                    <IframeScreen url={url} />
                </View>
            )}
            <TouchableOpacity style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 99, top: Platform.OS == 'ios' ? 90 : 50, right: 15, zIndex: 10,  borderRadius: 10, padding: 1, backgroundColor:'#fff' }} onPress={onSwitchToBrowser} >
                <Ionicons name="phone-portrait-outline" size={25} color="green" />
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default HomeProduct;