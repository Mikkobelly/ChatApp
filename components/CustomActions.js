import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location'
import firebase from 'firebase';

export default class CustomActions extends Component {
    //Choose image from user device's library
    imagePicker = async () => {
        try {
            // expo permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status === 'granted') {
                // pick image
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images // only images are allowed
                }).catch((error) => console.log(error));
                // canceled process
                if (!result.canceled) {
                    const imageUrl = await this.uploadImageFetch(result.assets[0].uri);
                    this.props.onSend({ image: imageUrl });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    //Take photo on device's camera
    takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync(
            Permissions.CAMERA,
            Permissions.MEDIA_LIBRARY
        );
        try {
            if (status === 'granted') {
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch((error) => console.log(error));

                if (!result.canceled) {
                    const imageUrl = await this.uploadImageFetch(result.assets[0].uri);
                    this.props.onSend({ image: imageUrl });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    //Get current location of user
    getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const result = await Location.getCurrentPositionAsync({}).catch((error) => console.log(error));
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
    };

    //Upload images to firestore
    uploadImageFetch = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

        const imageNameBefore = uri.split('/');
        const imageName = imageNameBefore[imageNameBefore.length - 1];
        const ref = firebase.storage().ref().child(`images/${imageName}`);
        const snapshot = await ref.put(blob);

        blob.close();

        return await snapshot.ref.getDownloadURL();
    };

    //When user selects a feature to use
    onActionPress = () => {
        const options = ['Choose Photo From Library', 'Take A Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;

        this.props.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log("user wants to pick an image");
                        return this.imagePicker();
                    case 1:
                        console.log("user wants to take a photo");
                        return this.takePhoto();
                    case 2:
                        console.log("user wants to get their location");
                        return this.getLocation();
                }
            }
        );
    };

    render() {
        return (
            <TouchableOpacity
                accessible={true}
                accessibilityLabel="More options"
                accessibilityHint="Let you choose to send an image or your geolocation."
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

const styles = StyleSheet.create({
    container: {
        width: 30,
        height: 30,
        marginLeft: 15,
        marginRight: 5,
        marginBottom: 10,
        marginTop: 10
    },
    wrapper: {
        borderRadius: 15,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 18,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};

CustomActions = connectActionSheet(CustomActions);