import { Drawer } from 'expo-router/drawer';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { router } from 'expo-router';
import {
  DrawerContentComponentProps,
  DrawerItem
} from '@react-navigation/drawer';

import { ActivityIndicator, Alert, Image, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useLastNotificationResponse} from 'expo-notifications';
import { auth, db, storage } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';


import { useColorScheme } from '@/hooks/use-color-scheme';


import { Courgette_400Regular } from '@expo-google-fonts/courgette';
import { Roboto_400Regular, Roboto_500Medium, useFonts } from '@expo-google-fonts/roboto';


//notificacoes

import { registerPushNotification } from '@/hooks/use-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface UserInfo {
  nome: string;
  fotoPerfil?: string;
}

const createLocalNavegation = (props: DrawerContentComponentProps) => {
  // Explicitly type the route parameter as a string to satisfy TypeScript
  return (route: string) => {
    props.navigation.navigate(route);
  };
};

const Separator = () => (<View style={styles.separator} />);


function Header(props: DrawerContentComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const {user , loading } = useAuth();
  const navigate = createLocalNavegation(props)
  const [userInfo, setUserInfo] = useState<UserInfo>({nome: "", fotoPerfil: undefined});
  useEffect(() =>{

    const getUserData = async () => {
      if (!user?.uid) return;
      try{
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if(userDoc.exists()){
        const data = userDoc.data();
        let urlPerfil;
        
        if (data.fotoUrl) {
            try {
              urlPerfil = await getDownloadURL(ref(storage, data.fotoUrl));
            } catch (e) {
              console.error(e);
            }
          }

        setUserInfo({
          nome: data.nome,
          fotoPerfil: urlPerfil,
        })
        }
      }catch(e){console.error(e)}
    }

  

  getUserData()

  }, [user?.uid]);
  const body = (
    <View>
    { !user &&
      <>
      <DrawerItem
        label='Cadastrar perfil'
        labelStyle={styles.text_entry}
        onPress={() => navigate('cadastrar_usuario')}
      />
      <Separator />
    </>
    }
    { user &&
      <>
      <DrawerItem
        label='Meu perfil'
        labelStyle={styles.text_entry}
        onPress={() => navigate('index')}
      />
      <Separator />
          
      <DrawerItem
        label='Meus pets'
        labelStyle={styles.text_entry}

        onPress={() => navigate('meus_pets/index')}
      />
      <Separator />
      </>
      }
      <DrawerItem
        label='Favoritos'
        labelStyle={styles.text_entry}

        onPress={() => navigate('index')}
      />
      <Separator />
      <DrawerItem
        label='Chat'
        labelStyle={styles.text_entry}
        onPress={() => navigate('chat/meus_chats')}
      />
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}>

        <View style={styles.header}>
          
          <View style={styles.picture_placeholder}>
<Image
          source={userInfo.fotoPerfil ? {uri: userInfo.fotoPerfil} : undefined}
          style={styles.foto_perfil}
        />

          </View>
          <View style={styles.header_expand_button}>
            <Text style={styles.text_title}> {user? userInfo.nome : 'Visitante'} </Text>
            <Ionicons name="chevron-down" size={24} />
          </View>
        </View>
      </TouchableOpacity>

      {expanded && body}
    </View>

  );


}



function Atalhos(props: DrawerContentComponentProps) {
  const [expanded, setExpanded] = useState(false);

  const { user, loading } = useAuth();
  const navigate = createLocalNavegation(props)

  const body = (
    <View>
    { user && <>
      <DrawerItem
        label='Cadastar um pet'
        labelStyle={styles.text_entry}
        onPress={() => navigate('cadastrar_animal')}
      />
      <Separator />
      </>
    }
      <DrawerItem
        label='Adotar um pet'
        labelStyle={styles.text_entry}

        onPress={() => navigate('adotar_pets/index')}
      />

  { user && <>
       <Separator />
      <DrawerItem
        label='Finalizar processo'
        labelStyle={styles.text_entry}

        onPress={() => navigate('finalizar_processo/index')}
      />
      
      </>
    }
 
      <Separator />
      <DrawerItem
        label='Pets no mapa'
        labelStyle={styles.text_entry}
        onPress={() => navigate('mapa_panoramico')}
      />

    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.atalhos}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}>
        <View style={styles.expand_buttons}>
          <View style={styles.expand_buttons_internal}>
            <Ionicons name="paw" size={24} />
            <Text style={styles.text_title}> Atalhos</Text>
          </View>
          <Ionicons name="chevron-down" size={24} />
        </View>


      </TouchableOpacity>

      {expanded && body}
    </View>

  );

}

