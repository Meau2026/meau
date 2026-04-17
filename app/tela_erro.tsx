import { Courgette_400Regular, useFonts } from '@expo-google-fonts/courgette';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


interface Entry {
	id: string;
	name: string;
}

export default function OpsCadastroScreen() {
	let [fontsLoaded] = useFonts({
		Courgette_400Regular
	});
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState(true);

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<StatusBar
				style="dark"
				backgroundColor="#88C9BF"
				translucent={false}
			/>
			<View style={styles.header}>
				<TouchableOpacity>
					<Ionicons name="arrow-back" size={24} color="#575757" />
				</TouchableOpacity>
				<Text style={styles.header_text}>Cadastro</Text>
			</View>

			<View style={styles.content}>
				<Text style={styles.opsText}>Ops!</Text>

				<Text style={styles.messageText}>
					Você não pode realizar esta ação sem possuir um cadastro.
				</Text>

				<TouchableOpacity style={[styles.button]}>
					<Text style={styles.buttonText}>FAZER CADASTRO</Text>
				</TouchableOpacity>

				<Text style={styles.questionText}>
					Já possui cadastro?
				</Text>

				<TouchableOpacity style={[styles.button]}>
					<Text style={styles.buttonText}>FAZER LOGIN</Text>
				</TouchableOpacity>

			</View>


		</SafeAreaView>

	);

}

const styles = StyleSheet.create({

	container: {
		flex: 1,
		backgroundColor: '#fff',
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
		fontSize: 24,
		fontWeight: 'bold',
		color: '#575757',
	},
	content: {

		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
	},

	opsText: {
		fontFamily: 'Courgette_400Regular',
		fontSize: 53,
		color: '#88C9BF',
		marginBottom: 40,
	},

	messageText: {
		fontSize: 14,
		color: '#757575',
		textAlign: 'center',
		marginBottom: 30, // Espaço para o botão
		lineHeight: 18,
	},

	questionText: {
		fontSize: 14,
		color: '#757575',
		textAlign: 'center',
		marginTop: 40, // Espaço após o primeiro botão
		marginBottom: 10, // Espaço para o segundo botão
	},

	button: {
		height: 48,
		width: 232,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		backgroundColor: '#88C9BF', // Cor principal do botão
	},

	buttonText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#434343', // Cor do texto do botão principal
		letterSpacing: 1, // Espaçamento entre letras (all caps)
	},
});
