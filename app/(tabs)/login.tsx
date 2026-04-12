import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity,View, Alert} from 'react-native';

import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


import { auth } from '../../firebaseConfig'

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'





export default function FireBaseTest() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const singIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      Alert.alert(`login com UID: ${userCredential.user.uid}`)
    } catch (e) {
      console.log(e)
      Alert.alert(`deu ruim: ${e.message}`)
    }

  }

  const signUp = async () => {
    
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password)
    } catch (e) {
      console.log(e)
    }
  }

  

	return (
		<SafeAreaView style={styles.container}  edges={['top', 'left', 'right']}>
    <StatusBar 
        style="dark"         
        backgroundColor="#87C9BF" 
        translucent={false}    
      />
			<View style={styles.header}>

				<TouchableOpacity>
				  <Ionicons name="menu" size={32}/>
				</TouchableOpacity>

				<Text style={styles.header_text}>Login</Text>
			</View>

			
			
			<View style={styles.layout}>
      <View style={{height:40}}/>
				<TextInput
					style={styles.input}
					placeholder="Email"
          value={email}
          onChangeText={(email) => setEmail(email)}

				/>
				<TextInput 
					style={styles.input}
					placeholder="Senha"
					secureTextEntry={true}
          value={password}
          onChangeText={(password) => setPassword(password)}
				/>

				<TouchableOpacity style={[styles.button, styles.button_entrar]}
          onPress={singIn}
        >
					<Text>ENTRAR</Text>
				</TouchableOpacity>
				
							
				<TouchableOpacity style={[styles.button, styles.button_facebook]}>
				<FontAwesome name="facebook-square" size={24} color="white" />
					<Text style={{color: '#FFFFFF'}}>ENTRAR COM FACEBOOK</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.button_google]}>
					<FontAwesome name="google" size={24} color="white" />
					<Text style={{color: '#FFFFFF'}}>ENTRAR COM GOOGLE</Text>
				</TouchableOpacity>
			</View>
    </SafeAreaView>

	);

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
   	backgroundColor: '#87C9BF',
  },
	header: {
	flexDirection: 'row',
	height: 75,
	width: '100%',
  alignItems: 'center',
  justifyContent: 'flex-start',
	backgroundColor: '#CFE9E5',
	padding: 15,
	gap: 30,
	},

	header_text: {
		fontSize:24,
		fontWeight:'bold',

	},
	layout: {
    
    flex: 1,
		//justifyContent: 'center',
		alignItems: 'center',
		gap: 5, 
    backgroundColor: '#fff',
	},

	input:{
		height: 45,
		width: '75%',
		fontSize: 18,
    borderWidth: 1,
    borderRadius: 3,
  borderColor: '#e0e0e0',
    
	},
	button:{
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
		alignItems: 'center',
		height:60,
		width: '60%',
		padding:15,
		borderRadius: 3,
		shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
	},
	button_entrar: {
    backgroundColor: '#87C9BF',
		marginBottom: 70,
		marginTop: 50,
  },
  button_facebook: {
    backgroundColor: '#1976D2',
  },
  button_google: {
    backgroundColor: '#E57373', 
  },

});
