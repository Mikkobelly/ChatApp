import React, { Component } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage } from 'react-native-gifted-chat';
import avatar from '../assets/user-avatar.png';
//importing firebase with code for ^v9
import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs } from 'firebase/firestore/lite'
import { doc, setDoc, getDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";


//app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGFYfvjUjAXZ8QJeIWggkbdYjpciDKfhM",
    authDomain: "chatapp-2ed91.firebaseapp.com",
    projectId: "chatapp-2ed91",
    storageBucket: "chatapp-2ed91.appspot.com",
    messagingSenderId: "543986050358",
    appId: "1:543986050358:web:62849422d01f6c9ba43f97"
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        }
    }

    componentDidMount() {
        let { name } = this.props.route.params;
        //Render users name on navigation bar at the top
        this.props.navigation.setOptions({ title: name });
        let time = new Date().toLocaleString();

        this.referenceChatMessages = this.getMessages(db);
        // if (this.referenceChatMessages) {
        //     this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate);
        // }

        this.setState({
            messages: [
                //Default first message to greet user
                {
                    _id: 1,
                    text: 'Hello ' + name,
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: avatar,
                    },
                },
                //System message displays the time user entered the chat room
                {
                    _id: 2,
                    text: `Entered at ${time}`,
                    createdAt: new Date(),
                    system: true
                }
            ],
        })
    }

    componentWillUnmount() {
        // this.unsubscribe();
    }

    async getMessages(db) {
        const messages = [];
        const messagesCol = collection(db, 'messages');
        const messagesSnapshot = await getDocs(messagesCol);
        messagesSnapshot.docs.forEach((doc) => {
            let data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: data.user
            })
        })
        this.setState({ messages });
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }), () => {
            this.addMessages(messages);
        });
    }

    // onCollectionUpdate(querySnapshot) {
    //     const messages = [];
    //     querySnapshot.forEach((doc) => {
    //         let data = doc.data();
    //         messages.push({
    //             _id: data._id,
    //             text: data.text,
    //             createdAt: data.createdAt.toDate(),
    //             user: data.user
    //         })
    //     });

    //     this.setState({ messages });
    // }

    async addMessages(msgArray) {
        const data = {
            _id: 3,
            text: 'How are you?',
            createdAt: new Date(),
            user: {
                _id: 4,
                name: 'testUser',
                avatar: avatar,
            },
        }
        const messagesRef = doc(db, 'messages');
        // setDoc(messagesRef, { merge: true });
        // await setDoc(doc(db, "messages", data._id), data);

        await addDoc(collection(messagesRef, "messages"), data);

        // await setDoc(doc(db, "messages"), {
        //     _id: 3,
        //     text: 'How are you?',
        //     createdAt: new Date(),
        //     user: {
        //         _id: 4,
        //         name: 'testUser',
        //         avatar: avatar,
        //     },
        // });
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
        let { color } = this.props.route.params;
        return (
            <View style={[styles.mainBox, { backgroundColor: color }]}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderSystemMessage={this.renderSystemMessage}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{ _id: 1 }}
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
    }
);