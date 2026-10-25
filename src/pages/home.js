import { Text, View, TouchableOpacity, Platform, BackHandler, Alert } from "react-native";
import { useEffect, useMemo, useState, useCallback, useRef, createContext, useContext, memo } from "react";
import styles from "../styles/global";
import HomeWidget from "../components/home/widget";
import HomeProfile from "../components/home/account";
import HomeProduct from "../components/home/product";
import SocialDashboard from "../components/home/socials";
import EcommerceLoading from "../components/home/ecommerce/loading";
import { useLang, useGetDeviceInfo } from "../shared/hooks";
import { APP_VERSION } from "../constants/home";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeZoom from "../components/home/zoom";
import { clearItem, getItem, setItem } from "../shared/utils";
import { USER_TOKEN_KEY, USER_TERMS_AGREED, WALLET_STORAGE_TOKEN_KEY } from "../shared/constant";
import TermsAgreementModal from "../components/terms-agreement";
import { fetchVersion, updatePushToken } from "../fetcher/api";
import { getVoipToken, subscribeVoipToken } from "../components/call/voip";
// import { reloadAppAsync } from "expo";+
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import initIO, { disconnectIO } from "../components/init-io";
import { useGlobal } from "../state/global";
import messaging from '@react-native-firebase/messaging';
import useConfirmDialog from "../components/confirm";
import RNCallKeep from 'react-native-callkeep';

const Tab = createBottomTabNavigator();

export const TabRoute = {
  TabHome: 'TabHome',
  TabContact: 'TabContact',
  TabStore: 'TabStore',
  TabWidget: 'TabWidget',
  TabAccount: 'TabAccount',
};

const HomeScreenContext = createContext(null);

const TAB_ICONS = {
  [TabRoute.TabHome]: { on: 'home', off: 'home-outline' },
  [TabRoute.TabContact]: { on: 'chatbubbles', off: 'chatbubbles-outline' },
  [TabRoute.TabStore]: { on: 'storefront', off: 'storefront-outline' },
  [TabRoute.TabWidget]: { on: 'apps', off: 'apps-outline' },
  [TabRoute.TabAccount]: { on: 'person', off: 'person-outline' },
};

const HomeTab = memo(({ profile, navigation, toggleOS }) => {
  return <HomeWidget profile={profile} navigation={navigation} toggleOS={toggleOS} />;
});

const NewfeedTab = memo(({ profile, navigation, toggleOS  }) => {
  return <SocialDashboard profile={profile} navigation={navigation} toggleOS={toggleOS} />
});

const ZoomTab = memo(({ profile, navigation, token, lang }) => {
  // return <TeamsContactScreen profile={profile} navigation={navigation} token={token} lang={lang} />;
  return <HomeZoom profile={profile} navigation={navigation} token={token} lang={lang} />;
});

const AccountTab = memo(({ profile, navigation, toggleOS }) => {
  return <HomeProfile profile={profile} navigation={navigation} toggleOS={toggleOS} />;
});

const StoreTab = memo(({ profile, navigation, token, lang }) => {
  const [useInApp, setUseInApp] = useState(2);
  const onConfirmDialog = useConfirmDialog();

  const getInfo = async () => {
    const toggle = await getItem('USE_IN_APP_STORE');
    if (toggle) {
      setUseInApp(parseInt(toggle));
    } else {
      setUseInApp(2);
    }
  }

  useEffect(() => {
    getInfo();
  }, []);

  const onSwitchToBrowser = (value) => {
    const label = value === 1 ? "ứng dụng" : "web";

    onConfirmDialog('Chuyển đổi trang', `Bạn có chắc chắn muốn chuyển đổi sang phiên bản ${label}?`, async () => {
      await setItem('USE_IN_APP_STORE', value);
      setUseInApp(value);
    });
  }
  if (useInApp == 1) {
    return <EcommerceLoading navigation={navigation} profile={profile} />
    // return <EcommercePage profile={profile} onSwitchToBrowser={()=> onSwitchToBrowser(2)} />
  } else if (useInApp == 2) {
    return <HomeProduct profile={profile} navigation={navigation} token={token} lang={lang} onSwitchToBrowser={() => onSwitchToBrowser(1)} />;
  } else {
    return <></>;
  }
});

