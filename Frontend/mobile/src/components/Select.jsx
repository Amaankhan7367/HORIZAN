import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Select = React.forwardRef(function Select({
  options = [],
  label,
  value,
  onValueChange,
  ...props
}, ref) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <View style={styles.pickerContainer}>
        <Picker
          ref={ref}
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          {...props}
        >
          {options.map((option) => (
            <Picker.Item
              key={option}
              label={option}
              value={option}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    color: 'white',
    marginBottom: 6,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
  },

  picker: {
    color: 'white',
  },
});

export default Select;
