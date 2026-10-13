import { Text, View, StatusBar, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import styles from "../styles/global";
import { getItem } from "../shared/utils";
import { featureToggle } from "../fetcher/api";
import { useGlobal } from "../state/global";

function Middleware({ navigation }) {
    const { dispatch } = useGlobal();
    const loadFeatureToggle = async () => { 
        const resp = await featureToggle();
        dispatch({ type: 'SET_FEATURE_TOGGLE', payload: resp });
    }
    const loadData =  () => {
        getItem('USER_TOKEN_KEY').then(res => {
            try {
                const profile = JSON.parse(res);
                dispatch({ type: 'SET_PROFILE', payload: profile });
                if (profile.success) {
                    navigation.navigate("Home", { item : profile })
                } else {
                    navigation.navigate("Login")
                }
            }
            catch {
                navigation.navigate("Login")
            }
        });
    }

    // Handle navigation focus events to check authentication when returning to this screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadFeatureToggle();
            loadData();
        });
        
        // Clean up the listener when component unmounts
        return unsubscribe;
    }, [navigation]);


    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <StatusBar style="auto" />
            <ActivityIndicator size="large" color="#0000ff" />
            {/* <Text style={styles.textNormal}>
                Đang xác thực
            </Text> */}
        </View>
    )
}

export default Middleware;