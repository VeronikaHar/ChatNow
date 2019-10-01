/* eslint-disable linebreak-style */
import React from 'react';
import {
  AsyncStorage, NetInfo, Platform, Text, View,
} from 'react-native';

// library for Android devices to keep input field above the keyboard
import KeyboardSpacer from 'react-native-keyboard-spacer';

// library with chat UI
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import MapView from 'react-native-maps';

// import Firebase to create a new Firestore database to store the chat's messages
import * as firebase from 'firebase';
import 'firebase/firestore';

// import specitake photo, share an image or location
import CustomActions from './CustomActions';

// the application’s Chat component that renders the chat UI
export default class Chat extends React.Component {
  // style the header bar and set the the user’s name as the title
  static navigationOptions({ navigation }) {
    return {
      title: navigation.state.params.name,
      headerStyle: {
        backgroundColor: navigation.state.params.color,
        opacity: 0.8,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: '600',
      },
    };
  }

  constructor(props) {
    super(props);

    // initialize Firebase with its configuration
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyD-NZrmpfQSKL1DwPfgjAJXXpmd9DQA4Qs',
        authDomain: 'chatnow-c78b8.firebaseapp.com',
        databaseURL: 'https://chatnow-c78b8.firebaseio.com',
        projectId: 'chatnow-c78b8',
        storageBucket: 'chatnow-c78b8.appspot.com',
        messagingSenderId: '367102862022',
        appId: '1:367102862022:web:82bf034244ae34ce712dc7',
      });
    }

    // reference created database in the Firestore
    this.referenceMessages = firebase.firestore().collection('messages');

    // initialize state
    this.state = {
      systemMessages: [],
      messages: [],
      uid: 0,
      loggedInText: 'Authentication in process. Please wait...',
      isConnected: false,
    };
  }

  componentDidMount() {
    // if online, fetch messages from Firestore, otherwise from asyncStorage
    NetInfo.isConnected.fetch().then((isConnected) => {
      if (isConnected) {
        // check whether the user is signed in and if not authorize a new user
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            firebase.auth().signInAnonymously();
          }

          const systemMessages = [];

          systemMessages.push({
            _id: 1,
            text: `${this.props.navigation.state.params.name} joined the chat`,
            createdAt: new Date(),
            system: true,
          });

          // update the state with currently active user data
          this.setState({
            systemMessages,
            uid: user.uid,
            loggedInText: `Hello there, ${this.props.navigation.state.params.name}!`,
            isConnected: true,
          });

          // listen for collection changes for chat room
          this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
        });
      } else {
        this.setState({
          isConnected: false,
          loggedInText: 'You are offline and cannot send messages.',
        });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
    }
  }

  // append new messages to the ones saved in the state, Firebase and asyncStorage
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
    () => {
      this.saveMessages();
      this.addMessage();
    });
  }

  // save a message object to the Firebase
  addMessage = async () => {
    const message = this.state.messages[0];

    // add a new message to the Firebase collection
    try {
      await this.referenceMessages.add({
        _id: message._id,
        text: message.text || '',
        createdAt: message.createdAt.toString(),
        user: message.user,
        image: message.image || null,
        location: message.location || null,
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // save messages into asyncStorage
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  // load the messages from asyncStorage
  getMessages = async () => {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // writes chat messages to state messages whenever the collection changes
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    messages.push(this.state.systemMessages[0]);

    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || '',
        createdAt: data.createdAt.toString(),
        user: data.user,
        image: data.image || null,
        location: data.location || null,
      });
      this.setState({
        messages,
      });
    });
  }

  // set bubble styling
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#dedede',
          },
          left: {
            backgroundColor: '#dbd5ed',
          },
        }}
        textProps={{
          style: {
            color: '#000',
          },
        }}
      />
    );
  }

  // only render the InputToolbar when the user is online
  renderInputToolbar(props) {
    if (this.state.isConnected === true) {
      return (
        <InputToolbar {...props} />
      );
    }
  }

  // render custom actions from the imported file
  renderCustomActions = (props) => <CustomActions {...props} />;

  // renders MapView if the currentMessage contains location data
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 15,
            margin: 3,
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.01,
          }}
        />
      );
    }
    return null;
  }

  render() {
    return (
      // set the background color to the one passed in the params
      <View
        style={{
          flex: 1,
          backgroundColor: this.props.navigation.state.params.color,
        }}
      >
        <Text
          style={{
            padding: 5,
            margin: 5,
            alignSelf: 'center',
            backgroundColor: '#fff',
          }}
        >
          {this.state.loggedInText}
        </Text>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={this.user}
        />
        {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
      </View>
    );
  }
}
