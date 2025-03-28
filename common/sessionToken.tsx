import { useEffect, useState } from 'react';

import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export const SESSION_TOKEN_KEY = 'sessionToken';

export function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export function deleteSessionToken(): Promise<void> {
  return SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

export function useSessionToken(): [string | null, boolean] {
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken();
        setSessionToken(token);
        setLoading(false);
      } catch (error) {
        console.error('Error retrieving session token:', error);
      }
    })();
  }, []);

  return [sessionToken, loading];
}

export function withSessionToken(Component: React.FC) {
  return (props: any) => {
    const [sessionToken, sessionTokenLoading] = useSessionToken();

    if (sessionTokenLoading) {
      return null;
    } else if (!sessionToken) {
      router.replace('/');
      return null;
    }

    return <Component {...props} />;
  };
}
