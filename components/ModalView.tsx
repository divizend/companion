import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Header, Icon } from '@rneui/themed';
import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ModalViewProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  noScrollView?: boolean;
  children: React.ReactNode;
}

export default function ModalView({ visible, onClose, title, noScrollView, children }: ModalViewProps) {
  const theme = useThemeColor();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 dark:bg-primary-dark bg-primary-light py-10">
        <Header
          backgroundColor={theme.backgroundPrimary}
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
