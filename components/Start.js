/**
 * @fileOverview Creates a start page where the user can type his name and pick chat background color
 */
import React from 'react';
import {
  AsyncStorage, Image, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import KeyboardSpacer from 'react-native-keyboard-spacer';

/**
* @class Start 
* @requires React
* @requires React-Native
* @requires Ionicons - expo library of special symbols
* @requires KeyboardSpacer - library for Android devices to keep input field above the keyboard
*/

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      color: '#868096',
    };
  }

  componentDidMount() {
    /** Sets username value to this.state.name for exisiting user */
    this.getUsername();
  }

  /** 
   *  Loads the existing user's username from the AsyncStorage and passes it to the state.
   * 
   * @async
   * @function getUsername
   * @return {Promise<string>} the username
   */
  getUsername = async () => {
    let username = '';
    try {
      /**
       * @default ''
       */
      username = await AsyncStorage.getItem('username') || '';
      /** @constant */
      const name = JSON.parse(username)
      this.setState({ name });
    } catch (error) {
      console.log(error.message);
    }
  }

  /** navigates to the Chat screen with the params of the user's name and selected background color */
  onPress = () => {
    this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color });
  }

  /** Styles the header bar */
  static navigationOptions = {
    headerStyle: {
      backgroundColor: '#757083',
    },
  };

  render() {
    /**
     * @function render
     * @memberof Start - react class component
     * @returns ImageBackground
     * @returns App Title
     * @returns TextInput
     * @returns TouchableOpacity with background color options
     * @returns KeyboardSpacer if user's OS is Android
     */
    return (
      <ImageBackground
        source={require('../assets/background.png')}
        style={{ flex: 1, justifyContent: 'space-between' }}
      >
        <Text style={[styles.title, { marginTop: '15%', marginBottom: '42%' }]}>
          ChatNow
                </Text>
        <View style={styles.container}>
          <View style={styles.textInput}>
            <Image
              style={{ height: 25, width: 25 }}
              source={require('../assets/icon.png')}
            />
            <TextInput
              style={[styles.text, { paddingLeft: 15, opacity: 0.8 }]}
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}
              placeholder="Your Name"
            />
          </View>
          <Text style={[styles.text, { margin: '5%' }]}>Choose Background Color:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: '-5%' }}>
            <TouchableOpacity
              accessible
              accessibilityLabel="Chat background color"
              accessibilityHint="Lets you choose your chat background color."
              accessibilityRole="button"
              style={[styles.circle, { backgroundColor: '#090C08' }]}
              onPress={() => this.setState({ color: '#090C08' })}
            >
              <Text style={styles.tick}>
                {this.state.color === '#090C08' ? <Ionicons name="md-checkmark" size={25} /> : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessible
              accessibilityLabel="Chat background color"
              accessibilityHint="Lets you choose your chat background color."
              accessibilityRole="button"
              style={[styles.circle, { backgroundColor: '#474056' }]}
              onPress={() => this.setState({ color: '#474056' })}
            >
              <Text style={styles.tick}>
                {this.state.color === '#474056' ? <Ionicons name="md-checkmark" size={25} /> : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessible
              accessibilityLabel="Chat background color"
              accessibilityHint="Lets you choose your chat background color."
              accessibilityRole="button"
              style={[styles.circle, { backgroundColor: '#8A95A5' }]}
              onPress={() => this.setState({ color: '#8A95A5' })}
            >
              <Text style={styles.tick}>
                {this.state.color === '#8A95A5' ? <Ionicons name="md-checkmark" size={25} /> : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessible
              accessibilityLabel="Chat background color"
              accessibilityHint="Lets you choose your chat background color."
              accessibilityRole="button"
              style={[styles.circle, { backgroundColor: '#B9C6AE' }]}
              onPress={() => this.setState({ color: '#B9C6AE' })}
            >
              <Text style={styles.tick}>
                {this.state.color === '#B9C6AE' ? <Ionicons name="md-checkmark" size={25} /> : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            accessible
            accessibilityLabel="Chat start"
            accessibilityHint="Transfers you to the chat screen."
            accessibilityRole="button"
            style={styles.button}
            onPress={this.onPress}
          >
            <Text style={[styles.title, { fontSize: 16 }]}>START CHATTING</Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'space-around',
    height: 60,
    backgroundColor: '#757083',
  },
  circle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 15,
  },
  container: {
    alignContent: 'flex-end',
    height: '44%',
    width: '88%',
    padding: '5%',
    alignSelf: 'center',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  tick: {
    color: '#fff',
    marginTop: '15%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    alignSelf: 'center',
    color: '#fff',
  },
  text: {
    color: '#757083',
    fontSize: 16,
    fontWeight: '300',
  },
  textInput: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 2,
    borderColor: '#757083',
    height: 60,
    padding: 15,
  },
});
