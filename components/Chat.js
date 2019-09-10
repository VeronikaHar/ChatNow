import React from 'react';
import { Platform, Text, View } from 'react-native';

// library for Android devices to keep input field above the keyboard
import KeyboardSpacer from 'react-native-keyboard-spacer';

//library with chat UI 
import { Bubble, GiftedChat } from 'react-native-gifted-chat';

// import Firebase to create a new Firestore database to store the chat's messages
const firebase = require('firebase');
require('firebase/firestore');

// the application’s Chat component that renders the chat UI
export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        // initialize Firebase with its configuration
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyD-NZrmpfQSKL1DwPfgjAJXXpmd9DQA4Qs",
                authDomain: "chatnow-c78b8.firebaseapp.com",
                databaseURL: "https://chatnow-c78b8.firebaseio.com",
                projectId: "chatnow-c78b8",
                storageBucket: "chatnow-c78b8.appspot.com",
                messagingSenderId: "367102862022",
                appId: "1:367102862022:web:82bf034244ae34ce712dc7"
            });
        }

        // reference created database in the Firestore
        this.referenceMessages = firebase.firestore().collection('messages');

        //initialize state
        this.state = {
            systemMessages: [],
            messages: [],
            uid: 0,
            loggedInText: 'Authentication in process. Please wait...'
        };
    }

    //append new messages to the ones saved in state and the ones in Firebase
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }),
            () => { this.addMessage() }
        );
        console.log(this.state)
    }

    //save a message object to the Firestore database
    addMessage() {
        const message = this.state.messages[0];

        // add a new message to the Firebase collection
        this.referenceMessages.add({
            _id: message._id,
            text: message.text,
            createdAt: message.createdAt.toString(),
            user: message.user
        });
    }

    //writes chat messages to state messages whenever the collection changes
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        messages.push(this.state.systemMessages[0]);
        console.log('sysMsg', messages)
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            var data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toString(),
                user: data.user,
            });
            this.setState({
                messages
            });
        });
    }

    //style the header bar and set the the user’s name as the title
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
    };

    //set bubbles styling
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
                    }
                }}
                textProps={{
                    style: {
                        color: '#000',
                    },
                }}

            />
        )
    }

    // set 'user' for GiftedChat props
    get user() {
        return {
            _id: this.state.uid,
            name: this.props.navigation.state.params.name,
            avatar: ''
        };
    }

    componentDidMount() {

        //check whether the user is signed in and if not authorize a new user
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                firebase.auth().signInAnonymously();
            }

            const systemMessages = [];

            systemMessages.push({
                _id: 1,
                text: this.props.navigation.state.params.name + ' joined the chat',
                createdAt: new Date(),
                system: true,
            });

            //update the state with currently active user data
            this.setState({
                systemMessages,
                uid: user.uid,
                loggedInText: 'Hello there, ' + this.props.navigation.state.params.name,
            });

            // listen for collection changes for chat room
            this.unsubscribe = this.referenceMessages.onSnapshot(this.onCollectionUpdate);
        });
    }

    componentWillUnmount() {
        // stop listening to authentication
        this.authUnsubscribe();
        // stop listening for changes
        this.unsubscribe();
    }

    render() {
        return (
            //set the background color to the one passed in the params
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.props.navigation.state.params.color,
                }}>
                <Text
                    style={{
                        padding: 5,
                        margin: 5,
                        alignSelf: 'center',
                        backgroundColor: '#fff',
                    }}>
                    {this.state.loggedInText}
                </Text>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={this.user}
                />
                {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
            </View>
        );
    }
}
