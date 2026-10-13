import { Text, View, KeyboardAvoidingView, Platform, FlatList, } from "react-native";
import styles from "../styles/global";
import { useLang } from "../shared/hooks";
import { useEffect, useState } from "react";
import { fetchHistoryPoint } from "../fetcher/api";
import BackButton from "../components/home/backButton";

function MemberScreen({ navigation, route }) {
    const { lang } = useLang();
    const { profile } = route.params;
    const [data, setData] = useState([]);

    const getHistoryPoint = async () => {
        const resp = await fetchHistoryPoint(profile.token);
        if (resp.success) {
            setData(resp.members);
        }
    }
    useEffect(() => {
        getHistoryPoint();
    }, [])
    
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>
                        {lang.members_list}
                    </Text>
                </View>
            </View>
            <FlatList
                data={data}
                renderItem={( { item, index }) => {
                    return (
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            paddingTop: 15,
                            paddingBottom: 15,
                            paddingHorizontal: 30,
                            borderBottomWidth: 1,
                            borderBottomColor: '#e9e9e9'
                        }}>
                            <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
                                <Text style={{ fontSize: 12, fontWeight: '400' }}>{index + 1}. {item.name.toUpperCase()}</Text>
                                <Text style={{ fontSize: 10, fontWeight: '600'}}>({item.email})</Text>
                            </View>
                        </View>
                    )
                }}
            />
        </KeyboardAvoidingView>
    )
}

export default MemberScreen;