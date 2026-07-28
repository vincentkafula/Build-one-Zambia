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
import MemberDashboardScreen from './src/screens/MemberDashboardScreen';
import ElectionAgentDashboardScreen from './src/screens/ElectionAgentDashboardScreen';
import CooperativeDashboardScreen from './src/screens/CooperativeDashboardScreen';
import RegistrationProfileScreen from './src/screens/RegistrationProfileScreen';
import ManagerDashboardScreen from './src/screens/ManagerDashboardScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import VoterValidationScreen from './src/screens/VoterValidationScreen';

const GREEN = '#007A30';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ELECTION_AGENT_ROLES = ['polling_agent', 'agent', 'election_agent'];
const MANAGER_ROLES = ['ward_manager', 'constituency_manager', 'district_manager', 'provincial_manager', 'province_manager', 'national_manager', 'super_admin', 'admin', 'manager'];

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'member') return <MemberDashboardScreen />;
  if (user?.role && ELECTION_AGENT_ROLES.includes(user.role)) return <ElectionAgentDashboardScreen />;
  if (user?.role === 'cooperative') return <CooperativeDashboardScreen />;
  if (user?.role === 'chamber') return <RegistrationProfileScreen type="chamber" title="Chamber of Commerce" subtitle="Chamber Profile" />;
  if (user?.role === 'internship') return <RegistrationProfileScreen type="internship" title="Internship" subtitle="Internship Profile" />;
  if (user?.role && MANAGER_ROLES.includes(user.role)) return <ManagerDashboardScreen />;
  if (user?.role === 'intl_party') return <RegistrationProfileScreen type="intlparty" title="International Political Party" subtitle="Party Profile" />;
  return <DashboardScreen />;
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: GREEN, headerStyle: { backgroundColor: GREEN }, headerTintColor: '#fff' }}>
      <Tab.Screen name="Dashboard" component={DashboardRouter} options={{ title: 'Dashboard' }} />
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
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password', headerStyle: { backgroundColor: GREEN }, headerTintColor: '#fff' }} />
            <Stack.Screen name="VoterValidation" component={VoterValidationScreen} options={{ title: 'Voter Validation', headerStyle: { backgroundColor: GREEN }, headerTintColor: '#fff' }} />
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
