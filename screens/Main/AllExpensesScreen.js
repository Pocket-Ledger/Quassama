import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchBar from 'components/FilterSearchBar';
import FilterModal from 'components/FilterModal';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import ExpenseListItem from 'components/ExpenseListItem';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Header from 'components/Header';
import Expense from 'models/expense/Expense';

const AllExpensesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get groupId from route params or default
  const groupId = route.params?.groupId || 'vacation_tager';

  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    dateRange: 'Today',
    selectedCategories: [],
    amountRange: { min: 5, max: 500, selectedMin: 20, selectedMax: 100 },
    selectedGroup: groupId,
  });

  // Pagination and data states
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [error, setError] = useState(null);

  // Sample groups data (you might want to fetch this from your Group model)
  const groups = [
    { id: 'vacation_tager', name: 'Vacation tager' },
    { id: 'family_expenses', name: 'Family Expenses' },
    { id: 'work_team', name: 'Work Team' },
    { id: 'friends_trip', name: 'Friends Trip' },
  ];

  // Load expenses function
  const loadExpenses = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      } else if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const result = await Expense.getExpensesByGroupPaginated(groupId, page, pagination.pageSize);
      
      if (isRefresh || page === 1) {
        setExpenses(result.expenses);
      } else {
        // Append new expenses for pagination
        setExpenses(prev => [...prev, ...result.expenses]);
      }
      
      setPagination(result.pagination);
      
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [groupId, pagination.pageSize]);

  // Load more expenses for pagination
  const loadMoreExpenses = useCallback(() => {
    if (!loadingMore && pagination.hasNextPage) {
      loadExpenses(pagination.currentPage + 1, false);
    }
  }, [loadExpenses, loadingMore, pagination.hasNextPage, pagination.currentPage]);

  // Refresh expenses
  const onRefresh = useCallback(() => {
    loadExpenses(1, true);
  }, [loadExpenses]);

  // Load expenses on component mount and when groupId changes
  useEffect(() => {
    loadExpenses(1, false);
  }, [groupId]);

  // Filter expenses based on search text
  const filteredExpenses = expenses.filter(expense =>
    expense.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchText.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense);
    // Navigate to expense details or handle as needed
  };

  const handleApplyFilter = (newFilter) => {
    setFilterConfig(newFilter);
    console.log('Filter applied:', newFilter);
    // You can implement additional filtering logic here
    // For now, we'll just update the filter config
  };

  // Render loading footer for pagination
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#2979FF" />
        <Text className="mt-2 text-sm text-center text-gray-500">Loading more expenses...</Text>
      </View>
    );
  };

  // Render expense item
  const renderExpenseItem = ({ item }) => (
    <ExpenseListItem
      id={item.id}
      name={item.title || item.name} // Use title from your model
      amount={item.amount}
      category={item.category}
      time={formatTime(item.incurred_at)} // Format timestamp
      paidBy={item.user_name || 'Unknown'} // You might need to fetch user name
      categories={DEFAULT_CATEGORIES}
      onPress={() => handleExpensePress(item)}
      showBorder={true}
      currency="MAD"
    />
  );

  // Helper function to format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View className="items-center px-4 py-12">
      <View className="items-center justify-center mb-4">
        <Ionicons name="receipt" size={70} color="#2979FF" />
      </View>
      <Text className="mb-2 font-dmsans-bold text-[24px]">No Expenses Yet</Text>
      <Text className="mb-6 text-center text-gray-500">
        Start by adding your first expense. Keep track of who paid what and split it fairly
        between your group members.
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-lg bg-primary"
        onPress={() => navigation.navigate('NewExpense', { groupId })}>
        <Text className="font-semibold text-white">Add Your First Expense</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View className="items-center px-4 py-12">
      <View className="items-center justify-center mb-4">
        <Ionicons name="alert-circle" size={70} color="#FF6B6B" />
      </View>
      <Text className="mb-2 font-dmsans-bold text-[24px]">Oops! Something went wrong</Text>
      <Text className="mb-6 text-center text-gray-500">{error}</Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-lg bg-primary"
        onPress={() => loadExpenses(1, false)}>
        <Text className="font-semibold text-white">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Render pagination info
  const renderPaginationInfo = () => {
    if (expenses.length === 0) return null;
    
    return (
      <View className="px-4 py-2 bg-gray-50">
        <Text className="text-sm text-center text-gray-600">
          Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems} expenses
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="container flex-1 bg-white">
      <Header title="All Expenses" />
      
      <View className="mb-4">
        <SearchBar
          searchText={searchText}
          onSearchChange={setSearchText}
          placeholder='Eg : "T9edia"'
          onFilterPress={() => setIsFilterModalVisible(true)}
        />
      </View>

      {renderPaginationInfo()}

      {loading && expenses.length === 0 ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#2979FF" />
          <Text className="mt-2 text-gray-500">Loading expenses...</Text>
        </View>
      ) : error && expenses.length === 0 ? (
        renderErrorState()
      ) : filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2979FF']}
              tintColor="#2979FF"
            />
          }
          onEndReached={loadMoreExpenses}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      ) : (
        renderEmptyState()
      )}

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        initialFilter={filterConfig}
        onApplyFilter={handleApplyFilter}
        categories={DEFAULT_CATEGORIES}
        groups={groups}
        currency="MAD"
        resultCount={pagination.totalItems}
      />
    </SafeAreaView>
  );
};

export default AllExpensesScreen;