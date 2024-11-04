import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { apiGet, apiPost } from '@/common/api';

export default function ExplainView({ explainText }) {
  return (
    <View style={styles.explaincontainer}>
      <Text style={styles.text}>{explainText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  explaincontainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 60,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: "#FFFFFF",
  },
  text: {
    color: '#FFFFFF',
  },
});
