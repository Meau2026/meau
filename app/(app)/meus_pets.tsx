
import { Alert, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import React, { useState, useEffect } from 'react';
import { storage } from '@/firebaseConfig'; 
import { ref, getDownloadURL } from 'firebase/storage';
import { Drawer } from 'expo-router/drawer'; 


interface Animal {
  id: string;
  name: string;
  url_foto: string;
  interessados: number;
}

function AnimalEntry({animal} : {animal : Animal} ){
  
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    
    getDownloadURL(ref(storage, 'animais/teste.jpg'))
      .then((url) => setUrl(url))
      .catch((e) => console.error(e));
  }, []); 

  return(
  <View style={styles.pet_frame}>
    <View style={styles.pet_header}>
      <Text style={styles.pet_nome}> 
        {animal.name} 
      </Text> 

      <Ionicons name="information-circle" size={24} color='#434343' />

    </View>
    <Image
      source={{ uri: url }}
      style={styles.pet_foto}
    />
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <Text style={styles.pet_interessados}> {animal.interessados} NOVOS INTERESSADOS </Text>
    </View>
  </View>
  );
}

function AnimalList(){

  const animaisTeste: Animal[] = [
    {id: "0", name: "corvo jubileu", interessados: 7},
    {id: "1", name: "junin", interessados: 0},
    {id: "2", name: "Tony Tony", interessados: 2},
    {id: "3", name: "Helicoptero de combate", interessados: 20},
  ];

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={styles.animal_list}>
    {
      animaisTeste.map( (animal) => (
        <AnimalEntry key={animal.id} animal={animal}/>
      ))
    }
    </ScrollView>

  );



}

export default function MeusPets(){
  
 return (
    <SafeAreaView style={styles.container}>
    <Drawer.Screen
      options = {{
        headerTitle: "meus pets",
        headerStyle: styles.drawer_header
      }}
    />

    <AnimalList/>

    </SafeAreaView>
);

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',

  },
  drawer_header: {
    backgroundColor: '#88c9bf',
  },
  animal_list: {
    gap: 8,
    
  },
  pet_frame: {
    width: 344,
    height: 264,
    borderWidth: 1,           
    borderColor: '#e6e7e8', 
    borderRadius: 4,

		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
  },
  pet_header: {
    width: 344,
    height: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#cfe9e5',
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  pet_foto: {
    width: 344,
    height: 183,
  },
  pet_nome: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#434343',

  },
  pet_interessados: {

    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },


})
