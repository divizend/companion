import React from 'react';

import { t } from 'i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/base';

interface BackgroundModalProps {
  visible: boolean;
  setMinimizeToBackground: (value: boolean) => void;
}

export function BackgroundModal({ visible, setMinimizeToBackground }: BackgroundModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{t('portfolioConnect.background.title')}</Text>
          <Text style={styles.description}>{t('portfolioConnect.background.description')}</Text>

          <View style={styles.buttonContainer}>
            <Button title={t('portfolioConnect.background.stay')} onPress={() => setMinimizeToBackground(false)} />
          </View>

          {/* Close Modal if tapped outside */}
          {/* <TouchableOpacity style={styles.backdrop} onPress={onClose} /> */}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
});
