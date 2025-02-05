import { Button, StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';
import { portfolioConnect } from '@/signals/portfolioConnect';

export function DepotLoading() {
  const theme = useThemeColor();

  const progress = portfolioConnect.value.secapiImport.progress;

  // Define custom green shades
  const greenShades = {
    green30: 'rgb(117, 202, 200)',
    green50: 'rgb(60, 157, 155)',
  };

  // Change color based on progress level
  const progressColor = progress < 0.5 ? greenShades.green30 : greenShades.green50;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Progress.Circle
          progress={progress}
          size={200}
          thickness={6}
          color={useThemeColor().icon}
          showsText={true}
          textStyle={styles.progressText}
        />
        <Text style={styles.text}>
          {progress < 1.0 ? t('portfolioConnect.loadingDepot') : t('portfolioConnect.loadingDepotSuccess')}
        </Text>
        <Button
          title="Simulate Progress"
          onPress={() => {
            portfolioConnect.value = {
              ...portfolioConnect.value,
              secapiImport: {
                ...portfolioConnect.value.secapiImport,
                progress: Math.min(portfolioConnect.value.secapiImport.progress + 0.1, 1.0),
              },
            };
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressText: {
    fontSize: 28,
  },
});
