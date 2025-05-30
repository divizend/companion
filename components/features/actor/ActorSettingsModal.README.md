# ActorSettingsModal Component

A generic, type-safe React component for creating settings modals that update ActorSettings in the Divizend companion app.

## Features

- ✅ **Type-safe**: Fully typed with TypeScript for ActorSettings
- ✅ **Generic**: Reusable for any ActorSettings configuration
- ✅ **Pre-built fields**: Ready-to-use field creators for common settings
- ✅ **Flexible**: Support for radio buttons and select dropdowns
- ✅ **Consistent UI**: Uses the same design patterns as existing components
- ✅ **Internationalized**: Full i18n support with translation keys

## Quick Start

### Simple Usage (Single Setting)

```tsx
import { showCustom } from '@/components/global/prompt';

import { createPerformanceQuotesField, useActorSettingsModal } from './ActorSettingsModal';

export default function QuotesWidget() {
  const SettingsModal = useActorSettingsModal([createPerformanceQuotesField()]);

  return (
    <Widget
      title="Quotes"
      settings={
        <Pressable onPress={() => showCustom(SettingsModal)}>
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      {/* Widget content */}
    </Widget>
  );
}
```

### Multiple Settings

```tsx
import {
  createCalendarShownDividendsField,
  createPerformanceQuotesField,
  createTopThreeWorstThreeSortField,
  useActorSettingsModal,
} from './ActorSettingsModal';

export const showComprehensiveSettings = () => {
  const SettingsModal = useActorSettingsModal([
    createPerformanceQuotesField(),
    createTopThreeWorstThreeSortField('topThreeWidget'),
    createCalendarShownDividendsField(),
  ]);
  showCustom(SettingsModal);
};
```

## Available Pre-built Field Creators

| Function                                       | ActorSettings Key                      | Description                         |
| ---------------------------------------------- | -------------------------------------- | ----------------------------------- |
| `createPerformanceQuotesField()`               | `performanceQuotesWidget`              | Performance vs TTWROR display       |
| `createTopThreeWorstThreeSortField(widgetKey)` | `topThreeWidget` \| `worstThreeWidget` | Sorting by absolute/relative change |
| `createCalendarShownDividendsField()`          | `calendarWidget`                       | Show all dividends vs only user's   |
| `createIsinWknDisplayField()`                  | `isinWknWidget`                        | Display WKN or VALOR                |
| `createDividendHistoryDisplayField()`          | `companyDividendHistoryWidget`         | Dividend display options            |

## Creating Custom Fields

### Method 1: Using Helper Functions

```tsx
import { createRadioOptions, createUnionOptions } from './ActorSettingsModal';

// For union types
const performanceField = {
  type: 'radio' as const,
  settingKey: 'performanceQuotesWidget' as const,
  title: 'Performance Options',
  options: createUnionOptions(['performance', 'ttwror'] as const, 'actor.quotes.options.', {
    performance: { name: 'chart-line', type: 'material-community' },
    ttwror: { name: 'percent', type: 'material' },
  }),
};

// For enums
const sortField = {
  type: 'radio' as const,
  settingKey: 'topThreeWidget' as const,
  title: 'Sort Options',
  options: createRadioOptions(SortBy, 'actor.sort.', {
    ABSOLUTE_CHANGE: { name: 'trending-up', type: 'material' },
    RELATIVE_CHANGE: { name: 'percent', type: 'material' },
  }),
};
```

### Method 2: Manual Field Creation

```tsx
const customField: SettingField<'performanceQuotesWidget'> = {
  type: 'radio',
  settingKey: 'performanceQuotesWidget',
  title: 'custom.settings.title',
  options: [
    {
      label: 'custom.option.performance',
      value: 'performance',
      icon: { name: 'chart-line', type: 'material-community' },
    },
    {
      label: 'custom.option.ttwror',
      value: 'ttwror',
      icon: { name: 'percent', type: 'material' },
    },
  ],
};
```

## Component API

### `ActorSettingsModal<K>`

| Prop     | Type                | Description                           |
| -------- | ------------------- | ------------------------------------- |
| `fields` | `SettingField<K>[]` | Array of setting fields to render     |
| `title?` | `string`            | Optional custom title translation key |

### `SettingField<K>`

| Property     | Type                            | Description                     |
| ------------ | ------------------------------- | ------------------------------- |
| `type`       | `'radio' \| 'select'`           | UI type to render               |
| `settingKey` | `K extends keyof ActorSettings` | ActorSettings key               |
| `title`      | `string`                        | Translation key for field title |
| `options`    | `SettingOption[]`               | Array of available options      |

### `SettingOption<T>`

| Property | Type                              | Description                      |
| -------- | --------------------------------- | -------------------------------- |
| `label`  | `string`                          | Translation key for option label |
| `value`  | `T`                               | The option value                 |
| `icon?`  | `{ name: string; type?: string }` | Optional icon                    |

## Hooks

### `useActorSettingsModal<K>(fields, title?)`

Returns a React component that renders the settings modal.

**Parameters:**

- `fields`: Array of SettingField objects
- `title?`: Optional title translation key

**Returns:** React component function

## Type Safety

The component is fully type-safe and will catch errors at compile time:

```tsx
// ✅ Correct - type matches ActorSettings
const validField: SettingField<'performanceQuotesWidget'> = {
  settingKey: 'performanceQuotesWidget',
  options: [{ value: 'performance' }], // ✅ Valid value
};

// ❌ Error - invalid setting key
const invalidField: SettingField<'invalidKey'> = {
  // TypeScript error
  settingKey: 'invalidKey',
};

// ❌ Error - invalid option value
const invalidValue: SettingField<'performanceQuotesWidget'> = {
  settingKey: 'performanceQuotesWidget',
  options: [{ value: 'invalidValue' }], // TypeScript error
};
```

## Integration with Existing Code

The component integrates seamlessly with the existing ActorSettings system:

1. **Updates**: Uses the existing `updateActorSettings` action
2. **State**: Reads from the existing `actor` signal
3. **UI**: Follows the same design patterns as other components
4. **i18n**: Uses the same translation system

## Translation Keys

Make sure to add the appropriate translation keys to your i18n files:

```json
{
  "actor": {
    "quotes": {
      "options": {
        "performance": "Performance",
        "ttwror": "TTWROR"
      }
    },
    "topThree": {
      "sortBy": {
        "ABSOLUTE_CHANGE": "Absolute Change",
        "RELATIVE_CHANGE": "Relative Change"
      }
    }
  },
  "common": {
    "settings": "Settings",
    "options": "Options"
  }
}
```

## Best Practices

1. **Use pre-built fields** when possible for consistency
2. **Group related settings** in the same modal
3. **Provide meaningful icons** for better UX
4. **Use descriptive translation keys** for maintainability
5. **Test type safety** during development

## Examples

See `ActorSettingsModal.examples.tsx` for comprehensive usage examples.
