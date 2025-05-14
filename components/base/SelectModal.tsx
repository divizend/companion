import React, { useCallback, useMemo, useState } from 'react';

import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Icon } from '@rneui/themed';
import { capitalize } from 'lodash';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, TouchableOpacity, View } from 'react-native';

import { clsx } from '@/common/clsx';
import { showCustom } from '@/components/global/prompt';
import { useThemeColor } from '@/hooks/useThemeColor';

import SectionList from '../SectionList';
import { Button } from './Button';
import { Text } from './Text';
import { TextInput } from './TextInput';

export interface SelectableItem {
  [key: string]: any; // Allow additional properties
}

interface SelectModalProps<T extends SelectableItem> {
  items: T[];
  selectedItems?: T[];
  onSelect: (selectedItems: T[]) => void;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  modalTitle?: string;
  noResultsText?: string;
  cancelText?: string;
  confirmText?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  renderItem?: (item: T, isSelected: boolean, onPress: () => void) => React.JSX.Element;
  keyExtractor?: (item: T) => string;
  labelExtractor?: (item: T) => string;
}

export function SelectModal<T extends SelectableItem>({
  items,
  selectedItems = [],
  onSelect,
  multiple = true,
  label,
  placeholder,
  searchPlaceholder,
  modalTitle,
  noResultsText,
  cancelText,
  confirmText,
  className,
  inputClassName,
  disabled = false,
  renderItem,
  keyExtractor = item => item.id,
  labelExtractor = item => item.label,
}: SelectModalProps<T>) {
  const { t } = useTranslation();
  const theme = useThemeColor();

  placeholder = placeholder ?? t('common.select.placeholder');
  searchPlaceholder = searchPlaceholder ?? t('common.select.searchPlaceholder');
  modalTitle = modalTitle ?? t('common.select.modalTitle');
  noResultsText = noResultsText ?? t('common.select.noResultsText');
  cancelText = cancelText ?? t('common.cancel');
  confirmText = confirmText ?? t('common.confirm');

  const displayLabel = useMemo(() => {
    if (label) return label;
    if (selectedItems.length === 0) return placeholder;
    if (selectedItems.length === 1) return labelExtractor(selectedItems[0]);
    return `${labelExtractor(selectedItems[0])} +${selectedItems.length - 1}`;
  }, [label, selectedItems, placeholder, labelExtractor]);

  const handleOpenSelector = useCallback(() => {
    if (disabled) return;

    showCustom(({ close }: any) => {
      const [search, setSearch] = useState('');
      const [selected, setSelected] = useState<T[]>(selectedItems);

      const filteredItems = useMemo(() => {
        if (!search) return items;
        const searchLower = search.toLowerCase();
        return items.filter(item => String(labelExtractor(item)).toLowerCase().includes(searchLower));
      }, [search, items]);

      const handleSelect = (item: T) => {
        if (!multiple) {
          setSelected([item]);
          // For single selection, automatically apply the change after a brief delay
          setTimeout(() => {
            onSelect([item]);
            close();
          }, 150);
          return;
        }

        setSelected(prev => {
          const isSelected = prev.some(selectedItem => keyExtractor(selectedItem) === keyExtractor(item));
          if (isSelected) {
            return prev.filter(selectedItem => keyExtractor(selectedItem) !== keyExtractor(item));
          }
          return [...prev, item];
        });
      };

      const handleApply = () => {
        onSelect(selected);
        close();
      };

      const handleCancel = () => {
        close();
      };

      const isSelected = (item: T) => {
        return selected.some(selectedItem => keyExtractor(selectedItem) === keyExtractor(item));
      };

      const defaultRenderItem = (item: T, isSelected: boolean) => (
        <TouchableOpacity
          onPress={() => handleSelect(item)}
          className={clsx('flex-row items-center justify-between py-2.5 px-3 mb-1 rounded-lg border')}
          style={{
            backgroundColor: isSelected ? theme.backgroundSecondary : 'transparent',
            borderColor: isSelected ? theme.selectedBorder : 'transparent',
          }}
        >
          <Text
            style={{
              fontWeight: isSelected ? '600' : 'normal',
            }}
          >
            {String(labelExtractor(item))}
          </Text>
          <Icon
            name="check-circle"
            type="material"
            size={18}
            color={theme.selectedBorder}
            style={{
              opacity: isSelected ? 1 : 0,
            }}
          />
        </TouchableOpacity>
      );

      return (
        <>
          {/* Title */}
          <Text h2 className="text-center mb-5">
            {modalTitle}
          </Text>

          <TextInput
            component={BottomSheetTextInput}
            placeholder={searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            className="mb-3"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="always"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <FlatList
            data={filteredItems}
            keyExtractor={keyExtractor}
            style={{ maxHeight: 250, marginBottom: 10 }}
            contentContainerStyle={{ paddingVertical: 2 }}
            className="-mr-2.5 pr-2.5"
            renderItem={({ item }) =>
              renderItem
                ? renderItem(item, isSelected(item), () => handleSelect(item))
                : defaultRenderItem(item, isSelected(item))
            }
            ListEmptyComponent={() => (
              <View className="py-6">
                <Text className="text-center text-gray-500">{noResultsText}</Text>
              </View>
            )}
          />

          <SectionList
            title={t('common.select.selectedText', {
              count: selected.length,
              total: items.length,
            })}
            items={[
              ...[
                {
                  title: confirmText,
                  onPress: handleApply,
                },
                {
                  title: cancelText,
                  onPress: handleCancel,
                },
              ],
            ]}
          />
        </>
      );
    });
  }, [
    items,
    selectedItems,
    multiple,
    disabled,
    onSelect,
    searchPlaceholder,
    theme,
    modalTitle,
    noResultsText,
    cancelText,
    confirmText,
    renderItem,
    keyExtractor,
    labelExtractor,
  ]);

  return (
    <TouchableOpacity
      onPress={handleOpenSelector}
      disabled={disabled}
      className={clsx(
        'bg-secondary-light dark:bg-secondary-dark px-4 h-12 rounded-xl flex-row items-center justify-between',
        disabled && 'opacity-50',
        className,
      )}
    >
      <Text
        numberOfLines={1}
        className={clsx(
          'flex-1 mr-2',
          selectedItems.length === 0 ? 'text-gray-500' : '',
          selectedItems.length > 0 && 'font-medium',
          inputClassName,
        )}
      >
        {capitalize(displayLabel)}
      </Text>
      <Icon name="keyboard-arrow-down" type="material" size={22} color={theme.icon} />
    </TouchableOpacity>
  );
}
