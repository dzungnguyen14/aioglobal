import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DropdownAction = ({ options, onSelect, buttonContent, buttonStyle, modalStyle, buttonLabel }) => {
    const [visible, setVisible] = useState(false);

    const toggleDropdown = () => {
        setVisible(!visible);
    };

    const handleSelect = (option) => {
        onSelect(option);
        setVisible(false);
    };

    const closeModal = () => {
        setVisible(false);
    };

    return (
        <View style={{ position: 'relative' }}>
            <TouchableOpacity onPress={toggleDropdown} style={[styles.button, buttonStyle, {flexDirection:'column'}]}>
                {buttonContent || <Ionicons name="ellipsis-vertical" size={20} color="#000" />}
                <Text style={{ color: '#fff', fontSize: 9, marginTop: 4 }}>{buttonLabel}</Text>
            </TouchableOpacity>
            <Modal
                transparent={true}
                visible={visible}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalContent, modalStyle]}>
                                {options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.option}
                                        onPress={() => handleSelect(option)}
                                    >
                                        {option.icon && (
                                            <Ionicons name={option.icon} size={20} color={option.iconColor || "#1976D2"} />
                                        )}
                                        <Text style={[styles.optionText, option.textStyle]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        // justifyContent: 'center',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'ios' ? 100 : 70,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        width: '60%',
        maxWidth: 300,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#333',
    },
});

export default DropdownAction;
