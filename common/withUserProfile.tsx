import { useEffect } from 'react';

import { router } from 'expo-router';
import { Alert } from 'react-native';

import { queryClient } from '@/app/_layout';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { t } from '@/i18n';

import { logout } from './api';
import { useUserProfileQuery } from './queries';
import { deleteSessionToken, withSessionToken } from './sessionToken';

export const withUserProfile = (Component: React.FC) => {
  return withSessionToken((props: any) => {
    const { data, error, isLoading } = useUserProfileQuery();

    const doErrorAlert = () =>
      Alert.alert(t('common.error'), error?.message, [
        {
          text: t('common.retry'),
          onPress: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
          },
        },
        {
          text: t('common.logout'),
          onPress: async () => {
            try {
              await logout(true);
            } catch (error) {
              doErrorAlert();
            }
          },
        },
      ]);

    useEffect(() => {
      // if the user got a 401, it means his session token is invalid
      if (error?.httpStatus === 401) {
        deleteSessionToken();
        router.replace('/');
      } else if (error) {
        doErrorAlert();
      }
    }, [error]);

    if (isLoading) {
      return <FullScreenActivityIndicator />;
    }

    if (!data) {
      return null;
    }

    return <Component {...props} />;
  });
};
