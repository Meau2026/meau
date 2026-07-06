import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db, storage } from '@/firebaseConfig';
// ✅ onSnapshot adicionado nos imports do Firestore
import { addDoc, arrayUnion, collection, doc, GeoPoint, getDoc, getDocs, serverTimestamp, setDoc, query, where, updateDoc, deleteDoc, onSnapshot, arrayRemove } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

import { useAuth } from '@/contexts/AuthContext';

interface Interessado {
  id: string; 
  userId: string; 
  userName: string;
  userFoto: string;
  petId: string;
  petName: string;
}

interface ChatMessage {
  id: string;
  nomeUser: string;
  nomeItem: string;
  ultimaMensagem: string;
  horario: string;
  foto: string; 
  timestamp: number;
}

export default function InteressadosScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  
  
  const { user } = useAuth(); 
  
 
  const [loading, setLoading] = useState(true);
  const [listaInteressados, setListaInteressados] = useState<Interessado[]>([]); // Começa vazio

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const interessesRef = collection(db, 'interesses');
    
    const q = query(interessesRef, where('donoId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const interessadosData: Interessado[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.interessadoId,
          userName: data.nomeInteressado || 'Usuário',
          userFoto: data.fotoInteressado || 'https://placehold.co/150.png',
          petId: data.animalId,
          petName: data.nomeAnimal || 'Animal',
        };
      });

      setListaInteressados(interessadosData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar interessados: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

const handleAceitar = (item: Interessado) => {
  
  router.push({
    pathname: '/finalizar_processo',
    params: { 
      userId: item.userId, 
      petId: item.petId,
      petName: item.petName 
    }
  });
};

const handleRejeitar = (item: Interessado) => {
  Alert.alert(
    "Rejeitar Interesse",
    `Tem certeza que deseja rejeitar o interesse de ${item.userName}?`,
    [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sim, Rejeitar", 
        style: "destructive",
        onPress: async () => {
          try {
            const petRef = doc(db, 'animais', item.petId);
            
           
            await updateDoc(petRef, {
              interesses_negados: arrayUnion(item.userId),
              interessados: arrayRemove(item.userId)
            });

            
            const interesseRef = doc(db, 'interesses', item.id);
            await deleteDoc(interesseRef);

          } catch (error) {
            console.error("Erro ao rejeitar interesse: ", error);
            Alert.alert("Erro", "Não foi possível rejeitar o pedido no momento.");
          }
        }
      }
    ]
  );
}; 
  const handleChat = async (item: Interessado) => {
    if (!user) return;

    try {
      const chatsRef = collection(db, 'chats');
      
      const q = query(
        chatsRef,
        where('animalId', '==', item.petId),
        where('interessadoId', '==', item.userId),
        where('donoId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      let chatId = "";
      let ultimaMsg = "Inicie a conversa...";
      let tempoMs = Date.now(); 

      if (!querySnapshot.empty) {
        const chatDoc = querySnapshot.docs[0];
        chatId = chatDoc.id;
        
        const data = chatDoc.data();
        if (data.ultimaMensagem) ultimaMsg = data.ultimaMensagem;
        if (data.createdAt) tempoMs = data.createdAt.toMillis();

      } else {
        const chatRef = await addDoc(collection(db, 'chats'), {
          donoId: user.uid,
          interessadoId: item.userId,
          animalId: item.petId,
          status: 0,
          createdAt: serverTimestamp(),
          ultimaMensagem: "",
        });
        
        chatId = chatRef.id;

        const dataAtual = new Date(tempoMs);
        const horarioFormatado = dataAtual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const chatInfo: ChatMessage = {
          id: chatId,
          nomeUser: item.userName,
          nomeItem: `${item.userName} | ${item.petName}`,
          ultimaMensagem: ultimaMsg,
          horario: horarioFormatado,
          foto: item.userFoto,
          timestamp: tempoMs,
        };

        router.push({
          pathname: '/chat/chat',
          params: { chatInfo: JSON.stringify(chatInfo) }
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar ou acessar chat:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o chat.');
    }
  };

  const renderInteressado = ({ item }: { item: Interessado }) => (
    <View style={styles.cardContainer}>
      <View style={styles.userInfoRow}>
        <Image source={{ uri: item.userFoto }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={styles.petText} numberOfLines={1}>
            Interessado em: <Text style={styles.petHighlight}>{item.petName}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionButton, styles.btnAceitar]} onPress={() => handleAceitar(item)}>
          <Text style={styles.btnText}>ACEITAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.btnRejeitar]} onPress={() => handleRejeitar(item)}>
          <Text style={styles.btnText}>REJEITAR</Text>
        </TouchableOpacity>
       
        <TouchableOpacity style={[styles.actionButton, styles.btnChat]} onPress={() => handleChat(item)}>
          <Ionicons name="chatbubbles-outline" size={16} color="#434343" style={styles.btnIcon} />
          <Text style={styles.btnText}>CHAT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#88c9bf" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
      <Drawer.Screen
        options={{
          headerTitle: 'Interessados',
          headerTintColor: '#434343',
          headerStyle: styles.drawerHeader,
          headerTitleStyle: styles.drawerTitle,
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu-outline" size={24} color="#434343" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={listaInteressados}
        keyExtractor={(item) => item.id}
        renderItem={renderInteressado}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Não há interessados no momento.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  drawerHeader: {
    backgroundColor: '#88c9bf',
  },
  drawerTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 20,
    color: '#434343',
  },
  listContainer: {
    paddingVertical: 8,
  },
  separator: {
    height: 0.8,
    backgroundColor: '#ebe7e8',
    marginHorizontal: 16,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fafafa',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#589b9b',
    marginBottom: 4,
  },
  petText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575',
  },
  petHighlight: {
    fontFamily: 'Roboto-Medium',
    color: '#434343',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 4,
  },
  btnText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
  btnChat: {
    backgroundColor: '#cfe9e5',
  },
  btnRejeitar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  btnAceitar: {
    backgroundColor: '#fdcf58',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575',
  },
});
