import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

// the application’s Chat component that renders the chat UI 
export default class Chat extends React.Component {
    constructor(props) {
        super(props);
    }

    //function that styles the header bar and sets the the user’s name as the title 
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name,
            headerStyle: {
                backgroundColor: navigation.state.params.color,
                opacity: 0.8
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize: 20,
                fontWeight: 600,
            },
        };
    };

    render() {
        return (
            //set the background to the one passed in the params
            <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color }}>

            </View>
        )
    }
}
