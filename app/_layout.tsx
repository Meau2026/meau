import { Drawer } from 'expo-router/drawer';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


import {
  DrawerContentComponentProps,
  DrawerItem
} from '@react-navigation/drawer';

import { Alert, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useNavigation } from 'expo-router';


import { useColorScheme } from '@/hooks/use-color-scheme';


import { useFonts, Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Courgette_400Regular } from '@expo-google-fonts/courgette';




const createLocalNavegation = (props: DrawerContentComponentProps) => {
  return (route) => {
    props.navigation.navigate(route);
  }
}

const Separator = () => (<View style={styles.separator} />);


function Header(props: DrawerContentComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const {user , loading } = useAuth();
  const navigate = createLocalNavegation(props)

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
        onPress={() => navigate('index')}
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
          <View style={styles.picture_placeholder} />
          <View style={styles.header_expand_button}>
            <Text style={styles.text_title}> Nome do Cidadao </Text>
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
