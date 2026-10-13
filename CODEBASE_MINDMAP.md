# AIOGlobal Codebase Mind Map

> **Generated:** Sunday, Feb 22, 2026  
> **Version:** 1.8.7  
> **Platform:** React Native + Expo SDK 54

---

## 🎯 Overview

**AIOGlobal** is a comprehensive React Native mobile application built with Expo, featuring social networking, real-time chat, video/voice calling, e-commerce, and digital wallet capabilities.

---

## 📊 Technology Stack

### Core Technologies
```
React Native (0.81.5)
├── Expo SDK 54
├── React 19.1.0
└── JavaScript (ES6+)
```

### Key Libraries
```
UI & Navigation
├── React Native Paper (Material Design)
├── React Navigation 6 (Stack + Bottom Tabs)
└── expo-status-bar

State Management
├── React Context API
└── useReducer Hook

Networking
├── Axios (HTTP)
├── Socket.io-client 2.5.0 (Real-time)
└── Firebase Cloud Messaging

Media & Communication
├── LiveKit (Video/Audio)
├── WebRTC
├── expo-av (Audio/Video playback)
└── react-native-gifted-chat

Storage & Security
├── expo-secure-store (Token storage)
└── Firebase (Push notifications)

Additional Features
├── react-native-maps (Location)
├── react-native-webview
└── Various Expo modules
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Entry Point                          │
│                    index.js → App.js                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │   GlobalProvider        │
                │   (State Management)    │
                └────────────┬────────────┘
                             │
                ┌────────────┴────────────┐
                │  NavigationContainer    │
                │  (React Navigation)     │
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   Middleware           Stack Navigator     Bottom Tabs
   (Auth Check)        (All Screens)       (Main App)
```

---

## 📁 Directory Structure

```
app_aioglobal/
│
├── 📱 Application Core
│   ├── index.js                    # Root entry point
│   ├── App.js                      # Root component with providers
│   ├── app.json                    # Expo configuration
│   └── package.json                # Dependencies & scripts
│
├── ⚙️ Configuration
│   ├── babel.config.js             # Babel preset
│   ├── metro.config.js             # Metro bundler config
│   ├── eas.json                    # EAS Build profiles
│   ├── GoogleService-Info.plist    # iOS Firebase
│   └── google-services.json        # Android Firebase
│
├── 🎨 Assets (assets/)
│   ├── fonts/                      # Custom fonts
│   ├── icons/                      # Icon images
│   ├── services/                   # Service images
│   ├── suppliers/                  # Supplier logos
│   ├── icon.png                    # App icon
│   ├── splash.png                  # Splash screen
│   ├── ringing.json & .mp3         # Ringtone assets
│   └── *.png                       # UI images
│
├── 💻 Source Code (src/)
│   ├── constants/                  # App constants
│   ├── fetcher/                    # API layer
│   ├── shared/                     # Utilities & hooks
│   ├── state/                      # Global state management
│   ├── styles/                     # Global styles
│   ├── components/                 # Reusable UI components
│   └── pages/                      # Screen components
│
├── 🤖 Native Platforms
│   ├── android/                    # Android native code
│   │   ├── app/
│   │   │   ├── build.gradle        # Android app config
│   │   │   └── src/main/
│   │   │       ├── AndroidManifest.xml
│   │   │       └── java/
│   │   └── build.gradle            # Root Android config
│   └── ios/                        # iOS native code
│       ├── Podfile                 # CocoaPods dependencies
│       └── aioglobal.xcodeproj/
│
└── 🔨 Build Output
    └── build/                      # Build artifacts & notes
```

---

## 🔄 State Management

### Global State (`src/state/global.js`)

```
GlobalContext
├── Authentication
│   ├── token
│   ├── profile
│   └── isAuthenticated
│
├── Real-time Communication
│   ├── socket (Socket.io instance)
│   ├── onlineUsers
│   ├── typing (typing indicators)
│   ├── historyMessages
│   └── recentRooms
│
├── Video/Voice Calls
│   ├── zoomToken
│   ├── zoomAccessToken
│   ├── callState
│   ├── liveKitUrl
│   ├── liveKitToken
│   ├── callInfo
│   └── room
│
├── Feature Flags
│   ├── isEnableSocial
│   ├── isEnableZoom
│   ├── isEnableEcommerce
│   ├── isEnableWallet
│   └── isEnableMap
│
└── UI State
    ├── loading
    ├── notification
    └── language
```

