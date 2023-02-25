import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default class Chat extends Component {
    componentDidMount() {
        let { name } = this.props.route.params;
        //Render users name on navigation bar at the top
        this.props.navigation.setOptions({ title: name });
    }

    render() {
        let { color } = this.props.route.params;
        let fontColor = color === '#B9C6AE' ? '#222' : '#FFFFFF'; //if the selected theme color is green, font color will be purple.
        return (
            <View style={[styles.mainBox, { backgroundColor: color }]}>
                <Text style={[styles.greeting, { color: fontColor }]}>Hello {this.props.route.params.name}!</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create(
    {
        mainBox: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        greeting: {
            fontSize: 20
        }
    }
);