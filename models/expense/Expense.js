import { getAuth } from 'firebase/auth';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  length
} from 'firebase/firestore';
import { app, db } from '../../firebase';
import Notification from 'models/notifications/notifications';
import Group from 'models/group/group';
import User from 'models/auth/user';
import { DEFAULT_CATEGORIES } from '../../constants/category';

class Expense {
  user_id;
  title;
  amount;
  category;
  description;
  incurred_at;
  group_id;
  settlement;

  constructor(title, amount, category, note, group_id) {
    this.title = title;
    this.amount = parseFloat(amount);
    this.category = category;
    this.description = note || '';
    this.user_id = null;
    this.incurred_at = null;
    this.group_id = group_id; // Optional, can be set later if needed
    this.settlement = false;

    console.log('New Expense Created:', {
      title: this.title,
      amount: this.amount,
      category: this.category,
      description: this.description,
      user_id: this.user_id,
      incurred_at: this.incurred_at,
      group_id: this.group_id,
    });
  }

  validate() {
    if (!this.title || !this.amount || !this.category) {
      throw new Error('All fields (name, amount, category) are required');
    }
    if (this.title.length > 100) {
      throw new Error('Title cannot exceed 100 characters');
    }
    if (this.description && this.description.length > 3000) {
      throw new Error('Description cannot exceed 3000 characters');
    }
    if (isNaN(this.amount) || this.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    return true;
  }

  async save() {
    this.validate();

    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    this.user_id = currentUser.uid;

    this.incurred_at = Timestamp.now();

    const expenseData = {
      user_id: this.user_id,
      title: this.title,
      amount: this.amount,
      category: this.category,
      description: this.description,
      incurred_at: this.incurred_at,
      group_id: this.group_id || null,
      settlement: this.settlement,
    };

    const expensesCollection = collection(db, 'expenses');
    const docRef = await addDoc(expensesCollection, expenseData);

    const creatorName = await User.getUsernameById(this.user_id).catch(() => 'Someone');

    const selfNotification = new Notification(
      this.user_id,
      this.user_id,
      'expense_created',
      `You have created a new expense: ${this.title} of amount ${this.amount}`
    );
    selfNotification.groupId = this.group_id;
    selfNotification.expenseId = docRef.id;
    await selfNotification.save();

    if (this.group_id) {
      try {
        const group = await Group.getGroupById(this.group_id);
        const members = group.members || [];
        await Promise.all(
          members.map(async (m) => {
            if (m && m.id && m.id !== this.user_id) {
              const notif = new Notification(
                this.user_id,
                m.id,
                'group_expense',
                `${creatorName} added a new expense "${this.title}" of ${this.amount}`
              );
              notif.groupId = this.group_id;
              notif.expenseId = docRef.id;
              await notif.save();
            }
          })
        );
      } catch (err) {
        console.error('Error sending group expense notifications:', err);
      }
    }

    console.log('Expense saved with ID:', docRef.id);
    return docRef.id;
  }

  /**
   * Update an existing expense by ID
   * @param {string} expenseId - The expense ID to update
   * @param {Object} updateData - The data to update {title, amount, category, description, group_id}
   * @returns {Promise<void>} - Resolves when the expense is updated
   */
  static async updateExpense(expenseId, updateData) {
    if (!expenseId || typeof expenseId !== 'string') {
      throw new Error('A valid expenseId (string) is required');
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required');
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    try {
      // Get the existing expense to check ownership
      const existingExpense = await Expense.getExpenseByID(expenseId);

      if (!existingExpense) {
        throw new Error('Expense not found');
      }

      // Check if the current user owns this expense
      if (existingExpense.user_id !== currentUser.uid) {
        throw new Error('You do not have permission to edit this expense');
      }

      // Validate the update data
      if (updateData.title && updateData.title.length > 100) {
        throw new Error('Title cannot exceed 100 characters');
      }
      if (updateData.description && updateData.description.length > 3000) {
        throw new Error('Description cannot exceed 3000 characters');
      }
      if (updateData.amount && (isNaN(updateData.amount) || parseFloat(updateData.amount) <= 0)) {
        throw new Error('Amount must be a positive number');
      }

      const expenseRef = doc(db, 'expenses', expenseId);

      const finalUpdateData = {
        ...updateData,
        amount: updateData.amount ? parseFloat(updateData.amount) : existingExpense.amount,
        updated_at: Timestamp.now(),
      };

      await updateDoc(expenseRef, finalUpdateData);

      // Create self notification
      const selfNotification = new Notification(
        currentUser.uid,
        currentUser.uid,
        'expense_updated',
        `You have updated your expense: ${finalUpdateData.title || existingExpense.title} with amount ${finalUpdateData.amount}`
      );
      selfNotification.groupId = finalUpdateData.group_id || existingExpense.group_id;
      selfNotification.expenseId = expenseId;
      await selfNotification.save();

      // If this is a group expense, notify other group members
      const groupId = finalUpdateData.group_id || existingExpense.group_id;
      if (groupId && groupId !== `personal_${currentUser.uid}`) {
        try {
          const group = await Group.getGroupById(groupId);
          const members = group.members || [];
          const updaterName = await User.getUsernameById(currentUser.uid).catch(() => 'Someone');

          await Promise.all(
            members.map(async (m) => {
              if (m && m.id && m.id !== currentUser.uid) {
                const notif = new Notification(
                  currentUser.uid,
                  m.id,
                  'group_expense_updated',
                  `${updaterName} updated an expense "${finalUpdateData.title || existingExpense.title}" with amount ${finalUpdateData.amount}`
                );
                notif.groupId = groupId;
                notif.expenseId = expenseId;
                await notif.save();
              }
            })
          );
        } catch (err) {
          console.error('Error sending group expense update notifications:', err);
        }
      }

      console.log('Expense updated successfully with ID:', expenseId);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }
  static async GetAllExpenseByUser() {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const expensesCollection = collection(db, 'expenses');
    const q = query(expensesCollection, where('user_id', '==', currentUser.uid));

    const snapshot = await getDocs(q);

    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
    }));

    return expenses;
  }