### State Actions
- `SET_TOKEN`, `SET_PROFILE`, `LOGOUT`
- `SET_SOCKET`, `SET_ONLINE_USERS`, `SET_TYPING`
- `SET_ZOOM_TOKEN`, `SET_CALL_STATE`, `SET_LIVEKIT_URL`
- `SET_RECENT_ROOMS`, `ADD_MESSAGE`, `SET_HISTORY_MESSAGES`
- `SET_FEATURE_FLAGS`

---

## 🌐 API Architecture

### API Hosts

```
Production Endpoints
├── App API
│   ├── iOS: https://app.aioglobal.org/api/mobile
│   └── Android: http://app.aioglobal.org/api/mobile
│
├── Social API
│   └── http://mxh.aioglobal.org/api
│
├── Zoom/Chat API
│   └── https://zoom-api.aioglobal.org
│
└── Digital Wallet API
    └── https://admin.alowallet.net/api/v1
```

### API Layer Structure (`src/fetcher/`)

```
API Services
│
├── auth.js
│   ├── login(phoneNumber, password)
│   ├── register(userData)
│   ├── forgotPassword(phoneNumber)
│   ├── resetPassword(phoneNumber, password, otp)
│   ├── verifyOTP(phoneNumber, otp)
│   └── healthCheck()
│
├── api.js (Main App API)
│   ├── Authentication & Profile
│   │   ├── getProfile()
│   │   ├── updateProfile(data)
│   │   ├── uploadAvatar(formData)
│   │   └── deactiveAccount()
│   │
│   ├── Social Features
│   │   ├── getNewfeeds(params)
│   │   ├── likePost(postId)
│   │   ├── getComments(postId)
│   │   └── postComment(postId, content)
│   │
│   ├── Notifications
│   │   ├── getNotification()
│   │   └── updateNotification(id)
│   │
│   ├── File Uploads
│   │   ├── uploadPhoto(formData)
│   │   └── uploadVNEID(formData)
│   │
│   ├── App Data
│   │   ├── getIcons()
│   │   ├── getSupplier()
│   │   ├── getVersions()
│   │   └── featureToggle()
│   │
│   ├── Wallet
│   │   ├── getBalance()
│   │   ├── deposit(amount, gateway)
│   │   ├── withdraw(amount, info)
│   │   ├── getTransactions()
│   │   └── checkOnboardWallet()
│   │
│   └── Zoom/Chat
│       ├── getContacts()
│       ├── searchContact(keyword)
│       ├── joinChat(userId)
│       ├── sendMessage(roomId, message)
│       ├── initRoom(participants)
│       ├── joinRoom(roomId)
│       ├── answerCall(roomId)
│       └── endCall(roomId)
│
└── ecommerce.js (E-commerce API)
    ├── getCategories()
    ├── getProducts(categoryId, page)
    ├── getProductDetail(productId)
    ├── getCart()
    ├── addToCart(productId, quantity)
    ├── updateCart(cartId, quantity)
    ├── deleteCart(cartId)
    ├── createOrder(orderData)
    ├── getOrders()
    ├── getOrderDetail(orderId)
    └── getPaymentConfigs()
```

---

## 📄 Pages & Screens

### Navigation Structure

```
App Navigator (Stack)
│
├── 🔐 Authentication Flow
│   ├── Middleware (Auth check & routing)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
│
├── 🏠 Main App (Bottom Tabs)
│   ├── TabHome (Newfeeds/Social)
│   ├── TabContact (Chat/Zoom)
│   ├── TabStore (E-commerce)
│   ├── TabWidget (Services/Widgets)
│   └── TabAccount (Profile)
│
├── 👤 Profile & Settings
│   ├── Profile
│   ├── EditProfile
│   ├── EditInformation
│   ├── IdentityNumber
│   └── InviteFriend
│
├── 📱 Social Features
│   ├── Post (View post details)
│   ├── Notifications
│   └── Members
│
├── 💬 Chat & Calls
│   ├── Chatbox (One-on-one chat)
│   ├── OnCall (Video/voice call)
│   ├── LiveKit (LiveKit integration)
│   ├── IncomingCallPopup (Overlay)
│   └── CallKeepTest (Testing screen)
│
├── 💰 Digital Wallet
│   ├── DigitalWallet (Main wallet)
│   ├── DepositWallet
│   ├── WithdrawWallet
│   ├── TransactionHistory
│   ├── KYCScreen (Verification)
│   ├── BarcodeScanner (QR payments)
│   └── SuccessPayment
│
├── 🛒 E-commerce
│   └── Ecommerce (Shop screens)
│
├── 🆘 Support & Help
│   ├── Support
│   ├── Support2
│   ├── Report
│   └── Tracking
│
├── 🗺️ Location
│   ├── Map
│   └── Point
│
└── 🌐 Web Views
    ├── Webview
    └── Browser
```

