import React, { useRef } from 'react';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
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

export const showAlert = (prompt: PromptConfig) => {
  const internalPrompt: PromptConfigInternal = { config: prompt, id: uniqueId(), type: 'alert' };
  ModalManager.showModal(
    renderModal({ prompt: internalPrompt }),
    {},
    {
      transparent: true,
    },
  );
};

export const showConfirm = (prompt: Omit<PromptConfig, 'actions'>): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const internalPrompt: PromptConfigInternal = {
      id: uniqueId(),
      type: 'alert',
      config: {
        ...prompt,
        actions: [
          {
            title: t('common.confirm'),
            onPress: () => resolve(),
          },
          {
            title: t('common.cancel'),
            onPress: () => reject(),
          },
        ],
      },
    };
    ModalManager.showModal(
      renderModal({
        prompt: internalPrompt,
        // TODO: Add onClose handler to reject if modal is dismissed
        // onClose: () => reject(),
      }),
      {},
      {
        transparent: true,
      },
    );
  });
};

export const showPrompt = (config: InputPromptConfig): Promise<string | null> => {
  return new Promise<string | null>(resolve => {
    const internalPrompt: PromptConfigInternal = {
      id: uniqueId(),
      type: 'input',
      config,
    };
    ModalManager.showModal(
      renderModal({ prompt: internalPrompt, resolve }),
      {},
      {
        transparent: true,
      },
    );
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
    {
      transparent: true,
    },
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

const renderModal = ({
  prompt,
  resolve,
}: {
  prompt: PromptConfigInternal;
  resolve?: (value: string | PromiseLike<string | null> | null) => void;
}) => {
  const PromptModal = (props: any) => {
    const theme = useThemeColor();
    const ref = useRef<BottomSheet>(null);
    const BSView = prompt.type === 'custom' ? BottomSheetView : BottomSheetScrollView;
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
          <BSView style={{ flex: 0, minHeight: 100 }} keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior="padding" className={clsx('py-10 px-5', Platform.OS === 'ios' && 'mb-12')}>
              <Content prompt={prompt} resolve={resolve} dismiss={props.dismiss} />
            </KeyboardAvoidingView>
          </BSView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  };
  PromptModal.displayName = 'PromptModal';
  return PromptModal;
};
