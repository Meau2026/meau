import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity,View, Button, FlatList, ActivityIndicator } from 'react-native';
import {db} from '../../firebaseConfig.js';
import { collection , addDoc, getDocs } from 'firebase/firestore';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
interface Entry {
  id: string;
  name: string;
}

export default function FireBaseTest() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

	return (
		<SafeAreaView style={styles.container}  edges={['top', 'left', 'right']}>
    <StatusBar 
        style="dark"         
        backgroundColor="#87C9BF" 
        translucent={false}    
      />
			<View style={styles.header}>
				<Ionicons name="menu" size={32}/>
				<Text style={styles.header_text}>Login</Text>
			</View>

			
			
			<View style={styles.layout}>
      <View style={{height:40}}/>
				<TextInput
					style={styles.input}
					placeholder="Nome de usuario"
				/>
				<TextInput 
					style={styles.input}
					placeholder="Senha"
					secureTextEntry={true}
				/>
				<TouchableOpacity style={[styles.button, styles.button_entrar]}>
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