---

## 🧩 Component Library

### Component Hierarchy (`src/components/`)

```
Components
│
├── 📞 Call Management (call/)
│   ├── IncomingCallPopup.js       # Incoming call UI overlay
│   ├── callHandler.js             # Call logic handler
│   ├── incomingCallHandler.js     # Incoming call routing
│   └── permission-check.js        # Camera/mic permissions
│
├── 💬 Chat (chat/)
│   ├── chat-input.js              # Message input field
│   ├── chat-skeleton.js           # Loading skeleton
│   └── emo-picker.js              # Emoji picker
│
├── 🏠 Home Components (home/)
│   │
│   ├── Main Tab Screens
│   │   ├── account.js             # Profile tab
│   │   ├── widget.js              # Services tab
│   │   ├── newfeed.js             # Social feed tab
│   │   └── product.js             # Store tab
│   │
│   ├── Zoom/Chat (zoom/)
│   │   ├── index.js               # Contact list
│   │   ├── chat.js                # Chat interface
│   │   └── search.js              # Contact search
│   │
│   ├── Social (socials/)
│   │   ├── index.js               # Social feed
│   │   ├── posts.js               # Post list
│   │   └── create.js              # Create post
│   │
│   ├── E-commerce (ecommerce/)
│   │   ├── index.js               # Shop home
│   │   ├── cart.js                # Shopping cart
│   │   ├── orders.js              # Order list
│   │   ├── product-detail.js      # Product page
│   │   └── checkout.js            # Checkout flow
│   │
│   └── Header Components (components/header/)
│       └── Various header variants
│
├── 🛍️ Orders (orders/)
│   └── history.js                 # Order history
│
├── 🔌 Real-time (init-io.js)
│   └── Socket.io initialization & event handlers
│
└── 🧰 UI Components (root)
    ├── PinInput.js                # PIN entry
    ├── confirm.js                 # Confirmation dialog
    ├── dropdown-action.js         # Action sheet dropdown
    ├── images.js                  # Image viewer
    ├── loading.js                 # Loading indicator
    ├── localNotify.js             # Local notifications
    ├── richeditor.js              # Rich text editor
    ├── select.js                  # Select dropdown
    ├── slider.js                  # Image slider
    ├── textarea.js                # Text area input
    ├── textInput.js               # Text input field
    ├── video.js                   # Video player
    └── webview.js                 # WebView wrapper
```

---

## 🔄 Data Flow Architecture

```
User Interaction
      │
      ▼
┌─────────────┐
│   Screens   │ (src/pages/)
│   (Pages)   │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ Components  │   │   Global    │
│             │◄──┤   Context   │
└──────┬──────┘   └──────┬──────┘
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  API Layer  │   │  Socket.io  │
│ (Fetchers)  │   │  Real-time  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  Backend APIs   │
       │                 │
       │  • App API      │
       │  • Social API   │
       │  • Zoom API     │
       │  • Wallet API   │
       └─────────────────┘
```

---

## 🛣️ Screen Navigation Map

### Main Navigation Flow

```
App Launch
    │
    ▼
Middleware ──────► Check Auth Token
    │                    │
    │                    ├─── Valid ──────► Home (Bottom Tabs)
    │                    │
    │                    └─── Invalid ───► Login
    │
    ▼
Bottom Tabs Navigator
    │
    ├── 🏠 Home Tab (Social Feed)
    │   └── TabHome (newfeed.js)
    │       ├── Create Post
    │       ├── View Posts
    │       └── Like/Comment
    │
    ├── 💬 Contact Tab (Chat)
    │   └── TabContact (zoom/)
    │       ├── Contact List
    │       ├── Search Contacts
    │       └── Chat Rooms
    │           ├── Text Chat
    │           ├── Voice Call
    │           └── Video Call
    │
    ├── 🛒 Store Tab (E-commerce)
    │   └── TabStore (ecommerce/)
    │       ├── Browse Products
    │       ├── Shopping Cart
    │       ├── Checkout
    │       └── Order History
    │
    ├── 🎯 Widget Tab (Services)
    │   └── TabWidget (widget.js)
    │       ├── Service Icons
    │       ├── Suppliers
    │       └── Quick Actions
    │
    └── 👤 Account Tab (Profile)
        └── TabAccount (account.js)
            ├── Profile Info
            ├── Settings
            └── Wallet Access
```

