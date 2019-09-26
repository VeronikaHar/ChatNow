import React from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';

// define what the props sent to a component should look like
import PropTypes from 'prop-types';

//import elements needed for the Start page UI
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default class CustomActions extends React.Component {

    //display a list of actions to share with chat, like take/load picture or share location
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
                }
            },
        );
    };

    //allow to pick an image from user's gallery 
    pickImage = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status === 'granted') {
                let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images', }).catch(error => console.log(error));

                if (!result.cancelled) {
                    await this.uploadImageToFirebase(result.uri);
                }
            }
        }
        catch (error) {
            console.log(error.message)
        }
    }

    // allow to take a picture with a camera to share 
    takePhoto = async () => {
        try {
            const camera = await Permissions.askAsync(Permissions.CAMERA);
            const gallery = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (camera.status === 'granted' && gallery.status === 'granted') {
                let result = await ImagePicker.launchCameraAsync({ mediaTypes: 'Images', }).catch(error => console.log(error));

                if (!result.cancelled) {
                    await this.uploadImageToFirebase(result.uri);
                }
            }
        }
        catch (error) {
            console.log(error.message);
        }
    }

    //allow to share user's current location 
    getLocation = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.LOCATION);
            if (status === 'granted') {
                let result = await Location.getCurrentPositionAsync({});
                if (result) {
                    this.props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude
                        }
                    });
                }
            }
        }
        catch (error) {
            console.log(error.message);
        }

    }

    // upload the image to Firebase Cloud Storage 
    uploadImageToFirebase = async (uri) => {
        try {
            //convert the image into a blob
            const response = await fetch(uri), blob = await response.blob();

            //set the last part of URI as the image name 
            const splitURI = uri.split('/'),
                imageName = splitURI[splitURI.length - 1];

            // create a reference to the Cloud storage location and puts the blob data in it
            const fileRef = firebase.storage().ref().child(`images/${imageName}`),
                snapshot = await fileRef.put(blob);

            //get the image URL from storage
            const imageURL = await snapshot.ref.getDownloadURL();

            return this.props.onSend({ image: imageURL });
        }
        catch (error) {
            console.log(error.message);
        }
    }

    render() {
        return (
            <TouchableOpacity
                accessible={true}
                accessibilityLabel="Custom actions list"
                accessibilityHint="Lets you pick whether to send an image from your camera or gallery or to share your location."
                accessibilityRole="button"
                style={[styles.container]}
                onPress={this.onActionPress}>
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

//custom actions button styling 
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

//define actionSheet as a function for this.content use
CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};