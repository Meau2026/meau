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



export default function ProcessoFinalizado(){
  const router = useRouter();
  const { petName } = useLocalSearchParams();
  return (
  <SafeAreaView  edges={['right', 'bottom', 'left']} style={styles.container}>
    <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: '  Finalizar processo',
      headerStyle: styles.drawer_header,
    }} />
   

    <View style={styles.text_container}>
      <Text style={styles.text_pronto}>Oba!</Text>
      <View>
        <Text style={styles.text_info}>
        Ficamos muito felizes com o sucesso 
        do seu processo! Esperamos que o 
        bichinho esteja curtindo muito essa
        nova experiência!
        
        </Text>
      
        <Text style={styles.text_info}> 
        {`Agora, que tal compartilhar a história do ${petName} com todos os outros membros do Meau?`}        
        </Text>
      </View>
    </View>
    <TouchableOpacity style={styles.button} onPress={() => {router.navigate('/finalizar_processo/index');}}>
      <Text>COMPARTILHAR HISTÓRIA</Text>
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
    color: '#757575',
    marginBottom:24

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
