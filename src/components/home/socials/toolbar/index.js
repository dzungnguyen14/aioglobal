
import {
    Platform,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import styles from './style';
import { AccountImage, CustomImage } from '../../../images';
import { TABS } from '../index';
import { IOS_VERSION } from '../../../../constants/home';

const Toolbar = ({ navigation, profile, onPress, onShowProfile, tab, setTab, toggleOS }) => {
    return (
        <View>
            {toggleOS && (
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={tab == TABS.NEWFEED ? styles.headerItemActive : styles.headerItem} onPress={() => setTab(TABS.NEWFEED)}>
                        <Text style={tab == TABS.NEWFEED ? styles.headerItemTextActive : styles.headerItemText}>Nhật ký</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={tab == TABS.VIDEO ? styles.headerItemActive : styles.headerItem} onPress={() => navigation.navigate('Reels')}>
                        <Text style={tab == TABS.VIDEO ? styles.headerItemTextActive : styles.headerItemText}>Video</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* Nhập trạng thái */}
            <View style={styles.statusContainer} >
                <TouchableOpacity onPress={onShowProfile}>
                    {profile.avatar && (<CustomImage source={{ uri: profile.avatar }} style={styles.avatar} />)}
                    {!profile.avatar && (<CustomImage source={AccountImage} style={styles.avatar} />)}
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputContainer} onPress={onPress}>
                    <Text style={styles.input}>
                        Hôm nay bạn thế nào?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Các nút: ảnh, video, album, kỷ niệm */}
            <View style={styles.buttonsRow}>
                <OptionButton icon="image" label="Ảnh" color="#4CAF50" onPress={onPress} />
                <OptionButton icon="videocam" label="Video" color="#E91E63" onPress={onPress} />
                <OptionButton icon="albums" label="Album" color="#2196F3" onPress={onPress} />
                <OptionButton icon="accessibility" label="Kỷ niệm" color="#FF9800" onPress={onPress} />
            </View>

            {/* Story / Khoảnh khắc */}
            {/* <View style={styles.storiesContainer}>
                <Text style={styles.sectionTitle}>Khoảnh khắc</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow}>
                    {stories.map((story, index) => (
                        <View key={index} style={styles.storyCard}>
                            <Image source={{ uri: story.image }} style={styles.storyImage} />
                            <Text numberOfLines={1} style={styles.storyName}>{story.name}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View> */}

        </View>
    );
};

const OptionButton = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.optionButtonText}>{label}</Text>
    </TouchableOpacity>
);

export default memo(Toolbar);