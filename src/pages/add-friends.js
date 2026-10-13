import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, FlatList, TextInput } from "react-native";
import { useLang } from "../shared/hooks";
import styles from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { addContact, searchContacts } from "../components/home/zoom/api";
import { CustomImage } from "../components/images";

function AddFriendsScreen({ navigation, route }) {
    const { lang } = useLang();
    const { profile, search } = route.params;
    const [phone, setPhone] = useState(search);
    const [contacts, setContacts] = useState([]);

    const [loading, setLoading] = useState(false);
    const onSubmit = async () => {
        if (!phone) {
            Alert.alert(lang.enter_phone_number);
            return;
        }
        setLoading(true);
        const response = await searchContacts({ keywords: phone }, profile.token);
        setLoading(false);
        setContacts(response.data);
    }

    useEffect(() => {
        if (search) {
            onSubmit();
        }
    }, [search])

    const handleAddContact = async (data, token) => {
        setLoading(true);
        const response = await addContact(data, token);
        setLoading(false);
        if (response.room) {
            navigation.navigate('Chatbox', { room_id: response.room._id, counterpart: data.counterpart });
        } else {
            Alert.alert(lang.add_friend_error);
        }
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={index} style={[styles.contactItem, { marginVertical: 10 }]}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <CustomImage source={item.avatar} style={{ width: 30, height: 30, borderRadius: 15, }} />
                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                    <TouchableOpacity onPress={() => handleAddContact({ counterpart: item.zoom_id }, profile.token)} style={{ position: 'absolute', right: 10 }}>
                        <Ionicons name="send" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}>
                <View style={[styles.contactSearch, { zIndex: 999, backgroundColor: '#1976D2' }]}>
                    <View style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" color={'#fff'} size={30} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            clearButtonMode="always"
                            placeholder={lang.search}
                            autoCorrect={false}
                            style={{ width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 10 }}
                            value={phone}
                            onChangeText={(value) => {
                                setPhone(value);
                                // value = value.replace(/\D/g, '');
                                // if (value.length <= 11) {
                                //     if (value.startsWith('84')) {
                                //         setPhone(value);
                                //     } else if (value.startsWith('0')) {
                                //         setPhone(value);
                                //     } else if (value.length > 0) {
                                //         setPhone('0' + value);
                                //     } else {
                                //         setPhone('');
                                //     }
                                // }
                            }}
                        />
                    </View>
                    <View style={{ flex: 0.2, alignItems: 'flex-end' }}>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'column', gap: 10, padding: 10 }}>
                    {loading && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#000" />
                        </View>
                    )}
                    {!loading && (
                        <View style={{ flex: 1, padding: 10, justifyContent: 'flex-start', alignContent: 'flex-start' }}>
                            <FlatList
                                data={contacts}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    )}
                    <View style={[styles.footer, { marginBottom: 50 }]}>
                        <TouchableOpacity onPress={onSubmit} style={loading ? styles.inActiveButton : styles.button} disabled={loading}>
                            {loading && <ActivityIndicator size="small" color={"blue"} />}
                            {!loading && <Text style={styles.buttonLabel}>{lang.search}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    )
}

export default AddFriendsScreen;