import { ActivityIndicator, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export default function FullScreenActivityIndicator() {
  const theme = useThemeColor();
  return (
    <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
      <ActivityIndicator size="small" color={theme.text} />
    </View>
  );
}
