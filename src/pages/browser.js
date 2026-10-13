import { View, TouchableOpacity, Dimensions, Platform } from "react-native";
import styles from "../styles/global";
import { useState } from "react";
import TextField from "../components/textInput";
import IframeScreen from "../components/webview";
import { Ionicons } from "@expo/vector-icons";
import { openBrowserAsync } from "expo-web-browser";
import { CustomImage, LogoImage } from "../components/images";

function BrowserScreen({ navigation, route }) {
    const { browserUrl } = route.params;
    const [keyword, setKeyWord] = useState();
    const paddingHeight = Platform.OS == 'ios' ? 95 : 75;

    const onOpenBrowser = async () => {
        if (keyword !== '' && typeof window !== 'undefined') {
            await openBrowserAsync(`https://google.com/search?q=${keyword}`);
        }
    }
    return (
        <>
            <View style={[styles.homeHeader, { height: paddingHeight, paddingTop: Platform.OS == 'ios' ? 30: 0 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flex: 0.2, flexDirection:'row', justifyContent: 'center', paddingTop: Platform.OS == 'ios' ? 20 : 10 }}>
                    <View style={{ justifyContent:'center', }}
                         >
                        <Ionicons name="chevron-back" size={30} color={"#3f85ca"} />
                    </View>
                    <CustomImage
                        style={{ height: 30, width: 30, marginLeft: 2 }}
                        source={LogoImage} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <TextField
                        label={''}
                        hideLabel
                        value={keyword}
                        onChange={(value) => setKeyWord(value)}
                        customStyle={{ paddingTop: 10, paddingBottom: 10, height:40, marginBottom:Platform.OS == 'ios' ? 50: 0 }}
                        placeholder={''}
                    />
                </View>
                <View style={{ flex: 0.2, justifyContent: 'center', alignItems:'center', paddingTop: Platform.OS == 'ios' ? 20: 10,  paddingRight: 10 }}>
                    <TouchableOpacity onPress={onOpenBrowser} style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#eee',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        height: 35,
                        width: 35,
                        borderRadius: 10,
                    }}>
                        <Ionicons name="search" size={18} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ position: 'absolute', top: paddingHeight, left: 0, height: Dimensions.get('screen').height - paddingHeight, width: Dimensions.get('screen').width }}>
                {browserUrl && <IframeScreen url={browserUrl} />}
            </View>
        </>
    )
}

export default BrowserScreen;