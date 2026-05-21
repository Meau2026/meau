import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Imports do Firebase e Contexto de Autenticação
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebaseConfig';
import { collection, doc, getDoc, getDocs, or, query, where } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  nomeItem: string;
  ultimaMensagem: string;
  horario: string;
  foto: string; 
}

export default function ChatScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const { user } = useAuth(); // Pega o usuário logado

  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Busca todos os chats onde o usuário atual participa
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          or(
            where('donoId', '==', user.uid),
            where('interessadoId', '==', user.uid)
          )
        );

        const querySnapshot = await getDocs(q);
        const listaChats: ChatMessage[] = [];

        // 2. Itera sobre cada chat para buscar os nomes reais do animal e da outra pessoa
        for (const chatDoc of querySnapshot.docs) {
          const chatData = chatDoc.data();

          // Identifica quem é a outra pessoa na conversa
          const outroUsuarioID = chatData.donoId === user.uid ? chatData.interessadoId : chatData.donoId;

          // Busca os dados do outro usuário de forma paralela no Firestore
          const userDocSnap = await getDoc(doc(db, 'users', outroUsuarioID));
          const animalDocSnap = await getDoc(doc(db, 'animais', chatData.animalId));

          const nomeUsuario = userDocSnap.exists() ? userDocSnap.data().nome?.toUpperCase() : 'USUÁRIO';
          const nomeAnimal = animalDocSnap.exists() ? animalDocSnap.data().nome?.toUpperCase() : 'ANIMAL';
          
          // Formata o horário (substitua pela lógica do seu timestamp se necessário)
          const horarioFormatado = chatData.updatedAt?.toDate 
            ? chatData.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '12:00';

          listaChats.push({
            id: chatDoc.id,
            nomeItem: `${nomeUsuario} | ${nomeAnimal}`,
            ultimaMensagem: chatData.ultimaMensagem || 'Inicie a conversa...',
            horario: horarioFormatado,
            foto: userDocSnap.exists() ? userDocSnap.data().fotoUrl : 'https://placehold.co/150.png', 
          });
        }

        setChats(listaChats);
      } catch (error) {
        console.error("Erro ao buscar conversas: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  const handleChatPress = (chatId: string) => {
    // Redireciona para a página interna usando o GiftedChat, enviando o ID da conversa
    router.push({
      pathname: '/chat/chat', 
      params: { id: chatId }
    });
  };

  const renderChatItem = ({ item }: { item: ChatMessage }) => (
    <TouchableOpacity 
      style={styles.chatRow} 
      activeOpacity={0.7}
      onPress={() => handleChatPress(item.id)} // Aciona a navegação ao clicar
    >
      <Image source={{ uri: item.foto }} style={styles.avatar} />
      
      <View style={styles.textContainer}>
        <View style={styles.topRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.nomeItem}
          </Text>
          <Text style={styles.timeText}>{item.horario}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={1}>
          {item.ultimaMensagem}
        </Text>
      </View>
    </TouchableOpacity>
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
          headerTitle: 'Chats',
          headerTintColor: '#434343',
          headerStyle: styles.drawerHeader,
          headerTitleStyle: styles.drawerTitle,
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu-outline" size={24} color="#434343" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="search-outline" size={24} color="#434343" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={chats} // Agora utiliza o estado dinâmico carregado do Firebase
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.footerButton} activeOpacity={0.8}>
          <Text style={styles.footerButtonText}>FINALIZAR UM PROCESSO</Text>
        </TouchableOpacity>
      </View>
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
    height: 56,
  },
  drawerTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 20,
    color: '#434343',
  },
  listContainer: {
    paddingVertical: 8,
  },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fafafa',
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#589b9b', 
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#589b9b',
  },
  messageText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575', 
  },
  separator: {
    height: 0.8,
    backgroundColor: '#ebe7e8', 
    marginLeft: 80, 
    marginRight: 16,
  },
  bottomContainer: {
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  footerButton: {
    width: 232, 
    height: 40,  
    borderWidth: 2,
    borderColor: '#88c9bf',
    borderRadius: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#434343',
  },
});