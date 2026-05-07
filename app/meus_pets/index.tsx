
import { Alert, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View, Image,FlatList , ScrollView} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { storage, db } from '@/firebaseConfig'; 
import { ref, getDownloadURL } from 'firebase/storage';
import { getDoc, doc } from 'firebase/firestore';
import { Drawer } from 'expo-router/drawer'; 
import { useRouter } from 'expo-router';

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
  visivel: boolean;
  interessados: string[];
  temperamento: string;
}

interface PageState {
  byId: { [key: string] : Animal};
  ids: string[];
};

function AnimalEntry({animal} : {animal : Animal} ){
  const router = useRouter();
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
    <TouchableOpacity onPress={()=>{
      router.push({ pathname: `/meus_pets/${animal.id}`, params: {petData: JSON.stringify(animal)} });
    }}>
    <Image
      source={{ uri: url }}
      style={styles.pet_foto}
    />

  </TouchableOpacity>
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

            const petRef = doc(db, "animais", animalUid);
            const petDoc = await getDoc(petRef);

            if (petDoc.exists()){
              const data = petDoc.data();
              state.byId[petDoc.id] = {
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
          interessados: data.interessados,
          visivel: data.visivel,
          temperamento: 'dócil'};

              state.ids.push(petDoc.id);
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
        headerStyle: styles.drawer_header,
       headerRight: () => (
        <TouchableOpacity style={{marginRight:12}}>
          <Ionicons name="search-outline" size={24} color='#434343' />
        </TouchableOpacity>
        ),

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
