import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRTL } from 'hooks/useRTL';

export const BackButton = () => {
  const navigation = useNavigation();
  const { getIconDirection } = useRTL();

  return (
    <View className="">
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-[10px] border border-border-light"
        onPress={() => navigation.goBack()}>
        <Ionicons name={getIconDirection('chevron-back')} size={24} color="rgba(0, 0, 0, 0.7)" />
      </TouchableOpacity>
    </View>
  );
};
