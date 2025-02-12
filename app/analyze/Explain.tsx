import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ExplainViewProps {
  explainText: string;
}

export default function ExplainView({ explainText }: ExplainViewProps) {
  return (
    <View style={styles.explaincontainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>{explainText}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  explaincontainer: {
    flex: 4,
    marginTop: 0,
    marginHorizontal: 20,
    marginBottom: 45,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  text: {
    margin: 0,
    padding: 0,
    color: '#FFFFFF',
  },
});