### Deep Link Screens

```
Standalone Screens (Outside Tabs)
│
├── 👤 Profile Management
│   ├── Profile (View profile)
│   ├── EditProfile
│   ├── EditInformation
│   ├── IdentityNumber (ID verification)
│   └── InviteFriend
│
├── 💰 Digital Wallet
│   ├── DigitalWallet (Main)
│   ├── DepositWallet
│   ├── WithdrawWallet
│   ├── TransactionHistory
│   ├── KYCScreen
│   ├── BarcodeScanner (QR scan)
│   └── SuccessPayment
│
├── 💬 Communication
│   ├── Chatbox (1-on-1 chat)
│   ├── OnCall (In-call screen)
│   ├── LiveKit (LiveKit room)
│   └── CallKeepTest
│
├── 📰 Content
│   ├── Post (Post detail)
│   ├── Notifications
│   └── Point (Points/rewards)
│
├── 🆘 Support
│   ├── Support
│   ├── Support2
│   ├── Report
│   └── Tracking
│
├── 🗺️ Location
│   └── Map
│
└── 🌐 Web
    ├── Webview (In-app browser)
    └── Browser (External browser)
```

---

## 🔌 API Endpoints Map

### Authentication API (`src/fetcher/auth.js`)

```
Base: API_HOST/auth

POST /auth/login
    Body: { phoneNumber, password }
    Returns: { success, token, profile }

POST /auth/register
    Body: { phoneNumber, password, fullName, ... }
    Returns: { success, token, profile }

POST /auth/forgot_password
    Body: { phoneNumber }
    Returns: { success, message }

POST /auth/reset_password
    Body: { phoneNumber, password, otp }
    Returns: { success, message }

POST /auth/verify_otp
    Body: { phoneNumber, otp }
    Returns: { success, valid }

GET /auth/health
    Returns: API health status
```

### Main App API (`src/fetcher/api.js`)

```
Base: API_HOST

Profile Management
├── GET /app/profile
├── PUT /app/update_profile
├── POST /app/upload_avatar
├── POST /app/deactive
└── POST /app/upload_vneid

Social Features
├── GET /app/get_newfeeds
├── POST /app/like_post
├── GET /app/get_comments
└── POST /app/post_comments

Notifications
├── GET /app/get_notification
└── PUT /app/update_notification

App Data
├── GET /app/get_icons
├── GET /app/get_supplier
├── GET /app/get_versions
└── GET /app/feature_toggle

Wallet
├── GET /wallet/get_balance
├── POST /wallet/deposit
├── POST /wallet/withdraw
├── GET /wallet/get_transactions
└── GET /wallet/check_onboard_wallet

Chat/Zoom
├── GET /zoom/get_contacts
├── GET /zoom/search_contact
├── POST /zoom/join_chat
├── POST /zoom/send_message
├── POST /zoom/init_room
├── POST /zoom/join_room
├── POST /zoom/answer_call
└── POST /zoom/end_call

File Uploads
├── POST /app/upload_photo
├── POST /app/upload_avatar
└── POST /app/upload_vneid
```

### E-commerce API (`src/fetcher/ecommerce.js`)

```
Base: API_HOST/shop

Product Catalog
├── GET /shop/category
├── GET /shop/products
└── GET /shop/product/:id

Shopping Cart
├── GET /shop/cart
├── POST /shop/cart (add)
├── PUT /shop/cart/:id (update)
└── DELETE /shop/cart/:id

Orders
├── POST /shop/order
├── GET /shop/history
├── GET /shop/order/:id
└── GET /shop/payment_configs
```

### Digital Wallet API (`src/pages/digital-wallet/fetcher.js`)

