/**
 * @fileOverview Creates custom actions available in Chat that allow users to take and share a photo, share their location
 */
import React from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

/**
* @class CustomActions
* @requires React
* @requires React-Native
* @requires Firebase
* @requires Firestore
* @requires PropTypes - defines the props sent to a component
* @requires Expo-Image-Picker
* @requires Expo-Permissions
* @requires Expo-Location
*/

export default class CustomActions extends React.Component {
  /** 
   * Displays a list of actions to share with chat, like take/load picture or share location.
   * 
   * @function onActionPress
   * @returns list of action options
   */
  onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            return this.pickImage();
          case 1:
            return this.takePhoto();
          case 2:
            return this.getLocation();
          default:
        }
      },
    );
  };

  /**
   * Allows to pick an image from user's gallery.
   * 
   * @async
   * @function pickImage
   * @returns selected image
   */
  pickImage = async () => {
    try {
      /** 
       * Asks the user for a permission to access the device's image gallery.
       * 
       * @async
       * @function status
       * @returns granted or not granted status
       */
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images' }).catch((error) => console.log(error));

        if (!result.cancelled) {
          await this.uploadImageToFirebase(result.uri);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Allows to share a picture taken with the user's device's camera.
   * 
   * @async
   * @function takePhoto
   * @returns picture taken by the device's camera
   */
  takePhoto = async () => {
    try {
      /** 
       * Asks the user for a permission to access the device's camera.
       * 
       * @async
       * @function camera
       * @returns granted or not granted status
       */
      const camera = await Permissions.askAsync(Permissions.CAMERA);
      const gallery = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (camera.status === 'granted' && gallery.status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'Images' }).catch((error) => console.log(error));

        if (!result.cancelled) {
          await this.uploadImageToFirebase(result.uri);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Allows to share user's current location.
   * 
   * @async
   * @function getLocation
   * @returns the device's location coordinates
   */
  getLocation = async () => {
    try {
      /** 
       * Asks the user for a permission to access the device's location.
       * 
       * @async
       * @function status
       * @returns granted or not granted status
       */
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        const result = await Location.getCurrentPositionAsync({});
        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }

  }

  /** 
   * Uploads the image to the 1Firebase Cloud Storage.
   * 
   * @async
   * @function uploadImageToFirebase
   * @param {string} uri image's URI
   * @returns image's Cloud Storage URL for download
   */
  uploadImageToFirebase = async (uri) => {
    try {
      /** converts the image into a blob*/
      const response = await fetch(uri);
      const blob = await response.blob();

      /** sets the last part of URI as the image name */
      const splitURI = uri.split('/');
      const imageName = splitURI[splitURI.length - 1];

      /** creates a reference to the Cloud storage location and puts the blob data in it */
      const fileRef = firebase.storage().ref().child(`images/${imageName}`);
      const snapshot = await fileRef.put(blob);

      /** gets the image URL from the Cloud storage */
      const imageURL = await snapshot.ref.getDownloadURL();

      return this.props.onSend({ image: imageURL });
    } catch (error) {
      console.log(error.message);
    }
  }

  render() {
    /**
     * @function render
     * @memberof CustomActions - react class component
     * @returns Touchable Opacity that on press generates list of custom actions
     */
    return (
      <TouchableOpacity
        accessible
        accessibilityLabel="Custom actions list"
        accessibilityHint="Lets you pick whether to send an image from your camera or gallery or to share your location."
        accessibilityRole="button"
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

/** custom actions button styling */
const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

/** defines actionSheet as a function for this.content use */
CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
