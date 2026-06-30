import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Animal {
    id: string;
    nome: string;
    porte: string;
    idade: string;
    sexo: string;
    fotos: string[];
    vacinado: string;
    vermifugado: string;
    castrado: string;
    doencas: string;
    visivel: boolean;
    interessados: string[];
    temperamento: string;
    localizacao: { latitude: number; longitude: number };
    fotoUrl: string;
    usuarioId: string;
}

export default function MapaPanoramico() {
    const router = useRouter();
    const navigation = useNavigation();
    const { user } = useAuth() as any;

    const [pets, setPets] = useState<Animal[]>([]);
    const [selectedPet, setSelectedPet] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({});
                    const coords = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };
                    setUserLocation(coords);
                }
            } catch (error) {
                console.error("Erro ao obter permissão ou localização do usuário:", error);
            }
        })();
    }, []);

    useEffect(() => {
        const animaisRef = collection(db, "animais");
        const q = query(animaisRef, where("visivel", "==", true));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const petPromises = snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                if (data.localizacao && typeof data.localizacao.latitude === 'number' && typeof data.localizacao.longitude === 'number') {
                    let resolvedFoto = '';
                    if (data.fotos && data.fotos.length > 0) {
                        const firstFoto = data.fotos[0];
                        if (firstFoto.startsWith('http://') || firstFoto.startsWith('https://')) {
                            resolvedFoto = firstFoto;
                        } else {
                            try {
                                resolvedFoto = await getDownloadURL(ref(storage, firstFoto));
                            } catch (err) {
                                console.error("Erro resolvendo foto do pet:", err);
                            }
                        }
                    }
                    return {
                        id: docSnap.id,
                        nome: data.nome || "Sem Nome",
                        porte: data.porte || "",
                        idade: data.idade || "",
                        sexo: data.sexo || "",
                        fotos: data.fotos || [],
                        vacinado: data.vacinado || "sim",
                        vermifugado: data.vermifugado || "sim",
                        castrado: data.castrado || "não",
                        doencas: data.doencas || "nenhuma",
                        interessados: data.interessados || [],
                        visivel: data.visivel || true,
                        temperamento: data.temperamento || "dócil",
                        localizacao: {
                            latitude: data.localizacao.latitude,
                            longitude: data.localizacao.longitude
                        },
                        fotoUrl: resolvedFoto,
                        usuarioId: data.usuarioId || ""
                    };
                }
                return null;
            });

            const resolvedPets = await Promise.all(petPromises);
            setPets(resolvedPets.filter(p => p !== null) as Animal[]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    }, [userLocation]);

    const defaultRegion = {
        latitude: -15.7801,
        longitude: -47.9292,
        latitudeDelta: 15,
        longitudeDelta: 15,
    };

    const handleMarkerPress = (pet: Animal) => {
        setSelectedPet(pet);
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: pet.localizacao.latitude - 0.005,
                longitude: pet.localizacao.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 600);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <Drawer.Screen
                options={{
                    headerTintColor: '#434343',
                    headerTitle: "Pets no mapa",
                    headerTitleStyle: {
                        fontFamily: 'Roboto-Medium',
                        color: '#434343',
                        fontSize: 20,
                    },
                    headerStyle: {
                        backgroundColor: '#fee29b', // amarelo correspondente ao "adotar"
                    },
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <Ionicons name="menu-outline" size={24} color='#434343' />
                        </TouchableOpacity>
                    )
                }}
            />
            <StatusBar style="dark" backgroundColor="#fee29b" translucent={false} />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffd358" />
                    <Text style={styles.loadingText}>Carregando mapa e pets...</Text>
                </View>
            ) : (
                <View style={styles.mapWrapper}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={
                            userLocation
                                ? {
                                    latitude: userLocation.latitude,
                                    longitude: userLocation.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }
                                : pets.length > 0
                                    ? {
                                        latitude: pets[0].localizacao.latitude,
                                        longitude: pets[0].localizacao.longitude,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }
                                    : defaultRegion
                        }
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        onPress={() => setSelectedPet(null)}
                    >
                        {pets.map((pet) => (
                            <Marker
                                key={pet.id}
                                coordinate={pet.localizacao}
                                pinColor={selectedPet?.id === pet.id ? '#FFD358' : 'red'}
                                onPress={() => handleMarkerPress(pet)}
                            />
                        ))}
                    </MapView>

                    {selectedPet && (
                        <View style={styles.detailsCard}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedPet(null)}
                            >
                                <Ionicons name="close-circle" size={24} color="#757575" />
                            </TouchableOpacity>

                            <View style={styles.cardContent}>
                                {selectedPet.fotoUrl ? (
                                    <Image source={{ uri: selectedPet.fotoUrl }} style={styles.cardImage} />
                                ) : (
                                    <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                                        <Ionicons name="paw" size={32} color="#bdbdbd" />
                                    </View>
                                )}

                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardName}>{selectedPet.nome}</Text>
                                    <View style={styles.cardTags}>
                                        <Text style={styles.cardTag}>{selectedPet.sexo}</Text>
                                        <Text style={styles.cardTagBullet}>•</Text>
                                        <Text style={styles.cardTag}>{selectedPet.idade}</Text>
                                        <Text style={styles.cardTagBullet}>•</Text>
                                        <Text style={styles.cardTag}>{selectedPet.porte}</Text>
                                    </View>
                                    <Text style={styles.cardTemp}>Temperamento: {selectedPet.temperamento}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.detailsButton}
                                onPress={() => {
                                    router.push({
                                        pathname: "/adotar_pets/[id]",
                                        params: { id: selectedPet.id, petData: JSON.stringify(selectedPet) }
                                    });
                                }}
                            >
                                <Text style={styles.detailsButtonText}>PRETENDO ADOTAR / VER DETALHES</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    loadingText: {
        marginTop: 12,
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: '#757575',
    },
    mapWrapper: {
        flex: 1,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    // Estilo do Card inferior de Detalhes
    detailsCard: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        resizeMode: 'cover',
    },
    cardImagePlaceholder: {
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        marginLeft: 16,
        flex: 1,
    },
    cardName: {
        fontFamily: 'Roboto-Medium',
        fontSize: 20,
        color: '#434343',
        marginBottom: 4,
    },
    cardTags: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTag: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: '#757575',
        textTransform: 'capitalize',
    },
    cardTagBullet: {
        fontSize: 12,
        color: '#bdbdbd',
        marginHorizontal: 6,
    },
    cardTemp: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        color: '#9e9e9e',
    },
    detailsButton: {
        backgroundColor: '#FFD358',
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    detailsButtonText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        color: '#434343',
        letterSpacing: 0.5,
    },
});
