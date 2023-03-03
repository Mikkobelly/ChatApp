import React, { Component } from 'react';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, InputToolbar } from 'react-native-gifted-chat';

import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import MapView from 'react-native-maps';
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import CustomActions from './CustomActions';

import avatar from '../assets/user-avatar.png';


export default class Chat extends Component {
    constructor(props) {
        super(props);

        //app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCGFYfvjUjAXZ8QJeIWggkbdYjpciDKfhM",
            authDomain: "chatapp-2ed91.firebaseapp.com",
            projectId: "chatapp-2ed91",
            storageBucket: "chatapp-2ed91.appspot.com",
            messagingSenderId: "543986050358",
            appId: "1:543986050358:web:62849422d01f6c9ba43f97"
        }

        //Initialize firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.state = {
            uid: 0,
            messages: [],
            user: {
                _id: '',
                avatar: '',
                name: '',
            },
            image: null,
            location: null,
            isConnected: false,
            loggedInText: 'Logging in... Please wait a moment'
        }
    }

    //get messages from local storage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({ messages: JSON.parse(messages), loggedInText: '' });
        } catch (error) {
            console.log(error.message);
        }
    }

    componentDidMount() {
        let { name } = this.props.route.params;
        //Render users name on navigation bar at the top
        this.props.navigation.setOptions({ title: `${name}'s Chat` });

        //check if the user had internet connection
        NetInfo.fetch().then((connection) => {
            if (connection.isConnected) {
                //Reference the collection stored in firestore
                this.referenceChatMessages = firebase.firestore().collection("messages");

                // authorize firebase
                this.authUnsubscribe = firebase
                    .auth()
                    .onAuthStateChanged(async (user) => {
                        if (!user) {
                            await firebase.auth().signInAnonymously();
                        }
                        //update user state with currently active user data
                        this.setState({
                            uid: user.uid,
                            messages: [],
                            user: {
                                _id: user.uid,
                                avatar: avatar,
                                name: name,
                            },
                            loggedInText: '',
                            isConnected: true,
                        });

                        this.unsubscribe = this.referenceChatMessages
                            .orderBy("createdAt", "desc")
                            .onSnapshot(this.onCollectionUpdate);
                    });
            } else {
                this.setState({ isConnected: false });
                this.getMessages();
            }
        });
    }

    componentWillUnmount() {
        if (this.referenceChatMessages) {
            //stop listening for changes
            this.unsubscribe();
            //stop listening to authentication
            this.authUnsubscribe();
        }
    }

    //Add a new message to the message collection in firestore DB using state
    addMessage = () => {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            uid: this.state.uid,
            _id: message._id,
            createdAt: message.createdAt,
            text: message.text || '',
            user: message.user,
            image: message.image || null,
            location: message.location || null
        })
    }

    //Save updated messages list to local storage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    //Delete all messages stored in local storage
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
            console.log('localstorage cleared')
        } catch (error) {
            console.log(error.message);
        }
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }), () => {
            // callbacks: after saving state, add message and save new message list in localstorage
            this.addMessage();
            this.saveMessages();
        });
    }

    //Update the message state when onSnapshot is triggered
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            let data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text || '',
                createdAt: data.createdAt ? data.createdAt.toDate() : {},
                user: data.user,
                image: data.image || null,
                location: data.location || null
            });
        });

        this.setState({ messages });
    }

    //Render input only when the user is online
    renderInputToolbar(props) {
        if (this.state.isConnected == false) {
        } else {
            return <InputToolbar {...props} />;
        }
    }

    //Customize bubble style
    renderBubble(props) {
        let { color } = this.props.route.params;
        //Change bubble color acording to the selected theme color
        let bubbleColor = color === '#090C08' ? '#2F4F4F' : color === '#474056' ? '#665f74' : color === '#8A95A5' ? '#5076ad' : '#76ac49';

        return (
            <Bubble
                {...props}
                wrapperStyle={{ right: { backgroundColor: bubbleColor } }}
            />
        )
    }

    //Render customized action button
    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    }

    //custom map view
    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    //Customoze system mesage
    renderSystemMessage(props) {
        return (
            <SystemMessage
                {...props}
                textStyle={{
                    color: '#fffafaa4'
                }}
            />
        )
    }

    render() {
        let { name } = this.props.route.params;
        let { color } = this.props.route.params;
        let loadTextColor = (color === '#090C08' || color === '#474056') ? '#FFFFFF' : '#090C08';
        let offlineAlert = {
            _id: 1,
            text: "You are currently offline. Messages can't be updated or sent.",
            system: true,
        };

        return (
            <ActionSheetProvider>
                <View style={[styles.mainBox, { backgroundColor: color }]}>
                    {this.state.loggedInText !== '' && <Text style={[styles.loadText, { color: loadTextColor }]}>{this.state.loggedInText}</Text>}
                    <GiftedChat
                        renderInputToolbar={this.renderInputToolbar.bind(this)}
                        renderBubble={this.renderBubble.bind(this)}
                        renderActions={this.renderCustomActions}
                        renderCustomView={this.renderCustomView}
                        renderSystemMessage={this.renderSystemMessage.bind(this)}
                        messages={
                            //If offline, append offlineAlert message before message array
                            this.state.isConnected ? this.state.messages : [offlineAlert, ...this.state.messages]
                        }
                        onSend={messages => this.onSend(messages)}
                        user={{
                            _id: this.state.user._id,
                            avatar: avatar,
                            name: name
                        }}
                        style={[styles.mainBox, { backgroundColor: color }]}
                    />
                    {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
                </View>
            </ActionSheetProvider>
        )
    }
}

const styles = StyleSheet.create(
    {
        mainBox: {
            flex: 1
        },

        loadText: {
            textAlign: 'center',
            fontSize: 20,
            marginTop: 30
        }
    }
);