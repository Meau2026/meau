
import { Alert, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

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



export default function MeusPets(){
  
  const animalTeste : Animal = {id: "1", name: "corvo jubileu", interessados: 0};
  
  return (
    <SafeAreaView style={styles.container}>
    <Drawer.Screen
      options = {{
        headerTitle: "meus pets",
        headerStyle: styles.drawer_header
      }}
    />

    <AnimalEntry animal={animalTeste}/>



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

  pet_frame: {
    width: 344,
    height: 264,
    borderWidth: 1,           // Espessura da linha
    borderColor: '#e6e7e8',   // Cor da borda (cinza claro do Meau)
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
