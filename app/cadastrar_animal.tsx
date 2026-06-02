import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { addDoc, arrayUnion, collection, doc, GeoPoint, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';



import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

export default function CadastroAnimal() {

	const navigation = useNavigation();

	const { user } = useAuth();
	const router = useRouter();
	const [nome, setNome] = useState('');
	const [fotos, setFotos] = useState<string[]>([]);
	const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
	const [selectedGender, setSelectedGender] = useState<string | null>(null);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [selectedAge, setSelectedAge] = useState<string | null>(null);
	const [selectedTemperament, setSelectedTemperament] = useState<string[]>([]);
	const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
	const [selectedAdoptionRequirements, setSelectedAdoptionRequirements] = useState<string[]>([]);
	const [selectedAdoptionMonths, setSelectedAdoptionMonths] = useState<string[]>([]);
	const [doencas, setDoencas] = useState('');
	const [historia, setHistoria] = useState('');

	const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
	const [region, setRegion] = useState<Region | null>(null);

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Permissão necessária', 'Precisamos da sua localização para facilitar o preenchimento do mapa.');
				return;
			}

			const currentPos = await Location.getCurrentPositionAsync({});
			const initialRegion = {
				latitude: currentPos.coords.latitude,
				longitude: currentPos.coords.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			};
			setRegion(initialRegion);
			setLocation({ latitude: currentPos.coords.latitude, longitude: currentPos.coords.longitude });
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
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.5,
		});

		if (!result.canceled) {
			setFotos(prev => [...prev, result.assets[0].uri]);
		}
	};

	const pickFromGallery = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.5,
		});

		if (!result.canceled) {
			setFotos(prev => [...prev, result.assets[0].uri]);
		}
	};

	const toggleTemperament = (temperament: string) => {
		setSelectedTemperament(prev =>
			prev.includes(temperament)
				? prev.filter(item => item !== temperament)
				: [...prev, temperament]
		);
	};

	const toggleHealth = (health: string) => {
		setSelectedHealth(prev =>
			prev.includes(health)
				? prev.filter(item => item !== health)
				: [...prev, health]
		);
	};

	const toggleAdoptionRequirement = (requirement: string) => {
		setSelectedAdoptionRequirements(prev =>
			prev.includes(requirement)
				? prev.filter(item => item !== requirement)
				: [...prev, requirement]
		);
	};

	const toggleAdoptionMonth = (month: string) => {
		setSelectedAdoptionMonths(prev =>
			prev.includes(month)
				? prev.filter(item => item !== month)
				: [...prev, month]
		);
	};

	const handleAdoptButtonPress = async () => {
		if (!user) {
			Alert.alert('Atenção', 'Você precisa estar logado para cadastrar um animal.');
			return;
		}

		try {
			// Upload das fotos para o Storage
			const uploadedUrls: string[] = [];
			for (let i = 0; i < fotos.length; i++) {
				const uri = fotos[i];
				const response = await fetch(uri);
				const blob = await response.blob();
				const storageRef = ref(storage, `animais/${user.uid}/${Date.now()}_${i}.jpg`);
				await uploadBytes(storageRef, blob);
				const downloadUrl = await getDownloadURL(storageRef);
				uploadedUrls.push(downloadUrl);
			}

			// Salvar no Firestore
			const animalRef = await addDoc(collection(db, 'animais'), {
				nome,
				fotos: uploadedUrls,
				especie: selectedSpecies,
				sexo: selectedGender,
				porte: selectedSize,
				idade: selectedAge,
				temperamento: selectedTemperament,
				saude: selectedHealth,
				requisitosAdocao: selectedAdoptionRequirements,
				mesesAdocao: selectedAdoptionMonths,
				visivel: true,
				interessados: [],
				doencas,
				historia,
				usuarioId: user.uid,
				localizacao: location ? new GeoPoint(location.latitude, location.longitude) : null,

			});

			await setDoc(doc(db, 'users', user.uid), {
				animais: arrayUnion(animalRef.id),
			}, { merge: true });

			Alert.alert('Sucesso', 'Animal cadastrado e vinculado ao seu usuário.');
			router.replace('/');
		} catch (error) {
			console.log(error);
			Alert.alert('Erro', 'Não foi possível cadastrar o animal.');
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
				<TouchableOpacity onPress={() => { navigation.goBack(); }}>
					<Ionicons name="arrow-back" size={24} color="#575757" />
				</TouchableOpacity>
				<Text style={styles.headerText}>Cadastro Animal</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.infoText}>Tenho interesse em cadastrar um animal para:</Text>

				<Text style={styles.sectionText}>Adoção</Text>

				<Text style={styles.sectionTitle}>NOME DO ANIMAL</Text>
				<TextInput style={styles.input} placeholder="Nome do animal" value={nome} onChangeText={setNome} />

				<Text style={styles.sectionTitle}>FOTOS DO ANIMAL</Text>
				<TouchableOpacity style={styles.photoContainer} onPress={handleAddPhoto}>
					<Ionicons name="add-circle-outline" size={24} color="#757575" />
					<Text style={styles.photoText}>adicionar fotos</Text>
				</TouchableOpacity>
				{fotos.length > 0 && (
					<View style={styles.photosContainer}>
						{fotos.map((uri, index) => (
							<Image key={index} source={{ uri }} style={styles.photo} />
						))}
					</View>
				)}

				<Text style={styles.sectionTitle}>ESPÉCIE</Text>
				<View style={styles.speciesContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedSpecies('Cachorro')}>
						<View style={[styles.radioCircle, selectedSpecies === 'Cachorro' && styles.radioSelected]}>
							{selectedSpecies === 'Cachorro' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Cachorro</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedSpecies('Gato')}>
						<View style={[styles.radioCircle, selectedSpecies === 'Gato' && styles.radioSelected]}>
							{selectedSpecies === 'Gato' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Gato</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionTitle}>SEXO</Text>
				<View style={styles.speciesContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedGender('Macho')}>
						<View style={[styles.radioCircle, selectedGender === 'Macho' && styles.radioSelected]}>
							{selectedGender === 'Macho' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Macho</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedGender('Fêmea')}>
						<View style={[styles.radioCircle, selectedGender === 'Fêmea' && styles.radioSelected]}>
							{selectedGender === 'Fêmea' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Fêmea</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionTitle}>PORTE</Text>
				<View style={styles.speciesContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedSize('Pequeno')}>
						<View style={[styles.radioCircle, selectedSize === 'Pequeno' && styles.radioSelected]}>
							{selectedSize === 'Pequeno' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Pequeno</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedSize('Médio')}>
						<View style={[styles.radioCircle, selectedSize === 'Médio' && styles.radioSelected]}>
							{selectedSize === 'Médio' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Médio</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedSize('Grande')}>
						<View style={[styles.radioCircle, selectedSize === 'Grande' && styles.radioSelected]}>
							{selectedSize === 'Grande' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Grande</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionTitle}>IDADE</Text>
				<View style={styles.speciesContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedAge('Filhote')}>
						<View style={[styles.radioCircle, selectedAge === 'Filhote' && styles.radioSelected]}>
							{selectedAge === 'Filhote' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Filhote</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedAge('Adulto')}>
						<View style={[styles.radioCircle, selectedAge === 'Adulto' && styles.radioSelected]}>
							{selectedAge === 'Adulto' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Adulto</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => setSelectedAge('Idoso')}>
						<View style={[styles.radioCircle, selectedAge === 'Idoso' && styles.radioSelected]}>
							{selectedAge === 'Idoso' && <View style={styles.radioInner} />}
						</View>
						<Text style={styles.radioText}>Idoso</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionTitle}>TEMPERAMENTO</Text>
				<View style={styles.speciesContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleTemperament('Brincalhão')}>
						<View style={[styles.checkboxBox, selectedTemperament.includes('Brincalhão') && styles.checkboxChecked]}>
							{selectedTemperament.includes('Brincalhão') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Brincalhão</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleTemperament('Tímido')}>
						<View style={[styles.checkboxBox, selectedTemperament.includes('Tímido') && styles.checkboxChecked]}>
							{selectedTemperament.includes('Tímido') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Tímido</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleTemperament('Calmo')}>
						<View style={[styles.checkboxBox, selectedTemperament.includes('Calmo') && styles.checkboxChecked]}>
							{selectedTemperament.includes('Calmo') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Calmo</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleTemperament('Guarda')}>
						<View style={[styles.checkboxBox, selectedTemperament.includes('Guarda') && styles.checkboxChecked]}>
							{selectedTemperament.includes('Guarda') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Guarda</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleTemperament('Amoroso')}>
						<View style={[styles.checkboxBox, selectedTemperament.includes('Amoroso') && styles.checkboxChecked]}>
							{selectedTemperament.includes('Amoroso') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Amoroso</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleTemperament('Preguiçoso')}>
						<View style={[styles.checkboxBox, selectedTemperament.includes('Preguiçoso') && styles.checkboxChecked]}>
							{selectedTemperament.includes('Preguiçoso') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Preguiçoso</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.sectionTitle}>SAÚDE</Text>
				<View style={styles.speciesContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleHealth('Vacinado')}>
						<View style={[styles.checkboxBox, selectedHealth.includes('Vacinado') && styles.checkboxChecked]}>
							{selectedHealth.includes('Vacinado') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Vacinado</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleHealth('Vermifugado')}>
						<View style={[styles.checkboxBox, selectedHealth.includes('Vermifugado') && styles.checkboxChecked]}>
							{selectedHealth.includes('Vermifugado') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Vermifugado</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleHealth('Castrado')}>
						<View style={[styles.checkboxBox, selectedHealth.includes('Castrado') && styles.checkboxChecked]}>
							{selectedHealth.includes('Castrado') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Castrado</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleHealth('Doente')}>
						<View style={[styles.checkboxBox, selectedHealth.includes('Doente') && styles.checkboxChecked]}>
							{selectedHealth.includes('Doente') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Doente</Text>
					</TouchableOpacity>
					<TextInput style={styles.input} placeholder="Doenças do animal" value={doencas} onChangeText={setDoencas} />
				</View>

				<Text style={styles.sectionTitle}>EXIGÊNCIAS PARA ADOÇÃO</Text>
				<View style={styles.adoptionRequirementsContainer}>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleAdoptionRequirement('Termo de adoção')}>
						<View style={[styles.checkboxBox, selectedAdoptionRequirements.includes('Termo de adoção') && styles.checkboxChecked]}>
							{selectedAdoptionRequirements.includes('Termo de adoção') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Termo de adoção</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleAdoptionRequirement('Fotos da casa')}>
						<View style={[styles.checkboxBox, selectedAdoptionRequirements.includes('Fotos da casa') && styles.checkboxChecked]}>
							{selectedAdoptionRequirements.includes('Fotos da casa') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Fotos da casa</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleAdoptionRequirement('Visita prévia ao animal')}>
						<View style={[styles.checkboxBox, selectedAdoptionRequirements.includes('Visita prévia ao animal') && styles.checkboxChecked]}>
							{selectedAdoptionRequirements.includes('Visita prévia ao animal') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Visita prévia ao animal</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.radioContainer} onPress={() => toggleAdoptionRequirement('Acompanhamento pós adoção')}>
						<View style={[styles.checkboxBox, selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxChecked]}>
							{selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && <View style={styles.checkboxCheck} />}
						</View>
						<Text style={styles.radioText}>Acompanhamento pós adoção</Text>
					</TouchableOpacity>
					<View style={styles.adoptionMonthsContainer}>
						<TouchableOpacity
							style={[styles.radioContainer, styles.nestedRequirement]}
							onPress={() => toggleAdoptionMonth('1 mês')}
							disabled={!selectedAdoptionRequirements.includes('Acompanhamento pós adoção')}
						>
							<View style={[
								styles.checkboxBox,
								selectedAdoptionMonths.includes('1 mês') && styles.checkboxChecked,
								!selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxDisabledBox
							]}>
								{selectedAdoptionMonths.includes('1 mês') && <View style={styles.checkboxCheck} />}
							</View>
							<Text style={[styles.radioText, !selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxDisabledText]}>1 mês</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.radioContainer, styles.nestedRequirement]}
							onPress={() => toggleAdoptionMonth('3 meses')}
							disabled={!selectedAdoptionRequirements.includes('Acompanhamento pós adoção')}
						>
							<View style={[
								styles.checkboxBox,
								selectedAdoptionMonths.includes('3 meses') && styles.checkboxChecked,
								!selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxDisabledBox
							]}>
								{selectedAdoptionMonths.includes('3 meses') && <View style={styles.checkboxCheck} />}
							</View>
							<Text style={[styles.radioText, !selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxDisabledText]}>3 meses</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.radioContainer, styles.nestedRequirement]}
							onPress={() => toggleAdoptionMonth('6 meses')}
							disabled={!selectedAdoptionRequirements.includes('Acompanhamento pós adoção')}
						>
							<View style={[
								styles.checkboxBox,
								selectedAdoptionMonths.includes('6 meses') && styles.checkboxChecked,
								!selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxDisabledBox
							]}>
								{selectedAdoptionMonths.includes('6 meses') && <View style={styles.checkboxCheck} />}
							</View>
							<Text style={[styles.radioText, !selectedAdoptionRequirements.includes('Acompanhamento pós adoção') && styles.checkboxDisabledText]}>6 meses</Text>
						</TouchableOpacity>
					</View>
				</View>

				<Text style={styles.sectionTitle}>SOBRE O ANIMAL</Text>
				<TextInput style={styles.input} placeholder="Compartilhe a história do animal" value={historia} onChangeText={setHistoria} />

				<Text style={styles.sectionTitle}>LOCALIZAÇÃO DO ANIMAL</Text>
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
						<Text style={styles.mapHint}>Toque no mapa ou arraste o marcador para o local exato</Text>
					</View>
				) : (
					<ActivityIndicator size="small" color="#88C9BF" style={{ marginBottom: 20 }} />
				)}

				<TouchableOpacity style={styles.button} onPress={handleAdoptButtonPress}>
					<Text style={styles.buttonText}>COLOCAR PARA ADOÇÃO</Text>
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
	infoText: { color: '#757575', textAlign: 'center', fontSize: 14, marginBottom: 16, alignSelf: 'flex-start' },
	sectionText: {
		alignSelf: 'flex-start', color: '#434343', fontSize: 16,
		marginTop: 20, marginBottom: 16, fontWeight: 'bold'
	},
	sectionTitle: {
		alignSelf: 'flex-start', color: '#88C9BF', fontSize: 12,
		marginTop: 20, marginBottom: 16
	},
	input: {
		width: '100%', borderBottomWidth: 0.8, borderBottomColor: '#E6E7E8',
		height: 40, marginBottom: 20, fontSize: 14
	},
	photoContainer: {
		width: 312, height: 128, backgroundColor: '#E6E7E7',
		justifyContent: 'center', alignItems: 'center', marginBottom: 32,
		elevation: 2
	},
	photoText: { color: '#757575', fontSize: 14 },
	photosContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 32,
	},
	photo: {
		width: 100,
		height: 100,
		margin: 4,
		borderRadius: 8,
	},
	button: {
		backgroundColor: '#88C9BF', width: 232, height: 48,
		justifyContent: 'center', alignItems: 'center', borderRadius: 2,
		marginBottom: 24, elevation: 2
	},
	selectedButton: {
		backgroundColor: '#A8D5CF',
	},
	button2: {
		backgroundColor: '#fafafa', width: 100, height: 40,
		justifyContent: 'center', alignItems: 'center', borderRadius: 2,
		marginBottom: 24, elevation: 2
	},
	button2Container: {
		flexDirection: 'row', gap: 8, marginBottom: 24, alignSelf: 'center', alignItems: 'center'
	},
	buttonText: { color: '#434343', fontWeight: 'bold' },
	speciesContainer: {
		flexDirection: 'row', gap: 32, flexWrap: 'wrap', marginBottom: 24, alignSelf: 'flex-start'
	},
	adoptionRequirementsContainer: {
		flexDirection: 'column', gap: 16, marginBottom: 24, alignSelf: 'flex-start'
	},
	adoptionMonthsContainer: {
		flexDirection: 'column', gap: 12
	},
	nestedRequirement: {
		marginLeft: 28
	},
	radioContainer: {
		flexDirection: 'row', alignItems: 'center', gap: 8
	},
	radioCircle: {
		width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#757575',
		justifyContent: 'center', alignItems: 'center'
	},
	radioSelected: {
		borderColor: '#757575'
	},
	radioInner: {
		width: 10, height: 10, borderRadius: 5, backgroundColor: '#757575'
	},
	radioText: { color: '#434343', fontSize: 14 },
	checkboxBox: {
		width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#757575',
		justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF'
	},
	checkboxChecked: {
		borderColor: '#757575', backgroundColor: '#757575'
	},
	checkboxDisabledBox: {
		borderColor: '#bdbdbd', backgroundColor: '#FFFFFF'
	},
	checkboxDisabledText: {
		color: '#bdbdbd'
	},
	checkboxCheck: {
		width: 10, height: 10, borderRadius: 2, backgroundColor: '#FFFFFF'
	},
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
