import { DialogButtonProps, DialogProps } from '@rneui/base';
import { Dialog } from '@rneui/themed';
import React from 'react';
import { Text, TextInput, TextInputProps } from 'react-native';

type Props = DialogProps & {
  title: string;
  actions: DialogButtonProps[];
  text?: string;
  textInputProps: TextInputProps;
};

export function Prompt({ title, actions, text, isVisible, textInputProps, ...rest }: Props) {
  return (
    <Dialog animationType="fade" isVisible={isVisible} {...rest}>
      <Dialog.Title title={title} />
      {text ? <Text>{text}</Text> : null}
      <TextInput
        className="flex border-[1px] min-h-11 mt-3 mr-3 py-2.5 px-4 rounded-[20px] border-[#e0e0e0]"
        {...textInputProps}
      />
      {actions.length
        ? actions.map(action => (
            <Dialog.Actions>
              <Dialog.Button title={action.title} onPress={action.onPress} />
            </Dialog.Actions>
          ))
        : null}
    </Dialog>
  );
}
