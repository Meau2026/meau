import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import {
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
  nomeItem: string; // Nome da pessoa + Nome do animal (ex: AMANDA TEIXEIRA | PEQUI)
  ultimaMensagem: string;
  horario: string;
  foto: string; 
}

const CHAT_DATA: ChatMessage[] = [
  {
    id: '1',
    nomeItem: 'AMANDA TEIXEIRA | PEQUI',
    ultimaMensagem: 'Ele é uma gracinha! Posso ir vê-lo na...',
    horario: '18:32',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    id: '2',
    nomeItem: 'ELIAS ROCHA | BACON',
    ultimaMensagem: 'Ele gosta de criancas? Tenho uma fi...',
    horario: '14:12',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  },
  {
    id: '3',
    nomeItem: 'MARÍLIA MARTINS | BACON',
    ultimaMensagem: 'Olá! Gostaria de adotar o seu gato!',
    horario: '11:37',
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
  {
    id: '4',
    nomeItem: 'ANA LUÍSA | PLUTO',
    ultimaMensagem: 'Emille, tudo bem? Quando você esta...',
    horario: '07:37',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
];

export default function ChatScreen() {
  const router = useRouter();

  const renderChatItem = ({ item }: { item: ChatMessage }) => (
    <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
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

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
      <Drawer.Screen
        options={{
          headerTitle: 'Chat',
          headerTintColor: '#434343',
          headerStyle: styles.drawerHeader,
          headerTitleStyle: styles.drawerTitle,
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => router.back()}>
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
        data={CHAT_DATA}
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