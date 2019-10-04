
/**
 * @fileOverview Creates chat room interface and functionality
 */
import React from 'react';
import {
  AsyncStorage, NetInfo, Platform, Text, View,
} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

/**
* @class Chat
* @requires React
* @requires React-Native
* @requires Firebase
* @requires Firestore
* @requires KeyboardSpacer - library for Android devices to keep input field above the keyboard
* @requires CustomActions - take photo, share an image or location
* @requires React-Native-Maps
* @requires React-Native-Gifted-Chat - library with Chat UI
*/

export default class Chat extends React.Component {
  /**
     * Styles the header bar and set the the user’s name as the title.
     * 
     * @function navigationOptions
     * @param { Object } navigation
     * @returns { Object }
     * */
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

    /** Initializes Firebase with its configuration */
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

    /** References the created database in the Firestore */
    this.referenceMessages = firebase.firestore().collection('messages');

    /** initializes state */
    this.state = {
      systemMessages: [],
      messages: [],
      uid: 0,
      loggedInText: 'Authentication in process. Please wait...',
      isConnected: false,
    };
  }

  componentDidMount() {
    /** if online, fetches messages from Firestore, otherwise from asyncStorage*/
    NetInfo.isConnected.fetch().then((isConnected) => {
      if (isConnected) {
        /**
         * Checks whether the user is signed in and if not authorize a new user.
         * 
         * @function navigationOptions
         * @param { Object } user
         * @returns { Object }
         */
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            firebase.auth().signInAnonymously();
          }

          /** @constant - informs that the user joined the chatroom */
          const systemMessages = [];

          systemMessages.push({
            _id: 1,
            text: `${this.props.navigation.state.params.name} joined the chat`,
            createdAt: new Date(),
            system: true,
          });

          /** Updates the state with currently active user data */
          this.setState({
            systemMessages,
            uid: user.uid,
            loggedInText: `Hello there, ${this.props.navigation.state.params.name}!`,
            isConnected: true,
          });

          /** Listens for collection changes for chat room */
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
      /** stops listening to authentication */
      this.authUnsubscribe();
      /** stops listening for chat room changes */
      this.unsubscribe();
    }
  }

  /** 
   * Appends new messages to the ones saved in the state, Firebase and asyncStorage.
   * @function onSend
   * @param {Array} messages 
   * @default []
   * @returns {Array} array of all the messages in the chat.
   */
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      () => {
        this.saveMessages();
        this.addMessage();
      });
  }

  /** 
   *  Adds a new message to the Firebase.
   * 
   * @async
   * @function addMessage
   * @return {Promise<Object>} the new message object. 
   */
  addMessage = async () => {
    /** @constant */
    const message = this.state.messages[0];
    try {
      await this.referenceMessages.add({
        _id: message._id,
        /**
         * @default ''
         */
        text: message.text || '',
        createdAt: message.createdAt.toString(),
        user: message.user,
        /**
        * @default null
        */
        image: message.image || null,
        /**
         * @default null
         */
        location: message.location || null,
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /** 
   *  Saves all messages and username into the AsyncStorage.
   * 
   * @async
   * @function saveMessages
   * @return {Promise<string>}  The data from the storage.
   */
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
      await AsyncStorage.setItem('username', JSON.stringify(this.props.navigation.state.params.name));
    } catch (error) {
      console.log(error.message);
    }
  }

  /** 
   *  Loads the messages from the AsyncStorage.
   * 
   * @async
   * @function getMessages
   * @return {Promise<string>}  all the messages from the Async storage
   */
  getMessages = async () => {
    let messages = '';
    try {
      /**
       * @default empty array
       */
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /** 
   *  Writes chat messages to state messages whenever the collection changes.
   * 
   * @function onCollectionUpdate
   * @param {Array} querySnapshot - array of chat messages
   * @return {Array}  updated array of messages in the state
   */
  onCollectionUpdate = (querySnapshot) => {
    /** @constant */
    const messages = [];
    messages.push(this.state.systemMessages[0]);

    querySnapshot.forEach((doc) => {
      /**@constant data - the QueryDocumentSnapshot's data */
      const data = doc.data();
      messages.push({
        _id: data._id,
        /**
         * @default ''
         */
        text: data.text || '',
        createdAt: data.createdAt.toString(),
        user: data.user,
        /**
         * @default null
         */
        image: data.image || null,
        /**
         * @default null
         */
        location: data.location || null,
      });
      this.setState({
        messages,
      });
    });
  }

  /**
   * Gets the user props for GiftedChat.
   * 
   * @function user
   * @returns {Object} - user object with id, name and avatar props 
   */
  get user() {
    return {
      _id: this.state.uid,
      name: this.props.navigation.state.params.name,
      avatar: ''
    };
  }

  /** 
   * Defines the chat bubbles styling.
   * 
   * @function renderBubble
   * @param props 
   * @returns {class} Bubble
   */
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

  /**
   * Renders the InputToolbar only when the user is online.
   * 
   * @function renderInputToolbar
   * @param props
   * @returns {class} InputToolbar
   */
  renderInputToolbar(props) {
    if (this.state.isConnected === true) {
      return (
        <InputToolbar {...props} />
      );
    }
  }

  /**
   * Renders custom actions.
   * 
   * @function renderCustomActions
   * @param props
   * @returns {class} CustomActions
   */
  renderCustomActions = (props) => <CustomActions {...props} />;

  // renders MapView if the currentMessage contains location data
  /**
   * Renders MapView if the current message contains location data.
   * 
   * @function renderCustomView
   * @param props
   * @returns {class} MapView
   */
  renderCustomView(props) {
    /** @constant */
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
    /**
     * @function render
     * @memberof Chat - react class component
     * @returns Offline/Online status text
     * @returns Gifted chat with its UI
     * @returns KeyboardSpacer if user's OS is Android
     */
    return (
      <View
        style={{
          flex: 1,
          /** sets the background color to the one passed in the params*/
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
