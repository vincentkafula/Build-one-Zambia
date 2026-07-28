import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { CartProvider } from './src/lib/CartContext';
import LoginScreen from './src/screens/LoginScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ShopScreen from './src/screens/ShopScreen';
import CartScreen from './src/screens/CartScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const GREEN = '#007A30';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: GREEN, headerStyle: { backgroundColor: GREEN }, headerTintColor: '#fff' }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Results" component={ResultsScreen} options={{ title: 'Election Results' }} />
      <Tab.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={GREEN} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart', headerStyle: { backgroundColor: GREEN }, headerTintColor: '#fff' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
