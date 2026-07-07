import { auth, db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, GeoPoint, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

export default function EditarPerfil() {
	const navigation = useNavigation();
	const router = useRouter();

	const [nome, setNome] = useState<string>('');
	const [idade, setIdade] = useState<string>('');
	const [estado, setEstado] = useState<string>('');
	const [cidade, setCidade] = useState<string>('');
	const [endereco, setEndereco] = useState<string>('');
	const [telefone, setTelefone] = useState<string>('');
	const [username, setUsername] = useState<string>('');
	const [image, setImage] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);

	const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
	const [region, setRegion] = useState<Region | null>(null);

	// Carregar os dados atuais do usuário do Firestore
	useEffect(() => {
		const loadUserData = async () => {
			const currentUser = auth.currentUser;
			if (!currentUser) {
				Alert.alert("Erro", "Usuário não autenticado.");
				router.replace('/');
				return;
			}

			try {
				const userDocRef = doc(db, "users", currentUser.uid);
				const userDoc = await getDoc(userDocRef);

				if (userDoc.exists()) {
					const data = userDoc.data();
					setNome(data.nome || '');
					setIdade(data.idade || '');
					setEstado(data.estado || '');
					setCidade(data.cidade || '');
					setEndereco(data.endereco || '');
					setTelefone(data.telefone || '');
					setUsername(data.username || '');

					// Se houver uma referência de foto, busca a URL temporária para renderizar na tela
					if (data.fotoUrl) {
						try {
							const url = await getDownloadURL(ref(storage, data.fotoUrl));
							setImage(url);
						} catch (e) {
							console.error("Erro ao buscar URL da foto:", e);
						}
					}

					if (data.localizacao) {
						const geoPoint = data.localizacao as GeoPoint;
						const userCoord = {
							latitude: geoPoint.latitude,
							longitude: geoPoint.longitude,
						};
						setLocation(userCoord);
						setRegion({
							...userCoord,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						});
					} else {
						const fallbackRegion = {
							latitude: -15.7975,
							longitude: -47.8919,
							latitudeDelta: 0.05,
							longitudeDelta: 0.05,
						};
						setRegion(fallbackRegion);
						setLocation({ latitude: fallbackRegion.latitude, longitude: fallbackRegion.longitude });
					}
				} else {
					Alert.alert("Erro", "Perfil não encontrado no banco de dados.");
				}
			} catch (error) {
				console.error("Erro ao carregar dados do usuário:", error);
				Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
			} finally {
				setLoading(false);
			}
		};

		loadUserData();
	}, []);

	const handleAddPhoto = async () => {
		const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
		const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
			Alert.alert('Permissões necessárias', 'Precisamos de permissões para acessar câmera e galeria.');
			return;
		}

		Alert.alert(
			'Selecionar Imagem',
			'Escolha uma opção',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{ text: 'Tirar Foto', onPress: pickFromCamera },
				{ text: 'Escolher da Galeria', onPress: pickFromGallery },
			]
		);
	};

	const pickFromCamera = async () => {
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.5,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setImage(result.assets[0].uri);
		}
	};

	const pickFromGallery = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.5,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setImage(result.assets[0].uri);
		}
	};

	const handleAtualizar = async () => {
		if (!nome) {
			Alert.alert("Erro", "O campo Nome é obrigatório.");
			return;
		}

		const currentUser = auth.currentUser;
		if (!currentUser) return;

		setSaving(true);
		try {
			// Mantém o valor atual que já está no banco caso a imagem não tenha mudado
			let fotoUrlValue = undefined;
			
			// Busca o documento atual para saber qual era o caminho antigo da foto
			const userDoc = await getDoc(doc(db, "users", currentUser.uid));
			if (userDoc.exists()) {
				fotoUrlValue = userDoc.data().fotoUrl;
			}

			// Se a imagem no estado mudou (contém caminhos locais do dispositivo)
			if (image && (image.startsWith('file:') || image.startsWith('content:'))) {
				const response = await fetch(image);
				const blob = await response.blob();
				
				// Define o caminho interno da string (ex: 'perfil/123456789')
				const pathStorage = `perfil/${currentUser.uid}_${Date.now()}`;
				const storageRef = ref(storage, pathStorage);
				
				await uploadBytes(storageRef, blob);
				
				// Salva no banco o PATH interno do storage, respeitando a lógica do _layout.tsx
				fotoUrlValue = pathStorage;
			}

			await updateDoc(doc(db, "users", currentUser.uid), {
				nome,
				idade,
				estado,
				cidade,
				endereco,
				telefone,
				username,
				fotoUrl: fotoUrlValue, // Agora salva a string de caminho estático do storage
				localizacao: location ? new GeoPoint(location.latitude, location.longitude) : null,
				updatedAt: new Date(),
			});

			Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
			router.replace('/');
		} catch (error) {
			console.error("Erro ao atualizar o documento: ", error);
			Alert.alert("Erro", "Não foi possível atualizar o perfil.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
				<ActivityIndicator size="large" color="#88C9BF" />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<Drawer.Screen options={{ headerShown: false }} />
			<StatusBar style="dark" backgroundColor="#88C9BF" translucent={false} />

			<View style={styles.header}>
				<TouchableOpacity onPress={() => { navigation.dispatch(DrawerActions.openDrawer()); }}>
					<Ionicons name="menu" size={24} color="#575757" />
				</TouchableOpacity>
				<Text style={styles.headerText}>Editar Perfil</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
				<TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#bdbdbd" value={nome} onChangeText={setNome} />
				<TextInput style={styles.input} placeholder="Idade" placeholderTextColor="#bdbdbd" keyboardType="numeric" value={idade} onChangeText={setIdade} />
				<TextInput style={styles.input} placeholder="Estado" placeholderTextColor="#bdbdbd" value={estado} onChangeText={setEstado} />
				<TextInput style={styles.input} placeholder="Cidade" placeholderTextColor="#bdbdbd" value={cidade} onChangeText={setCidade} />
				<TextInput style={styles.input} placeholder="Endereço" placeholderTextColor="#bdbdbd" value={endereco} onChangeText={setEndereco} />
				<TextInput style={styles.input} placeholder="Telefone" placeholderTextColor="#bdbdbd" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />

				<Text style={styles.sectionTitle}>INFORMAÇÕES DE PERFIL</Text>
				<TextInput style={styles.input} placeholder="Nome de usuário" placeholderTextColor="#bdbdbd" value={username} onChangeText={setUsername} />

				<Text style={styles.sectionTitle}>FOTO DE PERFIL</Text>
				<TouchableOpacity style={styles.photoContainer} onPress={handleAddPhoto}>
					{image ? (
						<Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
					) : (
						<>
							<Ionicons name="add-circle-outline" size={24} color="#757575" />
							<Text style={styles.photoText}>alterar foto</Text>
						</>
					)}
				</TouchableOpacity>

				<Text style={styles.sectionTitle}>SUA LOCALIZAÇÃO</Text>
				{region ? (
					<View style={styles.mapContainer}>
						<MapView
							provider={PROVIDER_GOOGLE}
							style={styles.map}
							initialRegion={region}
							onPress={(e) => setLocation(e.nativeEvent.coordinate)}
						>
							{location && (
								<Marker
									coordinate={location}
									draggable
									onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
								/>
							)}
						</MapView>
						<Text style={styles.mapHint}>Toque no mapa ou arraste o marcador para atualizar seu endereço</Text>
					</View>
				) : (
					<ActivityIndicator size="small" color="#88C9BF" style={{ marginBottom: 20 }} />
				)}

				<TouchableOpacity style={styles.button} onPress={handleAtualizar} disabled={saving}>
					{saving ? <ActivityIndicator color="#434343" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
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
	sectionTitle: {
		alignSelf: 'flex-start', color: '#88C9BF', fontSize: 14,
		marginTop: 20, marginBottom: 16
	},
	input: {
		width: '100%', borderBottomWidth: 0.8, borderBottomColor: '#E6E7E8',
		height: 40, marginBottom: 20, fontSize: 14, color: '#434343'
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
	buttonText: { color: '#434343', fontWeight: 'bold' },
	mapContainer: {
		width: '100%',
		marginBottom: 20,
		alignItems: 'center',
	},
	map: {
		width: '100%',
		height: 250,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#E6E7E8',
	},
	mapHint: {
		fontSize: 12,
		color: '#757575',
		marginTop: 8,
		textAlign: 'center',
	},
});