import { auth, db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, GeoPoint, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';



import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import * as Location from 'expo-location';

export default function CadastroPessoal() {

	const navigation = useNavigation();

	const router = useRouter();
	const [nome, setNome] = useState<string>('');
	const [idade, setIdade] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [estado, setEstado] = useState<string>('');
	const [cidade, setCidade] = useState<string>('');
	const [endereco, setEndereco] = useState<string>('');
	const [telefone, setTelefone] = useState<string>('');
	const [username, setUsername] = useState<string>('');
	const [senha, setSenha] = useState<string>('');
	const [confirmaSenha, setConfirmaSenha] = useState<string>('');
	const [image, setImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);


	const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
	const [region, setRegion] = useState<Region | null>(null);


  useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                
                
                const fallbackRegion = {
                    latitude: -15.7975, 
                    longitude: -47.8919,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };

                if (status !== 'granted') {
                    console.warn("Permissão de GPS negada pelo usuário.");
                    setRegion(fallbackRegion);
                    setLocation({ latitude: fallbackRegion.latitude, longitude: fallbackRegion.longitude });
                    return;
                }

               
                let currentLoc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    timeout: 5000 
                });

                const userRegion = {
                    latitude: currentLoc.coords.latitude,
                    longitude: currentLoc.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };

                
                setRegion(userRegion);
                setLocation({ latitude: userRegion.latitude, longitude: userRegion.longitude });

            } catch (error) {
                console.warn("O GPS falhou ou demorou muito. Usando fallback.", error);
                const fallbackRegion = {
                    latitude: -15.7975, 
                    longitude: -47.8919,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setRegion(fallbackRegion);
                setLocation({ latitude: fallbackRegion.latitude, longitude: fallbackRegion.longitude });
            }
        })();
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
			allowsEditing: true,
			quality: 0.5,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setImage(result.assets[0].uri);
		}
	};

	const pickFromGallery = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			quality: 0.5,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setImage(result.assets[0].uri);
		}
	};

	const handleCadastro = async () => {
		if (!nome || !email || !senha) {
			Alert.alert("Erro", "Preencha os campos obrigatórios (Nome, E-mail e Senha).");
			return;
		}

		if (senha !== confirmaSenha) {
			Alert.alert("Erro", "As senhas não coincidem.");
			return;
		}

		setLoading(true);
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
			const user = userCredential.user;


			let imageUrl = "";
			if (image) {
				const response = await fetch(image);
				const blob = await response.blob();
				const storageRef = ref(storage, `perfil/${Date.now()}`);
				await uploadBytes(storageRef, blob);
				imageUrl = await getDownloadURL(storageRef);
			}

			await setDoc(doc(db, "users", user.uid), {
				uid: user.uid,
				nome,
				idade,
				email,
				estado,
				cidade,
				endereco,
				telefone,
				username,
				fotoUrl: imageUrl,
				localizacao: location ? new GeoPoint(location.latitude, location.longitude) : null,
				createdAt: new Date(),
			});

			Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
			router.replace('/');
		} catch (error: any) {
			console.error(error);
			let message = "Não foi possível realizar o cadastro.";
			if (error.code === 'auth/email-already-in-use') message = "Este e-mail já está em uso.";
			if (error.code === 'auth/weak-password') message = "A senha deve ter pelo menos 6 caracteres.";
			Alert.alert("Erro", message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>


			<Drawer.Screen
				options={{
					headerShown: false
				}}
			/>

			<StatusBar style="dark" backgroundColor="#88C9BF" translucent={false} />

			<View style={styles.header}>
				<TouchableOpacity onPress={() => { navigation.dispatch(DrawerActions.openDrawer()); }}>
					<Ionicons name="menu" size={24} color="#575757" />
				</TouchableOpacity>

				<Text style={styles.headerText}>Cadastro Pessoal</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.infoBanner}>
					<Text style={styles.infoText}>
						As informações preenchidas serão divulgadas apenas para a pessoa com a qual você realizar o processo de adoção...
					</Text>
				</View>

				<Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
				<TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
				<TextInput style={styles.input} placeholder="Idade" keyboardType="numeric" value={idade} onChangeText={setIdade} />
				<TextInput style={styles.input} placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
				<TextInput style={styles.input} placeholder="Estado" value={estado} onChangeText={setEstado} />
				<TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
				<TextInput style={styles.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
				<TextInput style={styles.input} placeholder="Telefone" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />

				<Text style={styles.sectionTitle}>INFORMAÇÕES DE PERFIL</Text>
				<TextInput style={styles.input} placeholder="Nome de usuário" value={username} onChangeText={setUsername} />
				<TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
				<TextInput style={styles.input} placeholder="Confirmação de senha" secureTextEntry value={confirmaSenha} onChangeText={setConfirmaSenha} />

				<Text style={styles.sectionTitle}>FOTO DE PERFIL</Text>
				<TouchableOpacity style={styles.photoContainer} onPress={handleAddPhoto}>
					{image ? (
						<Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
					) : (
						<>
							<Ionicons name="add-circle-outline" size={24} color="#757575" />
							<Text style={styles.photoText}>adicionar foto</Text>
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
						<Text style={styles.mapHint}>Toque no mapa ou arraste o marcador para o seu endereço</Text>
					</View>
				) : (
					<ActivityIndicator size="small" color="#88C9BF" style={{ marginBottom: 20 }} />
				)}

				<TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
					{loading ? <ActivityIndicator color="#434343" /> : <Text style={styles.buttonText}>FAZER CADASTRO</Text>}
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
