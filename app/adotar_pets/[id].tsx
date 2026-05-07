
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';

import { db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { doc, getDoc, } from 'firebase/firestore';
import { getDownloadURL, ref, } from 'firebase/storage';
import React, { useEffect, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect,  } from 'react';
import { storage, db } from '@/firebaseConfig'; 
import { ref, getDownloadURL,  } from 'firebase/storage';
import { getDoc, doc,  } from 'firebase/firestore';
import { Drawer } from 'expo-router/drawer'; 

import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

interface Animal {
  id: string;
  nome: string;
  porte: string;
  idade: string;
  sexo: string;
  fotos: string[];

  vacinado: string;
  vermifugado: string;
  castrado: string;
  doencas: string;

  temperamento: string;
}


const Separator = () => (<View style={styles.separator} />);

function PetInfo({label, info}){

  return(
  <View style={styles.info_container}>
  <Text style={styles.info_label}> {label} </Text>
  <Text style={styles.info_text}> {info} </Text>
  </View>

  );
}



function Pet( {pet} : {pet: Animal} ){
  const router = useRouter();
  const [urls, setUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
 
  useEffect(() => {
    const fetchAllPhotos = async () => {
      try {
        const promises = pet.fotos.map(fotoPath => 
          getDownloadURL(ref(storage, fotoPath))
        );
        
        // Aguardamos todas as URLs serem resolvidas simultaneamente
        const resolvedUrls = await Promise.all(promises);
        setUrls(resolvedUrls);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPhotos(false);
      }
    };

    if (pet.fotos && pet.fotos.length > 0) {
      fetchAllPhotos();
    }
  }, [pet.fotos]);



  return(
  <View style={{flex:1}}>
  <ScrollView style = {styles.container}>

    <View style={styles.carouselContainer}>
      {loadingPhotos ? (
        <ActivityIndicator size="small" color="#f7a800" style={styles.pet_foto} />
      ) : (
        <FlatList
          data={urls}
          horizontal
          pagingEnabled // Faz a imagem "travar" centralizada ao deslizar
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
            />
          )}
        />
      )}
    </View>

    <View  style={styles.name_container}>
      <Text style={styles.name_text}>{pet.nome} </Text>
    </View>
    
    <View style={styles.info_row}>
    <PetInfo label="SEXO" info={pet.sexo}/>
    <PetInfo label="PORTE" info={pet.porte}/>
    <PetInfo label="IDADE" info={pet.idade}/>
    </View>
    
    <Separator/>
    
    <View style={styles.info_row}>
    <PetInfo label="LOCALIZAÇÃO" info={"ainda n pegamos"}/>
    </View>
  <Separator/>
    <View style={styles.info_row}>
    <PetInfo label="CASTRADO" info={pet.castrado}/>
    <PetInfo label="VERMIFUGADO" info={pet.vermifugado}/>

    </View>
      <Separator/>
    <View style={styles.info_row}>
    <PetInfo label="VACINADO" info={pet.vacinado}/>
    <PetInfo label="DOENCAS" info={pet.doencas}/>
    </View>
      <Separator/>
    <View style={styles.info_row}>
    
      <PetInfo label="TEMPERAMENTO" info={pet.temperamento}/>
    </View>
      <Separator/>
    <View style={styles.info_row}>
    <PetInfo label={`O ${pet.nome} PRECISA DE `} info="Alimento"/>

    </View>
      <Separator/>
    <View style={styles.info_row}>
    <PetInfo label="EXIGÊNCIAS DO DOADOR" info="auxílio financeiro com
alimentação"/>

    </View>
     <Separator/>
     <View>
     <PetInfo label={`MAIS SOBRE O ${pet.nome}`} info="Adora caminhadas e se dá muito bem com
crianças. Tem muito medo de raios e chuva."/>

    </View>

  </ScrollView>

  <View style={styles.buttons_container}>
  <TouchableOpacity style={styles.button}>
    <Text style={styles.button_text}> PRETENDO ADOTAR </Text>
  </TouchableOpacity>


  </View>

  </View>
  );


}


export default function MeuPet() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Animal>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    setLoading(true);
    const fetchPet = async () => {
    try{
      const petDoc = await getDoc(doc(db, "animais", id));
      if(petDoc.exists()){
        const data = petDoc.data()
        setPet({
          id: petDoc.id,
          nome: data.nome,
          porte: data.porte,
          idade: data.idade,
          sexo: data.sexo,
          fotos: data.fotos,
  
          vacinado: 'sim',
          vermifugado: 'sim',
          castrado: 'Não',
          doencas: 'nenhuma',

          temperamento: 'dócil',

        });
        setLoading(false);
      }
      
    }
    catch (e) {
      console.error(e);
      throw e;
    }
  }

  fetchPet();

  }, [id]);

  if (loading) {
    return(
      <View>
        <ActivityIndicator size="large"/>
      </View>
    ); 
  }
  return(
  <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
  <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: pet.nome,
      headerStyle: styles.drawer_header,
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft:12}}  onPress={() => router.replace('/adotar_pets')}>
          <Ionicons name="arrow-back-outline" size={24} color='#434343' />
        </TouchableOpacity>
        ),

      headerRight: () => (
        <TouchableOpacity  style={{ marginRight: 12 }} >          
        <Ionicons name="share-social-outline" size={24} color='#434343'  />
        </TouchableOpacity>
        ),

    }}
  />
  
  <Pet pet={pet}/> 

  </SafeAreaView >
  );
}



const styles = StyleSheet.create({
    carouselImage: {
    width: SCREEN_WIDTH, // IMPORTANTE: A imagem precisa saber qual a largura para aparecer
    height: 184,
    resizeMode: 'cover',
  },
  carouselContainer: {
    height: 184,
    width: '100%',
    backgroundColor: '#e6e7e8', // Cor de fundo para você ver se o espaço está lá
  },
  drawer_header:{
    backgroundColor: '#fee29b',
  },
  container:{
    flex: 1,
    backgroundColor: '#fafafa',
  },
  pet_foto:{
    width:'100%',
    height: 184,
  },
  info_container:{
   margin: 16,
   flexDirection: 'column',
   alignItems: 'flex-start',
  },
  info_row:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info_label:{
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#f7a800'

  },
  info_text:{
    textTransform: 'capitalize',
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575'

  },
  separator: {
    width: 350,
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 16, 
  },
  buttons_container:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  button:{
    height: 40,
    width: 148,
    backgroundColor: '#fdcf58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,

  },
  button_text:{
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343'

  },
  name_container:{
    margin: 16,
  },
  name_text:{
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#434343'
    },

})
