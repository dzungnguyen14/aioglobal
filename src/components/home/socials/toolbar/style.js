
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingTop: 20,
    },
    timeText: {
        fontSize: 16,
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#fff",
        paddingVertical: 10
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        marginLeft: 10,
    },
    inputContainer: {
        fontSize: 16,
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: 17,
        color: '#999',
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: "#fff",
        padding: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    optionButtonText: {
        color: '#333',
        fontSize: 13
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    storiesContainer: {
        backgroundColor: "#fff",
        padding: 10,
        marginBottom: 10
    },  
    storiesRow: {
        flexDirection: 'row',
    },
    storyCard: {
        width: 80,
        alignItems: 'center',
        marginRight: 10,
    },
    storyImage: {
        width: 65,
        height: 100,
        borderRadius: 12,
        marginBottom: 4,
    },
    storyName: {
        fontSize: 12,
        textAlign: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
    },
    headerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%',
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#fff'
    },
    headerItemActive: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%',
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    headerItemText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        fontWeight: '500',
    },
});