import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { collection, doc, getDoc, onSnapshot, or, query, where } from 'firebase/firestore';
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

interface ChatMessage {
  id: string;
  nomeUser: string;
  nomeItem: string;
  ultimaMensagem: string;
  horario: string;
  foto: string; 
  timestamp: number;
  status?: number;
}

export default function ChatScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter(); 
  const { user } = useAuth(); 
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
      }

    const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          or(
            where('donoId', '==', user.uid),
            where('interessadoId', '==', user.uid)
          )
        );

        // atualiza lista de chats e mensagem mais recente (espero)
        const unsubscribe = onSnapshot(q, async (querySnapshot) =>{
          try{
            const chatPromises = querySnapshot.docs.map(async (chatDoc) =>{
              const data = chatDoc.data();
              const outroId = data.donoId === user.uid? data.interessadoId : data.donoId;

              //busca em paralelo no bd
              const [userDocSnap, animalDocSnap] = await Promise.all([
                getDoc(doc(db, 'users', outroId)),
                getDoc(doc(db, 'animais', data.animalId))
              ]);
              
              const nomeUsuario = userDocSnap.exists() ? userDocSnap.data().nome?.toUpperCase() : 'USUÁRIO';
              const nomeAnimal = animalDocSnap.exists() ? animalDocSnap.data().nome?.toUpperCase() : 'ANIMAL';

              const dataAtualizacao = data.createdAt?.toDate() || new Date();
            
              return {
                id: chatDoc.id,
                nomeUser: nomeUsuario,
                nomeItem: `${nomeUsuario} | ${nomeAnimal}`,
                ultimaMensagem: data.ultimaMensagem || 'Inicie a conversa...',
                horario: dataAtualizacao.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                foto: userDocSnap.exists() ? userDocSnap.data().fotoUrl : 'https://placehold.co/150.png',
                timestamp: dataAtualizacao.getTime(),
                status: data.status || 0,               };        


            })

            const listaChats = await Promise.all(chatPromises)
            
            // chat ordenado por mensagem mais recente
            listaChats.sort((a, b) => b.timestamp - a.timestamp);

            setChats(listaChats);

          } 
        catch (error) {
          console.error("Erro ao buscar conversas: ", error);
        } 
        finally {
          setLoading(false);
        }
        }); //ubsub


       
      return () => unsubscribe(); 
    }, [user]);

  const handleChatPress = (item: ChatMessage ) => {
    router.push({
      pathname: '/chat/chat', 
      params: { chatInfo:  JSON.stringify(item) }
    });
  };

  const renderChatItem = ({ item }: { item: ChatMessage }) => (
    <TouchableOpacity 
      style={styles.chatRow} 
      activeOpacity={0.7}
      onPress={() => handleChatPress(item)}
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
        data={chats}
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
