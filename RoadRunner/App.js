import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './AuthScreen';
import ActivityTracking from './ActivityTracking';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Track" component={ActivityTracking} options={{ title: 'Track Activity' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
