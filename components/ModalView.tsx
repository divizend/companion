import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Icon, Header } from '@rneui/themed';

interface ModalViewProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  noScrollView?: boolean;
  children: React.ReactNode;
}

export default function ModalView({ visible, onClose, title, noScrollView, children }: ModalViewProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <Header
          centerComponent={
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
          }
          rightComponent={
            <TouchableOpacity onPress={onClose}>
              <View style={styles.closeButton}>
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
            <View style={styles.content}>{children}</View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 0,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlignVertical: 'center',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    padding: 4,
    margin: 5,
  },
  content: {
    padding: 20,
  },
});
