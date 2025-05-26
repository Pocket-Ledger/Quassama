import { AuthProvider } from 'utils/AuthContext';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from 'utils/AppNavigator';

//const Stack = createNativeStackNavigator();




export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}