const TabNewfeedScreen = memo(function TabNewfeedScreen({ navigation }) {
  const ctx = useContext(HomeScreenContext);
  if (!ctx) return null;
  return <NewfeedTab profile={ctx.profile} navigation={navigation} token={ctx.item?.token} toggleOS={ctx.toggleOS} isNewFeature={ctx.isNewFeature} />;
});
const TabZoomScreen = memo(function TabZoomScreen({ navigation }) {
  const ctx = useContext(HomeScreenContext);
  if (!ctx) return null;
  return <ZoomTab profile={ctx.profile} navigation={navigation} token={ctx.item?.token} lang={ctx.lang} />;
});
const TabHomeWidgetScreen = memo(function TabHomeWidgetScreen({ navigation }) {
  const ctx = useContext(HomeScreenContext);
  if (!ctx) return null;
  return <HomeTab profile={ctx.profile} navigation={navigation} toggleOS={ctx.toggleOS} />;
});
const TabAccountScreen = memo(function TabAccountScreen({ navigation }) {
  const ctx = useContext(HomeScreenContext);
  if (!ctx) return null;
  return <AccountTab profile={ctx.profile} navigation={navigation} toggleOS={ctx.toggleOS} />;
});
const TabStoreScreen = memo(function TabStoreScreen({ navigation }) {
  const ctx = useContext(HomeScreenContext);
  if (!ctx) return null;
  return <StoreTab profile={ctx.profile} navigation={navigation} token={ctx.item?.token} lang={ctx.lang} />;
});

