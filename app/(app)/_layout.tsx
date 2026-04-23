import { Drawer } from 'expo-router/drawer';


import {
  DrawerContentComponentProps,
  DrawerItem
} from '@react-navigation/drawer';

import { Alert, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import React, { useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';


const handleLogout = async () => {
  try {
    await signOut(auth);

  } catch (error: any) {
    Alert.alert("Erro ao sair", error.message);
  }
};



const createLocalNavegation = (props: DrawerContentComponentProps) => {
  return (route) => {
    props.navigation.navigate(route);
  }
}

const Separator = () => (<View style={styles.separator} />);


function Header(props: DrawerContentComponentProps) {
  const [expanded, setExpanded] = useState(false);

  const navigate = createLocalNavegation(props)

  const body = (
    <View>
      <DrawerItem
        label='Cadastrar perfil'
        labelStyle={styles.text_entry}
        onPress={() => navigate('tela_cadastro_pessoa')}
      />
      <Separator />
      <DrawerItem
        label='Meu perfil'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Meus pets'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Favoritos'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Chat'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
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

  const navigate = createLocalNavegation(props)

  const body = (
    <View>
      <DrawerItem
        label='Cadastar um pet'
        labelStyle={styles.text_entry}
        onPress={() => navigate('tela_cadastro_animal')}
      />
      <Separator />
      <DrawerItem
        label='Adotar um pet'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Ajudar um pet'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Apadrinhar um pet'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
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
        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Eventos'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Legislação'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Termo de adoção'
        labelStyle={styles.text_entry}
        onPress={() => navigate('hello')}
      />
      <Separator />
      <DrawerItem
        label='Histórias de adoção'
        labelStyle={styles.text_entry}

        onPress={() => navigate('hello')}
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

function LogoutButton() {


  return (
    <TouchableOpacity
      style={styles.logout_button}
      onPress={handleLogout}
    >
      <Text> Sair </Text>
    </TouchableOpacity>
  );

}

function CustomDrawerContent(props: DrawerContentComponentProps) {

  return (


    <SafeAreaView style={styles.drawer} edges={['bottom', 'left', 'right']} >
      <Header{...props} />
      <Atalhos{...props} />
      <Informacoes{...props} />
      <Configuracoes{...props} />
      <LogoutButton />

    </SafeAreaView>
  );

}


export default function DrawerLayout() {

  const colorScheme = useColorScheme();

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
