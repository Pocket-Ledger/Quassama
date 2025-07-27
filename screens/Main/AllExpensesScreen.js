import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { dateToTimestamp } from 'utils/time';

const AllExpensesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // Get groupId from route params or default
  const groupId = route.params?.groupId || 'vacation_tager';

  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    dateRange: t('filters.dateRanges.today'),
    selectedCategories: [],
    amountRange: { min: 1, max: 10000, selectedMin: null, selectedMax: null },
    selectedGroup: groupId,
    checkedFilter: false,
    startDate: null,
    endDate: null,
    categories: [],
    minAmount: null,
    maxAmount: null,
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
    { id: 'vacation_tager', name: t('groups.vacationTager') },
    { id: 'family_expenses', name: t('groups.familyExpenses') },
    { id: 'work_team', name: t('groups.workTeam') },
    { id: 'friends_trip', name: t('groups.friendsTrip') },
  ];

  // Load expenses function
  const loadExpenses = useCallback(
    async (page = 1, isRefresh = false, applyFilters = false) => {
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

        // Check if we should apply filters
        if (applyFilters && filterConfig.checkedFilter) {
          // Use filterExpenses method when filters are applied
          const filteredExpenses = await Expense.filterExpenses(
            groupId,
            dateToTimestamp(filterConfig.startDate),
            dateToTimestamp(filterConfig.endDate),
            filterConfig.categories,
            filterConfig.minAmount,
            filterConfig.maxAmount
          );

          // For filtered results, we'll handle pagination manually
          const startIndex = (page - 1) * pagination.pageSize;
          const endIndex = startIndex + pagination.pageSize;
          const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

          result = {
            expenses: paginatedExpenses,
            pagination: {
              currentPage: page,
              pageSize: pagination.pageSize,
              totalItems: filteredExpenses.length,
              totalPages: Math.ceil(filteredExpenses.length / pagination.pageSize),
              hasNextPage: endIndex < filteredExpenses.length,
              hasPreviousPage: page > 1,
              startIndex: startIndex + 1,
              endIndex: Math.min(endIndex, filteredExpenses.length),
            },
          };
        } else {
          // Use regular pagination when no filters are applied
          result = await Expense.getExpensesByGroupPaginated(groupId, page, pagination.pageSize);
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
    [groupId, pagination.pageSize, t, filterConfig]
  );

  // Load more expenses for pagination
  const loadMoreExpenses = useCallback(() => {
    if (!loadingMore && pagination.hasNextPage) {
      loadExpenses(pagination.currentPage + 1, false, filterConfig.checkedFilter);
    }
  }, [
    loadExpenses,
    loadingMore,
    pagination.hasNextPage,
    pagination.currentPage,
    filterConfig.checkedFilter,
  ]);

  // Refresh expenses
  const onRefresh = useCallback(() => {
    loadExpenses(1, true, filterConfig.checkedFilter);
  }, [loadExpenses, filterConfig.checkedFilter]);

  // Load expenses on component mount and when groupId changes
  useEffect(() => {
    loadExpenses(1, false, false);
  }, [groupId]);

  // Load expenses when filter changes (but not when manually reset)
  useEffect(() => {
    if (filterConfig.checkedFilter) {
      loadExpenses(1, false, true);
    }
  }, [
    filterConfig.checkedFilter,
    filterConfig.startDate,
    filterConfig.endDate,
    filterConfig.categories,
    filterConfig.minAmount,
    filterConfig.maxAmount,
  ]);

  // Filter expenses by search text
  const filteredExpenses = React.useMemo(() => {
    if (!searchText.trim()) {
      return expenses;
    }

    return expenses.filter((expense) => {
      const title = expense.title?.toLowerCase() || '';
      const description = expense.description?.toLowerCase() || '';
      const category = expense.category?.toLowerCase() || '';
      const search = searchText.toLowerCase();

      return title.includes(search) || description.includes(search) || category.includes(search);
    });
  }, [expenses, searchText]);

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense);
    // Navigate to expense details or handle as needed
  };

  const handleApplyFilter = (newFilter) => {
    newFilter.groupId = groupId;
    setFilterConfig(newFilter);
    console.log('Filter applied:', newFilter);
    // The useEffect will handle reloading expenses with filters
  };

  const handleResetFilter = () => {
    const resetFilter = {
      dateRange: '',
      selectedCategories: [],
      amountRange: { min: 5, max: 500, selectedMin: 20, selectedMax: 100 },
      selectedGroup: groupId,
      checkedFilter: false,
      startDate: null,
      endDate: null,
      categories: [],
      minAmount: null,
      maxAmount: null,
    };
    setFilterConfig(resetFilter);
    console.log('Filter reset');

    // Immediately reload expenses without filters
    loadExpenses(1, false, false);
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
  const renderEmptyState = () => {
    const isSearchActive = searchText.trim().length > 0;
    const isFilterActive = filterConfig.checkedFilter;

    return (
      <View className="items-center px-4 py-12">
        <View className="mb-4 items-center justify-center">
          <Ionicons name="receipt" size={70} color="#2979FF" />
        </View>
        <Text className="mb-2 font-dmsans-bold text-[24px]">
          {isSearchActive || isFilterActive
            ? t('expense.empty.noResults')
            : t('expense.empty.title')}
        </Text>
        <Text className="mb-6 text-center text-gray-500">
          {isSearchActive || isFilterActive
            ? t('expense.empty.tryDifferentFilters')
            : t('expense.empty.description')}
        </Text>
        {!isSearchActive && !isFilterActive && (
          <TouchableOpacity
            className="rounded-lg bg-primary px-6 py-3"
            onPress={() => navigation.navigate('NewExpense', { groupId })}>
            <Text className="font-semibold text-white">{t('expense.empty.addFirstExpense')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        onPress={() => loadExpenses(1, false)}>
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
            start: pagination.startIndex,
            end: pagination.endIndex,
            total: pagination.totalItems,
          })}
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

        {/* Filter Active Indicator */}
        {filterConfig.checkedFilter && (
          <View className="mx-4 mt-2 flex-row items-center rounded-lg bg-blue-50 px-3 py-2">
            <Feather name="filter" size={16} color="#2979FF" />
            <Text className="ml-2 flex-1 text-sm text-blue-700">{t('expense.filtersActive')}</Text>
            <TouchableOpacity onPress={handleResetFilter}>
              <Text className="text-sm font-medium text-blue-700">{t('filters.clear')}</Text>
            </TouchableOpacity>
          </View>
        )}
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
          className="mx-2"
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