```
Base: https://admin.alowallet.net/api/v1

Wallet Management
├── POST /register (Wallet registration)
├── POST /login (Wallet login)
├── GET /tokens (Token list)
├── GET /transaction-history
├── GET /transaction/:id
└── GET /bank-list

KYC & Verification
├── POST /kyc/submit
├── GET /kyc/status
└── POST /verify-phone

Transactions
├── POST /send (Send tokens)
├── POST /receive (Receive)
└── GET /balance
```

### Social API (`API_SOCIAL_HOST`)

```
Base: http://mxh.aioglobal.org/api

GET /social/get_posts
    Returns: Social feed posts

GET /social/get_config
    Returns: Social feature config
```

---

## 🔧 Shared Utilities

### Utilities (`src/shared/`)

```
src/shared/
│
├── constant.js
│   ├── API_HOST (iOS/Android variants)
│   ├── API_SOCIAL_HOST
│   ├── ZOOM_API_HOST
│   ├── WALLET_ENDPOINT
│   └── Storage Keys
│       ├── USER_TOKEN_KEY
│       ├── WALLET_STORAGE_TOKEN_KEY
│       ├── USER_LANG
│       └── EXPO_PUSH_TOKEN_KEY
│
├── utils.js
│   ├── SecureStore Helpers
│   │   ├── getToken()
│   │   ├── setToken()
│   │   └── removeToken()
│   ├── Date/Time
│   │   ├── formatDateTime()
│   │   └── formatDateToTime()
│   ├── Image
│   │   └── imageCompression()
│   └── QR/Banking
│       ├── parseTLV()
│       └── extractVietQR()
│
├── hooks.js
│   ├── useLang() (i18n hook)
│   ├── useProfile() (User profile)
│   ├── useGetDeviceInfo() (Device data)
│   └── debounce() (Debounce utility)
│
└── permissions.js
    └── requestMediaPermissions()
```

### Constants (`src/constants/`)

```
src/constants/
│
├── lang.js
│   └── Language translations (vi/en)
│       ├── Authentication
│       ├── Profile
│       ├── Social
│       ├── Chat
│       ├── Wallet
│       └── E-commerce
│
└── home.js
    ├── TAB_NAMES
    ├── HASH_SALT
    └── IOS_VERSION
```

### Styles (`src/styles/`)

```
src/styles/
├── global.js       # Global style definitions
└── slider.js       # Slider-specific styles
```

---

## 🔄 Real-time Communication

### Socket.io Integration (`src/components/init-io.js`)

```
Socket.io Events
│
├── Outgoing (Emit)
│   ├── authenticate (token)
│   ├── typing (roomId, isTyping)
│   ├── message (roomId, content)
│   └── disconnect
│
└── Incoming (Listen)
    ├── message-in → Add to history
    ├── typing → Update typing state
    ├── onlineUsers → Update online list
    ├── authenticate → Connection success
    ├── close → Handle disconnection
    └── error → Error handling
```

### Call Flow

```
Incoming Call
    │
    ▼
IncomingCallPopup
    │
    ├─── Accept ──────► OnCall Screen
    │                       │
    │                       ├── LiveKit Room
    │                       ├── WebRTC Connection
    │                       └── Audio/Video Stream
    │
    └─── Decline ─────► End Call API
```

---

## 📦 Package Management

### Key Dependencies (`package.json`)

```
Production Dependencies
│
├── React & React Native
│   ├── react: ^19.1.0
│   ├── react-native: 0.81.5
│   └── expo: ~54.0.0
│
├── Navigation
│   ├── @react-navigation/native
│   ├── @react-navigation/stack
│   └── @react-navigation/bottom-tabs
│
├── UI Components
│   ├── react-native-paper
│   └── react-native-vector-icons
│
├── Communication
│   ├── @livekit/react-native: 2.8.0
│   ├── socket.io-client: 2.5.0
│   ├── react-native-gifted-chat
│   └── react-native-callkeep
│
├── Firebase
│   ├── @react-native-firebase/app
│   ├── @react-native-firebase/messaging
│   └── @react-native-firebase/auth
│
├── Media & Files
│   ├── expo-av
│   ├── expo-image-picker
│   ├── react-native-image-crop-picker
│   └── expo-file-system
│
├── Location & Maps
│   ├── react-native-maps
│   └── expo-location
│
├── Storage & Security
│   ├── expo-secure-store
│   └── expo-crypto
│
└── Networking
    └── axios
```

