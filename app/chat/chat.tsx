import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { useHeaderHeight } from '@react-navigation/elements'

import { SafeAreaView } from 'react-native-safe-area-context';


import { StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import {  useRouter,  } from 'expo-router';
export default function Chat() {
  const [messages, setMessages] = useState([])
  const router = useRouter();
  // keyboardVerticalOffset = distance from screen top to GiftedChat container
  // useHeaderHeight() returns status bar + navigation header height
  const headerHeight = useHeaderHeight()

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Test 1',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'John Doe',  
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
 {
        _id: 2,
        text: 'alo alo',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'John Doe',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },

    ])
  }, [])

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    )
  }, [])

  return (
    <SafeAreaView style={{flex:1}}>
 <Drawer.Screen
    options = {{
      headerTintColor: '#434343',
      headerTitle: "chat teste",
      headerStyle: styles.drawer_header,
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft:12}}  onPress={() => router.replace('/index')}>
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
      user={{
        _id: 4,
      }}
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
