import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { GiftedChat, Bubble, InputToolbar, Composer, Send, type BubbleProps, type InputToolbarProps, type ComposerProps, type SendProps, type IMessage } from 'react-native-gifted-chat'
import { useHeaderHeight } from '@react-navigation/elements'

import { SafeAreaView } from 'react-native-safe-area-context';


import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import {  useRouter,  useLocalSearchParams} from 'expo-router';


import { db } from '@/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import {useAuth} from '@/contexts/AuthContext';


interface ChatData{
  id: string;
  nomeUser: string;
  nomeItem: string;
  ultimaMensagem: string;
  horario: string;
  foto: string; 
};

function CustomBubble(props: BubbleProps<IMessage>) {

  return (
  <Bubble
  {...props}
    wrapperStyle={{
          right: {
            backgroundColor: '#cfe9e5', 
            borderRadius: 4,    
            marginRight: 16,
          },
          left: {
            backgroundColor: '#ffffff',
            borderRadius: 4,
            marginLeft: 16,
          },
        }}
    textStyle={{
          right: {
            color: '#434343',          
            fontFamily: 'Roboto-Regular',     
            fontSize: 14,
          },
          left: {
            color: '#434343',          
            fontFamily: 'Roboto-Regular',     
            fontSize: 14,
          },
        }}

  />

  );

}


function CustomInputToolbar(props: InputToolbarProps<IMessage>) {

  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: '#f1f2f2',
        borderTopWidth: 0,          
        paddingBottom: 4,
        paddingTop: 4,
      }}
      primaryStyle={{ alignItems: 'flex-end' }} 
    />
  );
}

function CustomComposer(props: ComposerProps) {

return (
    <Composer
      {...props}
      textInputStyle={{
        backgroundColor: '#ffffff', 
        minHeight: 54,
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        marginLeft: 16,
        marginBottom: 12,
        //texto
        color: '#434343',          
        fontFamily: 'Roboto-Regular',        
        fontSize: 14,
      }}
    />
  );
}

function CustomSend(props: SendProps<IMessage>) {

return (
  <Send {...props} containerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
   <View style={styles.send_buttom}>
       
        <Ionicons name="send" size={24} color="#ffffff" style={{marginLeft: 3}} />

      </View> 
  </Send>
);

}

export default function Chat() {
  const { chatInfo } = useLocalSearchParams(); 
  const [chat, setChat] = useState<ChatData | null>(null); 
  const [messages, setMessages] = useState<IMessage[]>([])
  const [_loading, set_Loading] = useState(true);
  const router = useRouter();


  const {user, loading} = useAuth(); 
  const headerHeight = useHeaderHeight()

  useEffect(() => {
    let chatinfo;
    if(!chatInfo || typeof chatInfo !== 'string'){
      
      return;
    }

    try{
      chatinfo = JSON.parse(chatInfo as string);
      setChat(chatinfo);
      

    } catch(e) { 
      console.error("nao foi possivel carregar as informacoes do chat");
      return;
    }
   
    if (!chatinfo?.id) return;
    const msgRef = collection(db, 'chats', chatinfo.id, 'mensagens');
    
    // pega as mensagens a partir da mais recente
    //
    const msgQuery = query(msgRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(msgQuery, (snapshot) => {
      const newMsgs: IMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text ?? '',
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          user: data.user ?? { _id: '' },
          // include any other fields if needed
        } as IMessage;
      });
      
      setMessages(newMsgs);
      set_Loading(false);
    }); 
    return () => unsubscribe();
  }, [chatInfo, user?.uid]);

  const onSend = useCallback( async (messages: IMessage[] = []) => {
    if (messages.length === 0 || !chat?.id) return;

    const { text } = messages[0];

    try{
      console.log(chat.id);
      const msgRef = collection(db, 'chats', chat.id, 'mensagens');

      await addDoc(msgRef, {
        text: text,
        createdAt: serverTimestamp(),
        user: {
          _id: user?.uid ?? '',
        },
      });

    } catch (e) {
      console.error("erro ao enviar mensagem: ", e);
    }

  }, [chat?.id, user?.uid])

  const userInfo = useMemo(() => ({
    _id: user?.uid ?? 'unknown',
    name: user?.displayName ?? "Usuário",
  }), [user?.uid, user?.displayName]);

  if (loading || _loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#88c9bf" />
      </View>
    );
  }
  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#f1f2f2',
}}>
 <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: chat?.nomeUser || "",
      headerStyle: styles.drawer_header,
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft:12}}  onPress={() => router.replace('/chat/meus_chats')}>
          <Ionicons name="arrow-back-outline" size={24} color='#434343' />
        </TouchableOpacity>
        ),

      headerRight: () => (
        <TouchableOpacity  style={{ marginRight: 12 }} >          
        <Ionicons name="ellipsis-vertical" size={24} color='#434343'  />
        </TouchableOpacity>
        ),

    }}
  />

    <GiftedChat<IMessage>
        key={user?.uid}
        messages={messages as IMessage[]}
        onSend={messages => onSend(messages as IMessage[])}
        user={userInfo}
        loadEarlier={false}
        renderBubble={(props) => <CustomBubble {...props} />}
        renderAvatar={null}
        renderSend={(props) => <CustomSend {...props} />}
        renderInputToolbar={(props) => <CustomInputToolbar {...props} />}
        renderComposer={(props) => <CustomComposer {...props} />}
        alwaysShowSend={true}
        // keyboardAvoidingViewProps is not in TypeScript definitions; use any cast if needed
        {...({ keyboardAvoidingViewProps: { keyboardVerticalOffset: headerHeight } } as any)}
        placeholder="Digite sua mensagem..."
      />
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#f1f2f2',
  },
  drawer_header: {
    backgroundColor: '#cfe9e5',
 
  },
  send_buttom: {
    width: 44,
    height: 44,
    marginBottom: 32,
    marginRight: 16,
    marginLeft: 16,
    backgroundColor: '#88c9bf',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },


})
