import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "./AuthContext";
import LoginScreen from "screens/LoginScreen";
import RegisterScreen from "screens/RegisterScreen";

const Stack = createNativeStackNavigator();

function AppNavigator(){
    const { user } = useAuth();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {user ? (
                <>
                </>
            ) : (
                <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    )
};

export default AppNavigator;