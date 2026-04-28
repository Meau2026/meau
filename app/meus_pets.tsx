
import { Alert, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View, Image,FlatList , ScrollView} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { storage, db } from '@/firebaseConfig'; 
import { ref, getDownloadURL } from 'firebase/storage';
import { getDoc, doc } from 'firebase/firestore';
import { Drawer } from 'expo-router/drawer'; 


interface Animal {
  nome: string;
  fotos: string[];
  interessados: number;
}

interface PageState {
  byId: { [key: string] : Animal};
  ids: string[];
};

function AnimalEntry({animal} : {animal : Animal} ){
  
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    
    getDownloadURL(ref(storage, animal.fotos[0]))
      .then((url) => setUrl(url))
      .catch((e) => console.error(e));
  }, []); 

  return(
  <View style={styles.pet_frame}>
    <View style={styles.pet_header}>
      <Text style={styles.pet_nome}> 
        {animal.nome} 
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

function AnimalList( {user} ){
  
  const [pets, setPets] = useState<PageState>({ byId: {}, ids: []});

  useEffect( () => {
    

    const fetchAnimais = async () => {
      try{

        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef);
        
        if(userDoc.exists()){
          const userAnimals = userDoc.data().animais;

       
          let state : PageState = {byId:{}, ids: []};
          
          for (const animalUid of userAnimals){

            const animalRef = doc(db, "animais", animalUid);
            const animalDoc = await getDoc(animalRef);

            if (animalDoc.exists()){
              state.byId[animalDoc.id] = {
                nome: animalDoc.data().nome, 
                fotos: animalDoc.data().fotos, 
                interessados: 0};

              state.ids.push(animalDoc.id);
            }
            
          }
           setPets(state);

          }
         
        }
      catch(e){
        console.error(e)
      }

   

    }

    fetchAnimais()
    
    }, [user?.uid]);

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={styles.animal_list}>
    {
      pets.ids.map( (id) => (

        <AnimalEntry key={id} animal={pets.byId[id]}/>
      ))
    }
    </ScrollView>

  );



}


export default function MeusPets(){
  const { user } = useAuth();
  

  
 return (
   
    <SafeAreaView style={styles.container}>
    <Drawer.Screen
      options = {{
        headerTitle: "meus pets",
        headerStyle: styles.drawer_header
      }}
    />
    { user &&
      <AnimalList user={user} />
    }    
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
