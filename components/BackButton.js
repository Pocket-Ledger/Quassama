import { TouchableOpacity, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const BackButton = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  return (
    <View className="">
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-[10px] border border-border-light dark:border-white"
        onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
      </TouchableOpacity>
    </View>
  );
};
