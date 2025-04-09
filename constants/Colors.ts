/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    backgroundPrimary: '#f2f2f2',
    backgroundSecondary: '#FFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    theme: '#00008f', // Divizend Color rgb(60, 157, 155)
    muted: '#6c757d',
    disabled: '#d9d9d9',
  },
  dark: {
    text: '#ECEDEE',
    backgroundPrimary: '#262627',
    backgroundSecondary: '#1c1c1c',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    theme: '#3939ff',
    muted: '#6c757d',
    disabled: '#4d4d4d',
  },
};
