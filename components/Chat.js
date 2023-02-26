import React, { Component } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, SystemMessage } from 'react-native-gifted-chat';
import avatar from '../assets/user-avatar.png';

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

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }))
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
        let fontColor = color === '#B9C6AE' ? '#222' : '#FFFFFF'; //if the selected theme color is green, font color will be purple.
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