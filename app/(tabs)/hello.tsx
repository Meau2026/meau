import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, FlatList, ActivityIndicator,Alert, TouchableOpacity, } from 'react-native';
import {db} from '../../firebaseConfig.js';
import { collection , addDoc, getDocs } from 'firebase/firestore';

import { auth } from '@/firebaseConfig'; 
import { signOut } from 'firebase/auth';



interface Entry {
  id: string;
  name: string;
}

export default function FireBaseTest() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const writeTest = async () => {
    try {
      const docRef = await addDoc(collection(db, "test"), {
        name: "junin da capitinga",
        sapato: 48,
        sabor: "energetico"
      });

      console.log("document written with ID: ", docRef.id);
    } catch (e) {
      console.error("deu ruim paizao", e);
    }

  }

  const readTest = async () => {
    try {
      const query = await getDocs(collection(db,"test"));
      const list: Entry[] = [];

      query.forEach((doc) => {
        list.push({
        id: doc.id,
        name: doc.data().name,
        });  
      });

      setEntries(list);

    } catch(e){
      console.error("deu ruim", e)
    } finally {
      setLoading(false)
    }

    if(loading){
      return <ActivityIndicator size="large"/>;
    }

  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
 
    } catch (error: any) {
      Alert.alert("Erro ao sair", error.message);
    }
  };

  useEffect(() => {readTest();}, [] );
	return (
		<View>
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <View>
          <Text>{item.name}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>tem nada aqui nao meu mestre, aperta o botao.</Text>}
    />
		<Button title="envia pro firebase" onPress={writeTest}/>
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Logout Test</Text>
    </TouchableOpacity>
    </View>

	);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
},
logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
