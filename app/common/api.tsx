import { useQuery, useMutation } from "@tanstack/react-query";
import { getSessionToken } from "./sessionToken";
import { usedConfig } from "./config";

const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = await getSessionToken();

  // Set default headers and add the session token
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { "X-SessionToken": token }),
  };

  const response = await fetch(
    `${usedConfig.api.url}/${usedConfig.api.versionCode}/${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useFetch = (key: string, endpoint: string) => {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiFetch(endpoint),
  });
};

export const usePost = (key: string, endpoint: string) => {
  return useMutation({
    mutationKey: [key],
    mutationFn: (data: any) =>
      apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
};
