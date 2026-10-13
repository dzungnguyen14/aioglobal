
import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
    searchIcon: {
        marginRight: 8,
    },
    searchText: {
        color: '#fff',
        fontSize: 14,
    },
    searchRow: {
        flexDirection: 'row',
        backgroundColor: '#1976D2',
        padding: 10,
        paddingBottom: 10,
        paddingTop: Platform.OS == 'ios' ?  40 : 30,
        alignItems: 'center',
        flex: 1,
    },
    profileButton: {
        padding: 10,
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1976D2',
        paddingTop: Platform.OS == 'ios' ? 5 : 0,
    },
    rightIcon: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    rightIconText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '500'
    }
});