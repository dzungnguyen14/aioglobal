import { memo } from "react";
import { View, Text } from "react-native";
import { CustomImage } from "../../images";
import { ZOOM_API_HOST } from "../../../shared/constant";

export const ACTION_OPTIONS = [
    {
        id: 'add_friend',
        label: 'Thêm bạn',
        icon: 'person-add',
        iconColor: '#000',
        textStyle: { color: '#000' }
    },
    {
        id: 'create_group',
        label: 'Tạo nhóm',
        icon: 'people',
        iconColor: '#000',
        textStyle: { color: '#000' }
    },
    {
        id: 'create_meeting',
        label: 'Tạo Meeting',
        icon: 'videocam-outline',
        iconColor: '#000',
        textStyle: { color: '#000' }
    }
]
export const ContactAvatar = memo(({ account, width = 50, height = 50 }) => {
    if (!account) return null;
    if (account.picture) {
        return (
            <CustomImage
                source={{ uri: ZOOM_API_HOST + '/api/images/' + account.picture.shieldedID + '/256' }}
                style={{ width: width, height: height, borderRadius: width / 2 }}
            />
        );
    } else {
        return (
            <View style={{ width: width, height: height, borderRadius: width / 2, backgroundColor: '#1976D2', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '500', color: '#fff' }}>{account.firstName.charAt(0)}</Text>
            </View>
        );
    }
});
