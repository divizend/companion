import React, { useState } from 'react';

import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { StyleSheet } from 'react-native';
import RNRestart from 'react-native-restart';

import { apiDelete, logout } from '@/common/api';
import { showConfirmationDialog } from '@/common/inputDialog';
import { impersonateUser, useUserProfile } from '@/common/profile';
import ImpersonateUserModal from '@/components/ImpersonateUserModal';
import ModalView from '@/components/ModalView';
import SectionList from '@/components/SectionList';
import { t } from '@/i18n';

interface SettingsViewProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsView({ visible, onClose }: SettingsViewProps) {
  const { toggleColorScheme } = useColorScheme();
  const { profile, isPrivileged } = useUserProfile();
  const [resettingProfileLoading, setResettingProfileLoading] = useState(false);
  const [impersonateModalVisible, setImpersonateModalVisible] = useState(false);

  if (!profile) {
    return null;
  }

  const handleLogout = async () => {
    if (await showConfirmationDialog(t('common.logout'), t('common.logoutConfirmation'))) {
      await logout();
      onClose();
      router.replace('/');
    }
  };

  const handleResetProfile = async () => {
    const confirmed = await showConfirmationDialog(
      t('settings.resetProfile.title'),
      t('settings.resetProfile.message'),
    );
    if (confirmed) {
      setResettingProfileLoading(true);
      try {
        await apiDelete('/companion');
        RNRestart.Restart();
      } finally {
        setResettingProfileLoading(false);
      }
    }
  };

  return (
    <ModalView visible={visible} onClose={onClose} title={t('settings.title')}>
      <SectionList
        title={t('settings.accountSection.title')}
        items={[
          {
            title: t('settings.accountSection.email'),
            leftIcon: { name: 'mail-outline', type: 'material' },
            rightElement: profile.email,
          },
          {
            title: t('settings.resetProfile.title'),
            leftIcon: {
              name: resettingProfileLoading ? 'hourglass-empty' : 'delete-outline',
              type: 'material',
            },
            onPress: handleResetProfile,
            disabled: resettingProfileLoading,
          },
        ]}
        bottomText={t('settings.accountSection.bottomText')}
        containerStyle={styles.container}
      />

      {isPrivileged && (
        <SectionList
          title={t('settings.privilegedActions.title')}
          items={[
            {
              title: t('settings.privilegedActions.impersonateUser'),
              onPress: () => setImpersonateModalVisible(true),
              leftIcon: { name: 'person-outline', type: 'material' },
            },
            profile.impersonation
              ? {
                  title: t('settings.privilegedActions.endImpersonation'),
                  onPress: () => impersonateUser(profile.impersonation!.fromUserIdentityId),
                  leftIcon: { name: 'person-off', type: 'material' },
                }
              : null,
          ].filter(x => !!x)}
          bottomText={
            profile.impersonation
              ? t('settings.privilegedActions.currentImpersonation', {
                  email: profile.impersonation.fromEmail,
                })
              : undefined
          }
          containerStyle={styles.container}
        />
      )}

      <SectionList
        items={[
          {
            title: t('common.logout'),
            leftIcon: { name: 'logout', type: 'material' },
            onPress: handleLogout,
          },
          {
            title: t('settings.theme'),
            leftIcon: { name: 'dark-mode', type: 'material' },
            onPress: toggleColorScheme,
          },
        ]}
      />

      <ImpersonateUserModal visible={impersonateModalVisible} onClose={() => setImpersonateModalVisible(false)} />
    </ModalView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
});
