/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    darkBackground: '#fff',
    lightBackground: 'f2f2f2',
    backgroundPrimary: '#f2f2f2',
    backgroundSecondary: '#FFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    theme: '#00008f',
  },
  dark: {
    text: '#ECEDEE',
    darkBackground: '#151718',
    lightBackground: '#2b2b2c',
    backgroundPrimary: '#2b2b2c',
    backgroundSecondary: '#232223',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    theme: '#3333ff',
  },
};
