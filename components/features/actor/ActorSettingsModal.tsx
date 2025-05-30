import React from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { CheckBox } from '@rneui/themed';
import { useTranslation } from 'react-i18next';

import SectionList from '@/components/SectionList';
import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { updateActorSettings } from '@/signals/actions/actor.actions';
import { actor } from '@/signals/actor';
import {
  ActorSettings,
  DisplayValue,
  DividendDisplayOption,
  PerformanceQuotesType,
  ShownDividends,
  SortBy,
} from '@/types/actor-api.types';

/**
 * Generic setting option interface
 * @template T - The type of the option value
 */
export interface SettingOption<T = any> {
  /** Display label for the option (can be direct text or translation key) */
  label: string;
  /** The value of the option */
  value: T;
  /** Optional icon configuration */
  icon?: {
    name: string;
    type?: string;
  };
  /** Whether to use translation for the label (default: true) */
  useTranslation?: boolean;
}

// Setting field interface with more flexible typing
export interface SettingField<K extends keyof ActorSettings = keyof ActorSettings> {
  /** The type of setting UI to render */
  type: 'radio' | 'select';
  /** The key in ActorSettings that this field modifies */
  settingKey: K;
  /** The value's key */
  nestedKey: keyof ActorSettings[K];
  /** Display title for the field (can be direct text or translation key) */
  title: string;
  /** Array of options for this setting */
  options: SettingOption<any>[];
  /** Whether to use translation for the title (default: true) */
  useTranslation?: boolean;
}

/**
 * Props for the ActorSettingsModal component
 */
export interface ActorSettingsModalProps {
  /** Array of setting fields to render */
  fields: SettingField<any>[];
  /** Optional custom title (can be direct text or translation key) */
  title?: string;
  /** Whether to use translation for the title (default: true) */
  useTranslation?: boolean;
}

// Type-safe function to create radio options for enum-based settings
export function createRadioOptions<T extends Record<string, string | number>>(
  enumObject: T,
  translationKeyPrefix: string,
  icons?: Partial<Record<keyof T, { name: string; type?: string }>>,
  useTranslation: boolean = true,
): SettingOption<T[keyof T]>[] {
  return Object.entries(enumObject).map(([key, value]) => ({
    label: translationKeyPrefix + key,
    value: value as T[keyof T],
    icon: icons?.[key as keyof T],
    useTranslation,
  }));
}

// Type-safe function to create options for union type settings
export function createUnionOptions<T extends string>(
  values: readonly T[],
  translationKeyPrefix: string,
  icons?: Partial<Record<T, { name: string; type?: string }>>,
  useTranslation: boolean = true,
): SettingOption<T>[] {
  return values.map(value => ({
    label: translationKeyPrefix + value,
    value,
    icon: icons?.[value],
    useTranslation,
  }));
}

// Function to create options with direct text labels (no translation)
export function createDirectOptions<T>(
  options: Array<{
    label: string;
    value: T;
    icon?: { name: string; type?: string };
  }>,
): SettingOption<T>[] {
  return options.map(option => ({
    ...option,
    useTranslation: false,
  }));
}

// Generic hook for creating typed setting fields
export function useActorSettingField<K extends keyof ActorSettings>(
  settingKey: K,
  nestedKey: keyof ActorSettings[K],
  options: SettingOption<ActorSettings[K][keyof ActorSettings[K]]>[],
  title: string,
  type: 'radio' | 'select' = 'radio',
  useTranslation: boolean = true,
): SettingField<K> {
  return {
    type,
    settingKey,
    nestedKey,
    title,
    options,
    useTranslation,
  };
}

// Pre-defined setting field creators for common settings
export const createPerformanceQuotesField = (): SettingField<'performanceQuotesWidget'> => ({
  type: 'radio',
  settingKey: 'performanceQuotesWidget',
  nestedKey: 'type',
  title: 'common.options',
  options: createUnionOptions(Object.values(PerformanceQuotesType), 'actor.quotes.options.', {
    performance: { name: 'chart-line', type: 'material-community' },
    ttwror: { name: 'percent', type: 'material' },
  }),
});

export const createTopThreeWorstThreeSortField = (
  widgetKey: 'topThreeWidget' | 'worstThreeWidget',
): SettingField<'topThreeWidget' | 'worstThreeWidget'> => ({
  type: 'radio',
  settingKey: widgetKey,
  nestedKey: 'sortBy',
  title: 'actor.topThree.sortBy.title',
  options: createRadioOptions(SortBy, 'actor.topThree.sortBy.', {
    ABSOLUTE_CHANGE: { name: 'trending-up', type: 'material' },
    RELATIVE_CHANGE: { name: 'percent', type: 'material' },
  }),
});

export const createCalendarShownDividendsField = (): SettingField<'calendarWidget'> => ({
  type: 'radio',
  settingKey: 'calendarWidget',
  nestedKey: 'shownDividends',
  title: 'actor.calendar.shownDividends.title',
  options: createRadioOptions(ShownDividends, 'actor.calendar.shownDividends.', {
    ALL: { name: 'view-list', type: 'material' },
    MY_DIVIDENDS: { name: 'person', type: 'material' },
  }),
});

