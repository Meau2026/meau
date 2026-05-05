
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';


interface Animal {
  id: string;
  nome: string;
  porte: string;
  idade: string;
  sexo: string;
  fotos: string[];
}




interface PageState {
  byId: { [key: string]: Animal };
  ids: string[];
};

function AnimalEntry({ animal }: { animal: Animal }) {

  const [url, setUrl] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {

    getDownloadURL(ref(storage, animal.fotos[0]))
      .then((url) => setUrl(url))
      .catch((e) => console.error(e));
  }, []);

  return (

    <View style={styles.pet_frame}>
      <View style={styles.pet_header}>
        <Text style={styles.pet_nome}>
          {animal.nome}
        </Text>

        <Ionicons name="heart-outline" size={24} color='#434343' />

      </View>
      <TouchableOpacity onPress={()=>{
      router.push(`/adotar_pets/${animal.id}`);

    }}>

        <Image
          source={{ uri: url }} s
          style={styles.pet_foto}
        />

      </TouchableOpacity>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.pet_info_text}> {animal.sexo} </Text>
          <Text style={styles.pet_info_text}>{animal.idade} </Text>
          <Text style={styles.pet_info_text}>{animal.porte} </Text>
        </View>
        <View>
          <Text style={styles.pet_info_text}> LOCAL PLACEHOLDER </Text>
        </View>
      </View>
    </View>

  );
}

function AnimalList() {
  const { user } = useAuth();

  const [pets, setPets] = useState<PageState>({ byId: {}, ids: [] });

  useEffect(() => {


    const fetchAnimais = async () => {
      try {

        const animais = await getDocs(collection(db, "animais"));

        let state: PageState = { byId: {}, ids: [] };

        animais.forEach((animalDoc) => {
          if (animalDoc.data().usuarioId !== user?.uid) {
            state.byId[animalDoc.id] = {
              id: animalDoc.id,
              nome: animalDoc.data().nome,
              porte: animalDoc.data().porte,
              idade: animalDoc.data().idade,
              sexo: animalDoc.data().sexo,
              fotos: animalDoc.data().fotos,
            };

            state.ids.push(animalDoc.id);

          }

        })

        setPets(state);

      } catch (e) {
        console.error(e)
      }



    }

    fetchAnimais()

  }, []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.animal_list}>
      {
        pets.ids.map((id) => (

          <AnimalEntry key={id} animal={pets.byId[id]} />
        ))
      }
    </ScrollView>

  );



}


export default function Adotar() {



  return (

    <SafeAreaView style={styles.container}>
      <Drawer.Screen
        options={{
          headerTintColor: '#434343',
          headerTitle: "adotar",
          headerTitleStyle: {
            color: '#434343'
          },
          headerStyle: styles.drawer_header,
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="search-outline" size={24} color='#434343' />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar
        style="dark"
        backgroundColor="#fee29b"
        translucent={false}
      />


      <AnimalList />

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
    backgroundColor: '#ffd358',
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
    backgroundColor: '#fee29b',
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
  pet_info_text: {
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343'
  },


})
