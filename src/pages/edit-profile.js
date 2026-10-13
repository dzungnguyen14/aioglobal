import { Text, View, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import styles from "../styles/global";
import { useLang, } from "../shared/hooks";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/home/backButton";

function EditProfileScreen({ navigation, route }) {
    const { lang } = useLang();
    const { profile } = route.params;
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>
                        {lang.edit_profile}
                    </Text>
                </View>
            </View>
            <ScrollView>
                <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('EditInformation', { profile: profile })}>
                    <View style={styles.profileRowCenter}>
                        <Text style={styles.labelProfile}>{lang.edit_information}</Text>    
                    </View>
                    <View style={styles.profileRowRight}>
                        <Ionicons name="pencil" size={24} color={'#094C9C'} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('EditProfileId', { profile: profile })}>
                    <View style={styles.profileRowCenter}>
                        <Text style={styles.labelProfile}>{lang.edit_profile_id}</Text>    
                    </View>
                    <View style={styles.profileRowRight}>
                        <Ionicons name="pencil" size={24} color={'#094C9C'} />
                    </View>
                </TouchableOpacity>
            </ScrollView>

        </KeyboardAvoidingView>
    )
}

export default EditProfileScreen;