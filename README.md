# ChatNow
ChatNow is a React Native chat application for mobile devices (Android and iOS) that features GiftedChat, a chat UI by Farid Safi. This communication app allows you to
  - select images from your device's storage
  - take photos
  - get current geo-location
  - send and receive text messages

### Setup Accounts
To be able to access and use the services for the development and setup of this app, the following accounts need to be created:
* [Expo] - a set of tools and services for building, deploying, and quickly iterating on native iOS, Android, and web apps from the same codebase.
* [Firebase] - a realtime database and backend services.

### Authentication & Data Storage 
For data storage and user authentication, the services of [Google Firebase](https://firebase.google.com/) were used:
  - Firebase Authentication with Anonymous Sign-In Provider
  - Google Firestore database for storing all the chat conversations
  - Firebase Cloud Storage for storing of the images

### Installation
ChatNow requires [Node.js](https://nodejs.org/) v4+ to run.

In your machine's terminal install Expo CLI:
```sh
$ npm install expo-cli --global
```
To run the app in the development mode, go to the project's directory and run:
```sh
$ expo start
or
$ npm start
```
It will open http://localhost:19002 with QR code for ChatNow app.
To be able to run ChatNow on your Android or IOS phone, download Expo App that you can use to scan the QR code provided on the browser page.
Alternatively, you can set up [Android Studio](https://developer.android.com/studio) Android device emulator and use it to run the app on.
The app will reload if you make any edits.

#### Packages and Libraries
The following npm packages and libraries have been used:

|Package | Info |
|--------|--------|
 |expo| used to build the app and manage api actions
 |[expo-image-picker](https://docs.expo.io/versions/latest/sdk/imagepicker/)| provides access to the system's UI for selecting images and videos from the phone's library or taking a photo with the camera.
 |[expo-location](https://docs.expo.io/versions/latest/sdk/location/)| allows reading geolocation information from the device
 |[expo-permissions](https://docs.expo.io/versions/latest/sdk/permissions/)| provides functionality for asking for user's permission to access potentially sensitive content
 |[firebase](https://firebase.google.com/)| provides an API that allows application data to be synchronized across clients and stored on Firebase's cloud
 |[react](https://reactjs.org/)| JavaScript library for building user interfaces
 |[react-dom](https://reactjs.org/docs/react-dom.html)| package that provides DOM-specific methods for React
 |[react-native](https://facebook.github.io/react-native/)| library used to build native mobile apps
 |react-native-gesture-handler| provides native-driven gesture management APIs for building best possible touch-based experiences in React Native
 |[react-native-gifted-chat](https://github.com/FaridSafi/react-native-gifted-chat)| library with the most complete chat UI for React Native
 |react-native-keyboard-spacer| library used to correct the position of the keyboard in Android devices
 |[react-native-web](https://github.com/necolas/react-native-web)| library to run React Native components and APIs on the web using React DOM
 |[react-navigation](https://reactnavigation.org/en/)| library with routing and navigation functionality for React Native apps
# Note

To install, run in the project's directory:
```sh
$ npm install -s [package name]
or
$ npm install -s [for installing all dependencies]
```

### Setup
- set up React Native app with Expo by running $ expo init [project name] in the Win CMD
- create basic file setup with start.js, chat.js and custom-actions.js
- enable navigation between screens through react-navigation
- setup and configure GiftedChat, incl. KeyBoardSpacer - use hardwired data
- setup of Firebase database
- setup of Firebase authentication
- setup of AsyncStorage for offline data management
- implement NetInfo for online/offline switch
- implement mobile device's communication features, i.e. camera and geolocation
