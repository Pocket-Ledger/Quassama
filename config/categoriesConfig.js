export const EXPENSE_CATEGORIES = [
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping-cart',
    color: '#2979FF',
    description: 'Groceries, clothes, and general shopping',
  },
  {
    id: 'internet',
    name: 'Internet',
    icon: 'wifi',
    color: '#2979FF',
    description: 'Internet bills and connectivity',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'check-circle',
    color: '#2979FF',
    description: 'Cleaning supplies and services',
  },
  {
    id: 'rent',
    name: 'Rent',
    icon: 'home',
    color: '#2979FF',
    description: 'Monthly rent and housing costs',
  },
  {
    id: 'transportation',
    name: 'Transport',
    icon: 'truck',
    color: '#FF6B35',
    description: 'Gas, public transport, taxi',
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'coffee',
    color: '#4CAF50',
    description: 'Restaurants, takeout, dining',
  },
  {
    id: 'entertainment',
    name: 'Fun',
    icon: 'film',
    color: '#9C27B0',
    description: 'Movies, games, entertainment',
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'heart',
    color: '#F44336',
    description: 'Medical, pharmacy, fitness',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'book',
    color: '#FF9800',
    description: 'Books, courses, learning',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'plus',
    color: '#607D8B',
    description: 'Miscellaneous expenses',
  },
];

// Income categories
export const INCOME_CATEGORIES = [
  {
    id: 'salary',
    name: 'Salary',
    icon: 'dollar-sign',
    color: '#4CAF50',
    description: 'Monthly salary and wages',
  },
  {
    id: 'freelance',
    name: 'Freelance',
    icon: 'briefcase',
    color: '#2196F3',
    description: 'Freelance work and projects',
  },
  {
    id: 'investment',
    name: 'Investment',
    icon: 'trending-up',
    color: '#FF9800',
    description: 'Investment returns and dividends',
  },
  {
    id: 'gift',
    name: 'Gift',
    icon: 'gift',
    color: '#E91E63',
    description: 'Gifts and bonuses received',
  },
  {
    id: 'other-income',
    name: 'Other',
    icon: 'plus-circle',
    color: '#607D8B',
    description: 'Other sources of income',
  },
];

// Helper function to get category by id
export const getCategoryById = (categories, id) => {
  return categories.find((category) => category.id === id);
};

// Helper function to get category color
export const getCategoryColor = (categories, id) => {
  const category = getCategoryById(categories, id);
  return category ? category.color : '#607D8B';
};

// Helper function to get category name
export const getCategoryName = (categories, id) => {
  const category = getCategoryById(categories, id);
  return category ? category.name : 'Unknown';
};

// Filter categories by type
export const getExpenseCategories = () => EXPENSE_CATEGORIES;
export const getIncomeCategories = () => INCOME_CATEGORIES;
