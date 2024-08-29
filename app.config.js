export default ({ config }) => {
  const isProduction = process.env.APP_ENV !== "development";

  const appConfig = isProduction
    ? {
        auth: {
          url: "https://auth.divizend.com",
          clientId: "1d277b8c-eafa-49f2-a6b1-fa475ae1572c",
          tenantId: "0440c851-ab0b-d4ff-062a-34e04b26c680",
        },
        api: {
          url: "https://api.divizend.com",
          versionCode: "v1",
        },
      }
    : {
        auth: {
          url: "http://localhost:9011",
          clientId: "fa4aca16-0d68-433c-9b7f-24ccb1269d28",
          tenantId: "9c88929b-785c-5e8f-522b-760f28db724e",
        },
        api: {
          url: "http://localhost:3001",
          versionCode: "v1",
        },
      };

  return {
    ...config,
    name: "Divizend",
    slug: "companion",
    version: "1.0.0",
    owner: "divizend",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "divizend",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#00008f",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.divizend.companion",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#00008f",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router", "expo-secure-store", "expo-localization"],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...appConfig,
      eas: {
        projectId: "f08b7ace-61f4-44c3-b9cb-2e99ddfc47b1",
      },
    },
  };
};
