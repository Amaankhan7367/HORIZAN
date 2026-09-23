import React from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = React.forwardRef(function Input({
  label,
  placeholder = 'Enter Text',
  backgroundColor = 'transparent',
  color = 'white',
  borderColor = 'white',
  ...props
}, ref) {
  return (
    <View>
      {label && (
        <Text
          style={{
            color,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}

      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={{
          backgroundColor,
          color,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 6,
        }}
        {...props}
      />
    </View>
  );
});

export default Input;
