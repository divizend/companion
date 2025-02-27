import React, { useEffect, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Yup from 'yup';

import { Button, TextInput } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';
import {
  bankDepotDetailsSetField,
  bankDepotDetailsSubmit,
  restartImport,
} from '@/signals/actions/portfolio-connect.actions';
import { portfolioConnect } from '@/signals/portfolio-connect';
import { BankParent } from '@/types/secapi.types';
import { validateValues } from '@/utils/validation';

function getBankDepotProps() {
  const manualImport = portfolioConnect.value.manualImport;
  return {
    parent: manualImport.bank.parent ?? '',
    bankName: manualImport.bank.name ?? '',
    depotNumber: manualImport.depotNumber ?? '',
  };
}

const bankDepotPropsSchema = Yup.object().shape({
  parent: Yup.string()
    .required()
    .matches(/^[A-Z]{2}_[A-Z0-9_]+$/),
  bankName: Yup.string().max(100).required(),
  depotNumber: Yup.string().max(100).required(),
});

export default function BankDepotDetails() {
  const theme = useThemeColor();
  const bankDepotProps = getBankDepotProps();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(bankDepotProps.parent);
  const [bankName, setBankName] = useState(bankDepotProps.bankName);
  const [depotNumber, setDepotNumber] = useState(bankDepotProps.depotNumber);

  const [items, setItems] = useState(() => {
    const bankParentKeys = Object.keys(BankParent);
    for (const newParent of [
      'BE_UNKNOWN',
      'ES_UNKNOWN',
      'FI_UNKNOWN',
      'FR_UNKNOWN',
      'IS_UNKNOWN',
      'IT_UNKNOWN',
      'LI_UNKNOWN',
      'LU_UNKNOWN',
      'NL_UNKNOWN',
      'NO_UNKNOWN',
      'PT_UNKNOWN',
      'SE_UNKNOWN',
      'SG_UNKNOWN',
      'US_UNKNOWN',
      'GB_UNKNOWN',
    ]) {
      if (!bankParentKeys.includes(newParent)) {
        bankParentKeys.push(newParent);
      }
    }

    return bankParentKeys
      .filter(p => !p.startsWith('XX_'))
      .map(p => ({
        label: p.endsWith('_UNKNOWN')
          ? `${t('portfolioConnect.bankDepotDetails.unknownBank')} (${t('common.country.' + p.slice(0, 2).toLowerCase())})`
          : t('bank.' + p),
        value: p,
        parentCategory: p.slice(0, 2).toUpperCase(),
      }));
  });

  const [valid, setValid] = useState(false);

  useEffect(() => {
    const validationResult = validateValues(bankDepotPropsSchema, {
      parent: value,
      bankName,
      depotNumber,
    });
    setValid(Object.keys(validationResult.badFieldsWithMessages).length === 0);
  }, [value, bankName, depotNumber]);

  const onChange = (fieldName: string, newValue: string) => {
    bankDepotDetailsSetField(fieldName, newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{t('portfolioConnect.bankDepotDetails.description')}</Text>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder={t('portfolioConnect.bankDepotDetails.fields.parent')}
        searchable={true}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        onChangeValue={newValue => onChange('parent', newValue ?? '')}
      />
      <TextInput
        placeholder={t('portfolioConnect.bankDepotDetails.fields.bankName')}
        placeholderTextColor={theme.text}
        value={bankName}
        style={styles.input}
        editable={true}
        onChangeText={text => {
          setBankName(text);
          onChange('bankName', text);
        }}
      />

      <TextInput
        placeholder={t('portfolioConnect.bankDepotDetails.fields.depotNumber')}
        placeholderTextColor={theme.text}
        value={depotNumber}
        style={styles.input}
        editable={true}
        onChangeText={text => {
          setDepotNumber(text);
          onChange('depotNumber', text);
        }}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={t('portfolioConnect.restartImport')}
          onPress={() => {
            restartImport();
          }}
        />

        <Button
          title={t('common.continue')}
          disabled={!valid}
          onPress={() => {
            bankDepotDetailsSubmit();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  description: {
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 50,
  },
  dropdown: {
    width: 300,
    marginBottom: 20,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    marginLeft: 25,
  },
  dropdownContainer: {
    width: 300,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 25,
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
  },
});
