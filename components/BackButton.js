import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const BackButton = () => {
  const navigation = useNavigation();

  return (
    <View className="absolute left-0 top-0 z-50 flex-row items-center">
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-[10px] border border-border-light"
        onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="rgba(0, 0, 0, 0.7)" />
      </TouchableOpacity>
    </View>
  );
};
