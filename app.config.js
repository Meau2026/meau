import 'dotenv/config';

export default {
  expo: {
    name: "meau",
    slug: "meau",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/Meau_Icone.png",
    scheme: "meau",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Precisamos da sua localização para que você possa marcar onde o animal se encontra.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Precisamos da sua localização para que você possa marcar onde o animal se encontra."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/Meau_Icone.png",
        backgroundColor: "#ffd358"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.meau",
      googleServicesFile: "./google-services.json",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "POST_NOTIFICATIONS"
      ],
      config: {
        googleMaps: {
          
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/Meau_Icone.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffd358",
          dark: {
            backgroundColor: "#ffd358"
          }
        }
      ],
      "expo-font"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "669bc486-b10f-44e1-86ef-6a32e1e2a8b9"
      }
    }
  }
};
