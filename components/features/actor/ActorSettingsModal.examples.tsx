// Example usage of ActorSettingsModal component
// This file demonstrates how to use the generic ActorSettingsModal with different setting types
import { showCustom } from '@/components/global/prompt';

import {
  ActorSettingsModal,
  createCalendarShownDividendsField,
  createDividendHistoryDisplayField,
  createIsinWknDisplayField,
  createPerformanceQuotesField,
  createTopThreeWorstThreeSortField,
  useActorSettingsModal,
} from './ActorSettingsModal';

// Example 1: Single setting (Performance Quotes)
export const showPerformanceQuotesSettings = () => {
  const SettingsModal = useActorSettingsModal([createPerformanceQuotesField()]);
  showCustom(SettingsModal);
};

// Example 2: Multiple settings for a comprehensive settings modal
export const showComprehensiveSettings = () => {
  const SettingsModal = useActorSettingsModal(
    [
      createPerformanceQuotesField(),
      createTopThreeWorstThreeSortField('topThreeWidget'),
      createTopThreeWorstThreeSortField('worstThreeWidget'),
      createCalendarShownDividendsField(),
      createIsinWknDisplayField(),
      createDividendHistoryDisplayField(),
    ],
    'settings.comprehensive.title',
  );
  showCustom(SettingsModal);
};

// Example 3: Widget-specific settings group
export const showTopThreeSettings = () => {
  const SettingsModal = useActorSettingsModal(
    [createTopThreeWorstThreeSortField('topThreeWidget'), createTopThreeWorstThreeSortField('worstThreeWidget')],
    'settings.topThree.title',
  );
  showCustom(SettingsModal);
};

// Example 4: Direct usage without hook (for more complex scenarios)
export const showDirectUsageSettings = () => {
  showCustom(() => (
    <ActorSettingsModal
      fields={[createPerformanceQuotesField(), createCalendarShownDividendsField()]}
      title="settings.custom.title"
    />
  ));
};

// Example usage in a widget component:
/*
export default function MyWidget() {
  // ... widget logic
  
  return (
    <Widget
      title="My Widget"
      settings={
        <Pressable onPress={showPerformanceQuotesSettings}>
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      // ... widget content
    </Widget>
  );
}
*/
