import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text, ListItem, Divider, Icon } from '@rneui/themed';

interface SectionListProps {
  title?: string;
  items: Array<{
    key?: string;
    title: string | React.ReactNode;
    onPress?: () => void;
    rightElement?: string;
    leftIcon?:
      | string
      | {
          name: string;
          type?: string;
          color?: string;
        };
    containerStyle?: ViewStyle | ViewStyle[];
    itemStyle?: ViewStyle | ViewStyle[];
    onRemove?: () => void;
    disabled?: boolean;
    additional?: React.ReactNode;
  }>;
  bottomText?: string;
  containerStyle?: ViewStyle;
  ItemComponent?: React.ComponentType<any>;
}

export default function SectionList({
  title,
  items,
  bottomText,
  containerStyle,
  ItemComponent = View,
}: SectionListProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {title && <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>}
      <View style={styles.listWrapper}>
        {items.map((item, index) => (
          <ItemComponent key={item.key ?? index} style={item.containerStyle}>
            <TouchableOpacity onPress={item.onPress} disabled={item.disabled || !item.onPress}>
              <ListItem containerStyle={[item.onRemove ? styles.listItemWithRemove : styles.listItem, item.itemStyle]}>
                {item.leftIcon ? (
                  typeof item.leftIcon === 'string' ? (
                    <Text style={[item.disabled && styles.disabledTitle]}>{item.leftIcon}</Text>
                  ) : (
                    <Icon
                      name={item.leftIcon.name}
                      type={item.leftIcon.type || 'material'}
                      color={item.leftIcon.color || (item.disabled ? 'grey' : 'black')}
                      size={20}
                      containerStyle={styles.iconContainer}
                    />
                  )
                ) : null}
                <ListItem.Content style={styles.listItemContent}>
                  <ListItem.Title style={[styles.listItemTitle, item.disabled && styles.disabledTitle]}>
                    {item.title}
                  </ListItem.Title>
                  {item.rightElement && (
                    <Text style={styles.rightElementText} numberOfLines={1} ellipsizeMode="tail">
                      {item.rightElement}
                    </Text>
                  )}
                </ListItem.Content>
                {item.onRemove && (
                  <TouchableOpacity onPress={item.onRemove} style={styles.removeButton}>
                    <Icon name="minus" type="material-community" size={14} color="white" />
                  </TouchableOpacity>
                )}
                {item.onPress && !item.onRemove && <ListItem.Chevron />}
              </ListItem>
            </TouchableOpacity>
            {item.additional}
            {index !== items.length - 1 && <Divider style={styles.divider} />}
          </ItemComponent>
        ))}
      </View>
      {bottomText && <Text style={styles.bottomText}>{bottomText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    marginHorizontal: 20,
    textTransform: 'uppercase',
  },
  listWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
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
