import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from "react-native";
import styles from "../../styles/global";
import { useEffect, useState, useMemo } from "react";
import { fetchIcons, fetchSupplier } from "../../fetcher/api";
import { AccountImage, GiftImage, HelpImage, RepairImage, ReportImage, VNEIDImage, CustomImage, BackgroundImage, DigitalWalletImage } from "../images";
import { useLang, useProfile } from "../../shared/hooks";
import CustomSlider from "../slider";
import PagerView from 'react-native-pager-view';
import { useNavigation } from '@react-navigation/native'; // Hook to access navigation
import HomeHeader from "./components/header";
import { useGlobal } from "../../state/global";
import { APP_VERSION } from "../../constants/home";

function HomeWidget() {
    const { state } = useGlobal();
    const { featureToggle } = state;
    const { profile } = state;
    const toggleOS = useMemo(() => {
        if (Platform.OS == 'android') return true;
        return featureToggle.ios ? parseInt(featureToggle.ios ?? '0') >= APP_VERSION : false
    }, [featureToggle])

    const navigation = useNavigation();
    const { lang } = useLang();
    const [icons, setIcons] = useState();
    const [supliers, setSupliers] = useState([]);
    const [banners, setBanners] = useState([]);
    const styleImage = { width: 60, height: 60 };

    useEffect(() => {
        if (profile) {
            getIcons();
            setTimeout(() => {
                getSupplier();
            }, 500);
        }
    }, [profile])

    const getIcons = async () => {
        const response = await fetchIcons(profile.token);
        setIcons(response);
    }

    const getSupplier = async () => {
        const response = await fetchSupplier(profile.token);
        setSupliers(response.suppliers ?? []);
        setBanners(response.banners ?? []);

    }


    const handleIcon = (icon) => {
        if (icon.webview_url) {
            navigation.navigate('Webview', { url: icon.webview_url, name: icon.name_vi });
        } else {
            navigation.navigate('Map', { type: icon.id, name: icon.name_vi });
        }
    }
    return (
        <>
            <HomeHeader />
            <ScrollView style={{ backgroundColor: '#d9d9d9', padding: 5 }}>
                <PagerView
                    scrollEnabled={true}
                    style={{ flex: 1, height: 220, }}
                    initialPage={0}
                >
                    {banners.length > 0 ? banners.map((banner, index) => (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }} key={index + 1}>
                            <CustomImage
                                style={{ height: 200, width: Dimensions.get('screen').width - 20, borderRadius: 20, borderWidth: 2, borderColor: '#ddd' }}
                                source={{ uri: banner.image }} />
                        </View>
                    )) : (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }} key={1}>
                            <CustomImage
                                style={{ height: 200, width: Dimensions.get('screen').width - 20, borderRadius: 20, borderWidth: 2, borderColor: '#ddd' }}
                                source={BackgroundImage} />
                        </View>
                    )}
                </PagerView>
                <View style={styles.dashboardItem}>
                    <View>
                        <Text style={[styles.textNormal, { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' }]}>{lang.widgets_and_support}</Text>
                    </View>
                    <View style={{ margin: 'auto', flexWrap: 'wrap', flexDirection: 'row', width: 330, alignContent: 'center', alignSelf: 'center' }}>
                        <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate('IdentityNumber', { profile: profile, mode: 0 })}>
                            <CustomImage source={VNEIDImage} style={{ width: 57, height: 57 }} />
                            <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                VNeID
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate("Support2")}>
                            <CustomImage source={RepairImage} style={styleImage} />
                            <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                {lang.warrenty_and_fix}
                            </Text>
                        </TouchableOpacity>
                        {profile.code && (
                            <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate("Profile", { profile: profile })}>
                                <CustomImage source={AccountImage} style={styleImage} />
                                <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                    {lang.profile}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {/* <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate("Account")}>
                            <CustomImage source={GiftImage} style={styleImage} />
                            <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                {lang.my_gift}
                            </Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate("Support")}>
                            <CustomImage source={HelpImage} style={styleImage} />
                            <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                {lang.technical_support}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate("Report")}>
                            <CustomImage source={ReportImage} style={styleImage} />
                            <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                {lang.report_and_complain}
                            </Text>
                        </TouchableOpacity>
                        {toggleOS && (
                            <TouchableOpacity style={styles.widgetRow} onPress={() => navigation.navigate("DigitalWallet")}>
                                <CustomImage source={DigitalWalletImage} style={styleImage} />
                                <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 11 }]}>
                                    {lang.digital_wallet}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {toggleOS && (
                    <View style={styles.dashboardItem}>
                        <View>
                            <Text style={[styles.textNormal, { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' }]}>{lang.featured_supplier}</Text>
                        </View>
                        <CustomSlider supliers={supliers} navigation={navigation} />
                    </View>
                )}

                {toggleOS && (
                    <View style={styles.dashboardItem}>
                        <View>
                            <Text style={[styles.textNormal, { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' }]}>{lang.smart_service}</Text>
                        </View>
                        <View style={{ margin: 'auto', flexWrap: 'wrap', flexDirection: 'row', width: 330, alignContent: 'center', alignSelf: 'center' }}>
                            {icons && icons.length > 0 && icons.map((icon) => {
                                return (
                                    <TouchableOpacity key={icon.id} style={styles.widgetRow} onPress={() => handleIcon(icon)}>
                                        <CustomImage source={{ uri: icon.icon_url }} style={[styleImage]} />
                                        <Text style={[styles.textNormal, { textAlign: 'center', fontSize: 10 }]}>
                                            {icon.name_vi}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
        </>
    )
}

export default HomeWidget;