import { collection, query, where, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, app } from '../../firebase';
import Group from '../../models/group/group';
import User from '../../models/auth/user';

/**
 * Search service for expenses with various criteria
 */
class ExpenseSearchService {
  /**
   * Helper method to safely convert string to lowercase
   * @param {any} value - Value to convert
   * @returns {string} - Lowercase string or empty string if invalid
   */
  static safeToLowerCase(value) {
    if (value && typeof value === 'string') {
      return value.toLowerCase();
    }
    return '';
  }

  /**
   * Helper method to safely check if a string contains a search term
   * @param {any} value - Value to search in
   * @param {string} searchTerm - Term to search for
   * @returns {boolean} - True if found, false otherwise
   */
  static containsSearchTerm(value, searchTerm) {
    const safeValue = this.safeToLowerCase(value);
    return safeValue.includes(searchTerm);
  }
  /**
   * Search expenses by text across title, description, and category
   * @param {string} searchText - The text to search for
   * @param {string} groupId - Optional group ID to limit search scope
   * @param {Object} options - Additional search options
   * @returns {Promise<Array>} - Array of matching expenses
   */
  static async searchByText(searchText, groupId = null, options = {}) {
    if (!searchText || searchText.trim().length === 0) {
      return [];
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User must be authenticated to search expenses');
    }

    try {
      const expensesCollection = collection(db, 'expenses');
      let constraints = [];

      // Add group filter if specified (for group searches, we don't filter by user_id)
      if (groupId) {
        constraints.push(where('group_id', '==', groupId));
      } else {
        // Only filter by user_id if no group is specified (personal expenses)
        constraints.push(where('user_id', '==', currentUser.uid));
      }

      // Add date range filter if specified
      if (options.startDate) {
        constraints.push(where('incurred_at', '>=', options.startDate));
      }
      if (options.endDate) {
        constraints.push(where('incurred_at', '<=', options.endDate));
      }

      let q;
      if (constraints.length > 0) {
        q = query(
          expensesCollection,
          ...constraints,
          orderBy('incurred_at', 'desc')
        );
      } else {
        // If no constraints, just order by date
        q = query(
          expensesCollection,
          orderBy('incurred_at', 'desc')
        );
      }

      console.log('Search query constraints:', constraints);
      const snapshot = await getDocs(q);
      console.log('Raw expenses found:', snapshot.docs.length);
      
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
      }));

      // Filter by search text (case-insensitive)
      const searchTerm = searchText.toLowerCase().trim();
      console.log('Filtering with search term:', searchTerm);
      
      const filteredExpenses = expenses.filter(expense => {
        const titleMatch = this.containsSearchTerm(expense.title, searchTerm);
        const descMatch = this.containsSearchTerm(expense.description, searchTerm);
        const catMatch = this.containsSearchTerm(expense.category, searchTerm);
        
        if (titleMatch || descMatch || catMatch) {
          console.log('Match found:', expense.title, {titleMatch, descMatch, catMatch});
        }
        
        return titleMatch || descMatch || catMatch;
      });

      console.log('Filtered expenses count:', filteredExpenses.length);

      // Add user information and format results
      const enrichedExpenses = await this.enrichExpensesWithUserInfo(filteredExpenses);

      return enrichedExpenses;
    } catch (error) {
      console.error('Error searching expenses:', error);
      throw new Error('Failed to search expenses: ' + error.message);
    }
  }

  /**
   * Search expenses by category
   * @param {Array<string>} categories - Array of categories to search for
   * @param {string} groupId - Optional group ID to limit search scope
   * @param {Object} options - Additional search options
   * @returns {Promise<Array>} - Array of matching expenses
   */
  static async searchByCategory(categories, groupId = null, options = {}) {
    if (!categories || categories.length === 0) {
      return [];
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User must be authenticated to search expenses');
    }

    try {
      const expensesCollection = collection(db, 'expenses');
      let constraints = [
        where('user_id', '==', currentUser.uid),
        where('category', 'in', categories)
      ];

      if (groupId) {
        constraints.push(where('group_id', '==', groupId));
      }

      if (options.startDate) {
        constraints.push(where('incurred_at', '>=', options.startDate));
      }
      if (options.endDate) {
        constraints.push(where('incurred_at', '<=', options.endDate));
      }

      const q = query(
        expensesCollection,
        ...constraints,
        orderBy('incurred_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
      }));

      return await this.enrichExpensesWithUserInfo(expenses);
    } catch (error) {
      console.error('Error searching expenses by category:', error);
      throw new Error('Failed to search expenses by category: ' + error.message);
    }
  }

  /**
   * Search expenses by amount range
   * @param {number} minAmount - Minimum amount
   * @param {number} maxAmount - Maximum amount
   * @param {string} groupId - Optional group ID to limit search scope
   * @param {Object} options - Additional search options
   * @returns {Promise<Array>} - Array of matching expenses
   */
  static async searchByAmountRange(minAmount, maxAmount, groupId = null, options = {}) {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User must be authenticated to search expenses');
    }

    try {
      const expensesCollection = collection(db, 'expenses');
      let constraints = [where('user_id', '==', currentUser.uid)];

      if (groupId) {
        constraints.push(where('group_id', '==', groupId));
      }

      if (minAmount !== null && minAmount !== undefined) {
        constraints.push(where('amount', '>=', minAmount));
      }
      if (maxAmount !== null && maxAmount !== undefined) {
        constraints.push(where('amount', '<=', maxAmount));
      }

      if (options.startDate) {
        constraints.push(where('incurred_at', '>=', options.startDate));
      }
      if (options.endDate) {
        constraints.push(where('incurred_at', '<=', options.endDate));
      }

      const q = query(
        expensesCollection,
        ...constraints,
        orderBy('incurred_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
      }));

      return await this.enrichExpensesWithUserInfo(expenses);
    } catch (error) {
      console.error('Error searching expenses by amount range:', error);
      throw new Error('Failed to search expenses by amount range: ' + error.message);
    }
  }

  /**
   * Advanced search with multiple criteria
   * @param {Object} searchCriteria - Object containing search parameters
   * @returns {Promise<Array>} - Array of matching expenses
   */
  static async advancedSearch(searchCriteria) {
    const {
      searchText = '',
      categories = [],
      minAmount = null,
      maxAmount = null,
      startDate = null,
      endDate = null,
      groupId = null,
      sortBy = 'date', // 'date', 'amount', 'title'
      sortOrder = 'desc', // 'asc', 'desc'
      limit = null
    } = searchCriteria;

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User must be authenticated to search expenses');
    }

    try {
      const expensesCollection = collection(db, 'expenses');
      let constraints = [where('user_id', '==', currentUser.uid)];

      // Apply filters
      if (groupId) {
        constraints.push(where('group_id', '==', groupId));
      }

      if (categories && categories.length > 0) {
        constraints.push(where('category', 'in', categories));
      }

      if (minAmount !== null && minAmount !== undefined) {
        constraints.push(where('amount', '>=', minAmount));
      }
      if (maxAmount !== null && maxAmount !== undefined) {
        constraints.push(where('amount', '<=', maxAmount));
      }

      if (startDate) {
        constraints.push(where('incurred_at', '>=', startDate));
      }
      if (endDate) {
        constraints.push(where('incurred_at', '<=', endDate));
      }

      // Add ordering
      let orderField = 'incurred_at';
      if (sortBy === 'amount') orderField = 'amount';
      if (sortBy === 'title') orderField = 'title';

      const q = query(
        expensesCollection,
        ...constraints,
        orderBy(orderField, sortOrder)
      );

      const snapshot = await getDocs(q);
      let expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
      }));

      // Apply text search filter if provided
      if (searchText && searchText.trim().length > 0) {
        const searchTerm = searchText.toLowerCase().trim();
        expenses = expenses.filter(expense => {
          return this.containsSearchTerm(expense.title, searchTerm) || 
                 this.containsSearchTerm(expense.description, searchTerm) || 
                 this.containsSearchTerm(expense.category, searchTerm);
        });
      }

      // Apply limit if specified
      if (limit && limit > 0) {
        expenses = expenses.slice(0, limit);
      }

      return await this.enrichExpensesWithUserInfo(expenses);
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error('Failed to perform advanced search: ' + error.message);
    }
  }

  /**
   * Search for recent expenses (quick search)
   * @param {number} days - Number of days to look back (default: 7)
   * @param {string} groupId - Optional group ID
   * @returns {Promise<Array>} - Array of recent expenses
   */
  static async searchRecentExpenses(days = 7, groupId = null) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.advancedSearch({
      startDate,
      endDate,
      groupId,
      sortBy: 'date',
      sortOrder: 'desc',
      limit: 20
    });
  }

  /**
   * Search for high-value expenses
   * @param {number} threshold - Minimum amount threshold
   * @param {string} groupId - Optional group ID
   * @returns {Promise<Array>} - Array of high-value expenses
   */
  static async searchHighValueExpenses(threshold = 100, groupId = null) {
    return await this.advancedSearch({
      minAmount: threshold,
      groupId,
      sortBy: 'amount',
      sortOrder: 'desc',
      limit: 10
    });
  }

  /**
   * Get search suggestions based on user's expense history
   * @param {string} partialText - Partial text input
   * @param {number} limit - Maximum number of suggestions
   * @returns {Promise<Object>} - Object containing title, category, and description suggestions
   */
  static async getSearchSuggestions(partialText, limit = 5) {
    if (!partialText || partialText.trim().length < 2) {
      return { titles: [], categories: [], descriptions: [] };
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return { titles: [], categories: [], descriptions: [] };
    }

    try {
      const expensesCollection = collection(db, 'expenses');
      const q = query(
        expensesCollection,
        where('user_id', '==', currentUser.uid),
        orderBy('incurred_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map(doc => doc.data());

      const searchTerm = partialText.toLowerCase().trim();
      
      // Get unique suggestions
      const titleSuggestions = [...new Set(
        expenses
          .filter(exp => this.containsSearchTerm(exp.title, searchTerm))
          .map(exp => exp.title)
          .filter(title => title && typeof title === 'string')
      )].slice(0, limit);

      const categorySuggestions = [...new Set(
        expenses
          .filter(exp => this.containsSearchTerm(exp.category, searchTerm))
          .map(exp => exp.category)
          .filter(category => category && typeof category === 'string')
      )].slice(0, limit);

      const descriptionSuggestions = [...new Set(
        expenses
          .filter(exp => this.containsSearchTerm(exp.description, searchTerm))
          .map(exp => exp.description)
          .filter(description => description && typeof description === 'string')
      )].slice(0, limit);

      return {
        titles: titleSuggestions,
        categories: categorySuggestions,
        descriptions: descriptionSuggestions
      };
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return { titles: [], categories: [], descriptions: [] };
    }
  }

  /**
   * Enrich expenses with user information
   * @param {Array} expenses - Array of expense objects
   * @returns {Promise<Array>} - Array of enriched expenses
   */
  static async enrichExpensesWithUserInfo(expenses) {
    try {
      // Get unique user IDs
      const userIds = [...new Set(expenses.map(expense => expense.user_id))];
      
      // Fetch user information for all unique users
      const userPromises = userIds.map(userId => 
        User.getUsernameById(userId).catch(() => 'Unknown User')
      );
      const userNames = await Promise.all(userPromises);
      
      // Create user map
      const userMap = {};
      userIds.forEach((userId, index) => {
        userMap[userId] = userNames[index];
      });

      // Enrich expenses with user names
      return expenses.map(expense => ({
        ...expense,
        user_name: userMap[expense.user_id] || 'Unknown User'
      }));
    } catch (error) {
      console.error('Error enriching expenses with user info:', error);
      // Return expenses without user names if enrichment fails
      return expenses.map(expense => ({
        ...expense,
        user_name: 'Unknown User'
      }));
    }
  }
}

export default ExpenseSearchService;