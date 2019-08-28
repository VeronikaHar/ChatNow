import React from 'react';
import { Platform, View } from 'react-native';

// library for Android devices to keep input field above the keyboard
import KeyboardSpacer from 'react-native-keyboard-spacer';

//library with chat UI 
import { Bubble, GiftedChat } from 'react-native-gifted-chat';

// the application’s Chat component that renders the chat UI
export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };
    }

    // set example user and system messages
    componentDidMount() {
        this.setState({
            messages: [
                {
                    _id: 1,
                    text: this.props.navigation.state.params.name + ' joined the chat',
                    createdAt: new Date(),
                    system: true,
                },
                {
                    _id: 2,
                    text: 'Hey! Would you like to talk to yourself?',
                    createdAt: new Date(),
                    user: {
                        _id: 3,
                        name: this.props.navigation.state.params.name,
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                },
            ]
        })
    }

    //function that appends new messages to the ones saved in state
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }));
    }

    //function that styles the header bar and sets the the user’s name as the title
    static navigationOptions = ({ navigation }) => {
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

    //function that determines speech bubble background color
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#000'
                    }
                }}
            />
        )
    }

    render() {
        return (
            //set the background to the one passed in the params
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.props.navigation.state.params.color,
                }}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{ _id: 1, }}
                />
                {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
            </View>
        );
    }
}
