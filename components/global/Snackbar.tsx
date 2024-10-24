import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { Icon } from '@rneui/base';
import { Animated, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SnackbarMessage {
  id: number;
  message: string;
  animation: Animated.Value;
  options?: SnackbarOptions;
}

interface SnackbarOptions {
  type?: 'error' | 'success';
  duration?: number;
}

interface SnackbarContextType {
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const theme = useThemeColor();

  const showSnackbar = useCallback((message: string, options?: SnackbarOptions) => {
    const id = Date.now();
    const animation = new Animated.Value(0);
    setSnackbars(prev => [...prev, { id, message, animation, options }]);

    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const dismissSnackbar = useCallback(
    (id: number) => {
      const snackbar = snackbars.find(s => s.id === id);
      if (snackbar) {
        Animated.timing(snackbar.animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setSnackbars(prev => prev.filter(s => s.id !== id));
        });
      }
    },
    [snackbars],
  );

  // Dimissing the snacks is done in the useEffect to make sure the timeouts are cleared afterwards
  useEffect(() => {
    if (snackbars.length > 0) {
      const timer = setTimeout(() => {
        dismissSnackbar(snackbars[0].id);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [snackbars, dismissSnackbar]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbars.map((snackbar, index) => (
        <TouchableOpacity
          key={snackbar.id}
          onPress={() => dismissSnackbar(snackbar.id)}
          activeOpacity={0.8}
          style={[
            styles.snackbarContainer,
            { bottom: index * 60 + 10 }, // 10px margin between snackbars
          ]}
        >
          <Animated.View
            className="bg-secondary-light dark:bg-secondary-dark py-4 px-3 rounded-md shadow-lg flex flex-row justify-between items-center"
            style={[
              {
                transform: [
                  {
                    translateY: snackbar.animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: snackbar.animation,
              },
            ]}
          >
            <View className="flex flex-row items-center gap-2" style={{ maxWidth: '80%' }}>
              {!!snackbar.options?.type && (
                <Icon
                  name={snackbar.options?.type === 'error' ? 'error' : 'check'}
                  color={snackbar.options?.type === 'error' ? 'red' : 'green'}
                />
              )}
              <Text>{snackbar.message}</Text>
            </View>
            <TouchableOpacity>
              <Icon color={theme.text} name="close" onPress={() => dismissSnackbar(snackbar.id)} />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </SnackbarContext.Provider>
  );
};

const styles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 10,
    marginHorizontal: 30,
  },
});