export const createIsinWknDisplayField = (): SettingField<'isinWknWidget'> => ({
  type: 'radio',
  settingKey: 'isinWknWidget',
  nestedKey: 'displayValue',
  title: 'actor.isinWkn.displayValue.title',
  options: createRadioOptions(DisplayValue, 'actor.isinWkn.displayValue.', {
    WKN: { name: 'tag', type: 'material' },
    VALOR: { name: 'label', type: 'material' },
  }),
});

export const createDividendHistoryDisplayField = (): SettingField<'companyDividendHistoryWidget'> => ({
  type: 'radio',
  settingKey: 'companyDividendHistoryWidget',
  nestedKey: 'displayOption',
  title: 'actor.dividendHistory.displayOption.title',
  options: createRadioOptions(DividendDisplayOption, 'actor.dividendHistory.displayOption.', {
    ABSOLUTE: { name: 'attach-money', type: 'material' },
    ABSOLUTESPLITADJUSTED: { name: 'timeline', type: 'material' },
    YIELDS: { name: 'percent', type: 'material' },
  }),
});

// Helper function to create a field with direct text labels (no translation)
export function createDirectField<K extends keyof ActorSettings>(
  settingKey: K,
  nestedKey: keyof ActorSettings[K],
  title: string,
  options: Array<{
    label: string;
    value: any;
    icon?: { name: string; type?: string };
  }>,
  type: 'radio' | 'select' = 'radio',
): SettingField<K> {
  return {
    type,
    settingKey,
    nestedKey,
    title,
    options: createDirectOptions(options),
    useTranslation: false,
  };
}

// Helper function to create mixed fields (some translated, some not)
export function createMixedField<K extends keyof ActorSettings>(
  settingKey: K,
  nestedKey: keyof ActorSettings[K],
  title: string,
  options: SettingOption<any>[],
  type: 'radio' | 'select' = 'radio',
  useTranslation: boolean = false,
): SettingField<K> {
  return {
    type,
    settingKey,
    nestedKey,
    title,
    options,
    useTranslation,
  };
}

// Main ActorSettingsModal component
function ActorSettingsModal({ fields, title, useTranslation: useGlobalTranslation = true }: ActorSettingsModalProps) {
  const { t } = useTranslation();
  const theme = useThemeColor();

  useSignals();
  const settings = actor.value.settings;

  if (!settings) {
    return null;
  }

  const handleSettingChange = <T extends keyof ActorSettings>(
    settingKey: T,
    nestedKey: keyof ActorSettings[T],
    value: ActorSettings[T][keyof ActorSettings[T]],
  ) => {
    return () => {
      updateActorSettings({
        [settingKey]: {
          [nestedKey]: value,
        },
      });
    };
  };

  const renderRadioOption = <T extends keyof ActorSettings>(
    field: SettingField<T>,
    option: SettingOption<ActorSettings[T][keyof ActorSettings[T]]>,
    isSelected: boolean,
  ) => {
    const settingValue = settings[field.settingKey];
    const settingNestedKey = Object.keys(settingValue)[0] as keyof ActorSettings[T];

    return {
      title: option.useTranslation !== false ? t(option.label) : option.label,
      leftIcon: option.icon,
      onPress: handleSettingChange(field.settingKey, settingNestedKey, option.value),
      rightElement: (
        <CheckBox
          wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
          className=""
          iconType="material-community"
          checkedIcon="radiobox-marked"
          uncheckedIcon="radiobox-blank"
          checkedColor={theme.theme}
          checked={isSelected}
          containerStyle={{
            backgroundColor: 'transparent',
            margin: 0,
            padding: 0,
            marginLeft: 0,
            marginRight: 0,
          }}
        />
      ),
    };
  };

  const renderField = <T extends keyof ActorSettings>(field: SettingField<T>) => {
    const settingValue = settings[field.settingKey];
    if (!settingValue) return null;

    const settingNestedKey = Object.keys(settingValue)[0] as keyof ActorSettings[T];
    const currentValue = settingValue[settingNestedKey];

    const sectionItems = field.options.map(option => {
      // Handle default values for performanceQuotesWidget
      let isSelected = currentValue === option.value;

      if (field.type === 'radio') {
        return renderRadioOption(field, option, isSelected);
      }

      // For select type, you could implement a different UI
      return renderRadioOption(field, option, isSelected);
    });
    return (
      <SectionList
        key={field.settingKey}
        title={field.useTranslation !== false ? t(field.title) : field.title}
        containerStyle={{ marginBottom: 30 }}
        items={sectionItems}
      />
    );
  };
  return (
    <>
      <Text h2 className="text-center mb-5">
        {title ? (useGlobalTranslation ? t(title) : title) : t('common.settings')}
      </Text>
      {fields.map(renderField)}
    </>
  );
}

// Hook for easily using the modal with specific fields
export function useActorSettingsModal(fields: SettingField<any>[], title?: string, useTranslation?: boolean) {
  return () => <ActorSettingsModal fields={fields} title={title} useTranslation={useTranslation} />;
}

// Named and default exports
export { ActorSettingsModal };
export default ActorSettingsModal;
