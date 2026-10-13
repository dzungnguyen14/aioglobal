import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const EcommerceLoading = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            navigation.navigate('Ecommerce');
        }
    }, [isFocused, navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="green" />
        </View>
    )
}

export default EcommerceLoading;