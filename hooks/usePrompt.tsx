import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { uniqueId } from 'lodash';
import { KeyboardAvoidingView, Modal, Platform, TextInputProps, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { clsx } from '@/common/clsx';
import SectionList, { SectionListProps } from '@/components/SectionList';
import { Text, TextInput } from '@/components/base';
import { t } from '@/i18n';

// Define the types for the prompt configuration
type PromptConfig = {
  title: string;
  message?: string;
  /**
   * hideOnClick default is true
   */
  actions?: Array<SectionListProps['items'][number] & { hideOnPress?: boolean }>;
  /**
   * In pixels or in percentage
   * default 50%
   */
  height?: string | number;
};

type InputPromptConfig = PromptConfig & {
  textInputProps?: TextInputProps;
  submitText?: string;
  cancelText?: string;
};

type PromptConfigInternal = { id: string; hasInput?: boolean } & (PromptConfig | InputPromptConfig);

// Define the context type
interface PromptContextType {
  showAlert: (config: PromptConfig) => void;
  showPrompt: (config: InputPromptConfig) => Promise<string | null>;
}

// Create the context
const PromptContext = createContext<PromptContextType | undefined>(undefined);

// Hook to use the prompt context
export const usePrompt = (): PromptContextType => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};

// Define the props for the provider
interface PromptProviderProps {
  children: ReactNode;
}

const PromptProvider: React.FC<PromptProviderProps> = ({ children }) => {
  const [promptQueue, setPromptQueue] = useState<PromptConfigInternal[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<PromptConfigInternal | null>(null);

  const inputValueRef = useRef('');
  const bottomSheetRef = useRef<BottomSheet>(null);

  const showAlert = (prompt: PromptConfig) => {
    // If there's a current prompt, add the new one to the front of the queue
    const internalPromp = { ...prompt, id: uniqueId() };
    setPromptQueue(prevQueue => [internalPromp, ...prevQueue]);
    setCurrentPrompt(internalPromp);
  };

  const showPrompt = (config: InputPromptConfig): Promise<string | null> => {
    return new Promise<string | null>(resolve => {
      const internalPrompt: PromptConfigInternal = {
        ...config,
        id: uniqueId(),
        hasInput: true,
        actions: [
          {
            title: config.submitText || t('common.submit'),
            onPress: () => {
              resolve(inputValueRef.current);
              closeCurrentPrompt();
            },
          },
          {
            title: config.cancelText || t('common.cancel'),
            onPress: () => {
              resolve(null);
              closeCurrentPrompt();
            },
          },
          ...(config.actions ?? []),
        ],
      };
      setPromptQueue(prevQueue => [internalPrompt, ...prevQueue]);
      setCurrentPrompt(internalPrompt);
    });
  };

  const closeCurrentPrompt = () => {
    setPromptQueue(queue => queue.filter(item => item.id !== currentPrompt?.id));
    inputValueRef.current = '';
    setCurrentPrompt(null);
  };

  useEffect(() => {
    if (!currentPrompt && promptQueue.length > 0) {
      // When the current prompt is closed, show the next one from the queue
      setCurrentPrompt(promptQueue[0]);
    }
  }, [currentPrompt, promptQueue]);

  return (
    <PromptContext.Provider value={{ showAlert, showPrompt }}>
      {children}
      <Modal onTouchCancel={() => {}} transparent visible={!!currentPrompt}>
        <GestureHandlerRootView>
          {currentPrompt && (
            <BottomSheet
              animateOnMount
              onClose={closeCurrentPrompt}
              backdropComponent={backdropProps => (
                <BottomSheetBackdrop
                  {...backdropProps}
                  disappearsOnIndex={-1}
                  enableTouchThrough={false}
                  pressBehavior="close"
                />
              )}
              android_keyboardInputMode="adjustResize"
              ref={bottomSheetRef}
              enableDynamicSizing
              backgroundComponent={backgroundProps => (
                <View {...backgroundProps} className="bg-primary-light dark:bg-primary-dark rounded-3xl" />
              )}
            >
              <BottomSheetView>
                <KeyboardAvoidingView
                  behavior="padding"
                  className={clsx('py-10 px-5', Platform.OS === 'ios' && 'mb-12')}
                >
                  {/* Title */}
                  <Text h2 className="text-center mb-5">
                    {currentPrompt.title}
                  </Text>

                  {/* Mesasge */}
                  {currentPrompt.message && (
                    <Text className="text-sm text-center color-gray-500 mb-5">{currentPrompt.message}</Text>
                  )}

                  {/* Show text input if it's an input prompt */}
                  {!!currentPrompt.hasInput && (
                    <TextInput
                      component={BottomSheetTextInput}
                      placeholder="Type here..."
                      defaultValue={inputValueRef.current}
                      onChange={e => {
                        inputValueRef.current = e.nativeEvent.text;
                      }}
                      className={clsx('mb-5', (currentPrompt as InputPromptConfig).textInputProps?.className)}
                      {...(currentPrompt as InputPromptConfig).textInputProps}
                    />
                  )}
                  <SectionList
                    items={(currentPrompt.actions || []).map(item => ({
                      ...item,
                      onPress: () => {
                        if (item.onPress) item.onPress();
                        if (item.hideOnPress !== false) closeCurrentPrompt();
                      },
                    }))}
                  />
                </KeyboardAvoidingView>
              </BottomSheetView>
            </BottomSheet>
          )}
        </GestureHandlerRootView>
      </Modal>
    </PromptContext.Provider>
  );
};

export default PromptProvider;
