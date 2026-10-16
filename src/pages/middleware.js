import { Text, View, StatusBar, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import styles from "../styles/global";
import { getItemStrict, setItem } from "../shared/utils";
import { featureToggle } from "../fetcher/api";
import { useGlobal } from "../state/global";

function Middleware({ navigation }) {
    const { dispatch } = useGlobal();
    const loadFeatureToggle = async () => { 
        const resp = await featureToggle();
        dispatch({ type: 'SET_FEATURE_TOGGLE', payload: resp });
    }
    // The keychain can be unreadable right after a cold start from a VoIP push on a locked
    // phone. Retry instead of treating the failed read as "logged out".
    const readStoredProfile = async (tries = 20, delay = 500) => {
        for (let i = 0; i < tries; i += 1) {
            try {
                return await getItemStrict('USER_TOKEN_KEY');
            } catch (error) {
                if (i === tries - 1) break;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        return null;
    }
    const loadData = async () => {
        const res = await readStoredProfile();
        try {
            const profile = JSON.parse(res);
            dispatch({ type: 'SET_PROFILE', payload: profile });
            if (profile.success) {
                // Re-save so items written with the old WHEN_UNLOCKED policy get migrated.
                setItem('USER_TOKEN_KEY', res);
                navigation.navigate("Home", { item : profile })
            } else {
                navigation.navigate("Login")
            }
        }
        catch {
            navigation.navigate("Login")
        }
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