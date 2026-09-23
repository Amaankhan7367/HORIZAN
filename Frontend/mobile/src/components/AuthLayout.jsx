import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';

export default function AuthLayout({ children, authentication = true }) {
  const [loader, setLoader] = useState(true);

  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    setLoader(false);
  }, [authStatus, authentication]);

  if (loader) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Navigation protection will be handled
  // by AuthNavigator/MainNavigator.
  return <>{children}</>;
}

