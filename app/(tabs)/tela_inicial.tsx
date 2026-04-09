import { Courgette_400Regular, useFonts } from '@expo-google-fonts/courgette';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TelaInicial() {
    return (
        <View style={styles.layout}>
            <Ionicons name="menu-outline" size={24} color="#88C9BF" padding={12} />
            <View style={styles.layout2}>
                <View style={{ height: 56 }} />
                <Text style={styles.title_text}>Olá!</Text>
                <View style={{ height: 52 }} />
                <Text style={styles.text}>
                    Bem vindo ao Meau!{'\n'}
                    Aqui você pode adotar, doar e ajudar cães e gatos com facilidade.{'\n'}
                    Qual o seu interesse?
                </Text>
                <View style={{ height: 48 }} />
                <TouchableOpacity style={[styles.button]}>
                    <Text style={styles.button_text}>ADOTAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]}>
                    <Text style={styles.button_text}>AJUDAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]}>
                    <Text style={styles.button_text}>CADASTRAR ANIMAL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button_entrar]}>
                    <Text style={styles.login_text}>login</Text>
                </TouchableOpacity>

                <Image source={require('../../assets/images/Meau_marca_2.png')} style={{ width: 122, height: 44 }} />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({

    layout: {
        flex: 1,
        backgroundColor: '#fafafa',
    },

    layout2: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },

    title_text: {
        fontFamily: 'Courgette_400Regular',
        color: '#FFD358',
        fontSize: 72,
    },

    text: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 48,
        color: '#757575',
    },

    button_text: {
        fontSize: 12,
        color: '#434343',
    },

    login_text: {
        fontSize: 16,
        color: '#88C9BF',
    },

    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 232,
        borderRadius: 2,
        marginBottom: 12,
        // Sombras para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        // Sombra para Android
        elevation: 5,
        backgroundColor: '#FFD358',
    },
    button_entrar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 232,
        backgroundColor: '#fafafa',
        marginBottom: 100,
        marginTop: 32,
    },

});