function Informacoes(props: DrawerContentComponentProps) {
  const [expanded, setExpanded] = useState(false);

  const navigate = createLocalNavegation(props)

  const body = (
    <View>
      <DrawerItem
        label='Dicas'
        labelStyle={styles.text_entry}
        onPress={() => navigate('index')}
      />
      <Separator />
          <DrawerItem
        label='Termo de adoção'
        labelStyle={styles.text_entry}
        onPress={() => navigate('index')}
      />
      <Separator />
      <DrawerItem
        label='Histórias de adoção'
        labelStyle={styles.text_entry}

        onPress={() => navigate('index')}
      />

    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.informacoes}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}>
        <View style={styles.expand_buttons}>
          <View style={styles.expand_buttons_internal}>
            <Ionicons name="information-circle-outline" size={24} />
            <Text style={styles.text_title}> Informações</Text>
          </View>
          <Ionicons name="chevron-down" size={24} />
        </View>
      </TouchableOpacity>

      {expanded && body}
    </View>

  );

}

function Configuracoes(props: DrawerContentComponentProps) {
  const [expanded, setExpanded] = useState(false);

  const navigate = createLocalNavegation(props)

  const body = (
    <View>
      <DrawerItem
        label='Privacidade'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
      />
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.configuracoes}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}>
        <View style={styles.expand_buttons}>
          <View style={styles.expand_buttons_internal}>
            <Ionicons name="settings-outline" size={24} />
            <Text style={styles.text_title}> Configurações</Text>
          </View>
          <Ionicons name="chevron-down" size={24} />
        </View>


      </TouchableOpacity>

      {expanded && body}
    </View>

  );

}





function LogoutButton(props: DrawerContentComponentProps) {
  const { user, loading } = useAuth();
 

  if(user){
  return (
    <TouchableOpacity
      style={styles.logout_button}
      onPress={async () => {
        try {
          await signOut(auth);
          props.navigation.navigate('index');
        } catch (error: any) {
            Alert.alert("Erro ao sair", error.message);
          }
      }}
    >
      <Text> Sair </Text>
    </TouchableOpacity>
  );
  }

  return null;

}

