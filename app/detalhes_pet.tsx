import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetalhesPet() {
    const navigation = useNavigation();
    const router = useRouter();
    const { id, nome = "Farofa" } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Drawer.Screen options={{ headerShown: false }} />

            <StatusBar style="dark" backgroundColor="#88C9BF" translucent={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => { navigation.dispatch(DrawerActions.openDrawer()); }}>
                    <Ionicons name="menu" size={24} color="#575757" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{nome}</Text>
                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => { }}>
                    <Ionicons name="share-social-outline" size={24} color="#575757" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/400x300' }}
                    style={styles.petImage}
                />

                <View style={styles.infoContainer}>
                    <Text style={styles.petName}>{nome}</Text>

                    <View style={styles.attributeGrid}>
                        <View style={styles.column}>
                            <Text style={styles.sectionTitle}>SEXO</Text>
                            <Text style={styles.attributeText}>Macho</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.sectionTitle}>PORTE</Text>
                            <Text style={styles.attributeText}>Médio</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.sectionTitle}>IDADE</Text>
                            <Text style={styles.attributeText}>Adulto</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>LOCALIZAÇÃO</Text>
                    <Text style={styles.attributeText}>Samambaia Sul, Distrito Federal</Text>

                    <View style={styles.divider} />

                    <View style={styles.attributeGrid}>
                        <View style={styles.column}>
                            <Text style={styles.sectionTitle}>CASTRADO</Text>
                            <Text style={styles.attributeText}>Sim</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.sectionTitle}>VERMIFUGADO</Text>
                            <Text style={styles.attributeText}>Não</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>TEMPERAMENTO</Text>
                    <Text style={styles.descriptionText}>
                        Farofa é um cão muito dócil e companheiro. Gosta de brincar e se dá bem com outros animais.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => console.log('Adotar')}
                    >
                        <Text style={styles.buttonText}>PRETENDO ADOTAR</Text>
                    </TouchableOpacity>
                </View>
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
    scrollContent: { paddingBottom: 24 },
    petImage: {
        width: '100%',
        height: 240,
        backgroundColor: '#E6E7E8'
    },
    infoContainer: {
        paddingHorizontal: 16,
        paddingTop: 16
    },
    petName: {
        fontSize: 16,
        color: '#434343',
        fontWeight: 'bold',
        marginBottom: 16
    },
    attributeGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    column: {
        flex: 1
    },
    sectionTitle: {
        color: '#F7A800',
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'Roboto_Medium'
    },
    attributeText: {
        color: '#757575',
        fontSize: 14,
        marginBottom: 12
    },
    descriptionText: {
        color: '#757575',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 32
    },
    divider: {
        height: 0.8,
        backgroundColor: '#E6E7E8',
        marginVertical: 8
    },
    button: {
        backgroundColor: '#88C9BF',
        width: 232,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        alignSelf: 'center',
        elevation: 2,
        marginTop: 10
    },
    buttonText: { color: '#434343', fontWeight: 'bold' }
});