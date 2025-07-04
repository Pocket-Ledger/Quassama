import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SearchBar = ({
  searchText,
  onSearchChange,
  placeholder = 'Search...',
  onFilterPress,
  showFilter = true,
}) => {
  return (
    <View className="flex-row items-center">
      <View className="mr-3 ml-2 flex-1 flex-row items-center rounded-lg border border-gray-200 px-4 ">
        <Feather name="search" size={20} color="#999" />
        <TextInput
          className="ml-3 flex-1 text-base text-black p-3"
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          value={searchText}
          onChangeText={onSearchChange}
        />
      </View>
      {showFilter && (
        <TouchableOpacity className="rounded-lg bg-primary p-3" onPress={onFilterPress}>
          <Feather name="sliders" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
