
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './style';
import TabRightIcon from './tabRightIcon';
import { TabRoute } from '../../../../pages/home';
import { useNavigation } from '@react-navigation/native';

const HomeHeader = ({ onShowNavigation, isShowNavigation, isShowAccount , onShowAccount }) => {
    const navigation = useNavigation();
    return (
        <>
            <View style={styles.headerContainer}>
                {isShowNavigation && (
                    <TouchableOpacity onPress={onShowNavigation} style={[styles.searchRow, { flex: 0.2}]}>
                        <Ionicons name="list" size={25} color="#fff" style={styles.searchIcon} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.searchRow, { flex: 1 }]} onPress={() => {
                    navigation.navigate('Home', { screen: TabRoute.TabContact})
                }}>
                    <Ionicons name="search" size={16} color="#fff" style={styles.searchIcon} />
                    <Text style={styles.searchText}>Tìm kiếm</Text>
                </TouchableOpacity>
                <View style={[styles.searchRow , { flex: 1, justifyContent: 'flex-end', alignItems: 'center' }]}>
                    <TabRightIcon onShowAccount={onShowAccount} isShowAccount />
                </View>
            </View>
        </>
    );
};


export default HomeHeader;