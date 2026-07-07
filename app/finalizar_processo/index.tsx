import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Pet {
  id: string;
  nome: string;
}

interface Interessado {
  userId: string;
  nome: string;
}

export default function FinalizarProcesso() {
  const { user } = useAuth();
  const router = useRouter(); 
  const params = useLocalSearchParams();

  const [pets, setPets] = useState<Pet[]>([]);
  const [interessadosPorPet, setInteressadosPorPet] = useState<Record<string, Interessado[]>>({});
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listener para os animais do usuário
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribePets = onSnapshot(userDocRef, async (userDoc) => {
      if (!userDoc.exists()) {
        setPets([]);
        return;
      }

      const userAnimals = userDoc.data().animais || [];
      if (userAnimals.length > 0) {
        const petPromises = userAnimals.map(async (animalUid: string) => {
          const petRef = doc(db, "animais", animalUid);
          const petDoc = await getDoc(petRef);
          if (petDoc.exists()) {
            return { id: petDoc.id, nome: petDoc.data().nome };
          }
          return null;
        });
        const loadedPets = (await Promise.all(petPromises)).filter((p): p is Pet => p !== null);
        setPets(loadedPets);
      } else {
        setPets([]);
      }
    }, (error) => {
      console.error("Erro ao escutar pets do usuário:", error);
    });

    // Listener para os interesses
    const interessesRef = collection(db, 'interesses');
    const q = query(interessesRef, where('donoId', '==', user.uid));
    const unsubscribeInteresses = onSnapshot(q, (interessesSnap) => {
      const mapaInteressados: Record<string, Interessado[]> = {};
      interessesSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const petId = data.animalId;

        if (!mapaInteressados[petId]) {
          mapaInteressados[petId] = [];
        }
        mapaInteressados[petId].push({
          userId: data.interessadoId,
          nome: data.nomeInteressado || 'Usuário'
        });
      });
      setInteressadosPorPet(mapaInteressados);
    }, (error) => {
      console.error("Erro ao escutar interesses:", error);
    });
    
    return () => {
      unsubscribePets();
      unsubscribeInteresses();
    };
  }, [user]);

  useEffect(() => {
    // Seta os parâmetros da navegação sempre que eles mudarem
    if (params.petId && typeof params.petId === 'string') {
      setSelectedPetId(params.petId);
      if (params.userId && typeof params.userId === 'string') {
        setSelectedUserId(params.userId);
      }
    }
  }, [params]);

  const handleSelecionarPet = (petId: string) => {
    setSelectedPetId(petId);
    setSelectedUserId(""); 
  };

  const confirmarProcesso = async () => {
    if (!user || !selectedPetId || !selectedUserId) {
      Alert.alert("Erro", "Informações incompletas para finalizar o processo.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const animalRef = doc(db, "animais", selectedPetId);
        const antigoDonoRef = doc(db, "users", user.uid);
        const novoDonoRef = doc(db, "users", selectedUserId);

        // 1. Atualiza o animal: novo dono e visibilidade
        transaction.update(animalRef, { usuarioId: selectedUserId, visivel: false });

        // 2. Remove o animal do antigo dono
        transaction.update(antigoDonoRef, { animais: arrayRemove(selectedPetId) });

        // 3. Adiciona o animal ao novo dono
        transaction.update(novoDonoRef, { animais: arrayUnion(selectedPetId) });

        // 4. Encontra e fecha o chat correspondente
        const chatsRef = collection(db, 'chats');
        const chatQuery = query(
          chatsRef,
          where('animalId', '==', selectedPetId),
          where('donoId', '==', user.uid),
          where('interessadoId', '==', selectedUserId)
        );
        
        const chatSnapshots = await getDocs(chatQuery);
        chatSnapshots.forEach((chatDoc) => {
          if (chatDoc.exists()) {
            transaction.update(chatDoc.ref, { status: 1 });
          }
        });
      });

      setModalVisible(false);
      const petSelecionado = pets.find(p => p.id === selectedPetId);
    } catch (error) {
      console.error("Erro ao finalizar o processo de adoção: ", error);
      Alert.alert("Erro", "Não foi possível concluir a adoção. Tente novamente.");
    }
  };

  const interessadosAtuais = interessadosPorPet[selectedPetId] || [];

  return (
    <SafeAreaView style={styles.layout}>
      <Drawer.Screen
        options={{
          headerTintColor: '#434343',
          headerTitle: '  Finalizar processo',
          headerStyle: styles.drawer_header,
        }} 
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          
          <View style={styles.list}>
            <Text style={styles.title_text}>SELECIONE O ANIMAL</Text>
            {pets.map((pet) => (
              <TouchableOpacity key={pet.id} style={styles.radioContainer} onPress={() => handleSelecionarPet(pet.id)}>
                <View style={[styles.radioCircle, selectedPetId === pet.id && styles.radioSelected]}>
                  {selectedPetId === pet.id && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{pet.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.list}>
            <Text style={styles.title_text}>SELECIONE O USUÁRIO</Text>
            {!selectedPetId ? (
              <Text style={styles.text}>Selecione um animal acima primeiro.</Text>
            ) : interessadosAtuais.length === 0 ? (
              <Text style={styles.text}>Não há interessados para este pet.</Text>
            ) : (
              interessadosAtuais.map((interessado) => (
                <TouchableOpacity key={interessado.userId} style={styles.radioContainer} onPress={() => setSelectedUserId(interessado.userId)}>
                  <View style={[styles.radioCircle, selectedUserId === interessado.userId && styles.radioSelected]}>
                    {selectedUserId === interessado.userId && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>{interessado.nome}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => {
        if (!selectedPetId || !selectedUserId) {
          Alert.alert("Atenção", "Selecione o animal e o usuário antes de prosseguir.");
          return;
        }
        setModalVisible(true);
      }}>
        <Text style={styles.button_text}>FINALIZAR PROCESSO</Text>
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>LEIA ATENTAMENTE ANTES DE PROSSEGUIR</Text>
            <Text style={styles.modalBodyText}>
            Antes de realizar este passo, certifique-se de
            que o adotante  tenha cumprido
            todos os requisitos prévios à adoção. Além
            disso, esteja certo de que ele já está em
            posse do animal em questão.
            Após finalizar este processo, o seu animal
            será automaticamente removido da lista de
            pets para adoção.
            Além disso, é importante ressaltar que as
            suas informações de cadastro serão
            disponibilizadas para o usuário que está
            adotando o seu animal,
            assim como você também terá acesso à
            todas as informações fornecidas por ele(a).</Text>
            <Text style={styles.modalBoldText}>
            Ao clicar em “li e concorco”, você declara ter
            lido, compreendido e concordado com os
            termos acima expostos.
            </Text>
            <TouchableOpacity style={styles.modalButtonConfirm} onPress={confirmarProcesso}>
              <Text style={styles.modalButtonConfirmText}>LI E CONCORDO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonCancelText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  drawer_header: {
    backgroundColor: '#cfe9e5',
  },
  layout: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  title_text: {
    fontFamily: 'Roboto-Regular',
    color: '#589b9b',
    fontSize: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
    fontStyle: 'italic',
  },
  button_text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
  button: {
    height: 48,
    width: 232,
    backgroundColor: '#fdcf58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 24,
    alignSelf: 'center',
  },
  list: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#757575',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#757575',
  },
  radioText: {
    color: '#434343',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    paddingTop: 88,
  },
  modalContent: {
    width: 320,
    backgroundColor: '#f7f7f7',
    padding: 24,
    borderRadius: 2,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#589b9b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBodyText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'justify',
  },
  modalBoldText: {
    fontFamily: 'Roboto-Medium',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'justify',
  },
  modalButtonConfirm: {
    width: '100%',
    height: 40,
    backgroundColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 12,
  },
  modalButtonConfirmText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
  modalButtonCancel: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  modalButtonCancelText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
});
