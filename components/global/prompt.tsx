import React, { ReactNode, createContext, useContext, useRef } from 'react';

import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { uniqueId } from 'lodash';
import { KeyboardAvoidingView, Platform, TextInputProps, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { clsx } from '@/common/clsx';
import SectionList, { SectionListProps } from '@/components/SectionList';
import { Text, TextInput } from '@/components/base';
import { t } from '@/i18n';

import { useThemeColor } from '../../hooks/useThemeColor';
import { ModalManager } from './modal';

// Define the types for the prompt configuration
type PromptConfig = {
  title: string;
  message?: string;
  /**
   * hideOnClick default is true
   */
  actions?: (SectionListProps['items'][number] & { hideOnPress?: boolean })[];
  /**
   * In pixels or in percentage
   * default 50%
   */
  height?: string | number;
  onClose?: (...args: any[]) => void;
};

type InputPromptConfig = PromptConfig & {
  textInputProps?: TextInputProps;
  submitText?: string;
  cancelText?: string;
};

type PromptConfigInternal = {
  id: string;
} & (
  | {
      type: 'alert';
      config: PromptConfig;
    }
  | {
      type: 'input';
      config: InputPromptConfig;
    }
  | {
      type: 'custom';
      config: { Component: React.ComponentType<any>; onClose?: (...args: any[]) => void };
    }
);

// Define the context type
interface PromptContextType {
  showAlert: (config: PromptConfig) => void;
  showPrompt: (config: InputPromptConfig) => Promise<string | null>;
  showCustom: (config: React.ComponentType<any>) => void;
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

export const showAlert = (prompt: PromptConfig) => {
  // If there's a current prompt, add the new one to the front of the queue
  const internalPrompt: PromptConfigInternal = { config: prompt, id: uniqueId(), type: 'alert' };
  // setPromptQueue((prev: PromptConfigInternal[]) => [internalPrompt, ...prev]);
  ModalManager.showModal(renderModal({ prompt: internalPrompt }), {});
};

export const showPrompt = (config: InputPromptConfig): Promise<string | null> => {
  return new Promise<string | null>(resolve => {
    const internalPrompt: PromptConfigInternal = {
      id: uniqueId(),
      type: 'input',
      config,
    };
    ModalManager.showModal(renderModal({ prompt: internalPrompt, resolve }), {});
    // setPromptQueue(prevQueue => [internalPrompt, ...prevQueue]);
  });
};

export const showCustom = (Component: React.ComponentType) => {
  const internalPrompt: PromptConfigInternal = {
    id: uniqueId(),
    type: 'custom',
    config: { Component },
  };
  ModalManager.showModal(
    renderModal({
      prompt: internalPrompt,
    }),
    {},
  );
};

const Content = ({
  prompt,
  resolve,
  dismiss,
}: {
  prompt: PromptConfigInternal;
  resolve?: (value: string | PromiseLike<string | null> | null) => void;
  dismiss: any;
}) => {
  const inputRef = useRef('');
  if (prompt.type === 'custom') {
    const Component = prompt.config.Component;
    return <Component close={dismiss} />;
  }
  if (prompt.type === 'alert') {
    return (
      <>
        {/* Title */}
        <Text h2 className="text-center mb-5">
          {prompt.config.title}
        </Text>

        {/* Mesasge */}
        {prompt.config.message && (
          <Text className="text-sm text-center color-gray-500 mb-5">{prompt.config.message}</Text>
        )}
        <SectionList
          items={(prompt.config.actions || []).map(item => ({
            ...item,
            onPress: () => {
              if (item.onPress) item.onPress();
              if (item.hideOnPress !== false) dismiss();
            },
          }))}
        />
      </>
    );
  }
  if (prompt.type === 'input') {
    return (
      <>
        {/* Title */}
        <Text h2 className="text-center mb-5">
          {prompt.config.title}
        </Text>

        {/* Mesasge */}
        {prompt.config.message && (
          <Text className="text-sm text-center color-gray-500 mb-5">{prompt.config.message}</Text>
        )}

        {/* Show text input if it's an input prompt */}
        <TextInput
          component={BottomSheetTextInput}
          placeholder={t('common.placeholder')}
          defaultValue={inputRef.current}
          onChange={e => {
            inputRef.current = e.nativeEvent.text;
          }}
          className={clsx('mb-5', prompt.config.textInputProps?.className)}
          {...prompt.config.textInputProps}
        />
        <SectionList
          items={[
            ...(prompt.config.actions || []),
            ...[
              {
                title: prompt.config.submitText || t('common.submit'),
                onPress: () => {
                  if (resolve) resolve(inputRef.current);
                  dismiss();
                },
              },
              {
                title: prompt.config.cancelText || t('common.cancel'),
                onPress: () => {
                  if (resolve) resolve(null);
                  dismiss();
                },
              },
            ],
          ].map(item => ({
            ...item,
            onPress: () => {
              if (item.onPress) item.onPress();
              if (item.hideOnPress !== false) dismiss();
            },
          }))}
        />
      </>
    );
  }
  return <></>;
};

const renderModal =
  ({
    prompt,
    resolve,
  }: {
    prompt: PromptConfigInternal;
    resolve?: (value: string | PromiseLike<string | null> | null) => void;
  }) =>
  (props: any) => {
    const theme = useThemeColor();
    const ref = useRef<BottomSheet>(null);
    return (
      <GestureHandlerRootView>
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: theme.text }}
          animateOnMount
          keyboardBlurBehavior="restore"
          onClose={() => props.dismiss()}
          backdropComponent={backdropProps => (
            <BottomSheetBackdrop
              {...backdropProps}
              disappearsOnIndex={-1}
              enableTouchThrough={false}
              pressBehavior="collapse"
              onPress={() => ref.current?.close()}
            />
          )}
          ref={ref}
          android_keyboardInputMode="adjustResize"
          animationConfigs={{ duration: 100 }}
          enableDynamicSizing
          backgroundComponent={backgroundProps => (
            <View {...backgroundProps} className="bg-primary-light dark:bg-primary-dark rounded-3xl" />
          )}
        >
          <BottomSheetScrollView keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior="padding" className={clsx('py-10 px-5', Platform.OS === 'ios' && 'mb-12')}>
              <Content prompt={prompt} resolve={resolve} dismiss={props.dismiss} />
            </KeyboardAvoidingView>
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  };
