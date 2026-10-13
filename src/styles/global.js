import { StyleSheet, Dimensions, Platform } from "react-native";

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;
const defaultPadding = 10;
const defaultTextColor = "#4b4848";
const primaryColor = "#094C9C";
const successColor = "green";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: screenHeight,
    width: screenWidth,
    maxWidth: 1000,
    position: 'relative',
    // marginHorizontal: 'auto',
    // paddingBottom: Platform.OS === 'android' ? 50 : 0
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  rowFlex: {
    display: 'flex',
    flexDirection: 'row'
  },
  colFlex: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  footer: {
    flexDirection: 'column',
    width: '100%',
    padding: defaultPadding,
  },
  inputContainer: {
    display: 'flex',
    direction: 'column',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: defaultTextColor,
  },
  textInput: {
    fontSize: 18,
    color: defaultTextColor,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#fff'
  },
  textHeading: {
    fontSize: 30,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  textNormal: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
    marginBottom: 10,
  },
  textSmall: {
    fontSize: 12,
    color: '#000',
  },
  textDanger: {
    color: 'red',
  },
  smallButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: defaultPadding,
    paddingHorizontal: defaultPadding,
    width: "100%",
    backgroundColor: primaryColor,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 20
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: defaultPadding,
    paddingHorizontal: defaultPadding,
    width: "100%",
    backgroundColor: primaryColor,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 50
  },
  inActiveButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: defaultPadding,
    paddingHorizontal: defaultPadding,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 50
  },
  buttonNormal: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: defaultPadding,
    paddingHorizontal: defaultPadding,
    width: "100%",
    backgroundColor: primaryColor,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 50
  },
  successButtonNormal: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: defaultPadding,
    paddingHorizontal: defaultPadding,
    width: "100%",
    backgroundColor: successColor,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 50
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  normalLabel: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryLabel: {
    color: 'blue',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homeHeader: {
    height: Platform.OS == 'ios' ? 105 : 60,
    display: 'flex',
    flexDirection: "row",
    backgroundColor: "#fff",
    textAlign: 'left',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    paddingLeft: 10,
    gap: 20
  },
  homeHeaderDashboard: {
    height: Platform.OS === 'ios' ? 90 : 60,
    display: 'flex',
    flexDirection: "row",
    textAlign: 'left',
    alignItems: 'center',
    width: screenWidth,
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingLeft: 10,
    backgroundColor: "#fff"

  },
  homeNameDashboard: {
    fontSize: 13,
    fontWeight: '700',
    color: "#000"
  },
  homeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    flex: 1
  },
  homeName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: "#000",
    marginTop: Platform.OS == 'android' ? 20: 60
  },
  homeSmallLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: "#000",
  },
  homeEmail: {
    flex: 1,
    marginTop: 20
  },
  homeBarcode: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 20
  },
  homeContent: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 90 : 60,
  },
  homeFooter: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: screenWidth,
    height: Platform.OS === 'ios' ? 80 : 60,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    paddingTop: 10
  },
  bottomItem: {
    flex: 1,
    flexDirection: 'collumn',
    alignItems: 'center',
  },
  activeTextBottomItem: {
    color: primaryColor,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10
  },
  textBottomItem: {
    color: defaultTextColor,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10
  },
  profileRow: {
    flex: 1,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#ddd',
    shadowRadius: 10,
    shadowOpacity: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  profileRowLeft: {
    flex: 0.4,
  },
  profileRowRight: {
    flex: 0.3,
    alignItems: 'flex-end'
  },
  profileRowCenter: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'center',
  },
  labelProfile: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  labelProfileID: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  valueProfile: {
    fontSize: 16,
    width: '100%',
    fontWeight: '600',
    color: '#000',
  },
  pinContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1
  },
  checkBox: {
    borderColor: '#ddd',
    borderWidth: 1,
    color: defaultTextColor,
  },
  widgetRow: {
    width: 110,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  bannerImage: {
    width: screenWidth * 0.95,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    height: 140,
  },
  itemBlock: {
    flex: 1,
    flexDirection: 'column',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d9d9d9',
  },
  itemContent: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    flexDirection: 'column',
    flex: 1,
    borderRadius: 10,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
  },
  itemCollumn: {
    flexDirection: 'column',
    gap: 10,
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
  },
  moneyText: {
    fontWeight: '800',
    fontSize: 13,
  },
  boxShadow: {
    shadowColor: '#ddd',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  mapView: {
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    top: 0,
    left: 0,
    position: 'absolute',
  },
  dashboardItem: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 200,
    borderWidth: 5,
    borderColor: '#ddd',
    borderRadius: 20,
    marginBottom: 20,
  },
  langRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 30
  },
  langRowText: { fontSize: 18, fontWeight: '400', color: '#000' },
  langRowTextActive: { fontSize: 18, fontWeight: '800', color: '#094C9C' },
  tabIcon: {
    gap: 5,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems:'center'
  },
  txtTabIcon: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 500
  },
  contactSearch: {
    display: 'flex',
    flexDirection: "row",
    backgroundColor: "#fff",
    textAlign: 'left',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    paddingHorizontal: 10,
    paddingTop: 30,
    gap: 10,
    itemAlign: 'center'
  },
  contactChat: {
    height: Platform.OS == 'ios' ? 100 : 70,
    display: 'flex',
    flexDirection: "row",
    backgroundColor: "#fff",
    textAlign: 'left',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    paddingHorizontal: 10,
    paddingTop: Platform.OS == 'ios' ? 50 : 20,
    gap: 20
  },
  ownMessage: {
    backgroundColor: '#1976D2',
    padding: 10,
    borderRadius: 10,
  },
  otherMessage: {
    backgroundColor: '#e9e9e9',
    padding: 10,
    borderRadius: 10,
  },
  richEditor: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ccc',
    minHeight: 300
  },
  contactItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },

  textInputMessage: {
    fontSize: 14,
    color: defaultTextColor,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 5
  },
  avatarSpacer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 5
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff'
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    marginHorizontal: 10
  },
  messageContent: {
    flexDirection: 'column',
    gap: 5
  },
  messageText: {
    fontSize: 14,
    color: '#000'
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  headerLeft: {
    flex: 0.2,
    alignItems: 'center', 
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'center'
  },
  headerStatus: {
    color: '#fff',
    fontSize: 13,
    justifyContent: 'center',
    marginVertical: 5
  },
  headerRight: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20
  },
  backButton: {
    flex: 1,
    marginTop: 10
  },
  socialButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: defaultPadding,
    paddingHorizontal: defaultPadding,
    width: "100%",
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    marginTop: 10,
    marginBottom: 10,
  }
});