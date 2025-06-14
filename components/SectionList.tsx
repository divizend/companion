import React from 'react';

import { Divider, Icon, ListItem } from '@rneui/themed';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { clsx } from '@/common/clsx';
import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

export type SectionListProps = {
  title?: string | React.ReactNode;
  items: {
    key?: string;
    title: string | React.ReactNode;
    onPress?: () => void;
    rightElement?: string | React.ReactNode;
    leftIcon?:
      | string
      | {
          name: string;
          type?: string;
          color?: string;
        }
      | React.ReactNode;
    containerStyle?: ViewStyle | ViewStyle[];
    itemStyle?: ViewStyle | ViewStyle[];
    onRemove?: () => void;
    disabled?: boolean;
    additional?: React.ReactNode;
  }[];
  bottomText?: string;
  containerStyle?: ViewStyle;
  ItemComponent?: React.ComponentType<any>;
};

export default function SectionList({
  title,
  items,
  bottomText,
  containerStyle,
  ItemComponent = View,
}: SectionListProps) {
  const theme = useThemeColor();

  return (
    <View className="mb-5" style={containerStyle}>
      {typeof title === 'string' ? (
        <Text className="text-xs mb-1.5 mx-5 uppercase text-gray-600 dark:text-gray-300">{title.toUpperCase()}</Text>
      ) : (
        title
      )}
      <View className="rounded-xl overflow-hidden">
        {items.map((item, index) => (
          <ItemComponent key={item.key ?? index} style={item.containerStyle}>
            <TouchableOpacity onPress={item.onPress} disabled={item.disabled || !item.onPress}>
              <ListItem
                containerStyle={[
                  item.onRemove ? styles.listItemWithRemove : styles.listItem,
                  item.itemStyle,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                {item.leftIcon ? (
                  typeof item.leftIcon === 'string' ? (
                    <Text className={clsx(item.disabled && 'text-gray-500 dark:text-gray-200')}>{item.leftIcon}</Text>
                  ) : (item.leftIcon as any)?.name ? (
                    <Icon
                      name={(item.leftIcon as any).name}
                      type={(item.leftIcon as any).type || 'material'}
                      color={
                        (item.leftIcon as any).color || item.disabled
                          ? 'grey'
                          : theme.style === 'dark'
                            ? 'white'
                            : 'black'
                      }
                      size={20}
                      containerStyle={styles.iconContainer}
                    />
                  ) : (
                    React.isValidElement(item.leftIcon) && item.leftIcon
                  )
                ) : null}
                <ListItem.Content style={styles.listItemContent}>
                  {typeof item.title === 'string' ? (
                    <Text className="max-w-[90%]" style={[styles.listItemTitle, item.disabled && styles.disabledTitle]}>
                      {item.title}
                    </Text>
                  ) : (
                    item.title
                  )}
                  {typeof item.rightElement === 'string' ? (
                    <Text className="text-muted text-sm text-right shrink ml-3" numberOfLines={1} ellipsizeMode="tail">
                      {item.rightElement}
                    </Text>
                  ) : (
                    item.rightElement
                  )}
                </ListItem.Content>
                {item.onRemove && (
                  <TouchableOpacity onPress={item.onRemove} style={styles.removeButton}>
                    <Icon name="minus" type="material-community" size={14} color="white" />
                  </TouchableOpacity>
                )}
                {item.onPress && !item.onRemove && !item.rightElement && <ListItem.Chevron />}
              </ListItem>
            </TouchableOpacity>
            {item.additional}
            {index !== items.length - 1 && <Divider style={styles.divider} />}
          </ItemComponent>
        ))}
      </View>
      {bottomText && <Text className="text-sm mt-1.5 mx-5 text-gray-600]">{bottomText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  listItemWithRemove: {
    paddingVertical: 12,
    paddingLeft: 20,
  },
  divider: {
    backgroundColor: '#e0e0e0',
    height: StyleSheet.hairlineWidth,
  },
  bottomText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginHorizontal: 20,
  },
  iconContainer: {
    marginRight: 0,
  },
  removeButton: {
    backgroundColor: 'red',
    borderRadius: 12,
    width: 22,
    height: 22,
    padding: 0,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  listItemTitle: {
    fontSize: 16,
  },
  disabledTitle: {
    color: 'grey',
  },
  rightElementText: {
    color: 'grey',
    fontSize: 16,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },
});
