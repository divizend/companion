import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { useUserProfile } from '@/common/profile';
import { withUserProfile } from '@/common/withUserProfile';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { JsStack } from '@/components/global/JsStack';
import { ModalProvider } from '@/components/global/modal';
import { RevenueCatProvider } from '@/hooks/usePurchases';

function Layout() {
  const { colorScheme } = useColorScheme();
  const { profile } = useUserProfile();

  if (!profile) return <FullScreenActivityIndicator />;

  return (
    <RevenueCatProvider>
      <ModalProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <JsStack initialRouteName="onboarding" screenOptions={{ headerShown: false }}>
          <JsStack.Screen name="onboarding" options={{ presentation: 'modal' }} />
          <JsStack.Screen name="settings" options={{ presentation: 'modal' }} />
        </JsStack>
      </ModalProvider>
    </RevenueCatProvider>
  );
}

export default withUserProfile(Layout);
