import { Drawer } from 'expo-router/drawer';


import { 
  DrawerContentComponentProps,
  DrawerContentScrollView, 
  DrawerItemList,
  DrawerItem
} from '@react-navigation/drawer';

import {View, StyleSheet , Alert, TouchableOpacity, Text, LayoutAnimation }from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';



import React, { useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { auth } from '@/firebaseConfig'; 
import { signOut } from 'firebase/auth';


const handleLogout = async () => {
    try {
      await signOut(auth);
 
    } catch (error: any) {
      Alert.alert("Erro ao sair", error.message);
    }
  };

const createLocalNavegation = (props: DrawerContentComponentProps) => {
  return (route) => {
    props.navigation.navigate(route); 
  }
}

const Separator = () => (<View style={styles.separator} />);

function Atalhos(props: DrawerContentComponentProps){
  const [expanded, setExpanded] = useState(false);
  
  const navigate = createLocalNavegation(props)

  const body = (
    <View>
      <DrawerItem 
        label= 'Cadastar um pet'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
      />
      <Separator/>
      <DrawerItem 
        label= 'Adotar um pet'
        labelStyle={styles.text_entry}
        
        onPress={() => navigate('hello')}
      />
      <Separator/>
      <DrawerItem 
        label= 'Ajudar um pet'
        labelStyle={styles.text_entry}
        
        onPress={() => navigate('hello')}
      />
      <Separator/>
    <DrawerItem 
        label= 'Apadrinhar um pet'
        labelStyle={styles.text_entry} 
        onPress={() => navigate('hello')}
      />
    </View>
  );

  return(
    <View>
     <TouchableOpacity 
    style = {styles.atalhos}
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    }}>
      <Text> Atalhos </Text>
    </TouchableOpacity>

    { expanded && body }
    </View>

  );

}

function Informacoes(props: DrawerContentComponentProps){
  const [expanded, setExpanded] = useState(false);
  
  const navigate = createLocalNavegation(props)

  const body = (
    <View>
      <DrawerItem 
        label= 'Dicas'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
      />
      <Separator/>
      <DrawerItem 
        label= 'Eventos'
        labelStyle={styles.text_entry}
        
        onPress={() => navigate('hello')}
      />
      <Separator/>
      <DrawerItem 
        label= 'Legislação'
        labelStyle={styles.text_entry}
        
        onPress={() => navigate('hello')}
      />
      <Separator/>
    <DrawerItem 
        label= 'Termo de adoção'
        labelStyle={styles.text_entry} 
        onPress={() => navigate('hello')}
      />
  <Separator/>
      <DrawerItem 
        label= 'Histórias de adoção'
        labelStyle={styles.text_entry}
        
        onPress={() => navigate('hello')}
      />

    </View>
  );

  return(
    <View>
     <TouchableOpacity 
    style = {styles.informacoes}
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    }}>
      <Text> Informações </Text>
    </TouchableOpacity>

    { expanded && body }
    </View>

  );

}



function CustomDrawerContent(props: DrawerContentComponentProps){

  return(


    <SafeAreaView  style={styles.drawer} edges={['bottom', 'left', 'right']} >
      <View style={styles.header}>
        <View style={styles.picture_placeholder} />
      </View>
    
    <Atalhos{...props}/>
    <Informacoes{...props}/>
  <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
    <TouchableOpacity 
    style = {styles.logout_button}
    onPress={handleLogout}
    >
      <Text> Sair </Text>
    </TouchableOpacity>
    
    </SafeAreaView>
  );

}


export default function DrawerLayout() {

  const colorScheme = useColorScheme();

  return (
    <Drawer 
    screenOptions={{
      drawerStyle:{width:304},
      drawerActiveTintColor: '#f7f7f7',
      drawerLabelStyle: {
        color: '#434343',
        fontFamily: 'Roboto-Regular'

      }
    }} 
    drawerContent={CustomDrawerContent}/>);


}


const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#f7f7f7',
    flex: 1
  },
  header: {
    height: 172,
    width:304, 
    backgroundColor: '#88c9bf'
  },
  picture_placeholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee29b',
    top:40,
    left:16,
  },
  logout_button: {
    height: 48,
    width:304, 
    backgroundColor: '#88c9bf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhos: {
    height: 48,
    width:304,
    backgroundColor: '#fee29b',
    justifyContent: 'center',
  },
  informacoes: {
    height: 48,
    width:304,
    backgroundColor: '#cfe9e5',
    justifyContent: 'center',

  },
  separator: {
    width: 256,
    height: 1,
    backgroundColor: '#e6e7e8', 
    marginLeft: 48,
  },
  text_entry:{
    fontFamily: 'Roboto-Regular', 
    fontSize: 14,
    color: '#434343',
    marginLeft: 48,
  } 




})
