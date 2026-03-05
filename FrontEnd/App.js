// ============================================
// APP.JS - Configurarea navigării între ecrane
// Instalează: npx expo install @react-navigation/native
//             npx expo install @react-navigation/stack
//             npx expo install react-native-screens react-native-safe-area-context
// ============================================
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importă toate ecranele
import WelcomeScreen from './app/WelcomeScreen';
import { LoginScreen } from './app/AuthScreens';
import RegisterScreen from './app/AuthScreens';
import AddChildScreen from './app/AddChildScreen';
import DashboardScreen from './app/MainScreens';
import { TasksScreen, ProgressScreen, RewardScreen } from './app/MainScreens';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }} // ascunde header-ul implicit
      >
        {/* Flux 1: Onboarding */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AddChild" component={AddChildScreen} />

        {/* Flux 2: Aplicația principală */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Reward" component={RewardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}