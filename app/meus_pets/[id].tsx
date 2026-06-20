import {  StyleSheet, Text, TouchableOpacity, View, Image, FlatList , ScrollView, ActivityIndicator} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { storage, db } from '@/firebaseConfig'; 
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDoc, doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { Drawer } from 'expo-router/drawer'; 

import { useLocalSearchParams, useRouter } from 'expo-router';

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


const Separator = () => (<View style={styles.separator} />);

function PetInfo({label, info}){

  return(
  <View style={styles.info_container}>
  <Text style={styles.info_label}> {label} </Text>
  <Text style={styles.info_text}> {info} </Text>
  </View>

  );
}

const RemoverPet = async (pet: Animal) => {
  const {user, loading} = useAuth();
  try{
    const deletePromisses = pet.fotos.map((url) => {
      const refFoto = ref(storage, url);
      return deleteObject(refFoto);
    });

    await Promise.all(deletePromisses);

    const petDocRef = doc(db, "animais", pet.id);
    
    await deleteDoc(petDocRef);

    const userDocRef = doc(db, "users", user.uid);
    
    await updateDoc(userDocRef, {
      animais: arrayRemove(pet.id)
    });


  }
  catch(e){
    console.error(e)
  }

}

function Pet( {pet} : {pet: Animal} ){
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    setUrl(null); 
    getDownloadURL(ref(storage, pet.fotos[0]))
      .then((url) => setUrl(url))
      .catch((e) => console.error(e));
  }, [pet]); 


  return(
  <View style={{flex:1}}>
  <ScrollView style = {styles.container}>
     <Image
      source={{ uri: url }}
      style={styles.pet_foto}
    />

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
    <Text style={styles.button_text}> VER INTERESSADOS </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.button} onPress={async () => {
    RemoverPet(pet)
    router.replace('meus_pets/remover_pet');
  }}>
    <Text style={styles.button_text}> REMOVER PET </Text>
  </TouchableOpacity>
  </View>

  </View>
  );


}


export default function MeuPet() {
  const { petData } = useLocalSearchParams();
  const [pet, setPet] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
  if (!petData || typeof petData !== 'string') {
      return; 
    }
    try { 
      setPet(JSON.parse(petData as string));
      setLoading(false);
    } catch(e){
      console.error(e)
    }
  
  },[petData]);

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
        <TouchableOpacity style={{marginLeft:12}}  onPress={() => router.replace('/meus_pets')}>
          <Ionicons name="arrow-back-outline" size={24} color='#434343' />
        </TouchableOpacity>
        ),

      headerRight: () => (
        <View style={{flexDirection:'row'}}>
        
        <TouchableOpacity  style={{ marginRight: 12 }} onPress={async () => {
          const new_visivel = !pet.visivel;
          
          const petRef = doc(db, "animais", pet.id);
          await updateDoc(petRef, { visivel: new_visivel});

          setPet({...pet, visivel: new_visivel});
        }}> 
        { pet.visivel &&
          <Ionicons name="eye-off-outline" size={24} color='#434343'  />
        }

        { !pet.visivel &&

          <Ionicons name="eye-outline" size={24} color='#434343'  />
        }
        </TouchableOpacity>
          <TouchableOpacity  style={{ marginRight: 12 }} >          
            <Ionicons name="share-social-outline" size={24} color='#434343'  />
          </TouchableOpacity>
        </View>
        ),

    }}
  />
  
  <Pet pet={pet}/> 

  </SafeAreaView >
  );
}



const styles = StyleSheet.create({
  drawer_header:{
    backgroundColor: '#cfe9e5',
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
    color: '#589b9b'

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
    backgroundColor: '#88c9bf',
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
