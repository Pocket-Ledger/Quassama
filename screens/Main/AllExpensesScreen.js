import React, { useState } from 'react';
import { View, FlatList, SafeAreaView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SearchBar from 'components/FilterSearchBar';
import FilterModal from 'components/FilterModal';
import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import ExpenseListItem from 'components/ExpenseListItem';
import { DEFAULT_CATEGORIES } from 'constants/category';

const AllExpensesScreen = () => {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    dateRange: 'Today',
    selectedCategories: [],
    amountRange: { min: 5, max: 500, selectedMin: 20, selectedMax: 100 },
    selectedGroup: 'vacation_tager',
  });

  // Sample expenses data
  const expenses = [
    {
      id: '1',
      name: 'Groceries',
      amount: 180,
      category: 'groceries',
      time: '2h ago',
      paidBy: 'Sara',
    },
    {
      id: '2',
      name: 'Internet Bill',
      amount: 180,
      category: 'internet',
      time: 'Yesterday',
      paidBy: 'Morad',
    },
    { id: '3', name: 'Cleaning', amount: 60, category: 'cleaning', time: '2d ago', paidBy: 'You' },
    {
      id: '4',
      name: 'Groceries',
      amount: 180,
      category: 'groceries',
      time: '2h ago',
      paidBy: 'Sara',
    },
    {
      id: '5',
      name: 'Internet Bill',
      amount: 180,
      category: 'internet',
      time: 'Yesterday',
      paidBy: 'Morad',
    },
    { id: '6', name: 'Cleaning', amount: 60, category: 'cleaning', time: '2d ago', paidBy: 'You' },
  ];

  /* const categories = [
    { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#2979FF' },
    { id: 'cleaning', name: 'Cleaning', icon: 'check-circle', color: '#2979FF' },
    { id: 'internet', name: 'Internet', icon: 'wifi', color: '#2979FF' },
    { id: 'rent', name: 'Rent', icon: 'home', color: '#2979FF' },
    { id: 'transport', name: 'Transport', icon: 'truck', color: '#2979FF' },
  ]; */

  const groups = [
    { id: 'vacation_tager', name: 'Vacation tager' },
    { id: 'family_expenses', name: 'Family Expenses' },
    { id: 'work_team', name: 'Work Team' },
    { id: 'friends_trip', name: 'Friends Trip' },
  ];
  /* const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : 'plus';
  };

  const getCategoryIconColor = (categoryId) => {
    return '#2979FF';
  }; */
  const handleExpensePress = (expense) => {
    // Handle expense item press
    console.log('Expense pressed:', expense);
  };

  const handleApplyFilter = (newFilter) => {
    setFilterConfig(newFilter);
    // Apply filtering logic here
    console.log('Filter applied:', newFilter);
  };

  const renderExpenseItem = ({ item }) => (
    <ExpenseListItem
      id={item.id}
      name={item.name}
      amount={item.amount}
      category={item.category}
      time={item.time}
      paidBy={item.paidBy}
      categories={DEFAULT_CATEGORIES}
      onPress={handleExpensePress}
      showBorder={true}
      currency="MAD"
    />
  );

  /* const renderExpenseItem = ({ item }) => (
    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-primary-50">
          <Feather
            name={getCategoryIcon(item.category)}
            size={20}
            color={getCategoryIconColor(item.category)}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-black">{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.time}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-base font-semibold text-black">{item.amount} MAD</Text>
        <Text className="text-sm text-gray-500">Paid by {item.paidBy}</Text>
      </View>
    </View>
  ); */

  return (
    <SafeAreaView className="container flex-1 bg-white">
      <View className="mb-6 flex flex-row items-center justify-start px-4 pb-4">
        <BackButton />
        <Text className="ml-12 mt-2 font-dmsans-bold text-xl text-black">All Expenses</Text>
      </View>
      <View className="mb-4 ">
        <SearchBar
          searchText={searchText}
          onSearchChange={setSearchText}
          placeholder='Eg : "T9edia"'
          onFilterPress={() => setIsFilterModalVisible(true)}
        />
      </View>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        initialFilter={filterConfig}
        onApplyFilter={handleApplyFilter}
        categories={DEFAULT_CATEGORIES}
        groups={groups}
        currency="$"
        resultCount={80}
      />
    </SafeAreaView>
  );
};

export default AllExpensesScreen;
