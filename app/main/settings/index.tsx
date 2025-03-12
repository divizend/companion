import React, { useState } from 'react';

import { CheckBox } from '@rneui/themed';
import { router } from 'expo-router';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import RNRestart from 'react-native-restart';

import { apiDelete, apiPost, logout } from '@/common/api';
import { showConfirmationDialog } from '@/common/inputDialog';
import { impersonateUser, useUserProfile } from '@/common/profile';
import ImpersonateUserModal from '@/components/ImpersonateUserModal';
import SectionList from '@/components/SectionList';
import { useSnackbar } from '@/components/global/Snackbar';
import { ModalManager } from '@/components/global/modal';
import { showAlert } from '@/components/global/prompt';
import { useThemeColor } from '@/hooks/useThemeColor';

export const supportedLanguages = [
  'de-DE',
  'en-US',
  'fr-FR',
  'it-IT',
  'es-ES',
  'sv-SE',
  'pt-PT',
  'nl-NL',
  'fi-FI',
  'no-NO',
  'da-DK',
  'is-IS',
];

export default function SettingsView() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const { toggleTheme, theme } = useThemeColor();
  const { profile, isPrivileged, updateProfile } = useUserProfile();
  const [resettingProfileLoading, setResettingProfileLoading] = useState(false);
  const [togglingPrivilegeLoading, setTogglingPrivilegeLoading] = useState(false);
  const [changeLanguageToggleLoading, setChangeLanguageToggleLoading] = useState(false);

  if (!profile) {
    return null;
  }

  const handleLogout = async () => {
    if (await showConfirmationDialog(t('common.logout'), t('settings.logoutConfirmation'))) {
      await logout();
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

  const handleTogglePrivilegedMembership = async () => {
    if (togglingPrivilegeLoading === true) return;
    setTogglingPrivilegeLoading(true);
    try {
      await apiPost('/users/flag', {
        name: 'canAccessCompanionFeaturesWithoutSubscription',
        value: !profile.flags.canAccessCompanionFeaturesWithoutSubscription,
      });
      updateProfile(p => {
        p.flags.canAccessCompanionFeaturesWithoutSubscription = !p.flags.canAccessCompanionFeaturesWithoutSubscription;
      });
    } catch (error: any) {
      showSnackbar(error.message, { type: 'error' });
    } finally {
      setTogglingPrivilegeLoading(false);
    }
  };

  const handleChangeLanguage = async (newLanguage: string) => {
    if (changeLanguageToggleLoading === true) return;
    setChangeLanguageToggleLoading(true);
    try {
      await apiPost('/users/language', {
        language: newLanguage,
      });
      updateProfile(p => {
        p.flags.language = newLanguage;
      });
      return newLanguage;
    } catch (error: any) {
      showSnackbar(error.message, { type: 'error' });
    } finally {
      setChangeLanguageToggleLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5">
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
          {
            title: t('settings.currentPlan.title'),
            leftIcon: {
              name: 'star-outline',
              type: 'material',
            },
            onPress: () => router.navigate('/main/settings/plan'),
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
              onPress: () => ModalManager.showModal(ImpersonateUserModal),
              leftIcon: { name: 'person-outline', type: 'material' },
            },
            profile.impersonation
              ? {
                  title: t('settings.privilegedActions.endImpersonation'),
                  onPress: () => impersonateUser(profile.impersonation!.fromUserIdentityId),
                  leftIcon: { name: 'person-off', type: 'material' },
                }
              : null,
            {
              title: t('settings.privilegedActions.privilegedMembershipAccess'),
              onPress: handleTogglePrivilegedMembership,
              rightElement: (
                <CheckBox
                  wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
                  iconType="material-community"
                  checkedIcon="checkbox-marked"
                  uncheckedIcon="checkbox-blank-outline"
                  checkedColor={theme}
                  disabled={togglingPrivilegeLoading}
                  containerStyle={{
                    backgroundColor: 'transparent',
                    margin: 0,
                    padding: 0,
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                  checked={!!profile.flags.canAccessCompanionFeaturesWithoutSubscription}
                  onPress={handleTogglePrivilegedMembership}
                />
              ),
              leftIcon: { name: 'switch-access-shortcut', type: 'material' },
              disabled: togglingPrivilegeLoading,
            },
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
            title: t('settings.theme'),
            leftIcon: { name: 'dark-mode', type: 'material' },
            onPress: toggleTheme,
          },
          {
            title: t('common.logout'),
            leftIcon: { name: 'logout', type: 'material' },
            onPress: handleLogout,
          },
          {
            title: t('settings.accountSection.language'),
            leftIcon: {
              name: 'language',
              type: 'material',
            },
            onPress: () => {
              showAlert({
                title: t('settings.accountSection.language'),
                actions: supportedLanguages.map(language => ({
                  title: t(`language.${language?.split('-')?.[0]}`),
                  onPress: () =>
                    handleChangeLanguage(language).then(newLanguage =>
                      i18next.changeLanguage(newLanguage?.split('-')[1]),
                    ),
                })),
              });
            },
            disabled: !!changeLanguageToggleLoading,
            rightElement: t(`language.${profile.flags.language?.split('-')?.[0] || 'en'}`),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
});
