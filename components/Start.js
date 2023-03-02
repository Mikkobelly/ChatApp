import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, Image } from 'react-native';
import backgroundImage from '../assets/homeBG.png';

//Color theme list
const backgroundColors = {
    black: { backgroundColor: "#090C08" },
    purple: { backgroundColor: "#474056" },
    grey: { backgroundColor: "#8A95A5" },
    green: { backgroundColor: "#B9C6AE" },
};

export default class Start extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            color: ''
        }
    }

    componentDidMount() {
        //Default theme color is grey
        this.setState({ color: '#8A95A5' });
    }

    render() {
        const { black, purple, grey, green } = backgroundColors;
        return (
            <View style={styles.mainBox}>
                <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.bgImage}>
                    <View style={[styles.mainBox, styles.contentBox]}>
                        <Text style={styles.title}>Chat App</Text>
                        <View style={styles.settingBox}>
                            <View style={styles.inputContainer}>
                                <Image source={require('../assets/icon.png')} style={styles.userIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={this.state.name}
                                    onChangeText={(text) => this.setState({ name: text })}
                                    placeholder='Your Name'
                                />
                            </View>
                            <View>
                                <Text style={styles.chooseText}>Choose Background Color:</Text>
                                <View style={styles.colorBox}>
                                    <TouchableOpacity style={[styles.outer, this.state.color === black.backgroundColor && { borderColor: '#757083' }]}>
                                        <TouchableOpacity
                                            accessibilityLabel="Theme color option: black"
                                            accessibilityHint="Let’s you choose the theme color for the chat screen"
                                            accessibilityRole="button"
                                            style={[styles.colorCircle, { backgroundColor: black.backgroundColor }]}
                                            onPress={() => this.setState({ color: black.backgroundColor })}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.outer, this.state.color === purple.backgroundColor && { borderColor: '#757083' }]}>
                                        <TouchableOpacity
                                            accessibilityLabel="Theme color option: purple"
                                            accessibilityHint="Let’s you choose the theme color for the chat screen"
                                            accessibilityRole="button"
                                            style={[styles.colorCircle, { backgroundColor: purple.backgroundColor }]}
                                            onPress={() => this.setState({ color: purple.backgroundColor })}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.outer, this.state.color === grey.backgroundColor && { borderColor: '#757083' }]}>
                                        <TouchableOpacity
                                            accessibilityLabel="Theme color option: grey"
                                            accessibilityHint="Let’s you choose the theme color for the chat screen"
                                            accessibilityRole="button"
                                            style={[styles.colorCircle, { backgroundColor: grey.backgroundColor }]}
                                            onPress={() => this.setState({ color: grey.backgroundColor })}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.outer, this.state.color === green.backgroundColor && { borderColor: '#757083' }]}>
                                        <TouchableOpacity
                                            accessibilityLabel="Theme color option: green"
                                            accessibilityHint="Let’s you choose the theme color for the chat screen"
                                            accessibilityRole="button"
                                            style={[styles.colorCircle, { backgroundColor: green.backgroundColor }]}
                                            onPress={() => this.setState({ color: green.backgroundColor })}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity
                                accessibilityLabel="Go to chat room"
                                accessibilityRole="button"
                                style={styles.startButton}
                                onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })}
                            >
                                <Text style={styles.buttonText}>Start Chatting</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        )
    }
}

const styles = StyleSheet.create(
    {
        mainBox: {
            flex: 1,
        },

        bgImage: {
            flex: 1,
        },

        contentBox: {
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 30
        },

        title: {
            fontSize: 45,
            color: '#FFF',
            marginTop: 40
        },

        settingBox: {
            backgroundColor: '#FFF',
            flex: .5,
            justifyContent: 'space-between',
            width: '100%',
            padding: 20,
        },

        inputContainer: {
            flexDirection: 'row',
            borderColor: '#757083',
            borderWidth: 2,
            borderRadius: 3,
            height: 50,
            padding: 12,
        },

        userIcon: {
            width: 20,
            height: 20
        },

        input: {
            fontSize: 16,
            width: '100%'
        },

        chooseText: {
            fontSize: 16,
            color: '#757083',
            marginBottom: 12
        },

        colorBox: {
            flex: 1,
            flexDirection: 'row'
        },

        colorCircle: {
            width: 44,
            height: 44,
            borderRadius: 22,
            position: 'absolute',
            top: 1,
            left: 1,
            opacity: 1
        },

        outer: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 25,
            backgroundColor: '#FFFFFF',
            borderColor: '#FFFFFF',
            borderStyle: 'solid',
            borderWidth: 2,
            position: 'relative',
        },
        startButton: {
            width: '100%',
            backgroundColor: '#757083',
            padding: 15,
            borderRadius: 3,
            marginTop: 30
        },

        buttonText: {
            color: '#FFFFFF',
            marginRight: 'auto',
            marginLeft: 'auto',
        }
    }
)