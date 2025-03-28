import React, { useCallback, useState } from 'react';

import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { apiGet } from '@/common/api';
import { impersonateUser } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { TextInput } from '@/components/base';

import ModalLayout from './global/ModalLayout';

interface ImpersonateUserModalProps {
  dismiss: () => void;
}

interface UserIdentity {
  id: string;
  text: string;
}

export default function ImpersonateUserModal({ dismiss }: ImpersonateUserModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [userIdentities, setUserIdentities] = useState<UserIdentity[]>([]);

  const searchUserIdentities = useCallback(
    debounce(async (searchEmail: string) => {
      if (searchEmail.trim() === '') {
        setUserIdentities([]);
        return;
      }
      try {
        const response = await apiGet(`/users`, { query: searchEmail });
        setUserIdentities(response);
      } catch (error) {
        console.error('Error searching users:', error);
        setUserIdentities([]);
      }
    }, 300),
    [],
  );

  const handleEmailChange = (text: string) => {
    setEmail(text);
    searchUserIdentities(text);
  };

  return (
    <ModalLayout
      title={t('settings.impersonateUser.title')}
      dismiss={() => {
        setEmail('');
        setUserIdentities([]);
        dismiss();
      }}
    >
      <View className="flex-1">
        <TextInput
          className="mb-5"
          value={email}
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={t('settings.impersonateUser.emailPlaceholder')}
        />
        {userIdentities.length > 0 ? (
          <SectionList
            items={userIdentities.map(userIdentity => ({
              title: userIdentity.text,
              onPress: () => impersonateUser(userIdentity.id),
            }))}
          />
        ) : null}
      </View>
    </ModalLayout>
  );
}
