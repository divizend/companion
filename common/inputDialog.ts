import { Alert } from 'react-native';

import { t } from '@/i18n';

export function showConfirmationDialog(title: string, message?: string): Promise<boolean> {
  return new Promise(resolve => {
    Alert.alert(title, message, [
      {
        text: t('common.cancel'),
        onPress: () => resolve(false),
        style: 'cancel',
      },
      {
        text: t('common.yes'),
        onPress: () => resolve(true),
      },
    ]);
  });
}
