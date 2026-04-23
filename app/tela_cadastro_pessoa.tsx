import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CadastroPessoal() {
	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<StatusBar style="dark" backgroundColor="#88C9BF" translucent={false} />

			<View style={styles.header}>
				<TouchableOpacity><Ionicons name="menu" size={24} color="#575757" /></TouchableOpacity>
				<Text style={styles.headerText}>Cadastro Pessoal</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.infoBanner}>
					<Text style={styles.infoText}>
						As informações preenchidas serão divulgadas apenas para a pessoa com a qual você realizar o processo de adoção...
					</Text>
				</View>

				<Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
				<TextInput style={styles.input} placeholder="Nome completo" />
				<TextInput style={styles.input} placeholder="Idade" keyboardType="numeric" />
				<TextInput style={styles.input} placeholder="E-mail" keyboardType="email-address" />
				<TextInput style={styles.input} placeholder="Estado" />
				<TextInput style={styles.input} placeholder="Cidade" />
				<TextInput style={styles.input} placeholder="Endereço" />
				<TextInput style={styles.input} placeholder="Telefone" keyboardType="phone-pad" />

				<Text style={styles.sectionTitle}>INFORMAÇÕES DE PERFIL</Text>
				<TextInput style={styles.input} placeholder="Nome de usuário" />
				<TextInput style={styles.input} placeholder="Senha" secureTextEntry={true} />
				<TextInput style={styles.input} placeholder="Confirmação de senha" secureTextEntry={true} />

				<Text style={styles.sectionTitle}>FOTO DE PERFIL</Text>
				<TouchableOpacity style={styles.photoContainer}>
					<Ionicons name="add-circle-outline" size={24} color="#757575" />
					<Text style={styles.photoText}>adicionar foto</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.button}>
					<Text style={styles.buttonText}>FAZER CADASTRO</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#FAFAFA' },
	header: {
		flexDirection: 'row', height: 56, alignItems: 'center',
		backgroundColor: '#CFE9E5', paddingHorizontal: 16, gap: 16
	},
	headerText: { fontSize: 20, color: '#575757', fontFamily: 'Courgette_400Regular' },
	scrollContent: { padding: 16, alignItems: 'center' },
	infoBanner: {
		backgroundColor: '#CFE9E5', padding: 8, borderRadius: 3, marginBottom: 28
	},
	infoText: { color: '#434343', textAlign: 'center', fontSize: 14 },
	sectionTitle: {
		alignSelf: 'flex-start', color: '#88C9BF', fontSize: 14,
		marginTop: 20, marginBottom: 16
	},
	input: {
		width: '100%', borderBottomWidth: 0.8, borderBottomColor: '#E6E7E8',
		height: 40, marginBottom: 20, fontSize: 14
	},
	photoContainer: {
		width: 128, height: 128, backgroundColor: '#E6E7E7',
		justifyContent: 'center', alignItems: 'center', marginBottom: 32,
		elevation: 2
	},
	photoText: { color: '#757575', fontSize: 14 },
	button: {
		backgroundColor: '#88C9BF', width: 232, height: 48,
		justifyContent: 'center', alignItems: 'center', borderRadius: 2,
		marginBottom: 24, elevation: 2
	},
	buttonText: { color: '#434343', fontWeight: 'bold' }
});