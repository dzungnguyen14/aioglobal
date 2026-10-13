import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const BackButton = ({ onBack, top }) => {
    const defautTopPosition = Platform.OS === 'ios' ? 60 : 20;
    return (
        <>
            <View style={{ position: 'absolute', top: top ? (Platform.OS ==='ios' ? top + 30 : top) : defautTopPosition, left: 15, flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'center', paddingRight: 10, gap: 7, zIndex: 10 }}>
                <TouchableOpacity onPress={() => onBack()}><Ionicons name="chevron-back" color={'#3f85ca'} size={25} /></TouchableOpacity>
            </View>
        </>
    )
}

export default BackButton;