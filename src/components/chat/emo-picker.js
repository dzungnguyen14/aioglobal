import { View, TouchableOpacity, Modal, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EMOJI_LIST = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
    '😋', '😎', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩',
    '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
    '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👋', '🤚', '🖐',
    '✋', '🖖', '👏', '🙌', '🤝', '🙏', '✍️', '💪', '🦵', '🦶',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '☮️', '✝️'
];

const EmoPicker = ({ selectEmoji, lang, emoPicker, setEmoPicker }) => {
    return (
        <Modal
            visible={emoPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setEmoPicker(false)}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end'
                }}
                onPress={() => setEmoPicker(false)}
            >
                <View
                    style={{
                        backgroundColor: '#fff',
                        maxHeight: 300,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 15
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {lang.emoticons || 'Biểu tượng'}
                        </Text>
                        <TouchableOpacity onPress={() => setEmoPicker(false)}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 10
                        }}>
                            {EMOJI_LIST.map((emoji, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => selectEmoji(emoji)}
                                    style={{
                                        padding: 8,
                                        borderRadius: 8,
                                        backgroundColor: '#f5f5f5'
                                    }}
                                >
                                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default EmoPicker;