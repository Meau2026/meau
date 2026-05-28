import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


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
  localizacao: { latitude: number; longitude: number }; 
  distanciaKm: number;   
}

interface PageState {
  byId: { [key: string]: Animal };
  ids: string[];
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

function AnimalEntry({ animal }: { animal: Animal }) {
  const [url, setUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getDownloadURL(ref(storage, animal.fotos[0]))
      .then((url) => setUrl(url))
      .catch((e) => console.error(e));
  }, [animal]);

  const textoDistancia = animal.distanciaKm !== 99999 
    ? `A ${animal.distanciaKm.toFixed(1)} km de distância` 
    : 'Localização não informada';

  return (
    <View style={styles.pet_frame}>
      <View style={styles.pet_header}>
        <Text style={styles.pet_nome}>
          {animal.nome}
        </Text>
        <Ionicons name="heart-outline" size={24} color='#434343' />
      </View>

      <TouchableOpacity onPress={()=>{
        router.push({ pathname:`/adotar_pets/${animal.id}`, params: {petData: JSON.stringify(animal)} });
      }}>
        <Image
          source={{ uri: url }}
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
          <Text style={[styles.pet_info_text, { color: '#88c9bf', fontWeight: 'bold' }]}> 
            {textoDistancia} 
          </Text>
        </View>
      </View>
    </View>
  );
}

function AnimalList() {
  const { user } = useAuth();
  const [pets, setPets] = useState<PageState>({ byId: {}, ids: [] });
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lon: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error("Erro ao obter localização do usuário:", error);
      }
    })();
  }, []);

    if (!user?.uid) return;

    const animaisRef = collection(db, "animais");
    
    const q = query(animaisRef, where("visivel", "==", true));


    const unsubscribe = onSnapshot(q, (snapshot) => {
      let state: PageState = { byId: {}, ids: [] };

      snapshot.forEach((animalDoc) => {
        const data = animalDoc.data();
        
        if (data.usuarioId !== user.uid) {
          const pet = {
            id: animalDoc.id,
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
            temperamento: 'dócil'
          };

        state.byId[animalDoc.id] = pet;
        state.ids.push(animalDoc.id);
        }
      });

      setPets(state);
    });



    return () => unsubscribe();

  }, [user?.uid]);

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
