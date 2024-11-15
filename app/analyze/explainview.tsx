import { StyleSheet, Text, View } from 'react-native';

interface ExplainViewProps {
  explainText: string;
}

export default function ExplainView({ explainText }: ExplainViewProps) {
  return (
    <View style={styles.explaincontainer}>
      <Text style={styles.text}>{explainText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  explaincontainer: {
    flex: 2,
    marginTop: 0,
    marginHorizontal: 20,
    marginBottom: 45,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: "#FFFFFF",
  },
  text: {
    margin: 0,
    padding: 0,
    color: '#FFFFFF',
  },
});
