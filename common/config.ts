import Constants from 'expo-constants';

export type Config = {
  auth: {
    url: string;
    clientId: string;
    tenantId: string;
  };
  api: {
    url: string;
    versionCode: string;
  };
  secapiImportUrl: string;
  actorUrl: string;
  actorApi: {
    url: string;
    versionCode: string;
  };
  actorStaticUrl: string;
  revenueCat: {
    playStore: string;
    appStore: string;
  };
};

export const usedConfig = Constants.expoConfig!.extra! as Config;
