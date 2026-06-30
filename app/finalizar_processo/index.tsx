import { Courgette_400Regular, useFonts } from '@expo-google-fonts/courgette';
import { Ionicons } from '@expo/vector-icons';
import React, {useEffect, useState } from 'react';

import {  StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';


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
    <TouchableOpacity style={styles.button} onPress={() => {router.push({pathname: '/finalizar_processo/processo_finalizado', params: {petName: selectedPet}});}}>
      <Text style={styles.button_text}>FINALIZAR PROCESSO</Text>
    </TouchableOpacity>

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
});
