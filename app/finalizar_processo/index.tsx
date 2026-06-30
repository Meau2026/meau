import { Courgette_400Regular, useFonts } from '@expo-google-fonts/courgette';
import { Ionicons } from '@expo/vector-icons';
import React, {useEffect, useState } from 'react';

import {  StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Alert } from 'react-native';


import { Drawer } from 'expo-router/drawer';
import { useNavigation,  useLocalSearchParams, useRouter  } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { storage, db } from '@/firebaseConfig'; 
import { getDoc, doc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';


interface PetListState{
  byId: { [key: string] : string};
  ids: string[];

}

export default function FinalizarProcesso() {

  const { user, loading } = useAuth();
  const router = useRouter(); 

  const [petList, setPetList] = useState<PetListState>({byId: {}, ids: []});
  const [selectedPet, setSelectedPet] = useState<string>("");


  const [modalVisible, setModalVisible] = useState(false);

  //carrega lista de pets
  useEffect ( () => {
    if(!user) { return;}

    const fetchPets = async () => {
      try{

        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef);
        
        if(userDoc.exists()){
          const userAnimals = userDoc.data().animais;

       
          let state : PetListState = {byId: {}, ids :[] };
          for (const animalUid of userAnimals){

            const petRef = doc(db, "animais", animalUid);
            const petDoc = await getDoc(petRef);

            if (petDoc.exists()){
              const data = petDoc.data();
              state.byId[petDoc.id] = data.nome;
              state.ids.push(petDoc.id)
            }

            
          }
           setPetList(state);

          }
         
        }
      catch(e){
        console.error(e)
      }

    }


  fetchPets()

  }, [user?.uid]);

  return (
        <SafeAreaView style={styles.layout}>
         <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: '  Finalizar processo',
      headerStyle: styles.drawer_header,
    }} />

        <View style={styles.container}>
          <ScrollView style={styles.list}>
          <Text style={styles.title_text}> SELECIONE O ANIMAL</Text>
          {
            petList.ids.map( (id) => (
            <TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedPet(petList.byId[id])}>
						<View style={[styles.radioCircle, selectedPet === petList.byId[id] && styles.radioSelected]}>
							{selectedPet === petList.byId[id] && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>{petList.byId[id]}</Text>
					</TouchableOpacity>

            ) )
          }
        </ScrollView>


               
        <ScrollView style={styles.list}>
          <Text style={styles.title_text}> SELECIONE O USUÁRIO</Text>
        </ScrollView>
    </View>
    <TouchableOpacity style={styles.button} onPress={() => {
      if (!selectedPet) {
            Alert.alert("Atenção", "Por favor, selecione um animal antes de prosseguir.");
            return;
          }
          setModalVisible(true);
     }
    }>
      <Text style={styles.button_text}>FINALIZAR PROCESSO</Text>
    </TouchableOpacity>

  
<Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Para o botão de voltar do Android
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitle}>LEIA ATENTAMENTE ANTES DE PROSSEGUIR</Text>
            
            <Text style={styles.modalBodyText}>
              Antes de realizar este passo, certifique-se de que o adotante  tenha cumprido todos os requisitos prévios à adoção. Além disso, esteja certo de que ele já está em posse do animal em questão.
            </Text>
            
            <Text style={styles.modalBodyText}>
              Após finalizar este processo, o seu animal será automaticamente removido da lista de pets para adoção.
            </Text>
            
            <Text style={styles.modalBodyText}>
              Além disso, é importante ressaltar que as suas informações de cadastro serão disponibilizadas para o usuário que está adotando o seu animal, assim como você também terá acesso a todas as informações fornecidas por ele(a).
            </Text>
            
            <Text style={styles.modalBoldText}>
              Ao clicar em “Li e concordo”, você declara ter lido, compreendido e concordado com os termos acima expostos.
            </Text>

            <TouchableOpacity style={styles.modalButtonConfirm} onPress={() => router.push({pathname: '/finalizar_processo/processo_finalizado', params: {petName: selectedPet}})}>
              <Text style={styles.modalButtonConfirmText}>LI E CONCORDO</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonCancelText}>CANCELAR</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
    );
}


const styles = StyleSheet.create({
drawer_header:{
    backgroundColor: '#cfe9e5',
    
  },

    layout: {
        flex: 1,
        backgroundColor: '#fafafa',
    },

   container: {
      flex: 1,
    backgroundColor: '#fafafa',
   
    

   },


    title_text: {
        fontFamily: 'Roboto-Regular',
        color: '#589b9b',
        fontSize: 12,
    },

    text: {
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        color: '#757575',
    },
    

    button_text: {
 fontFamily: 'Roboto-Regular',

        fontSize: 12,
        color: '#434343',
    },


    button:{
    height: 48,
    width: 232,
    backgroundColor: '#fdcf58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 24,
    alignSelf: 'center',
    },
  list: {
    paddingTop:12,
    paddingBottom:12,
    paddingLeft: 24,

  },

  radioContainer: {
		flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8
	},
	radioCircle: {
		width: 20, 
    height: 20,
    borderRadius: 10, 
    borderWidth: 2,
    borderColor: '#757575',
		justifyContent: 'center', 
    alignItems: 'center'
	},
	radioSelected: {
		borderColor: '#757575'
	},
	radioInner: {
		width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#757575'
	},
	radioText: { 
    color: '#434343', 
    fontSize: 14 
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    alignItems: 'center',
    paddingTop: 88, 
  },
  modalContent: {
    width: 320, 
    backgroundColor: '#f7f7f7',
    padding: 24,
    borderRadius: 2,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#589b9b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBodyText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'justify',
  },
  modalBoldText: {
        fontFamily: 'Roboto-Medium', 
    fontWeight: 'bold',
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'justify',
  },
  modalButtonConfirm: {
    width: '100%',
    height: 40,
    backgroundColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 12, 
  },
  modalButtonConfirmText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
  modalButtonCancel: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  modalButtonCancelText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
});