const HomeScreen = ({ navigation, route }) => {
  const { item } = route.params ?? {};
  const { lang, value } = useLang();
  const { state, dispatch } = useGlobal();
  const { profile } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [zoomToken, setZoomToken] = useState(null);
  const [isNewFeature, setIsNewFeature] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const deviceInfo = useGetDeviceInfo();
  const navigationRef = useRef(navigation);

  useEffect(() => {
    navigationRef.current = navigation;
  }, [navigation]);

  useEffect(() => {
    getItem(USER_TERMS_AGREED).then((val) => {
      if (val !== 'true') setShowTerms(true);
    });
  }, []);

  const onAgreeTerms = useCallback(async () => {
    await setItem(USER_TERMS_AGREED, 'true');
    setShowTerms(false);
  }, []);

  const toggleOS = useMemo(() => {
    if (Platform.OS === 'android') return true;
    return state.featureToggle.ios ? parseInt(state.featureToggle.ios) >= APP_VERSION : false;
  }, [state.featureToggle.ios]);

  const forceLoggedOutRef = useRef(false);
  // Used by both the version check and the socket `force-logout` event. The session is ended
  // right away (not on alert dismiss) so nothing keeps running on the revoked account.
  const handleForceLogout = useCallback(() => {
    if (forceLoggedOutRef.current) return;
    forceLoggedOutRef.current = true;
    disconnectIO();
    clearItem(USER_TOKEN_KEY);
    clearItem(WALLET_STORAGE_TOKEN_KEY);
    dispatch({ type: 'SET_IO', payload: null });
    dispatch({ type: 'SET_ZOOM_TOKEN', payload: null });
    dispatch({ type: 'SET_PROFILE', payload: {} });
    // Reset (not navigate) so an open call/LiveKit screen is unmounted too.
    navigationRef.current.reset({ index: 0, routes: [{ name: 'Login' }] });
    Alert.alert("", lang.force_logout_message);
  }, [dispatch, lang]);
  const forceLogoutRef = useRef(handleForceLogout);
  forceLogoutRef.current = handleForceLogout;

  const getVersion = useCallback(async (token) => {
    const resp = await fetchVersion(token, value);

    // Before zoom_token, so no socket is opened for a session that is being revoked.
    if (resp.force_logout) {
      handleForceLogout();
      return;
    }

    if (resp.zoom_token) {
      setZoomToken(resp.zoom_token);
      dispatch({ type: 'SET_ZOOM_TOKEN', payload: resp.zoom_token });
    }

    if (resp.is_new_feature) {
      setIsNewFeature(resp.is_new_feature);
    }

    setIsLoading(false);
  }, [value, handleForceLogout, dispatch]);

  useEffect(() => {
    if (item?.token) {
      getVersion(item.token);
    }
  }, [item, getVersion]);

  const ctxValue = useMemo(() => ({
    profile,
    item,
    toggleOS,
    isNewFeature,
    lang: value,
    navigation,
  }), [profile, item, toggleOS, isNewFeature, value, navigation]);

  const listenersHomeFocus = useMemo(() => ({
    focus: () => dispatch({ type: 'SET_IS_SOCIAL_PAGE', payload: true }),
  }), [dispatch]);
  const listenersChatFocus = useMemo(() => ({
    focus: () => dispatch({ type: 'SET_IS_SOCIAL_PAGE', payload: false }),
  }), [dispatch]);
  const listenersShopFocus = useMemo(() => ({
    focus: () => dispatch({ type: 'SET_IS_SOCIAL_PAGE', payload: false }),
  }), [dispatch]);
  const listenersWidgetFocus = useMemo(() => ({
    focus: () => dispatch({ type: 'SET_IS_SOCIAL_PAGE', payload: false }),
  }), [dispatch]);
  const listenersAccountFocus = useMemo(() => ({
    focus: () => dispatch({ type: 'SET_IS_SOCIAL_PAGE', payload: false }),
  }), [dispatch]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!item?.token || !deviceInfo) return;

    const sendPushTokens = async (voipToken) => {
      try {
        // FCM failure (e.g. permission denied) must not block sending the VoIP token.
        const pushToken = await registerForPushNotificationsAsync().catch((err) => {
          console.warn("Failed to get FCM token:", err);
          return null;
        });
        const voip = voipToken || (Platform.OS === 'ios' ? await getVoipToken() : null);
        if (!pushToken && !voip) return;
        // await updatePushToken({
        //   ...deviceInfo,
        //   push_token: pushToken,
        //   voip_token: voip || undefined,
        //   access_token: item.token,
        //   platform: Platform.OS,
        // }, item.token);
      } catch (err) {
        console.error("Error updating push token:", err);
      }
    };

    sendPushTokens();
    const unsubscribeVoip = Platform.OS === 'ios' ? subscribeVoipToken(sendPushTokens) : null;
    return () => {
      if (unsubscribeVoip) unsubscribeVoip();
    };
  }, [item?.token, deviceInfo]);

  useEffect(() => {
    if (zoomToken && zoomToken !== '') {
      initIO(zoomToken, dispatch, navigation, {
        onForceLogout: () => forceLogoutRef.current(),
      });
    }
  }, [zoomToken, dispatch, navigation]);

  const registerForPushNotificationsAsync = async () => {
    let token = null;
    await messaging().requestPermission();
    token = await messaging().getToken();
    return token;
  };

  const handleNotification = useCallback((notification) => {
    const { title, body, data } = notification;
    try {
      const { service, room, counterpart, meetingID } = data;
      if (room && counterpart && meetingID) {
        if (service === 'call') {
          navigation.navigate('OnCall', { room_id: room._id, counterpart, meeting_id: meetingID, incoming: true });
        } else {
          navigation.navigate('Chatbox', { room_id: room._id, counterpart, meeting_id: meetingID });
        }
      }
    } catch (error) {
      console.error("Error parsing notification data:", error);
    }
  }, [navigation]);

  const handleMessageNotification = useCallback(async (notification) => {
    const { title, body } = notification;
    try {
      // Implementation for message notifications
    } catch (error) {
      console.error("Error parsing notification data:", error);
    }
  }, []);

  const screenOptions = useCallback(({ route }) => ({
    headerShown: false,
    lazy: true,
    tabBarIcon: ({ focused, color, size }) => {
      const icons = TAB_ICONS[route.name];
      const name = icons ? (focused ? icons.on : icons.off) : 'ellipse-outline';
      return <Ionicons name={name} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#3f85ca',
    tabBarInactiveTintColor: 'gray',
  }), []);

  if (isLoading)
    return <></>;


  if (profile) {
    return (
      <HomeScreenContext.Provider value={ctxValue}>
        <TermsAgreementModal visible={showTerms} onAgree={onAgreeTerms} lang={lang} />
        <Tab.Navigator initialRouteName={TabRoute.TabHome} screenOptions={screenOptions}>
          <Tab.Screen
            listeners={listenersHomeFocus}
            options={{ tabBarLabel: lang.home }}
            name={TabRoute.TabHome}
            component={TabNewfeedScreen}
          />
          {toggleOS && (
            <Tab.Screen listeners={listenersChatFocus} options={{ tabBarLabel: lang.chats }} name={TabRoute.TabContact} component={TabZoomScreen} />
          )}
          {toggleOS && (
            <Tab.Screen listeners={listenersShopFocus} options={{ tabBarLabel: lang.shopping }} name={TabRoute.TabStore} component={TabStoreScreen} />
          )}
          <Tab.Screen listeners={listenersWidgetFocus} options={{ tabBarLabel: lang.widget }} name={TabRoute.TabWidget} component={TabHomeWidgetScreen} />
          <Tab.Screen listeners={listenersAccountFocus} options={{ tabBarLabel: lang.account }} name={TabRoute.TabAccount} component={TabAccountScreen} />
        </Tab.Navigator>
      </HomeScreenContext.Provider>
    );
  } else {
    return (
      <View style={[styles.container, { paddingTop: 0, flexDirection: 'column' }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17 }}>{lang.something_went_error}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.button}>
            {lang.login}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.back} {lang.login}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

export default HomeScreen;
