import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { useHeaderHeight } from '@react-navigation/elements'

import { SafeAreaView } from 'react-native-safe-area-context';


import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import {  useRouter,  } from 'expo-router';


import { db } from '@/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import {useAuth} from '@/contexts/AuthContext';
export default function Chat() {
  const test_id = 'ChQpRF4jAaGKSHHfjdV5'
  const [messages, setMessages] = useState([])
  const [_loading, set_Loading] = useState(true);
  const router = useRouter();


  const {user, loading} = useAuth(); 
  const headerHeight = useHeaderHeight()

  useEffect(() => { 
    const msgRef = collection(db, 'chats', test_id, 'mensagens');
    
    // pega as mensagens a partir da mais recente
    const msgQuery = query(msgRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(msgQuery, (snapshot) => {
      const newMsgs = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        _id: doc.id, 
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      
    });

    setMessages(newMsgs);
    set_Loading(false);
    }); 
    return () => unsubscribe();
  }, [test_id]);

  const onSend = useCallback( async (messages = []) => {
    if (messages.length === 0) return;

    const { text } = messages[0];

    try{
      const msgRef = collection(db, 'chats', test_id, 'mensagens');

      await addDoc(msgRef, {
        text: text,
        createdAt: serverTimestamp(),
        user: {
          _id: user.uid,
        },
      });

    } catch (e) {
      console.error("erro ao enviar mensagem: ", e);
    }

  }, [test_id])

  const userInfo = useMemo(() => ({
    _id: user?.uid,
    name: "Testando",
  }), [user?.uid]);

  if (loading || _loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#88c9bf" />
      </View>
    );
  }
  return (
    <SafeAreaView style={{flex:1}}>
 <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: "chat teste",
      headerStyle: styles.drawer_header,
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft:12}}  onPress={() => router.replace('index')}>
          <Ionicons name="arrow-back-outline" size={24} color='#434343' />
        </TouchableOpacity>
        ),

      headerRight: () => (
        <TouchableOpacity  style={{ marginRight: 12 }} >          
        <Ionicons name="share-social-outline" size={24} color='#434343'  />
        </TouchableOpacity>
        ),

    }}
  />

    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={userInfo}
      loadEarlier={false}
      keyboardAvoidingViewProps={{ keyboardVerticalOffset: headerHeight }}
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
  
  },


})
