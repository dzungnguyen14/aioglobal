import { View, Dimensions, Platform, Text } from "react-native";
import IframeScreen from "../webview";
import { useLang } from "../../shared/hooks";
import { useEffect } from "react";
import { fetchSocialUrl } from "../../fetcher/api";
import { useState } from "react"


function HomeNewfeed({ token }) {
    const { value } = useLang();
    const [url, setUrl] = useState();
    const fetchUrl = async () => {
        const resp = await fetchSocialUrl(token, value);
        setUrl(resp.url)
    }
    useEffect(() => {
        fetchUrl();
    }, [])

    return (
        <>
            {url && (
                <View style={{ position: 'absolute', top: Platform.OS == 'ios' ? 50 : 0, left: 0, height: Dimensions.get('screen').height - (Platform.OS == 'ios' ? 130 : 120), width: Dimensions.get('screen').width }}>
                    <IframeScreen url={url} />
                </View>
            )}
            {!url && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                </View>
            )}
        </>
    )
}

export default HomeNewfeed;