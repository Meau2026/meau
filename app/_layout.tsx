import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// garante que o user acesse o app direto caso ja esteja logado, se n, 
// carrega tela de login
function RoutingControl() {
  const { user, loading } = useAuth();
  const segments = useSegments(); // partes do path
  const router= useRouter();

  useEffect(() => {
    if (loading) return; //firebase ainda nao esta pronto

    const isLogin = segments[0] === 'login';
    
    if (!user && !isLogin) {
    // user nao esta logado
      router.replace('/login'); 
    } else if(user && isLogin){
      // user logado e esta na tela de login
      router.replace('/(tabs)');
    } 


  }, [user, loading, segments]);

  if  (loading) {
    return(
      <View>
      <ActivityIndicator size="large"/>
      </View>

    );
  }
  return (

      <Stack>
        <Stack.Screen name="login" options={{headerShown: false}}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
     <RoutingControl/> 
      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthProvider>
  );
}
