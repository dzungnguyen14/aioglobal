import { View, TouchableOpacity, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useMemo } from "react";
import { countNotifications, fetchSupplier } from "../../../../fetcher/api";
import { APP_VERSION } from "../../../../constants/home";
import { useLang } from "../../../../shared/hooks";
import { useGlobal } from "../../../../state/global";
import { useNavigation } from "@react-navigation/native";
import styles from "./style";

const TabRightIcon = ({ isShowAccount, onShowAccount }) => {
    const navigation = useNavigation();
    const { state } = useGlobal();
    const { profile, featureToggle } = state;
    const { lang } = useLang();
    const [browserUrl, setBrowserUrl] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);
    const toggleOS = useMemo(() => {
        if (Platform.OS == 'android') return true;
        return featureToggle.ios ? parseInt(featureToggle.ios ?? '0') >= APP_VERSION : false
    }, [featureToggle])

    const getNotificationCount = async () => {
        const response = await countNotifications(profile.token);
        setNotificationCount(response.count);
    }

    useEffect(() => {
        if (profile) {
            getSupplier();
            getNotificationCount();
        }
    }, [])



    const getSupplier = async () => {
        const response = await fetchSupplier(profile.token);
        setBrowserUrl(response.app_browser ?? 'https://google.com/search?q=ktsmaill');
    }
    if (!toggleOS) return <></>
    return (
        <>
            <View style={{ flex : 1, flexDirection: 'row', justifyContent:'flex-end', alignContent:'flex-end' }}>
                <TouchableOpacity style={styles.rightIcon} onPress={() => navigation.navigate('Browser', { browserUrl: browserUrl })}>
                    <Ionicons name="globe" color={'#fff'} size={15} />
                    <Text style={styles.rightIconText}>{lang.browser}</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={() => navigation.navigate('Chatbox', { item: profile })}><CustomImage source={ChatImage} style={{ width: 20, height: 20 }} /></TouchableOpacity> */}
                <TouchableOpacity style={styles.rightIcon} onPress={() => navigation.navigate("BarcodeScanner")}>
                    <Ionicons name="qr-code" color={'#fff'} size={15} />
                    <Text style={styles.rightIconText}>{lang.scan_qr}</Text>
                </TouchableOpacity>
                {!isShowAccount && 
                    <TouchableOpacity style={[styles.rightIcon, { position: 'relative'}]} onPress={() => navigation.navigate('Notifications', { item: profile })}>
                        <Ionicons name="notifications" color={'#fff'} size={15} />
                        <Text style={styles.rightIconText}>{lang.notifications}</Text>
                        {notificationCount > 0 && <Text style={{ position: 'absolute', top: -5, right: 15, backgroundColor: 'red', color: 'white', fontSize: 9, padding: 2, borderRadius: 5 }}>{notificationCount}</Text>}
                    </TouchableOpacity>
                }
                {isShowAccount &&  onShowAccount && (
                    <TouchableOpacity style={styles.rightIcon} onPress={onShowAccount}>
                        <Ionicons name="person-circle" color={'#fff'} size={25} />
                    </TouchableOpacity>
                )}
            </View>
        </>
    )
}

export default TabRightIcon;