---

## 🔐 Security & Authentication

### Token Storage Strategy

```
Secure Storage (expo-secure-store)
│
├── USER_TOKEN_KEY
│   └── Main app authentication token
│
├── WALLET_STORAGE_TOKEN_KEY
│   └── Digital wallet auth token
│
├── USER_LANG
│   └── User language preference (vi/en)
│
└── EXPO_PUSH_TOKEN_KEY
    └── Push notification token
```

### Authentication Flow

```
Login/Register
    │
    ▼
API Response (token + profile)
    │
    ├─────► Save token to SecureStore
    │
    ├─────► Update Global Context
    │           ├── SET_TOKEN
    │           └── SET_PROFILE
    │
    └─────► Navigate to Home
```

---

## 🏗️ Build Configuration

### Build Profiles (`eas.json`)

```
EAS Build Profiles
│
├── development
│   ├── developmentClient: true
│   └── distribution: internal
│
├── preview
│   ├── distribution: internal
│   └── android.buildType: apk
│
└── production
    ├── android.buildType: app-bundle
    └── Production builds for stores
```

### Platform-specific

```
Android
├── Package: com.ktsgroup.aioglobal
├── Version Code: 82
├── Target SDK: 35
├── Min SDK: 23
└── Build: Gradle + Kotlin

iOS
├── Bundle ID: com.ktsgroup.aioglobal
├── Version: 1.8.7
├── Build Number: 82
└── Build: Xcode + CocoaPods
```

---

## 📱 Feature Modules

### 1. Social Networking

```
Social Module
├── Feed
│   ├── View posts
│   ├── Like/Unlike
│   ├── Comment
│   └── Create post
│
├── Profile
│   ├── View profile
│   ├── Edit profile
│   ├── Upload avatar
│   └── Deactivate account
│
└── Notifications
    ├── Activity notifications
    └── Mark as read
```

### 2. Real-time Chat & Calls

```
Communication Module
├── Chat
│   ├── Contact list
│   ├── Search contacts
│   ├── 1-on-1 messaging
│   ├── Typing indicators
│   ├── Online status
│   └── Message history
│
├── Voice/Video Calls
│   ├── Initiate call
│   ├── Answer call
│   ├── Decline call
│   ├── End call
│   ├── LiveKit integration
│   └── CallKeep (native calling)
│
└── Socket.io Real-time
    ├── Message delivery
    ├── Online presence
    ├── Typing events
    └── Call signaling
```

### 3. E-commerce

```
E-commerce Module
├── Catalog
│   ├── Categories
│   ├── Product listing
│   ├── Product detail
│   └── Search products
│
├── Shopping Cart
│   ├── Add to cart
│   ├── Update quantity
│   ├── Remove items
│   └── Cart summary
│
├── Checkout
│   ├── Shipping info
│   ├── Payment method
│   └── Order confirmation
│
└── Orders
    ├── Order history
    ├── Order detail
    └── Order tracking
```

### 4. Digital Wallet

```
Wallet Module
├── Balance & Tokens
│   ├── View balance
│   ├── Token list
│   └── Transaction history
│
├── Transactions
│   ├── Deposit
│   ├── Withdraw
│   ├── Send/Receive
│   └── QR Scanner (VietQR)
│
├── KYC Verification
│   ├── Submit documents
│   ├── Phone verification
│   └── Status check
│
└── Banking
    ├── Bank list
    └── Bank linking
```

### 5. Support & Services

```
Support Module
├── Help & Support
│   ├── Support tickets
│   ├── FAQ
│   └── Contact support
│
├── Tracking
│   └── Service tracking
│
├── Reports
│   └── Issue reporting
│
└── Services/Widgets
    ├── Icon-based services
    ├── Supplier integration
    └── Quick actions
```

---

## 🎨 UI/UX Components

### Core UI Elements

```
UI Component Library
│
├── Input Components
│   ├── textInput (Standard input)
│   ├── textarea (Multi-line)
│   ├── PinInput (PIN entry)
│   ├── richeditor (Rich text)
│   └── select (Dropdown)
│
├── Media Components
│   ├── images (Image viewer)
│   ├── video (Video player)
│   ├── slider (Image carousel)
│   └── webview (Web content)
│
├── Feedback Components
│   ├── loading (Loading spinner)
│   ├── confirm (Confirmation dialog)
│   ├── localNotify (Notifications)
│   └── dropdown-action (Action sheet)
│
└── Chat Components
    ├── chat-input (Message input)
    ├── chat-skeleton (Loading state)
    └── emo-picker (Emoji selector)
```

