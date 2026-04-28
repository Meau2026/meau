import { Courgette_400Regular, useFonts } from '@expo-google-fonts/courgette';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';


import { Drawer } from 'expo-router/drawer';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';


import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';



export default function TelaInicial() {
  const navigation = useNavigation();  
 const { user, loading } = useAuth();

  return (
        <SafeAreaView style={styles.layout}>

         <Drawer.Screen
          options = {{
           headerShown: false
            }}
          />

        
          <TouchableOpacity onPress={() => {navigation.dispatch(DrawerActions.openDrawer());}} >
            <Ionicons name="menu-outline" size={24} color="#88C9BF" padding={12} />
          </TouchableOpacity>
          
          <View style={styles.layout2}>
                <View style={{ height: 50 }} />
                <Text style={styles.title_text}>Olá!</Text>
                <View style={{height: 20  }} />
                <Text style={styles.text}>
                    Bem vindo ao Meau!{'\n'}
                    Aqui você pode adotar, doar e ajudar cães e gatos com facilidade.{'\n'}
                    Qual o seu interesse?
                </Text>
                <View style={{ height: 15 }} />
                <TouchableOpacity style={[styles.button]}>
                    <Text style={styles.button_text}>ADOTAR</Text>
                </TouchableOpacity>
              
                <TouchableOpacity  onPress={() => {
                  if(user){
                    navigation.navigate('cadastrar_animal');
                  }
                  else{
                    Alert.alert("É preciso estar logado para cadastrar animais");

                  }

                }} style={[styles.button]}>
                    <Text style={styles.button_text}>CADASTRAR ANIMAL</Text>
                </TouchableOpacity>
                { !user &&
                <TouchableOpacity onPress={() => {navigation.navigate('login');}} style={[styles.button_entrar]}>
                   
                    <Text style={styles.login_text}>login</Text>
                </TouchableOpacity>
                }
                { user && 
                  <Text style={styles.bem_vindo_text}>bem vindo!</Text>
                }

                <Image source={require('../assets/images/Meau_marca_2.png')} style={{ width: 122, height: 44}} />
            </View>
        </SafeAreaView>
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
        fontFamily: 'Courgette',
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
    bem_vindo_text: {
        fontSize: 16,
        color: '#88C9BF',
        marginBottom: 100,
        marginTop: 32,
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
