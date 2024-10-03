import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Icon, Header } from '@rneui/themed';
import { Text } from '@/components/base';
import { useColorScheme } from 'nativewind';

interface ModalViewProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  noScrollView?: boolean;
  children: React.ReactNode;
}

export default function ModalView({ visible, onClose, title, noScrollView, children }: ModalViewProps) {
  const { colorScheme } = useColorScheme();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 dark:bg-black bg-[#f2f2f2] py-10">
        <Header
          backgroundColor={colorScheme === 'dark' ? 'black' : '#f2f2f2'}
          centerComponent={
            <View className="flex-1 flex-row items-center">
              <Text className="font-bold text-[16px] text-center">{title}</Text>
            </View>
          }
          rightComponent={
            <TouchableOpacity onPress={onClose}>
              <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
                <Icon name="close" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          }
          containerStyle={styles.header}
        />
        {noScrollView ? (
          children
        ) : (
          <ScrollView>
            <View className="p-5">{children}</View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 0,
  },
});
