import { useSignalEffect } from '@preact/signals-react';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { Avatar, Icon } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { router, useSegments } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useUserProfile } from '@/common/profile';
import { useThemeColor } from '@/hooks/useThemeColor';
import { isHeaderVisible } from '@/signals/app.signal';

import { Text } from '../base';
import PortfolioConnectModal from '../features/portfolio-import/PortfolioConnectModal';
import { ModalManager } from './modal';

type BlurredHeaderProps = BottomTabHeaderProps & { title: string };

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function BlurredHeader(props: BlurredHeaderProps) {
  const theme = useThemeColor();
  const { profile } = useUserProfile();
  const { colorScheme } = useColorScheme();
  const opacity = useSharedValue(0);
  const intensity = useSharedValue(0);
  const color = useSharedValue(theme.style === 'light' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)');
  const segments = useSegments();

  const shouldBlur = true;

  const config = {
    duration: 300,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, config),
  }));

  const animatedProps = useAnimatedProps(() => ({
    intensity: withTiming(intensity.value, config),
  }));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(color.value, config),
    };
  });

  useSignalEffect(() => {
    opacity.value = isHeaderVisible.value ? 1 : 0;
    intensity.value = isHeaderVisible.value ? 80 : 0;
    color.value =
      theme.style === 'light'
        ? isHeaderVisible.value
          ? 'rgba(255, 255, 255, 1)'
          : 'rgba(255, 255, 255, 0)'
        : isHeaderVisible.value
          ? 'rgba(0, 0, 0, 1)'
          : 'rgba(0, 0, 0, 0)';
  });

  const RenderContent = () => (
    <>
      <Text h3 animated style={style}>
        {props.title}
      </Text>

      <View style={{ position: 'absolute', right: 15, bottom: 10 }} className="flex flex-row gap-3 items-center">
        <TouchableOpacity onPress={() => ModalManager.showModal(PortfolioConnectModal)}>
          <Icon
            size={32}
            name="add"
            type="material"
            className="rounded-full"
            style={{ borderColor: theme.theme }}
            color={theme.theme}
          />
        </TouchableOpacity>
        {/* Do not show profile icon when profile is already open (following temporary solution to add profile in bottom tabs) */}
        {/* {(segments.at(-1) as string) !== 'profile' && (
          <TouchableOpacity onPress={() => router.navigate('/main/settings')}>
            <Avatar
              // Added empty source to remove Image source not found warning (which is a bug from rneui)
              // Look here for more info https://github.com/react-native-elements/react-native-elements/issues/3742#issuecomment-1978783981
              source={{ uri: 'data:image/png' }}
              rounded
              title={profile.email[0].toUpperCase()}
              containerStyle={{ backgroundColor: theme.theme }}
              placeholderStyle={{ backgroundColor: 'transparent' }}
            />
          </TouchableOpacity>
        )} */}
      </View>
    </>
  );

  return shouldBlur ? (
    <AnimatedBlurView
      experimentalBlurMethod="dimezisBlurView"
      tint={colorScheme === 'dark' ? 'dark' : 'extraLight'}
      animatedProps={animatedProps}
      style={{
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        height: 100,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 10,
      }}
    >
      <RenderContent />
    </AnimatedBlurView>
  ) : (
    <Animated.View
      style={[
        animatedStyle,
        {
          ...StyleSheet.absoluteFillObject,
          overflow: 'hidden',
          height: 100,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 10,
        },
      ]}
    >
      <RenderContent />
    </Animated.View>
  );
}
