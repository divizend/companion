import { useSignalEffect } from '@preact/signals-react';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import { StyleSheet, TouchableOpacity } from 'react-native';
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

type BlurredHeaderProps = BottomTabHeaderProps;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function BlurredHeader(props: BlurredHeaderProps) {
  const navigation = useNavigation();
  const theme = useThemeColor();
  const { profile } = useUserProfile();
  const { colorScheme } = useColorScheme();
  const opacity = useSharedValue(0);
  const intensity = useSharedValue(0);
  const color = useSharedValue(theme.style === 'light' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)');

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
        {props.route.name}
      </Text>
      <TouchableOpacity
        style={{ position: 'absolute', right: 15, bottom: 10 }}
        onPress={() => navigation.navigate('SettingsModal' as never)}
      >
        <Avatar rounded title={profile.email[0].toUpperCase()} containerStyle={{ backgroundColor: theme.theme }} />
      </TouchableOpacity>
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