---

## 🌍 Internationalization

### Language Support (`src/constants/lang.js`)

```
Languages
├── Vietnamese (vi)
└── English (en)

Translation Keys
├── auth (Login, Register, Password)
├── profile (User, Edit, Settings)
├── social (Post, Like, Comment)
├── chat (Message, Call, Contact)
├── wallet (Balance, Deposit, Withdraw)
├── ecommerce (Product, Cart, Order)
├── support (Help, Report, Track)
└── common (Save, Cancel, Confirm, etc.)
```

---

## 📲 Push Notifications

### Notification Architecture

```
Push Notifications
│
├── Firebase Cloud Messaging (FCM)
│   ├── Android: google-services.json
│   └── iOS: GoogleService-Info.plist
│
├── Expo Notifications
│   ├── Request permissions
│   ├── Get push token
│   ├── Handle foreground
│   └── Handle background
│
└── Local Notifications
    └── src/components/localNotify.js
```

---

## 🔍 Key File Reference

### Critical Files

| File | Purpose | Lines |
|------|---------|-------|
| `App.js` | Root component, navigation setup | ~200 |
| `src/state/global.js` | Global state management | ~300 |
| `src/fetcher/api.js` | Main API service | ~500+ |
| `src/shared/constant.js` | Configuration constants | ~50 |
| `src/shared/utils.js` | Utility functions | ~150 |
| `src/components/init-io.js` | Socket.io setup | ~200 |

### Entry Flow

```
1. index.js
       ↓
2. App.js (Setup providers)
       ↓
3. src/pages/middleware.js (Auth check)
       ↓
4. Home (Bottom Tabs) OR Login
```

---

## 🔐 Environment & Secrets

### Configuration Sources

```
app.json
├── extra
│   ├── eas.projectId
│   └── Feature flags

Firebase
├── google-services.json (Android)
└── GoogleService-Info.plist (iOS)

Hardcoded in constant.js
├── API_HOST
├── ZOOM_API_HOST
└── WALLET_ENDPOINT
```

---

## 🚀 Build & Deployment

### Scripts (`package.json`)

```
Development
├── npm start           # Start Expo dev server
├── npm run android     # Run on Android
├── npm run ios         # Run on iOS
└── npm run tunnel      # Start with tunnel

Building
├── npm run build:apk   # EAS build (Android)
└── Manual iOS builds   # Via Xcode or EAS
```

### Build Platforms

```
Targets
├── Android (APK/AAB)
│   ├── Min SDK: 23
│   ├── Target SDK: 35
│   └── Version: 82
│
└── iOS
    ├── iOS 14+
    ├── Version: 1.8.7
    └── Build: 82
```

---

## 🧪 Testing & Quality

### Current State

```
Testing Infrastructure
├── Unit Tests: ❌ None
├── Integration Tests: ❌ None
├── E2E Tests: ❌ None
├── Linting: ❌ No config
└── Type Checking: ❌ No TypeScript
```

### Quality Tools

```
Potential Improvements
├── ESLint (Code quality)
├── Prettier (Formatting)
├── Jest (Unit testing)
├── Detox (E2E testing)
└── TypeScript (Type safety)
```

---

## 📊 Dependency Graph

### Core Dependencies

```
App.js
    │
    ├─── GlobalProvider (state/global.js)
    │       │
    │       └─── Used by all screens & components
    │
    ├─── React Navigation
    │       │
    │       ├─── Stack Navigator
    │       │       ├─── Auth Screens
    │       │       └─── App Screens
    │       │
    │       └─── Bottom Tabs
    │               ├─── TabHome
    │               ├─── TabContact
    │               ├─── TabStore
    │               ├─── TabWidget
    │               └─── TabAccount
    │
    └─── ActionSheetProvider
```

### API Dependencies

```
Screens/Components
    │
    ├─── Import from fetcher/
    │       ├── auth.js
    │       ├── api.js
    │       └── ecommerce.js
    │
    ├─── Import from shared/
    │       ├── constant.js (API hosts)
    │       ├── utils.js (Storage)
    │       └── hooks.js
    │
    └─── Use Global Context
            └── useGlobal() hook
```