  static async RecentlyActivityByUser() {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const expensesCollection = collection(db, 'expenses');

    const q = query(
      expensesCollection,
      where('user_id', '==', currentUser.uid),
      orderBy('incurred_at', 'desc'),
      limit(3)
    );

    const snapshot = await getDocs(q);

    const recentExpenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
    }));

    return recentExpenses;
  }

  /**
   * Fetch all expenses for a given group, ordered by date (newest first).
   * @param {string} groupId
   * @returns {Promise<Array<object>>}
   */
  static async getExpensesByGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const expensesCol = collection(db, 'expenses');
    const q = query(expensesCol, where('group_id', '==', groupId), orderBy('incurred_at', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
    }));
  }

  /**
   * Fetch up to `n` expenses for a given group, ordered by date (newest first).
   * @param {string} groupId
   * @param {number} n  — maximum number of expenses to return
   * @returns {Promise<Array<object>>}
   */
  static async getExpensesByGroupWithLimit(groupId, n) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }
    if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) {
      throw new Error('Limit `n` must be a positive integer');
    }

    const expensesCol = collection(db, 'expenses');
    const q = query(
      expensesCol,
      where('group_id', '==', groupId),
      orderBy('incurred_at', 'desc'),
      limit(n)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      amount: doc.data().amount ? parseFloat(doc.data().amount.toFixed(2)) : 0,
    }));
  }

  // function that return the total amount of expenses for a given group
  static async getTotalExpensesByGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const expenses = await this.getExpensesByGroup(groupId);
    // Only count regular expenses, not settlement transactions, for fair share calculation
    const total = expenses.reduce((total, expense) => {
      if (!expense.is_settlement) {
        return total + expense.amount;
      }
      return total;
    }, 0);
    return parseFloat(total.toFixed(2));
  }

  // Return an object mapping each user to their total spent in the group
  static async getTotalExpensesPerUserByGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const expenses = await this.getExpensesByGroup(groupId);
    return expenses.reduce((totals, expense) => {
      const { user_id, amount, is_settlement, settlement_type } = expense;
      
      if (!totals[user_id]) totals[user_id] = 0;
      
      if (is_settlement) {
        // For settlement transactions, handle them specially
        if (settlement_type === 'payment') {
          // Settlement payment increases the payer's total spending
          totals[user_id] += amount;
        } else if (settlement_type === 'receipt') {
          // Settlement receipt acts as a negative expense (reduces total spending)
          totals[user_id] -= amount;
        }
      } else {
        // Regular expenses
        totals[user_id] += amount;
      }
      
      return totals;
    }, {});
  }

  // function that return the total amount of expenses for the current user and the giving group
  static async getTotalExpensesByUserAndGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const expenses = await this.getExpensesByGroup(groupId);
    const userExpenses = expenses.filter((expense) => expense.user_id === currentUser.uid);

    const total = userExpenses.reduce((total, expense) => total + expense.amount, 0);
    return parseFloat(total.toFixed(2));
  }

  // function that return the total amount of expenses for the current user he paid in all groups
  static async getTotalExpensesByUser() {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const expenses = await this.GetAllExpenseByUser();
    const total = expenses.reduce((total, expense) => total + expense.amount, 0);
    return parseFloat(total.toFixed(2));
  }

  // a function the return if the member is + or - in the group
  // by deviding the total amount of expenses by the number of members in the group and then subtracting the total amount of expenses by the current user
  static async getBalanceByUserAndGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const totalExpenses = await this.getTotalExpensesByGroup(groupId);
    const totalExpensesPerUser = await this.getTotalExpensesPerUserByGroup(groupId);

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const userExpense = totalExpensesPerUser[currentUser.uid] || 0;
    const balance = userExpense - totalExpenses / Object.keys(totalExpensesPerUser).length;

    return parseFloat(balance.toFixed(2));
  }

  // same function as above but for all members in the group
  static async getBalanceByAllUsersInGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const totalExpenses = await this.getTotalExpensesByGroup(groupId);
    const totalExpensesPerUser = await this.getTotalExpensesPerUserByGroup(groupId);

    const balances = {};
    for (const userId in totalExpensesPerUser) {
      const userExpense = totalExpensesPerUser[userId] || 0;
      const balance = userExpense - totalExpenses / Object.keys(totalExpensesPerUser).length;
      balances[userId] = parseFloat(balance.toFixed(2));
    }

    return balances;
  }

  // Return the total amount others owe the current user across all groups
  static async getTotalOwedToUser() {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const groups = await Group.getGroupsByUser(currentUser.uid);
    const balances = await Promise.all(groups.map((g) => this.getBalanceByUserAndGroup(g.id)));

    const total = balances.filter((b) => b > 0).reduce((sum, b) => sum + b, 0);
    return parseFloat(total.toFixed(2));
  }

  // Return the total amount the current user owes to others across all groups
  static async getTotalYouOwe() {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const groups = await Group.getGroupsByUser(currentUser.uid);
    const balances = await Promise.all(groups.map((g) => this.getBalanceByUserAndGroup(g.id)));

    const total = balances.filter((b) => b < 0).reduce((sum, b) => sum + Math.abs(b), 0);
    return parseFloat(total.toFixed(2));
  }

  /**
   * Get expense overview by category for a specific month/year
   * @param {string} groupId - Group ID (optional, if null gets user's personal expenses)
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise<Object>} - Object containing category breakdown and total
   */
  static async getExpenseOverview(groupId = null, month = null, year = null) {
    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // If no month/year provided, use current month/year
      const now = new Date();
      const targetMonth = month || now.getMonth() + 1; // getMonth() returns 0-11
      const targetYear = year || now.getFullYear();

      // Create start and end dates for the month
      const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
      const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const expensesCollection = collection(db, 'expenses');
      let q;

      if (groupId) {
        // Get expenses for specific group
        q = query(
          expensesCollection,
          where('group_id', '==', groupId),
          where('incurred_at', '>=', Timestamp.fromDate(startOfMonth)),
          where('incurred_at', '<=', Timestamp.fromDate(endOfMonth))
        );
      } else {
        // Get user's personal expenses
        q = query(
          expensesCollection,
          where('user_id', '==', currentUser.uid),
          where('incurred_at', '>=', Timestamp.fromDate(startOfMonth)),
          where('incurred_at', '<=', Timestamp.fromDate(endOfMonth))
        );
      }

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create category mapping for easy lookup
      const categoryMap = {};
      DEFAULT_CATEGORIES.forEach((cat) => {
        categoryMap[cat.id] = cat;
        categoryMap[cat.name] = cat;
      });

      // Calculate totals by category
      const categoryTotals = {};
      let totalAmount = 0;

      expenses.forEach((expense) => {
        let categoryKey = expense.category || 'Other';
        const amount = expense.amount || 0;

        // If category is an ID (number), get the name
        const categoryInfo = categoryMap[categoryKey];
        if (categoryInfo) {
          categoryKey = categoryInfo.name;
        }

        if (!categoryTotals[categoryKey]) {
          categoryTotals[categoryKey] = 0;
        }
        categoryTotals[categoryKey] += amount;
        totalAmount += amount;
      });

      // Convert to array with percentages and sort by amount (descending)
      const categoryData = Object.keys(categoryTotals)
        .map((categoryName) => {
          // Find the category info from DEFAULT_CATEGORIES
          const categoryInfo = DEFAULT_CATEGORIES.find((cat) => cat.name === categoryName) || {
            name: categoryName,
            color: '#9CA3AF',
          }; // fallback color

          return {
            category: categoryName,
            amount: categoryTotals[categoryName],
            percentage:
              totalAmount > 0 ? Math.round((categoryTotals[categoryName] / totalAmount) * 100) : 0,
            color: categoryInfo.color,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      const categoryDataWithColors = categoryData;

      return {
        categoryData: categoryDataWithColors,
        totalAmount,
        month: targetMonth,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', {
          month: 'long',
        }),
        expenseCount: expenses.length,
      };
    } catch (error) {
      console.error('Error getting expense overview:', error);
      throw error;
    }
  }

  /**
   * Get expense overview for current user across all groups for a specific month
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise<Object>} - Combined overview data
   */
  static async getExpenseOverviewAllGroups(month = null, year = null) {
    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // If no month/year provided, use current month/year
      const now = new Date();
      const targetMonth = month || now.getMonth() + 1;
      const targetYear = year || now.getFullYear();

      // Create start and end dates for the month
      const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
      const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const expensesCollection = collection(db, 'expenses');
      const q = query(
        expensesCollection,
        where('user_id', '==', currentUser.uid),
        where('incurred_at', '>=', Timestamp.fromDate(startOfMonth)),
        where('incurred_at', '<=', Timestamp.fromDate(endOfMonth))
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create category mapping for easy lookup
      const categoryMap = {};
      DEFAULT_CATEGORIES.forEach((cat) => {
        categoryMap[cat.id] = cat;
        categoryMap[cat.name] = cat;
      });

      // Calculate totals by category
      const categoryTotals = {};
      let totalAmount = 0;

      expenses.forEach((expense) => {
        let categoryKey = expense.category || 'Other';
        const amount = expense.amount || 0;

        // If category is an ID (number), get the name
        const categoryInfo = categoryMap[categoryKey];
        if (categoryInfo) {
          categoryKey = categoryInfo.name;
        }

        if (!categoryTotals[categoryKey]) {
          categoryTotals[categoryKey] = 0;
        }
        categoryTotals[categoryKey] += amount;
        totalAmount += amount;
      });

      // Convert to array with percentages and sort by amount (descending)
      const categoryData = Object.keys(categoryTotals)
        .map((categoryName) => {
          // Find the category info from DEFAULT_CATEGORIES
          const categoryInfo = DEFAULT_CATEGORIES.find((cat) => cat.name === categoryName) || {
            name: categoryName,
            color: '#9CA3AF',
          }; // fallback color

          return {
            category: categoryName,
            amount: categoryTotals[categoryName],
            percentage:
              totalAmount > 0 ? Math.round((categoryTotals[categoryName] / totalAmount) * 100) : 0,
            color: categoryInfo.color,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      const categoryDataWithColors = categoryData;

      return {
        categoryData: categoryDataWithColors,
        totalAmount,
        month: targetMonth,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', {
          month: 'long',
        }),
        expenseCount: expenses.length,
      };
    } catch (error) {
      console.error('Error getting expense overview for all groups:', error);
      throw error;
    }
  }

  /**
   * Returns paginated expenses for a given group.
   * @param {string} groupId - The group ID
   * @param {number} page - Page number (starts from 1)
   * @param {number} pageSize - Number of items per page
   * @returns {Promise<Object>} - Object containing expenses array, pagination info, and totals
   */
  static async getExpensesByGroupPaginated(groupId, page = 1, pageSize = 10) {
    if (!groupId) {
      throw new Error('Group ID is required for paginated fetching.');
    }

    const expensesCol = collection(db, 'expenses');
    const q = query(expensesCol, where('group_id', '==', groupId), orderBy('incurred_at', 'desc'));

    const snapshot = await getDocs(q);
    const totalItems = snapshot.size;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    const expensesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch usernames for each expense
    const expensesWithUsernames = await Promise.all(
      expensesData.map(async (expense) => {
        try {
          const username = await User.getUsernameById(expense.user_id);
          return { ...expense, user_name: username };
        } catch (error) {
          console.warn(`Could not fetch username for user_id: ${expense.user_id}`, error);
          return { ...expense, user_name: 'Unknown' }; // fallback
        }
      })
    );

    const paginatedExpenses = expensesWithUsernames.slice(startIndex, endIndex);

    return {
      expenses: paginatedExpenses,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        startIndex: startIndex + 1,
        endIndex: endIndex,
      },
    };
  }

  /**
   * Alternative implementation using startAfter for better performance with large datasets
   * @param {string} groupId - The group ID
   * @param {number} pageSize - Number of items per page
   * @param {Object} lastDoc - Last document from previous page (for cursor-based pagination)
   * @returns {Promise<Object>} - Object containing expenses array and pagination info
   */
  static async getExpensesByGroupCursor(groupId, pageSize = 10, lastDoc = null) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    if (typeof pageSize !== 'number' || !Number.isInteger(pageSize) || pageSize <= 0) {
      throw new Error('PageSize must be a positive integer');
    }

    try {
      const expensesCol = collection(db, 'expenses');

      let q = query(
        expensesCol,
        where('group_id', '==', groupId),
        orderBy('incurred_at', 'desc'),
        limit(pageSize + 1) // Get one extra to check if there's a next page
      );

      // If we have a lastDoc, start after it
      if (lastDoc) {
        q = query(
          expensesCol,
          where('group_id', '==', groupId),
          orderBy('incurred_at', 'desc'),
          startAfter(lastDoc),
          limit(pageSize + 1)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      // Check if there's a next page
      const hasNextPage = docs.length > pageSize;

      // Remove the extra document if it exists
      const expenses = docs.slice(0, pageSize).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        _doc: doc, // Keep reference for next page cursor
      }));

      const currentPageTotal = expenses.reduce(
        (total, expense) => total + (expense.amount || 0),
        0
      );

      return {
        expenses,
        pagination: {
          pageSize,
          hasNextPage,
          itemCount: expenses.length,
          lastDoc: expenses.length > 0 ? expenses[expenses.length - 1]._doc : null,
        },
        totals: {
          currentPageTotal,
          itemCount: expenses.length,
        },
      };
    } catch (error) {
      console.error('Error fetching cursor-based paginated expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }
  }

  /**
   * Function for filter with date range or categories or amount range or all of them
   * @param {string} groupId - The group ID
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @param {Array<string>} categories - Array of categories to filter by
   * @param {number} minAmount - Minimum amount for filtering
   * @param {number} maxAmount - Maximum amount for filtering
   * @returns {Promise<Array<object>>} - Filtered expenses
   */
  static async filterExpenses(
    groupId,
    startDate = null,
    endDate = null,
    categories = [],
    minAmount = null,
    maxAmount = null
  ) {
    console.log('MODEL:FilterExpenses called with:', {
      groupId,
      startDate,
      endDate,
      categories,
      minAmount,
      maxAmount,
    });

    try {
      if (categories) {
        console.log('Filtering by categories:', categories);
      }

      // Start with base query filtering by groupId
      let expenseQuery = query(collection(db, 'expenses'), where('group_id', '==', groupId));

      // Apply date range filters if provided
      if (startDate) {
        expenseQuery = query(expenseQuery, where('incurred_at', '>=', startDate));
      }

      if (endDate) {
        expenseQuery = query(expenseQuery, where('incurred_at', '<=', endDate));
      }

      // Apply category filter if provided
      if (categories && categories.length > 0) {
        expenseQuery = query(expenseQuery, where('category', 'in', categories));
        console.log('Filtering by categories:', categories);
      }

      // Apply amount range filters if provided
      if (minAmount !== null) {
        expenseQuery = query(expenseQuery, where('amount', '>=', minAmount));
      }

      if (maxAmount !== null) {
        expenseQuery = query(expenseQuery, where('amount', '<=', maxAmount));
      }

      // Add ordering by date (most recent first)
      expenseQuery = query(expenseQuery, orderBy('incurred_at', 'desc'));

      // Execute the query
      const querySnapshot = await getDocs(expenseQuery);

      // Convert documents to array of objects
      const expenses = [];
      querySnapshot.forEach((doc) => {
        expenses.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return expenses;
    } catch (error) {
      console.error('Error filtering expenses:', error);
      throw new Error(`Failed to filter expenses: ${error.message}`);
    }
  }

  
  /**
   * Function to handle Settle up expenses between users in a group
   * This function creates settlement transactions to make all users have zero balance
   *
   * Example:
   * - User A paid 100, balance: +20 (owed 20)
   * - User B paid 60, balance: -20 (owes 20)
   * - User C paid 80, balance: 0 (even)
   *
   * Result: Creates a settlement transaction where B pays A 20, making all balances 0
   *
   * @param {string} groupId - The group ID to settle up
   * @returns {Promise<Object>} - Settlement summary and created transactions
   */
  static async settleUpGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    try {
      // Get group details to check if current user is admin
      const group = await Group.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if current user is the group creator (admin)
      if (group.created_by !== currentUser.uid) {
        throw new Error('Only group admin can settle up expenses');
      }

      // Get all balances for users in the group
      const balances = await this.getBalanceByAllUsersInGroup(groupId);

      if (!balances || Object.keys(balances).length === 0) {
        throw new Error('No expenses found to settle');
      }

      // Check if settlement is needed (if any user has non-zero balance)
      const hasUnbalancedUsers = Object.values(balances).some(
        (balance) => Math.abs(balance) > 0.01
      );

      if (!hasUnbalancedUsers) {
        return {
          success: true,
          message: 'All expenses are already settled',
          settlementsCreated: [],
          totalSettled: 0,
        };
      }

      // Separate users who owe money and users who are owed money
      const creditors = []; // Users who are owed money (positive balance)
      const debtors = [];   // Users who owe money (negative balance)

      for (const [userId, balance] of Object.entries(balances)) {
        if (balance > 0.01) {
          creditors.push({ userId, amount: balance });
        } else if (balance < -0.01) {
          debtors.push({ userId, amount: Math.abs(balance) });
        }
      }

      const settlementsCreated = [];
      let totalSettled = 0;

      // Create settlement transactions between debtors and creditors
      let creditorIndex = 0;
      let debtorIndex = 0;

      while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
        const creditor = creditors[creditorIndex];
        const debtor = debtors[debtorIndex];

        // Calculate settlement amount (minimum of what's owed and what's due)
        const settlementAmount = Math.min(creditor.amount, debtor.amount);

        // Get usernames for the settlement description
        const creditorName = await User.getUsernameById(creditor.userId).catch(() => 'Unknown User');
        const debtorName = await User.getUsernameById(debtor.userId).catch(() => 'Unknown User');

        // Create settlement records that balance the users without affecting expense totals
        // Settlement payment from debtor
        const settlementPayment = {
          user_id: debtor.userId,
          title: `Settlement Payment to ${creditorName}`,
          amount: settlementAmount,
          category: 'Settlement',
          description: `Settlement payment from ${debtorName} to ${creditorName}`,
          incurred_at: Timestamp.now(),
          group_id: groupId,
          is_settlement: true,
          settlement_type: 'payment',
          settled_by: currentUser.uid,
          settlement_from: debtor.userId,
          settlement_to: creditor.userId,
        };

        // Settlement receipt for creditor (same amount, different perspective)
        const settlementReceipt = {
          user_id: creditor.userId,
          title: `Settlement Received from ${debtorName}`,
          amount: settlementAmount,
          category: 'Settlement',
          description: `Settlement received from ${debtorName}`,
          incurred_at: Timestamp.now(),
          group_id: groupId,
          is_settlement: true,
          settlement_type: 'receipt',
          settled_by: currentUser.uid,
          settlement_from: debtor.userId,
          settlement_to: creditor.userId,
        };

        // Save both settlement records to Firestore
        const expensesCollection = collection(db, 'expenses');
        const [paymentDocRef, receiptDocRef] = await Promise.all([
          addDoc(expensesCollection, settlementPayment),
          addDoc(expensesCollection, settlementReceipt)
        ]);

        settlementsCreated.push({
          id: paymentDocRef.id,
          from: debtorName,
          to: creditorName,
          fromUserId: debtor.userId,
          toUserId: creditor.userId,
          amount: settlementAmount,
          title: settlementPayment.title,
          type: 'payment'
        }, {
          id: receiptDocRef.id,
          from: debtorName,
          to: creditorName,
          fromUserId: debtor.userId,
          toUserId: creditor.userId,
          amount: settlementAmount,
          title: settlementReceipt.title,
          type: 'receipt'
        });

        totalSettled += settlementAmount;

        // Update remaining amounts
        creditor.amount -= settlementAmount;
        debtor.amount -= settlementAmount;

        // Move to next creditor/debtor if current one is fully settled
        if (creditor.amount <= 0.01) {
          creditorIndex++;
        }
        if (debtor.amount <= 0.01) {
          debtorIndex++;
        }

        // Create notifications for both users involved in the settlement
        const debtorNotification = new Notification(
          currentUser.uid,
          debtor.userId,
          'settlement_payment',
          `You have a settlement payment of ${settlementAmount.toFixed(2)} to ${creditorName}`
        );
        debtorNotification.groupId = groupId;
        debtorNotification.expenseId = paymentDocRef.id;
        await debtorNotification.save();

        const creditorNotification = new Notification(
          currentUser.uid,
          creditor.userId,
          'settlement_received',
          `You will receive a settlement payment of ${settlementAmount.toFixed(2)} from ${debtorName}`
        );
        creditorNotification.groupId = groupId;
        creditorNotification.expenseId = receiptDocRef.id;
        await creditorNotification.save();
      }

      // Create notifications for all group members about the settlement
      const groupMembers = group.members || [];
      const adminNotificationPromises = [];
      const actualSettlementCount = settlementsCreated.length / 2; // Since we create 2 records per settlement

      for (const member of groupMembers) {
        if (member && member.id && member.id !== currentUser.uid) {
          const notification = new Notification(
            currentUser.uid,
            member.id,
            'group_settled',
            `Group expenses have been settled up by admin. ${actualSettlementCount} settlement transactions were created.`
          );
          notification.groupId = groupId;
          adminNotificationPromises.push(notification.save());
        }
      }

      await Promise.all(adminNotificationPromises);

      return {
        success: true,
        message: `Successfully created ${actualSettlementCount} settlement transactions`,
        settlementsCreated,
        totalSettled: parseFloat(totalSettled.toFixed(2)),
        summary: {
          totalTransactions: actualSettlementCount,
          creditorCount: creditors.length,
          debtorCount: debtors.length,
          groupBalanced: true,
        },
      };
    } catch (error) {
      console.error('Error settling up group:', error);
      throw error;
    }
  }

  /**
   * Function to get expense details by id
   * @param {string} expenseId - The expense ID
   * @returns {Promise<Object>} - Expense details object
   */
  static async getExpenseByID(expenseId) {
    if (!expenseId || typeof expenseId !== 'string') {
      throw new Error('A valid expenseId (string) is required');
    }

    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      const expenseDoc = await getDoc(expenseRef);
      if (!expenseDoc.exists()) {
        throw new Error('Expense not found');
      }

      const expenseData = {
        id: expenseDoc.id,
        ...expenseDoc.data(),
      };

      // Format amount to 2 decimal places
      if (expenseData.amount && typeof expenseData.amount === 'number') {
        expenseData.amount = parseFloat(expenseData.amount.toFixed(2));
      }

      // Fetch the username for the user who created this expense
      if (expenseData.user_id) {
        try {
          const username = await User.getUsernameById(expenseData.user_id);
          expenseData.user_name = username;
        } catch (error) {
          console.warn(`Could not fetch username for user_id: ${expenseData.user_id}`, error);
          expenseData.user_name = 'Unknown';
        }
      } else {
        expenseData.user_name = 'Unknown';
      }

      return expenseData;
    } catch (error) {
      console.error('Error fetching expense by ID:', error);
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }
  }

  /**
   * Function to delete an expense by expenseID
   * @param {string} expenseId -The expense ID
   * @return {Promise<void>} - Resolves when the expense is deleted
   */
  static async deleteExpenseByID(expenseId) {
    if (!expenseId || typeof expenseId !== 'string') {
      throw new Error('A valid expenseId (string) is required');
    }

    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense by ID:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  }
}

export default Expense;
