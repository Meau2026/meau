 import {  StyleSheet, Text, TouchableOpacity, View, Image, FlatList , ScrollView, ActivityIndicator} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { storage, db } from '@/firebaseConfig'; 
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Drawer } from 'expo-router/drawer'; 

import { useLocalSearchParams, useRouter } from 'expo-router';



export default function petRemovido(){
  const router = useRouter();
  const { petName } = useLocalSearchParams();
  return (
  <SafeAreaView  edges={['right', 'bottom', 'left']} style={styles.container}>
    <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: '  Remover Pet',
      headerStyle: styles.drawer_header,
    }} />
   

    <View style={styles.text_container}>
      <Text style={styles.text_pronto}>Pronto!</Text>
      <View>
        <Text style={styles.text_info}>{`O ${petName} foi removido da nossa lista com sucesso!`}</Text>
      
        <Text style={styles.text_info}> 
            Porém, as conversas relacionadas à ele
            serão mantidas para o caso de você
            desejar manter contato. Caso deseje
            apagá-las, você pode realizar esta ação
            nas configurações no chat dos
            usuários relacionados à este pet.
        </Text>
      </View>
    </View>
    <TouchableOpacity style={styles.button} onPress={() => {router.navigate('/meus_pets');}}>
      <Text>VOLTAR À MEUS PETS</Text>
    </TouchableOpacity>

   
    

  </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  
  drawer_header:{
    backgroundColor: '#cfe9e5',
    
  },
  container:{
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  text_container:{
    flexDirection :'column', 
    margin: 52,
    gap: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text_pronto:{
    fontFamily: 'Courgette',
    fontSize: 53,
    color: '#88c9bf'

  },
  text_info:{
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575'

  },
  button:{
    height: 48,
    width: 232,
    backgroundColor: '#fdcf58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 24,
  },
  

});
