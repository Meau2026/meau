import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo e Roteamento
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

// Firebase Config e Funções
import { db, storage } from '@/firebaseConfig';
import { addDoc, arrayUnion, collection, doc, GeoPoint, getDoc, getDocs, serverTimestamp, setDoc, query, where, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';


import { useAuth } from '@/contexts/AuthContext';

import { enviarNotificacaoPush } from '@/utils/enviarNotificacao';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Animal {
  id: string;
  nome: string;
  porte: string;
  idade: string;
  sexo: string;
  fotos: string[];

  saude: string[];
  doencas: string;
  temperamento: string[];
  requisitosAdocao: string[];
  mesesAdocao: string[];
  historia: string;

  usuarioId: string;
  localizacao?: GeoPoint | null;
}


const Separator = () => (<View style={styles.separator} />);

function PetInfo({ label, info }: { label: string; info: string }) {

  return(
  <View style={styles.info_container}>
  <Text style={styles.info_label}> {label} </Text>
  <Text style={styles.info_text}> {info} </Text>
  </View>

  );
}



function Pet({ 
  pet, 
  onPressAdotar, 
  userLocation 
}: { 
  pet: Animal; 
  onPressAdotar: () => Promise<void>; 
  userLocation: { latitude: number; longitude: number } | null 
}) {
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
      <View style={styles.mapSection}>
        <Text style={styles.info_label}>LOCALIZAÇÃO DO ANIMAL (REGIÃO)</Text>
        {pet.localizacao ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.miniMap}
            initialRegion={{
              latitude: pet.localizacao.latitude,
              longitude: pet.localizacao.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            <Circle
              center={{ latitude: pet.localizacao.latitude, longitude: pet.localizacao.longitude }}
              radius={1000} // Raio de 400 metros para representar a região
              fillColor="rgba(254, 211, 88, 0.3)"
              strokeColor="#F7A800"
            />
            {userLocation && (
              <Marker coordinate={userLocation} title="Você está aqui" pinColor="blue" />
            )}
          </MapView>
        ) : (
          <Text style={styles.info_text}>Localização não informada</Text>
        )}
      </View>
    </View>
  <Separator/>
    <View style={styles.info_row}>
      <PetInfo label="CASTRADO" info={pet.saude?.includes('Castrado') ? 'Sim' : 'Não'}/>
      <PetInfo label="VERMIFUGADO" info={pet.saude?.includes('Vermifugado') ? 'Sim' : 'Não'}/>
    </View>
    <Separator/>
    <View style={styles.info_row}>
      <PetInfo label="VACINADO" info={pet.saude?.includes('Vacinado') ? 'Sim' : 'Não'}/>
      <PetInfo label="DOENCAS" info={pet.saude?.includes('Doente') ? (pet.doencas || 'Não especificado') : 'Nenhuma'}/>
    </View>
    <Separator/>
    <View style={styles.info_row}>
      <PetInfo 
        label="TEMPERAMENTO" 
        info={pet.temperamento && pet.temperamento.length > 0 ? pet.temperamento.join(', ') : 'Não informado'}
      />
    </View>
    <Separator/>
    <View style={styles.info_row}>
      <PetInfo 
        label="EXIGÊNCIAS DO DOADOR" 
        info={
          pet.requisitosAdocao && pet.requisitosAdocao.length > 0 
            ? pet.requisitosAdocao.map(req => {
                if (req === 'Acompanhamento pós adoção' && pet.mesesAdocao && pet.mesesAdocao.length > 0) {
                  return `${req} (por ${pet.mesesAdocao.join(', ')})`;
                }
                return req;
              }).join(', ')
            : 'Nenhuma'
        }
      />
    </View>
    <Separator/>
    <View>
      <PetInfo 
        label={`MAIS SOBRE O ${pet.nome}`} 
        info={pet.historia || 'Nenhuma informação adicional'}
      />
    </View>

  </ScrollView>

  <View style={styles.buttons_container}>
  <TouchableOpacity style={styles.button} onPress={onPressAdotar}>
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
  const { user } = useAuth() as any;
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

const handleCriarInteresse = async () => {
  if (!pet) {
    console.warn('Pet não carregado ainda.');
    return;
  }

  if (!user) {
    Alert.alert(
      'Atenção',
      'Você precisa fazer login para demonstrar interesse na adoção.',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    
    
    //if (pet.interesses_negados && pet.interesses_negados.includes(user.uid)) {
    //  Alert.alert('Aviso', 'Infelizmente, o dono optou por não prosseguir com a sua solicitação para este pet.');
    //  return;
    //}

      
    const interessesRef = collection(db, 'interesses');
    const q = query(
      interessesRef,
      where('animalId', '==', pet.id),
      where('interessadoId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      Alert.alert('Aviso', 'Você já demonstrou interesse neste pet! Aguarde o retorno do dono.');
     // return;
    }

    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    let nomeInteressado = 'Usuário';
    let fotoInteressado = 'https://placehold.co/150.png';

    if (userDoc.exists()) {
      nomeInteressado = userDoc.data().nome || nomeInteressado;
      fotoInteressado = userDoc.data().fotoUrl || fotoInteressado;
    }

    
    const interesseRef = await addDoc(collection(db, 'interesses'), {
      donoId: pet.usuarioId,
      interessadoId: user.uid,
      animalId: pet.id,
      nomeInteressado: nomeInteressado,
      fotoInteressado: fotoInteressado,
      nomeAnimal: pet.nome,
      createdAt: serverTimestamp(),
    });

    console.log('Interesse registrado com ID:', interesseRef.id);
    
    const petRef = doc(db, 'animais', pet.id);
    await updateDoc(petRef, {
      interessados: arrayUnion(user.uid)
    });

    Alert.alert('Sucesso!', 'Seu interesse foi enviado ao dono do pet.');


    //envia notificacao

    const donoDoc = await getDoc(doc(db, 'users', pet.usuarioId));
    
    if (donoDoc.exists()) {
      const donoData = donoDoc.data(); 
      if (donoData.expoPushToken) {
        await enviarNotificacaoPush(
          donoData.expoPushToken, 
          "Querem adotar seu pet!", 
          `${nomeInteressado} tem interesse em adotar o(a) ${pet.nome}!`, 
          { interesseId: interesseRef.id, petId: pet.id, interessadoId: user.uid },
          'REQUEST_ADOCAO'
        );
      }
    }

  } catch (e) {
    console.error('Erro ao registrar interesse:', e);
  }
};


  useEffect(() => {
    setLoading(true);
    const fetchPet = async () => {
    try{
      const petDoc = await getDoc(doc(db, "animais", id as string));
      if(petDoc.exists()){
        const data = petDoc.data()
        setPet({
          id: petDoc.id,
          nome: data.nome,
          porte: data.porte,
          idade: data.idade,
          sexo: data.sexo,
          fotos: data.fotos,
  
          saude: data.saude || [],
          doencas: data.doencas || '',
          temperamento: data.temperamento || [],
          requisitosAdocao: data.requisitosAdocao || [],
          mesesAdocao: data.mesesAdocao || [],
          historia: data.historia || '',

          usuarioId: data.usuarioId,
          localizacao: data.localizacao,
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

  if (loading || !pet) {
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
  
  <Pet pet={pet} onPressAdotar={handleCriarInteresse} userLocation={userLocation} /> 

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
  mapSection: {
    margin: 16,
    width: '90%',
  },
  miniMap: {
    width: '100%',
    height: 150,
    marginTop: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
})
