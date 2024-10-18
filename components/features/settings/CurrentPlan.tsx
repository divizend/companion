import React from 'react';

import { Icon } from '@rneui/base';
import { View } from 'react-native';

import SectionList from '@/components/SectionList';
import StyledButton from '@/components/StyledButton';
import { ScrollScreen, Text } from '@/components/base';
import '@/global.css';
import { usePrompt } from '@/hooks/usePrompt';
import { useThemeColor } from '@/hooks/useThemeColor';

import SubscriptionCarousel from '../subscription/SubscriptionCarousel';

export default function CurrentPlan() {
  const theme = useThemeColor();
  const { showCustom } = usePrompt();
  return (
    <>
      <ScrollScreen style={{ flex: 1 }}>
        {/* Crown subscription showoff */}
        <View className="rounded-full bg-secondary-light mb-8 self-center p-8 shadow-lg shadow-theme">
          <Icon color={theme.theme} name="crown-outline" type="material-community" size={80}></Icon>
        </View>

        <View className="flex flex-row justify-center items-center gap-2">
          <View className="w-2 h-2 dark:bg-green-400 bg-green-600 rounded-full" />
          <Text type="success" className="text-center">
            Active
          </Text>
        </View>
        <Text h1 className="text-center mb-8 font-semibold">
          Basic Plan
        </Text>

        {/* Free tiral notice */}
        <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
          <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
            <Icon name="info" type="material" size={20} color={theme.text} />
          </View>
          <Text h4 className="max-w-[85%] font-bold text-center">
            Your free trial will end on July 1, 2024 at 12:00 AM
          </Text>
          <Text type="muted" className="max-w-[95%] text-center">
            After that you will be automatically billed $49.99
          </Text>
        </View>
        {/* Plan details table */}
        <View className="gap-4 mb-8 px-6 py-5">
          <View className="flex flex-row">
            <Text type="muted" className="flex-1">
              Plan
            </Text>
            <Text className="flex-1 font-bold">Basic</Text>
          </View>

          <View className="flex flex-row">
            <Text type="muted" className="flex-1">
              Price
            </Text>
            <Text className="flex-1 font-bold">$49.99/month</Text>
          </View>

          <View className="flex flex-row">
            <Text type="muted" className="flex-1">
              Next billing date
            </Text>
            <Text className="flex-1 font-bold">July 1, 2024</Text>
          </View>
        </View>
      </ScrollScreen>
      <StyledButton
        title={
          <Text
            style={{
              textAlign: 'center',
              color: theme.allColors.dark.text,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            Manage plan
          </Text>
        }
        onPress={() => showCustom(SubscriptionCarousel)}
        buttonStyle={{ backgroundColor: theme.theme, borderRadius: 12, marginBottom: 5 }}
      />
      <StyledButton
        title={
          <Text
            style={{
              textAlign: 'center',
              color: theme.text,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            Cancel plan
          </Text>
        }
        buttonStyle={{ borderRadius: 12, backgroundColor: theme.backgroundSecondary }}
      />
    </>
  );
}