function CustomDrawerContent(props: DrawerContentComponentProps) {


  return (


    <SafeAreaView style={styles.drawer} edges={['bottom', 'left', 'right']} >
      <Header{...props} />
      <Atalhos{...props} />
      <Informacoes{...props} />
      <Configuracoes{...props} />
      <LogoutButton{...props} />

    </SafeAreaView>
  );

}


 function RoutingControl() {

  const { user , loading } = useAuth();
const lastNotificationResponse = useLastNotificationResponse();

  //cadastra o user pra receber notificacao  
    useEffect(() =>{
   
    if (!user?.uid) return;
   
    async function setupNofitications(){
      const token = await registerPushNotification();
      
      if(token){
   
       const tokenSalvoLocalmente = await AsyncStorage.getItem('expoPushToken');
       // se o token ja tiver no storage ele ta no firebase, n precisa atualizar
       if (token !== tokenSalvoLocalmente) {
            const userRef = doc(db, 'users', user!.uid);
            await updateDoc(userRef, {
              expoPushToken: token
            });

       if (token !== tokenSalvoLocalmente) {
            
          await AsyncStorage.setItem('expoPushToken', token);
          }   
    
      }
    }

    setupNofitications();
  }, [user?.uid]);


// pro botao da notificacao de adocao levar pro chat
useEffect(() => {
    // Se o app abriu normalmente (sem clicar em notificação), ignora e sai.
    if (!lastNotificationResponse) return;

    // Se abriu por notificação, rodamos a lógica assíncrona
    const processarNotificacao = async () => {
      const actionIdentifier = lastNotificationResponse.actionIdentifier;
      const chatId = lastNotificationResponse.notification.request.content.data.chatId;

      if (!chatId) return;

      try {
        const chatRef = doc(db, 'chats', chatId);

        if (actionIdentifier === 'ACCEPT_ACTION') {
          console.log("Usuário ACEITOU o chat!");
          await updateDoc(chatRef, { status: '1' });
          
          const chatSnap = await getDoc(chatRef);
          
          if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const outroId = chatData.interessadoId;

            const [userDocSnap, animalDocSnap] = await Promise.all([
              getDoc(doc(db, 'users', outroId)),
              getDoc(doc(db, 'animais', chatData.animalId))
            ]);

            const nomeUsuario = userDocSnap.exists() ? userDocSnap.data().nome?.toUpperCase() : 'USUÁRIO';
            const nomeAnimal = animalDocSnap.exists() ? animalDocSnap.data().nome?.toUpperCase() : 'ANIMAL';
            const dataAtualizacao = chatData.createdAt?.toDate() || new Date();

            const chatItem = {
              id: chatId,
              nomeUser: nomeUsuario,
              nomeItem: `${nomeUsuario} | ${nomeAnimal}`,
              ultimaMensagem: chatData.ultimaMensagem || 'Inicie a conversa...',
              horario: dataAtualizacao.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              foto: userDocSnap.exists() ? userDocSnap.data().fotoUrl : 'https://placehold.co/150.png',
              timestamp: dataAtualizacao.getTime(),
            };

            // Redireciona com os dados montados
            router.push({
              pathname: '/chat/chat', 
              params: { chatInfo: JSON.stringify(chatItem) }
            });
          } 
          
        } else if (actionIdentifier === 'REJECT_ACTION') {
          console.log("Usuário REJEITOU o chat!");
          await updateDoc(chatRef, { status: 'rejected' });
        }
      } catch (error) {
        console.error("Erro ao atualizar status do chat:", error);
      }
    };

    // Executa a função 
    processarNotificacao();

  }, [lastNotificationResponse]); 
 
  if(loading) {
    return(
      <View>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
  return (
    <Drawer
      screenOptions={{
        drawerStyle: { width: 304 },
        drawerActiveTintColor: '#f7f7f7',
        drawerLabelStyle: {
          color: '#434343',
          fontFamily: 'Roboto-Regular'

        }
      }}
      drawerContent={CustomDrawerContent} />);


}


export default function RootLayout(){

  const colorScheme = useColorScheme();


  const [loaded, error] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium' : Roboto_500Medium,
    'Courgette': Courgette_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);


  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
     <RoutingControl/> 
      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthProvider>
  );



}


const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#f7f7f7',
    flex: 1
  },
  header: {
    height: 172,
    width: 304,
    backgroundColor: '#88c9bf',
    paddingTop: 40,        // Protege o topo para a foto
    paddingBottom: 12,     // Protege a base para o texto/ícone
    paddingHorizontal: 16, // Protege as laterais (16dp esquerda e direita)

    // Separa os filhos: joga a foto para cima e a View de texto para baixo
    justifyContent: 'space-between',
  },
  picture_placeholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee29b',
  },
  foto_perfil:{
    width: '100%',
    height: '100%',
    borderRadius: 32
  },
  header_expand_button: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  expand_buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,

  },
  expand_buttons_internal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  logout_button: {
    height: 48,
    width: 304,
    backgroundColor: '#88c9bf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhos: {
    height: 48,
    width: 304,
    backgroundColor: '#fee29b',
    justifyContent: 'center',
  },
  informacoes: {
    height: 48,
    width: 304,
    backgroundColor: '#cfe9e5',
    justifyContent: 'center',

  },
  configuracoes: {
    height: 48,
    width: 304,
    backgroundColor: '#e6e7e8',
    justifyContent: 'center',

  },
  separator: {
    width: 256,
    height: 1,
    backgroundColor: '#e6e7e8',
    marginLeft: 48,
  },
  text_title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#434343',
  },
  text_entry: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#434343',
    marginLeft: 48,
  }




})
