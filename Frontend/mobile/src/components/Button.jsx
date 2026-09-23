import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

function Button({
  children,
  style,
  disabled = false,
  onPress,
  ...props
}) {
  return (
    <TouchableOpacity
      style={style}
      disabled={disabled}
      onPress={onPress}
      {...props}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}

export default Button;
