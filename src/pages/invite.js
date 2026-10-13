import { Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Alert, Image, } from "react-native";
import styles from "../styles/global";
import { useLang } from "../shared/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { fetchHistoryPoint, fetchInviteInfo } from "../fetcher/api";
import * as Clipboard from 'expo-clipboard';
import BackButton from "../components/home/backButton";

function InviteScreen({ navigation, route }) {
    const { lang } = useLang();
    const { profile } = route.params;
    const [totalInvite, setTotalInvite] = useState(0);
    const [qrCode, setQrCode] = useState();
    const loadInfoInvite = async () => {
        const response = await fetchInviteInfo(profile.token);
        setQrCode(response.qrcode ? response.qrcode : null);
    }

    const getHistoryPoint = async () => {
        const resp = await fetchHistoryPoint(profile.token);
        if (resp.success) {
            setTotalInvite(resp.members.length);
        }
    }
    useEffect(() => {
        loadInfoInvite();
        getHistoryPoint();
    }, []);

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
        Alert.alert(text)
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <BackButton onBack={() => navigation.goBack()} top={0} />
                        <Text style={[styles.homeName]}>
                            {lang.invite_friend}
                        </Text>
                    </View>
                </View>
            </View>
            <ScrollView style={{ flex: 1, flexDirection: 'collumns', backgroundColor: "#eee" }}>
                <TouchableOpacity onPress={() => navigation.navigate('Members', { profile: profile })} style={styles.profileRow}>
                    <View style={styles.profileRowCenter}>
                        <Text style={styles.labelProfile}>{lang.invite_success}</Text>
                    </View>
                    <View style={[styles.profileRowRight, { flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', gap: 5 }]}>
                        <Text style={{color: '#094C9C', fontWeight:'700'}}>{totalInvite}</Text>
                        <Ionicons name="person-add" />
                    </View>
                </TouchableOpacity>
                <View style={styles.profileRow} >
                    <View style={[styles.profileRowCenter, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.labelProfile}>{lang.code_ref}</Text>
                        <Text style={[styles.labelProfile, { color: 'orange' }]}>{profile.ref_code}</Text>

                    </View>
                    <View style={[styles.profileRowRight]}>
                        <TouchableOpacity onPress={() => copyToClipboard(profile.ref_code)}>
                            <Text style={[styles.buttonLabel, { color: 'blue', textAlign: 'left' }]}>{lang.copy}</Text>
                        </TouchableOpacity>
                        {qrCode &&
                            <Image source={{ uri: qrCode }} width={200} height={200} />
                        }
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default InviteScreen;