---

## 📈 Feature Flags

### Toggle System

```
Feature Flags (src/state/global.js)
│
├── isEnableSocial
│   └── Social feed & posts
│
├── isEnableZoom
│   └── Chat & video calls
│
├── isEnableEcommerce
│   └── Shopping features
│
├── isEnableWallet
│   └── Digital wallet
│
└── isEnableMap
    └── Location/map features
```

Loaded from: `GET /app/feature_toggle`

---

## 🔗 Integration Points

### External Services

```
External Integrations
│
├── Firebase
│   ├── Cloud Messaging (Push)
│   └── Authentication
│
├── LiveKit
│   └── Video/audio rooms
│
├── Google Services
│   └── Maps, Location
│
├── AloWallet (Blockchain)
│   └── Digital wallet backend
│
└── Custom Backend APIs
    ├── App API (Main)
    ├── Social API (MXH)
    └── Zoom API (Chat/Calls)
```

---

## 🎯 User Journey Map

### First-time User

```
App Launch
    ↓
Middleware (No token)
    ↓
Login/Register
    ↓
Request Permissions
    ↓
Feature Toggle Load
    ↓
Home Screen
    ↓
Explore Features
```

### Returning User

```
App Launch
    ↓
Middleware (Valid token)
    ↓
Load Profile & Features
    ↓
Connect Socket.io
    ↓
Register Push Token
    ↓
Home Screen (Tabs)
```

---

## 📝 Code Organization Patterns

### Page Structure Pattern

```javascript
// Typical page structure
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useGlobal } from '../state/global';
import { apiFunction } from '../fetcher/api';

export default function ScreenName() {
  const { state, dispatch } = useGlobal();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    // API call
  };
  
  return (
    <View>
      {/* UI */}
    </View>
  );
}
```

### Component Structure Pattern

```javascript
// Reusable component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComponentName({ prop1, prop2 }) {
  return (
    <View style={styles.container}>
      {/* Component UI */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Styles
  }
});
```

---

## 🔍 Quick Reference

### Finding Specific Features

| Feature | Primary Location |
|---------|------------------|
| Authentication | `src/fetcher/auth.js` + `src/pages/login.js` |
| Social Feed | `src/components/home/socials/` |
| Chat | `src/components/home/zoom/` + `src/pages/chatbox.js` |
| Video Calls | `src/pages/on-call.js` + `src/pages/livekit.js` |
| E-commerce | `src/components/home/ecommerce/` |
| Digital Wallet | `src/pages/digital-wallet/` |
| Profile | `src/pages/profile.js` + `src/pages/edit-profile.js` |
| Notifications | `src/pages/notifications.js` |
| Maps | `src/pages/map.js` |
| Support | `src/pages/support.js` |

### Common Utilities

| Utility | Location |
|---------|----------|
| Get/Set Token | `src/shared/utils.js` |
| Format Dates | `src/shared/utils.js` |
| Translations | `src/shared/hooks.js` (useLang) |
| Get Profile | `src/shared/hooks.js` (useProfile) |
| Global State | `src/state/global.js` (useGlobal) |
| API Hosts | `src/shared/constant.js` |

---

## 🎯 Development Workflow

### Local Development

```
Setup
├── npm install
├── expo prebuild (if native changes)
└── npm start

Run
├── npm run ios (iOS Simulator)
├── npm run android (Android Emulator)
└── Expo Go app (Physical device)
```

### Production Build

```
Build Process
├── Update version in app.json
├── Update android/app/build.gradle
├── npm run build:apk (Android)
└── EAS build for iOS
```

---

## 🔮 Future Considerations

### Potential Enhancements

```
Code Quality
├── Add TypeScript
├── Add ESLint/Prettier
├── Add unit tests (Jest)
└── Add E2E tests (Detox)

Features
├── Offline support
├── Caching layer
├── Analytics integration
└── Error tracking (Sentry)

Performance
├── Code splitting
├── Image optimization
├── Bundle size reduction
└── Memory optimization
```

---

## 📚 Documentation Index

- **Setup Guide**: `README.md`
- **Build Notes**: `build/FIXES_SUMMARY.md`
- **This Mind Map**: `CODEBASE_MINDMAP.md`

---

**Last Updated:** Feb 22, 2026  
**Maintained By:** Development Team
