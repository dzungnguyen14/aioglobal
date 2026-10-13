import { Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, } from "react-native";
import styles from "../styles/global";
import { useLang } from "../shared/hooks";
import { useEffect,useState } from "react";
import { fetchHistoryPoint,  } from "../fetcher/api";
import BackButton from "../components/home/backButton";

function PointScreen({ navigation, route }) {
    const { lang } = useLang();
    const { profile } = route.params;
    const [data, setData] = useState([]);

    const getHistoryPoint = async () => {
        const resp = await fetchHistoryPoint(profile.token);
        if (resp.success) {
            setData(resp.data);
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
                        {lang.history_point}
                    </Text>
                </View>
            </View>
            <FlatList
                data={data}
                renderItem={( { item }) => {
                    return (
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            paddingTop: 15,
                            paddingHorizontal: 30,
                            borderBottomWidth: 1,
                            borderBottomColor: '#e9e9e9'
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '400'}}>{item.name}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '400', color:'gray', marginTop: 5}}>{item.description}</Text>
                            </View>
                            <View style={{ flex: 0.5 }}>
                                <Text style={{ fontSize: 14, fontWeight: '900', color: item.value >= 0 ? 'green' : 'red', textAlign:'right'}}>{item.value}</Text>
                            </View>
                        </View>
                    )
                }}
            />
            <TouchableOpacity onPress={() => navigation.navigate('PointIntruction')} style={{ padding: 15, backgroundColor: '#fff', borderRadius: 10, margin: 15 }}>
                <Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center', fontWeight: 'bold'}}>{lang.point_intruction}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default PointScreen;