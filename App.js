import 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/pages/home';
import LoginScreen from './src/pages/login';
import Middleware from './src/pages/middleware';
import ForgotPasswordScreen from './src/pages/forgot-password';
import ReportScreen from './src/pages/report';
import TrackingScreen from './src/pages/tracking';
import SupportScreen from './src/pages/support';
import ProfileScreen from './src/pages/profile';
import Support2Screen from './src/pages/support2';
import RegisterScreen from './src/pages/register';
import NotificationsScreen from './src/pages/notifications';
import PostScreen from './src/pages/post';
import PointScreen from './src/pages/point';
import MapScreen from './src/pages/map';
import InviteScreen from './src/pages/invite';
import IdentityScreen from './src/pages/indentity';
import WebviewScreen from './src/pages/webview';
import ChatboxScreen from './src/pages/chatbox';
import BrowserScreen from './src/pages/browser';
import EditProfileScreen from './src/pages/edit-profile';
import EditInformationScreen from './src/pages/edit-information';
import EditProfileIdScreen from './src/pages/edit-profile-id';
import MemberScreen from './src/pages/members';
import AddFriendsScreen from './src/pages/add-friends';
import OnCallScreen from './src/pages/on-call';
import PointIntructionScreen from './src/pages/point-intruction';
import DigitalWalletScreen from './src/pages/digital-wallet';
import DepositWalletScreen from './src/pages/digital-wallet/deposit';
import WithdrawWalletScreen from './src/pages/digital-wallet/withdraw';
import BarcodeScannerScreen from './src/pages/digital-wallet/scanner';
import ChangePasswordScreen from './src/pages/digital-wallet/change-password';
import KYCScreen from './src/pages/digital-wallet/kyc';
import { GlobalProvider } from './src/state/global';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import LiveKitScreen from './src/pages/livekit';
import TransactionHistoryScreen from './src/pages/digital-wallet/transaction-history';
import SuccessPaymentScreen from './src/pages/digital-wallet/success-payment';
import EcommercePage from './src/components/home/ecommerce';
import ReelsPage from './src/components/home/reels';
import CallRouter from './src/components/call/CallRouter';
import React from 'react';

function App() {
  const Stack = createStackNavigator();
  const navigationRef = useNavigationContainerRef();

  const options = {
    headerShown: false,
  };
  const unMountOptions = {
    headerShown: false,
    unmountOnBlur: true
  };
  return (
    <GlobalProvider>
      <ActionSheetProvider>
        <>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName="Middleware">
            <Stack.Screen name="Home" component={HomeScreen} options={{ ...options, gestureEnabled: false }} />
            <Stack.Screen name="Report" component={ReportScreen} options={options} />
            <Stack.Screen name="Register" component={RegisterScreen} options={options} />
            <Stack.Screen name="Login" component={LoginScreen} options={options} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={options} />
            <Stack.Screen name="Tracking" component={TrackingScreen} options={options} />
            <Stack.Screen name="Support" component={SupportScreen} options={options} />
            <Stack.Screen name="Support2" component={Support2Screen} options={options} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={options} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={options} />
            <Stack.Screen name="Post" component={PostScreen} options={options} />
            <Stack.Screen name="Point" component={PointScreen} options={options} />
            <Stack.Screen name="Members" component={MemberScreen} options={options} />
            <Stack.Screen name="Map" component={MapScreen} options={options} />
            <Stack.Screen name="Webview" component={WebviewScreen} options={options} />
            <Stack.Screen name="InviteFriend" component={InviteScreen} options={options} />
            <Stack.Screen name="IdentityNumber" component={IdentityScreen} options={options} />
            <Stack.Screen name="Chatbox" component={ChatboxScreen} options={options} />
            <Stack.Screen name="Browser" component={BrowserScreen} options={options} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={options} />
            <Stack.Screen name="EditInformation" component={EditInformationScreen} options={options} />
            <Stack.Screen name="EditProfileId" component={EditProfileIdScreen} options={options} />
            <Stack.Screen name="Middleware" component={Middleware} options={options} />
            <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={options} />
            <Stack.Screen name="PointIntruction" component={PointIntructionScreen} options={options} />
            <Stack.Screen name="OnCall" component={OnCallScreen} options={unMountOptions} />
            <Stack.Screen name="DigitalWallet" component={DigitalWalletScreen} options={unMountOptions} />
            <Stack.Screen name="DigitalForgotPassword" component={ForgotPasswordScreen} options={unMountOptions} />
            <Stack.Screen name="DepositWallet" component={DepositWalletScreen} options={unMountOptions} />
            <Stack.Screen name="WithdrawWallet" component={WithdrawWalletScreen} options={unMountOptions} />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={unMountOptions} />
            <Stack.Screen name="WalletChangePassword" component={ChangePasswordScreen} options={unMountOptions} />
            <Stack.Screen name="WalletKYC" component={KYCScreen} options={unMountOptions} />
            <Stack.Screen name="LiveKit" component={LiveKitScreen} options={unMountOptions} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={unMountOptions} />
            <Stack.Screen name="SuccessPayment" component={SuccessPaymentScreen} options={unMountOptions} />
            <Stack.Screen name="Ecommerce" component={EcommercePage} options={unMountOptions} />
            <Stack.Screen name="Reels" component={ReelsPage} options={unMountOptions} />
            </Stack.Navigator>
          </NavigationContainer>
          <CallRouter navigationRef={navigationRef} />
        </>
      </ActionSheetProvider>
    </GlobalProvider>
  );
}

export default App; 