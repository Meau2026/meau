import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
// Optionally import the services that you want to use
 import { initializeAuth, browserLocalPersistence, getReactNativePersistence} from 'firebase/auth';
// import {...} from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// import {...} from 'firebase/functions';

 import { getStorage } from 'firebase/storage';



import AsyncStorage from '@react-native-async-storage/async-storage';


// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig); //conexao com o firebase
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

// inicializacao dos servicos 
export const db = getFirestore(app);


// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);


// usamos async storage pra manter user logado apos fechar o app
let auth;

if (Platform.OS === 'web') {
  // Configuração para Web
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
} else {
  // Configuração para Mobile 
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
