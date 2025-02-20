import { StyleSheet, Text, View } from 'react-native';
import { Circle } from 'react-native-progress';

import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';
import { portfolioConnect } from '@/signals/portfolio-connect';

export function DepotLoading() {
  const theme = useThemeColor();

  const progress = portfolioConnect.value.secapiImport.progress;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Circle
          progress={progress}
          size={200}
          thickness={6}
          color={theme.icon}
          showsText={true}
          textStyle={styles.progressText}
        />
        <Text style={[styles.text, { color: theme.text }]}>
          {progress < 1.0 ? t('portfolioConnect.loadingDepot') : t('portfolioConnect.loadingDepotSuccess')}
        </Text>
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
    marginTop: 40,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressText: {
    fontSize: 28,
  },
});
