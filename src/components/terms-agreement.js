import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANG } from '../constants/lang';

const { width } = Dimensions.get('window');

const TermsAgreementModal = ({ visible, onAgree, lang }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="shield-checkmark" size={48} color="#094C9C" />
                    </View>

                    <Text style={styles.title}>
                        {lang.terms_of_use}
                    </Text>
                    <Text style={styles.subtitle}>
                        {lang.by_using_aio_global_you_agree_that }
                    </Text>

                    <View style={styles.rulesContainer}>
                        <View style={styles.ruleRow}>
                            <Ionicons name="alert-circle" size={18} color="#e67e22" style={styles.ruleIcon} />
                            <Text style={styles.ruleText}>{lang.posting_offensive_abusive_illegal_or_harmful_content_is_prohibited}</Text>
                        </View>
                        <View style={styles.ruleRow}>
                            <Ionicons name="alert-circle" size={18} color="#e67e22" style={styles.ruleIcon} />
                            <Text style={styles.ruleText}>{lang.users_violating_rules_may_be_banned}</Text>
                        </View>
                        <View style={styles.ruleRow}>
                            <Ionicons name="alert-circle" size={18} color="#e67e22" style={styles.ruleIcon} />
                            <Text style={styles.ruleText}>{lang.content_may_be_moderated_and_removed}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.agreeButton} onPress={onAgree} activeOpacity={0.8}>
                        <Text style={styles.agreeButtonText}>
                            {lang.i_agree}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.88,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#094C9C15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    rulesContainer: {
        width: '100%',
        gap: 14,
        marginBottom: 28,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    ruleIcon: {
        marginTop: 2,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    agreeButton: {
        width: '100%',
        backgroundColor: '#094C9C',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    agreeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default TermsAgreementModal;
