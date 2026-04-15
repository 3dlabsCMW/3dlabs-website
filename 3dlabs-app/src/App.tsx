import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from './navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './utils/notifications';

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
