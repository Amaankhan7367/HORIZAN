import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

function Button({
  children,
  variant = 'default',
  size = 'default',
  style,
  disabled = false,
  onPress,
  textStyle,
  ...props
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        getSizeStyle(size),
        getVariantStyle(variant),
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {typeof children === 'string' ||
      typeof children === 'number' ? (
        <Text
          style={[
            styles.text,
            getTextStyle(variant),
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function getVariantStyle(variant) {
  switch (variant) {
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: '#374151',
        borderWidth: 1,
      };

    case 'secondary':
      return {
        backgroundColor: '#374151',
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };

    case 'destructive':
      return {
        backgroundColor: 'rgba(239,68,68,0.15)',
      };

    case 'link':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };

    default:
      return {
        backgroundColor: '#536cff',
        borderColor: 'transparent',
      };
  }
}

function getTextStyle(variant) {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return {
        color: '#fff',
      };

    case 'secondary':
      return {
        color: '#fff',
      };

    case 'destructive':
      return {
        color: '#ef4444',
      };

    case 'link':
      return {
        color: '#60a5fa',
        textDecorationLine: 'underline',
      };

    default:
      return {
        color: '#fff',
      };
  }
}

function getSizeStyle(size) {
  switch (size) {
    case 'xs':
      return {
        minHeight: 24,
        paddingHorizontal: 8,
        borderRadius: 8,
      };

    case 'sm':
      return {
        minHeight: 28,
        paddingHorizontal: 10,
        borderRadius: 9,
      };

    case 'lg':
      return {
        minHeight: 36,
        paddingHorizontal: 12,
        borderRadius: 10,
      };

    case 'icon':
      return {
        width: 32,
        height: 32,
        paddingHorizontal: 0,
        borderRadius: 8,
      };

    case 'icon-xs':
      return {
        width: 24,
        height: 24,
        paddingHorizontal: 0,
        borderRadius: 7,
      };

    case 'icon-sm':
      return {
        width: 28,
        height: 28,
        paddingHorizontal: 0,
        borderRadius: 8,
      };

    case 'icon-lg':
      return {
        width: 36,
        height: 36,
        paddingHorizontal: 0,
        borderRadius: 9,
      };

    default:
      return {
        minHeight: 32,
        paddingHorizontal: 10,
        borderRadius: 8,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }],
  },
});

export {
  Button,
  getVariantStyle as buttonVariants,
};