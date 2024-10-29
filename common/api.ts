import { useMutation, useQuery } from '@tanstack/react-query';
import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { queryClient } from '../app/_layout';
import { usedConfig } from './config';
import { getSessionToken } from './sessionToken';
import { deleteSessionToken } from './sessionToken';

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = await getSessionToken();

  // Set default headers and add the session token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'X-SessionToken': token }),
  };

  const response = await fetch(`${usedConfig.api.url}/${usedConfig.api.versionCode}/${endpoint}`, {
    ...options,
    body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
    headers,
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // ignore
  }

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}${
        json?.error?.message
          ? ` (${json?.error?.message}${response.status === 422 ? ': ' + JSON.stringify(json?.error?.details) : ''})`
          : ''
      }`,
    );
  }

  return json;
};

export const apiGet = (endpoint: string, queryParams?: Record<string, string>) => {
  return apiFetch(endpoint + (queryParams ? '?' + new URLSearchParams(queryParams).toString() : ''), { method: 'GET' });
};

export const apiPost = <T = any>(endpoint: string, body: any) => {
  return apiFetch(endpoint, {
    method: 'POST',
    body,
  }) as Promise<T>;
};

export const apiDelete = (endpoint: string) => {
  return apiFetch(endpoint, {
    method: 'DELETE',
  });
};

export const useFetch = <T = any>(key: string, endpoint?: string) => {
  return useQuery<T>({
    queryKey: [key],
    queryFn: endpoint ? () => apiFetch(endpoint) : undefined,
  });
};

export const usePost = (key: string, endpoint: string) => {
  return useMutation({
    mutationKey: [key],
    mutationFn: (data: any) =>
      apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
};

export async function logout(throwOnError?: boolean) {
  const sessionToken = await getSessionToken();
  const resp = await WebBrowser.openAuthSessionAsync(
    `${usedConfig.api.url}/${usedConfig.api.versionCode}/auth/logout/${sessionToken}?` +
      new URLSearchParams({
        postLogoutRedirectUri: makeRedirectUri({ scheme: 'divizend', path: 'authcallback' }),
      }).toString(),
    makeRedirectUri({ scheme: 'divizend', path: 'authcallback' }),
  );

  if (resp.type === 'success') {
    await deleteSessionToken();
    queryClient.clear();
    router.replace('/');
  } else if (throwOnError) {
    throw new Error('Logout failed');
  }
}
