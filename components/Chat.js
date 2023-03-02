import React, { Component } from 'react';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage } from 'react-native-gifted-chat';
import avatar from '../assets/user-avatar.png';
import firebase from 'firebase';
import firestore from 'firebase';

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
            loggedInText: 'Logging in... Please wait a moment'
        }
    }

    componentDidMount() {
        let { name } = this.props.route.params;
        //Render users name on navigation bar at the top
        this.props.navigation.setOptions({ title: name });

        this.referenceChatMessages = firebase.firestore().collection("messages");
        this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate);

        this.authUnsubscribe = firebase.auth().onAuthStateChanged(
            user => {
                if (!user) { firebase.auth().signInAnonymously(); }
                this.setState({
                    uid: user.uid,
                    messages: [
                        {
                            _id: user.uid + 'system',
                            text: `${name} logged in`,
                            createdAt: new Date(),
                            system: true,
                        }
                    ],
                    user: {
                        _id: user.uid,
                        avatar: user.avatar,
                        name: name,
                    },
                    loggedInText: ''
                });

                this.unsubscribe = this.referenceChatMessages
                    .orderBy('createdAt', 'desc')
                    .onSnapshot(this.onCollectionUpdate);
            }
        );
    }

    componentWillUnmount() {
        if (this.referenceChatMessages) {
            //stop listening for changes
            this.unsubscribe();
            //stop listening to authentication
            this.authUnsubscribe();
        }
    }

    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            let data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt ? data.createdAt.toDate() : {},
                user: {
                    _id: data.user._id,
                    avatar: data.user.avatar || '',
                    name: data.user.name,
                }
            });
        });

        this.setState({ messages });
    }

    addMessages = () => {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            uid: this.state.uid,
            _id: message._id,
            createdAt: message.createdAt,
            text: message.text || '',
            user: message.user,
        })
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }), () => {
            // callback: after saving state, add message
            this.addMessages();
        });
    }

    //Customizing bubble style
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

    //Customozinig system mesage
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
        return (
            <View style={[styles.mainBox, { backgroundColor: color }]}>
                {this.state.loggedInText !== '' && <Text style={[styles.loadText, { color: loadTextColor }]}>{this.state.loggedInText}</Text>}
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderSystemMessage={this.renderSystemMessage}
                    messages={this.state.messages}
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