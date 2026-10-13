import { Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView, FlatList, Alert, } from "react-native";
import styles from "../styles/global";
import IframeScreen from "../components/webview";
import { useLang } from "../shared/hooks";
import { useEffect, useRef, useState } from "react";
import { fetchServices } from "../fetcher/api";
import PagerView from "react-native-pager-view";
import { CustomImage } from "../components/images";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import TextField from "../components/textInput";
import * as WebBrowser from 'expo-web-browser';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BackButton from "../components/home/backButton";

function MapScreen({ navigation, route }) {
    const { lang } = useLang();
    const { type, name } = route.params;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [originalServices, setOriginalServices] = useState([]);
    const [services, setServices] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [filter, setFilter] = useState([]);
    const [search, setSearch] = useState("");
    const [isSearch, setIsSearch] = useState(false);
    const [address, setAddress] = useState('');

    const [region, setRegion] = useState({
        latitude: 21.0278,
        longitude: 105.8342,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    const [marker, setMarker] = useState();

    const ref = useRef(PagerView);

    const setPage = (page) => {
        ref.current.setPage(page);
    }

    const onPressSearch = () => {
        setIsSearch(true);
    }

    const onSelectAddress = async (item) => {
        getLatLng(item);
        const index = services.findIndex(s => s.address == item.address);
        if (index > -1) {
            // ref.current.setPage(index);
        }
    }

    const onCloseSearch = () => {
        setIsSearch(false);
    }

    const onFindWay = async (address) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
        await WebBrowser.openBrowserAsync(url);

    }

    const getLatLng = (address) => {
        const longitude = parseFloat(address.lng);
        const latitude = parseFloat(address.lat);
        console.log(address, latitude, longitude)
        if (latitude && longitude) {
            setRegion({ ...region, latitude: latitude, longitude: longitude });
            setMarker({ longitude , latitude });
        }
    };

    const onLoadServices = async (type) => {
        const response = await fetchServices({
            type: type,
            filter: filter,
            platform: Platform.OS
        });
        if (response.services.length > 0) {
            setServices(response.services);
            setOriginalServices(response.services);
            setKeywords(response.keywords);
            onSelectAddress(response.services[0]);
            setPage(0)
        }
    };


    useEffect(() => {
        onLoadServices(type)
    }, [type]);

    useEffect(() => {
        if (filter.length > 0) {
            setServices(originalServices.filter(service => filter.includes(service.category))); 
        } else {
            setServices(originalServices);
        }
    }, [filter])
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>
                        {name}
                    </Text>
                </View>
            </View>
            {isSearch && (
                <View style={{ flex: 1, flexDirection: 'column', padding: 10 }}>
                    <View style={{ height: 50, position: 'relative' }}>
                        <TextField
                            hideLabel
                            value={search}
                            onChange={(value) => setSearch(value)}
                            placeholder={lang.search_location}
                            required
                        />
                        <TouchableOpacity style={{ position: 'absolute', right: 20, top: 20 }} onPress={() => {
                            setSearch('');
                        }}>
                            <MaterialIcons name="close" size={20} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }}>
                        <FlatList
                            data={services.filter(service => search !== '' && (service.name.indexOf(search) > -1 || service.address.indexOf(search)))}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => {
                                    onSelectAddress(item.address);
                                    setSearch(item.address);
                                    onCloseSearch()
                                }}
                                    style={{
                                        padding: 10,
                                        marginBottom: 10
                                    }}
                                >
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item.id}
                        />
                        <TouchableOpacity style={[styles.button, { marginTop: 50 }]} onPress={onCloseSearch}>
                            <Text style={styles.buttonLabel}>{lang.close}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}
            {!isSearch && (
                <>
                    <View style={{ position: 'absolute', top: Platform.OS == 'ios' ? 110 : 70, left: 20, width: Dimensions.get('screen').width - 40, zIndex: 99 }}>
                        <TouchableOpacity style={{
                            flex: 1,
                            borderWidth: 0.5,
                            borderColor: '#ddd',
                            backgroundColor: '#fff',
                            padding: 10,
                            borderRadius: 20,
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                            onPress={() => onPressSearch()}
                        >
                            <Ionicons name="search" style={{ marginRight: 10 }} size={20} color={'gray'} />
                            <Text style={{ fontSize: 14, color: 'gray' }}>
                                {search ? search : lang.search_location}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {keywords.length > 0 && (
                        <ScrollView horizontal style={{ position: 'absolute', top: Platform.OS == 'ios' ? 160 : 120, left: 20, width: Dimensions.get('screen').width - 40, zIndex: 99 }}>
                            {keywords.map((keyword, idx) => {
                                return (
                                    <TouchableOpacity key={idx} style={{
                                        backgroundColor: filter.indexOf(keyword) > -1 ? '#094C9C' : '#fff',
                                        padding: 4,
                                        marginHorizontal: 3,
                                        width: 100,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 20,
                                        borderColor: filter.indexOf(keyword) > -1 ? '#fff' : '#eee',
                                        borderWidth: 0.5,
                                    }}
                                        onPress={() => {
                                            if (filter.indexOf(keyword) > -1) {
                                                setFilter(filter.filter(f => f != keyword));
                                            } else {
                                                setFilter(filter.concat([keyword]));
                                            }
                                        }}
                                    >
                                        <Text style={{ fontWeight: '500', color: filter.indexOf(keyword) > -1 ? '#fff' : '#094C9C', }}>{keyword}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    )}
                    <View style={{ position: 'absolute', bottom: 20, left: 0, width: Dimensions.get('screen').width, zIndex: 99 }}>
                        {services.length > 0 && (
                            <PagerView
                                ref={ref}
                                scrollEnabled={true}
                                style={{ flex: 1, height: 200, }}
                                initialPage={currentIndex}
                                onPageSelected={(e) => {
                                    const addr = services[e.nativeEvent.position];
                                    getLatLng(addr);
                                }}
                            >
                                {services.filter(service => service.name.indexOf(search) > -1 || service.address.indexOf(search) > -1).map((service, index) => (
                                    <View style={{ width: Dimensions.get('screen'), padding: 5, flex: 1 }} key={index}>
                                        <View style={{ flex: 1, flexDirection: 'row', borderRadius: 20, borderWidth: 1, borderColor: '#eee', padding: 10, backgroundColor: '#fff'}}>
                                            <CustomImage
                                                style={{ height: 120, width: 120, borderRadius: 20 }}
                                                source={{ uri: service.image_url }} />
                                            <View style={{ flex: 1, flexDirection: 'column', paddingVertical: 0, paddingHorizontal: 10 }}>
                                                <Text style={{ fontSize: 13, fontWeight: '700' }}>{service.name}</Text>
                                                <Text style={{ fontSize: 12, marginTop: 10 }}>{service.address}</Text>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <TouchableOpacity onPress={() => onFindWay(service.address)} style={[
                                                        styles.button,
                                                        {
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            alignContent: 'center',
                                                            width: 150,
                                                        }]}>
                                                        <Text style={{ fontSize: 14, color: '#fff' }}>
                                                            Chỉ đường {' '}
                                                            <Ionicons name="arrow-forward-circle" size={14} color={'#fff'} />
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>

                                    </View>
                                ))}
                            </PagerView>
                        )}
                    </View>
                    <MapView
                        region={region}
                        style={{ position: 'absolute', top: 0, left: 0, height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, zIndex: 10 }}

                    >
                        {marker && (
                            <Marker
                                coordinate={marker}
                            />
                        )}
                    </MapView>
                </>
            )}

        </KeyboardAvoidingView>
    )
}

export default MapScreen;