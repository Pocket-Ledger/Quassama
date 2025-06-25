import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchBar from 'components/FilterSearchBar';
import FilterModal from 'components/FilterModal';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import ExpenseListItem from 'components/ExpenseListItem';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Header from 'components/Header';
import Expense from 'models/expense/Expense';
import { useTranslation } from 'react-i18next';

const AllExpensesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // Get groupId from route params or default
  const groupId = route.params?.groupId || 'vacation_tager';

  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    dateRange: '',
    selectedCategories: [],
    amountRange: { min: 5, max: 500, selectedMin: 20, selectedMax: 100 },
    selectedGroup: groupId,
    customStartDate: null,
    customEndDate: null,
    checkedFilter: false,
  });

  const [appliedFilterConfig, setAppliedFilterConfig] = useState({
    dateRange: '',
    selectedCategories: [],
    amountRange: null,
    selectedGroup: groupId,
    customStartDate: null,
    customEndDate: null,
    checkedFilter: false,
  });

  // Pagination and data states
  const [expenses, setExpenses] = useState([]);
  const [checkedFilter, setCheckedFilter] = useState(false);
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
    { id: 'vacation_tager', name: t('groups.vacationTager') },
    { id: 'family_expenses', name: t('groups.familyExpenses') },
    { id: 'work_team', name: t('groups.workTeam') },
    { id: 'friends_trip', name: t('groups.friendsTrip') },
  ];

  // Helper function to convert date range to actual dates
  const getDateRangeFromFilter = useCallback((filterConfig) => {
    if (filterConfig.dateRange === 'custom') {
      return {
        startDate: filterConfig.customStartDate,
        endDate: filterConfig.customEndDate,
      };
    }

    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (filterConfig.dateRange) {
      case t('filters.dateRanges.today'):
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case t('filters.dateRanges.last7Days'):
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case t('filters.dateRanges.last30Days'):
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case t('filters.dateRanges.thisMonth'):
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    return { startDate, endDate };
  }, [t]);

  // Load expenses function - now handles both filtered and paginated requests
  const loadExpenses = useCallback(
    async (page = 1, isRefresh = false, useFilter = false) => {
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

        let result;

        if (useFilter && checkedFilter && appliedFilterConfig.checkedFilter) {
          console.log("\n\n\n\n");
          console.log('Using filter for expenses:', useFilter);
          // Use filter function
          const { startDate, endDate } = getDateRangeFromFilter(appliedFilterConfig);
          console.log('\n\n\nLoading filtered expenses:');
          
          const filteredExpenses = await Expense.filterExpenses(
            groupId,
            startDate,
            endDate,
            appliedFilterConfig.selectedCategories,
            appliedFilterConfig.amountRange?.selectedMin || null,
            appliedFilterConfig.amountRange?.selectedMax || null
          );
          console.log(appliedFilterConfig.selectedCategories);

          // For filtered results, we don't have pagination from backend
          // So we handle it manually
          const pageSize = pagination.pageSize;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

          result = {
            expenses: paginatedExpenses,
            pagination: {
              currentPage: page,
              pageSize: pageSize,
              totalItems: filteredExpenses.length,
              totalPages: Math.ceil(filteredExpenses.length / pageSize),
              hasNextPage: endIndex < filteredExpenses.length,
              hasPreviousPage: page > 1,
              startIndex: startIndex + 1,
              endIndex: Math.min(endIndex, filteredExpenses.length),
            }
          };

          // Store full filtered results for client-side pagination
          if (page === 1 || isRefresh) {
            setFilteredExpensesCache(filteredExpenses);
          }
          console.log('Filtered expenses loaded:', result);
        } else {
          // Use regular paginated function
          result = await Expense.getExpensesByGroupPaginated(
            groupId,
            page,
            pagination.pageSize
          );
          console.log('Loading paginated expenses:', result);
        }

        if (isRefresh || page === 1) {
          setExpenses(result.expenses);
        } else {
          // Append new expenses for pagination
          setExpenses((prev) => [...prev, ...result.expenses]);
        }

        setPagination(result.pagination);
      } catch (err) {
        console.error('Error loading expenses:', err);
        setError(err.message || t('expense.errors.loadFailed'));
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [groupId, pagination.pageSize, t, checkedFilter, appliedFilterConfig, getDateRangeFromFilter]
  );

  // Cache for filtered expenses (for client-side pagination)
  const [filteredExpensesCache, setFilteredExpensesCache] = useState([]);

  // Load more expenses for pagination
  const loadMoreExpenses = useCallback(() => {
    if (!loadingMore && pagination.hasNextPage) {
      if (checkedFilter && appliedFilterConfig.checkedFilter) {
        // For filtered results, handle pagination from cache
        const nextPage = pagination.currentPage + 1;
        const pageSize = pagination.pageSize;
        const startIndex = (nextPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newExpenses = filteredExpensesCache.slice(startIndex, endIndex);

        setExpenses(prev => [...prev, ...newExpenses]);
        setPagination(prev => ({
          ...prev,
          currentPage: nextPage,
          hasNextPage: endIndex < filteredExpensesCache.length,
          endIndex: Math.min(endIndex, filteredExpensesCache.length),
        }));
      } else {
        // Regular pagination
        loadExpenses(pagination.currentPage + 1, false, false);
      }
    }
  }, [loadExpenses, loadingMore, pagination, checkedFilter, appliedFilterConfig, filteredExpensesCache]);

  // Refresh expenses
  const onRefresh = useCallback(() => {
    const useFilter = checkedFilter && appliedFilterConfig.checkedFilter;
    loadExpenses(1, true, useFilter);
  }, [loadExpenses, checkedFilter, appliedFilterConfig]);

  // Load expenses on component mount and when groupId or filter state changes
  useEffect(() => {
    const useFilter = checkedFilter && appliedFilterConfig.checkedFilter;
    loadExpenses(1, false, useFilter);
  }, [groupId, checkedFilter, appliedFilterConfig.checkedFilter]);

  // Filter expenses based on search text (this is for real-time search, not the modal filters)
  const getFilteredExpenses = useCallback(() => {
    let filtered = expenses;

    // Text search filter (this always applies as user types)
    if (searchText.trim()) {
      filtered = filtered.filter(
        (expense) =>
          expense.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          expense.category?.toLowerCase().includes(searchText.toLowerCase()) ||
          expense.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [expenses, searchText]);

  const filteredExpenses = getFilteredExpenses();

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense);
    // Navigate to expense details or handle as needed
  };

  const handleApplyFilter = (newFilter) => {
    console.log('Filter applied:', newFilter);
    
    // Update both filter configs
    setFilterConfig(newFilter);
    setAppliedFilterConfig(newFilter);
    
    // Update checked filter state
    setCheckedFilter(newFilter.checkedFilter);
    
    // Reset expenses and load with filter
    setExpenses([]);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handleResetFilter = () => {
    const resetFilter = {
      dateRange: '',
      selectedCategories: [],
      amountRange: { min: 5, max: 500, selectedMin: 20, selectedMax: 100 },
      selectedGroup: groupId,
      customStartDate: null,
      customEndDate: null,
      checkedFilter: false,
    };
    
    setFilterConfig(resetFilter);
    setAppliedFilterConfig(resetFilter);
    setCheckedFilter(false);
    setFilteredExpensesCache([]);
    
    // Reset expenses and load all expenses
    setExpenses([]);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
    
    console.log('Filter reset - showing all expenses');
  };

  // Render loading footer for pagination
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#2979FF" />
        <Text className="mt-2 text-center text-sm text-gray-500">{t('expense.loadingMore')}</Text>
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
      paidBy={item.user_name || t('common.unknown')} // You might need to fetch user name
      categories={DEFAULT_CATEGORIES}
      onPress={() => handleExpensePress(item)}
      showBorder={true}
      currency={t('common.currency')}
    />
  );

  // Helper function to format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return t('common.unknown');

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return t('time.minutesAgo', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('time.hoursAgo', { count: diffInHours });
    } else if (diffInDays === 1) {
      return t('time.yesterday');
    } else if (diffInDays < 7) {
      return t('time.daysAgo', { count: diffInDays });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View className="items-center px-4 py-12">
      <View className="mb-4 items-center justify-center">
        <Ionicons name="receipt" size={70} color="#2979FF" />
      </View>
      <Text className="mb-2 font-dmsans-bold text-[24px]">{t('expense.empty.title')}</Text>
      <Text className="mb-6 text-center text-gray-500">{t('expense.empty.description')}</Text>
      <TouchableOpacity
        className="rounded-lg bg-primary px-6 py-3"
        onPress={() => navigation.navigate('NewExpense', { groupId })}>
        <Text className="font-semibold text-white">{t('expense.empty.addFirstExpense')}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View className="items-center px-4 py-12">
      <View className="mb-4 items-center justify-center">
        <Ionicons name="alert-circle" size={70} color="#FF6B6B" />
      </View>
      <Text className="mb-2 font-dmsans-bold text-[24px]">{t('expense.error.title')}</Text>
      <Text className="mb-6 text-center text-gray-500">{error}</Text>
      <TouchableOpacity
        className="rounded-lg bg-primary px-6 py-3"
        onPress={() => loadExpenses(1, false, checkedFilter && appliedFilterConfig.checkedFilter)}>
        <Text className="font-semibold text-white">{t('expense.error.tryAgain')}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render pagination info
  const renderPaginationInfo = () => {
    if (expenses?.length === 0) return null;

    return (
      <View className="bg-gray-50 px-4 py-2">
        <Text className="text-center text-sm text-gray-600">
          {t('expense.pagination.showing', {
            start: pagination.startIndex || 1,
            end: pagination.endIndex || expenses.length,
            total: pagination.totalItems || expenses.length,
          })}
          {checkedFilter && appliedFilterConfig.checkedFilter && (
            <Text className="text-primary"> (Filtered)</Text>
          )}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="container flex-1 bg-white">
      <Header title={t('expense.title')} />

      <View className="mb-4">
        <SearchBar
          searchText={searchText}
          onSearchChange={setSearchText}
          placeholder={t('expense.search.placeholder')}
          onFilterPress={() => setIsFilterModalVisible(true)}
        />
      </View>

      {renderPaginationInfo()}

      {loading && expenses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2979FF" />
          <Text className="mt-2 text-gray-500">{t('expense.loading')}</Text>
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
        onResetFilter={handleResetFilter}
        categories={DEFAULT_CATEGORIES}
        groups={groups}
        currency={t('common.currency')}
        resultCount={pagination.totalItems}
      />
    </SafeAreaView>
  );
};

export default AllExpensesScreen;