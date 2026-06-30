import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { arrayRemove, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';

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

  visivel: boolean;
  interessados: string[];
}


const Separator = () => (<View style={styles.separator} />);

function PetInfo({label, info}: { label: string; info: string }){

  return(
  <View style={styles.info_container}>
  <Text style={styles.info_label}> {label} </Text>
  <Text style={styles.info_text}> {info} </Text>
  </View>

  );
}

function Pet( {pet} : {pet: Animal} ){
  const router = useRouter();
  const { user } = useAuth();
  const [urls, setUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  
  useEffect(() => {
    const fetchAllPhotos = async () => {
      setLoadingPhotos(true);
      try {
        const promises = pet.fotos.map(fotoPath => 
          getDownloadURL(ref(storage, fotoPath))
        );
        const resolvedUrls = await Promise.all(promises);
        setUrls(resolvedUrls);
      } catch (e) {
        console.error("Erro ao buscar fotos:", e);
      } finally {
        setLoadingPhotos(false);
      }
    };

    if (pet.fotos && pet.fotos.length > 0) {
      fetchAllPhotos();
    } else {
      setLoadingPhotos(false);
    }
  }, [pet.fotos]);

  const handleRemoverPet = async () => {
    try {
      // Deleta as fotos do storage
      const deletePromises = pet.fotos.map((url) => {
        const fotoRef = ref(storage, url);
        return deleteObject(fotoRef);
      });
      await Promise.all(deletePromises);

      // Deleta o documento do animal
      await deleteDoc(doc(db, "animais", pet.id));

      // Remove a referência do animal do documento do usuário
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          animais: arrayRemove(pet.id)
        });
      }

      router.replace({ pathname: '/meus_pets/remover_pet', params: { petName: pet.nome } });

    } catch (e) {
      console.error("Erro ao remover pet:", e);
    }
  };


  return(
  <View style={{flex:1}}>
  <ScrollView style = {styles.container}>
    <View style={styles.carouselContainer}>
      {loadingPhotos ? (
        <ActivityIndicator size="small" color="#88c9bf" style={styles.pet_foto} />
      ) : (
        <FlatList
          data={urls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.carouselImage} />
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
      <PetInfo label="CASTRADO" info={pet.saude?.includes('Castrado') ? 'Sim' : 'Não'}/>
      <PetInfo label="VERMIFUGADO" info={pet.saude?.includes('Vermifugado') ? 'Sim' : 'Não'}/>
    </View>
    <Separator/>
    <View style={styles.info_row}>
      <PetInfo label="VACINADO" info={pet.saude?.includes('Vacinado') ? 'Sim' : 'Não'}/>
      <PetInfo label="DOENÇAS" info={pet.saude?.includes('Doente') ? (pet.doencas || 'Não especificado') : 'Nenhuma'}/>
    </View>
    <Separator/>
    <View style={styles.info_row}>
      <PetInfo label="TEMPERAMENTO" info={pet.temperamento?.join(', ') || 'Não informado'}/>
    </View>
    <Separator/>
    <View style={styles.info_row}>
      <PetInfo label="EXIGÊNCIAS DO DOADOR" info={pet.requisitosAdocao?.join(', ') || 'Nenhuma'}/>
    </View>
    <Separator/>
    <View>
      <PetInfo label={`MAIS SOBRE O ${pet.nome}`} info={pet.historia || 'Nenhuma informação adicional'}/>
    </View>

  </ScrollView>

  <View style={styles.buttons_container}>
    <TouchableOpacity style={styles.button_secondary}>
      <Text style={styles.button_text}> VER INTERESSADOS </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button_secondary} onPress={() => router.push({ pathname: '/atualizar_animal/[id]', params: { id: pet.id } })}>
      <Text style={styles.button_text}> EDITAR PET </Text>
    </TouchableOpacity>
  </View>
  <View style={styles.remove_button_container}>
    <TouchableOpacity style={styles.button_remove} onPress={handleRemoverPet}>
      <Text style={styles.button_text_remove}> REMOVER PET </Text>
    </TouchableOpacity>
  </View>

  </View>
  );


}


export default function MeuPet() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setLoading(false);
      return;
    }

    const fetchPet = async () => {
      try {
        const petDocRef = doc(db, "animais", id);
        const petDoc = await getDoc(petDocRef);

        if (petDoc.exists()) {
          const data = petDoc.data();
          setPet({ id: petDoc.id, ...data } as Animal);
        } else {
          console.log("Nenhum pet encontrado com este ID!");
        }
      } catch (e) {
        console.error("Erro ao buscar dados do pet:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();

  }, [id]);

  // Guard against loading or null pet
  if (loading || !pet) {
    return (
      <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
        <ActivityIndicator size="large" color="#434343" />
      </SafeAreaView>
    );
  }

  return(
  <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
  <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: pet?.nome ?? '',
      headerStyle: styles.drawer_header,
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft:12}}  onPress={() => router.replace('/meus_pets')}>
          <Ionicons name="arrow-back-outline" size={24} color='#434343' />
        </TouchableOpacity>
        ),

      headerRight: () => {
          if (!pet) return null;
          return (
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
          );
        },

    }}
  />
  
  { pet && <Pet pet={pet} />} 

  </SafeAreaView >
  );
}



const styles = StyleSheet.create({
  carouselImage: {
    width: 393, // Assumindo largura da tela, ajuste se necessário
    height: 184,
    resizeMode: 'cover',
  },
  carouselContainer: {
    height: 184,
    width: '100%',
    backgroundColor: '#e6e7e8',
  },
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  remove_button_container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button_secondary:{
    height: 40,
    flex: 1,
    backgroundColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  button_remove: {
    height: 40,
    width: '100%',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#88c9bf',
  },
  button_text:{
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343'
  },
  button_text_remove: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#88c9bf'
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
