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
} from 'firebase/firestore';
import { app, db } from '../../firebase';
import Notification from 'models/notifications/notifications';
import Group from 'models/group/group';
import User from 'models/auth/user';

class Expense {
  user_id;
  title;
  amount;
  category;
  description;
  incurred_at;
  group_id;

  constructor(title, amount, category, note, group_id) {
    this.title = title;
    this.amount = parseFloat(amount);
    this.category = category;
    this.description = note || '';
    this.user_id = null;
    this.incurred_at = null;
    this.group_id = group_id; // Optional, can be set later if needed

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
    }));
  }

  // function that return the total amount of expenses for a given group
  static async getTotalExpensesByGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const expenses = await this.getExpensesByGroup(groupId);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // Return an object mapping each user to their total spent in the group
  static async getTotalExpensesPerUserByGroup(groupId) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    const expenses = await this.getExpensesByGroup(groupId);
    return expenses.reduce((totals, { user_id, amount }) => {
      if (!totals[user_id]) totals[user_id] = 0;
      totals[user_id] += amount;
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

    return userExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // function that return the total amount of expenses for the current user he paid in all groups
  static async getTotalExpensesByUser() {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const expenses = await this.GetAllExpenseByUser();
    return expenses.reduce((total, expense) => total + expense.amount, 0);
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

    return balance;
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
      balances[userId] = userExpense - totalExpenses / Object.keys(totalExpensesPerUser).length;
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

    return balances.filter((b) => b > 0).reduce((sum, b) => sum + b, 0);
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

    return balances.filter((b) => b < 0).reduce((sum, b) => sum + Math.abs(b), 0);
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

      // Calculate totals by category
      const categoryTotals = {};
      let totalAmount = 0;

      expenses.forEach((expense) => {
        const category = expense.category || 'Others';
        const amount = expense.amount || 0;

        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += amount;
        totalAmount += amount;
      });

      // Convert to array with percentages and sort by amount (descending)
      const categoryData = Object.keys(categoryTotals)
        .map((category) => ({
          category,
          amount: categoryTotals[category],
          percentage:
            totalAmount > 0 ? Math.round((categoryTotals[category] / totalAmount) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Assign colors to categories
      const colors = [
        '#2979FF',
        '#FF9800',
        '#00BCD4',
        '#673AB7',
        '#E91E63',
        '#4CAF50',
        '#FF5722',
        '#795548',
        '#607D8B',
        '#FFC107',
      ];

      const categoryDataWithColors = categoryData.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));

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

      // Calculate totals by category
      const categoryTotals = {};
      let totalAmount = 0;

      expenses.forEach((expense) => {
        const category = expense.category || 'Others';
        const amount = expense.amount || 0;

        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += amount;
        totalAmount += amount;
      });

      // Convert to array with percentages and sort by amount (descending)
      const categoryData = Object.keys(categoryTotals)
        .map((category) => ({
          category,
          amount: categoryTotals[category],
          percentage:
            totalAmount > 0 ? Math.round((categoryTotals[category] / totalAmount) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Assign colors to categories
      const colors = [
        '#2979FF',
        '#FF9800',
        '#00BCD4',
        '#673AB7',
        '#E91E63',
        '#4CAF50',
        '#FF5722',
        '#795548',
        '#607D8B',
        '#FFC107',
      ];

      const categoryDataWithColors = categoryData.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));

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
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('A valid groupId (string) is required');
    }

    if (typeof page !== 'number' || !Number.isInteger(page) || page <= 0) {
      throw new Error('Page must be a positive integer starting from 1');
    }
    //getExpensesByGroup
    if (typeof pageSize !== 'number' || !Number.isInteger(pageSize) || pageSize <= 0) {
      throw new Error('PageSize must be a positive integer');
    }

    try {
      const expensesCol = collection(db, 'expenses');

      // First, get total count for pagination info
      const countQuery = query(expensesCol, where('group_id', '==', groupId));
      const countSnapshot = await getDocs(countQuery);
      const totalItems = countSnapshot.size;

      // Calculate pagination values
      const totalPages = Math.ceil(totalItems / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      // Get paginated data
      const paginatedQuery = query(
        expensesCol,
        where('group_id', '==', groupId),
        orderBy('incurred_at', 'desc'),
        limit(pageSize * page) // Get all items up to current page
      );

      const snapshot = await getDocs(paginatedQuery);
      const allExpenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Extract only the current page items
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const expenses = allExpenses.slice(startIndex, endIndex);

      // Calculate total amount for current page
      const currentPageTotal = expenses.reduce(
        (total, expense) => total + (expense.amount || 0),
        0
      );

      return {
        expenses,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage,
          hasPreviousPage,
          startIndex: startIndex + 1,
          endIndex: Math.min(endIndex, totalItems),
        },
        totals: {
          currentPageTotal,
          itemCount: expenses.length,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }
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
   * This function creates balancing expenses to make all users have equal share (zero balance)
   * 
   * Example:
   * - User A paid 100, balance: +20 (owed 20)
   * - User B paid 60, balance: -20 (owes 20)  
   * - User C paid 80, balance: 0 (even)
   * 
   * Result: Creates expense of 20 for User B to balance everyone to 0
   * 
   * @param {string} groupId - The group ID to settle up
   * @returns {Promise<Object>} - Settlement summary and created expenses
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
      const hasUnbalancedUsers = Object.values(balances).some(balance => Math.abs(balance) > 0.01);
      
      if (!hasUnbalancedUsers) {
        return {
          success: true,
          message: 'All expenses are already settled',
          expensesCreated: [],
          totalSettled: 0
        };
      }

      const expensesCreated = [];
      let totalSettled = 0;

      // Create balancing expenses for users who owe money (negative balance)
      for (const [userId, balance] of Object.entries(balances)) {
        if (balance < -0.01) { // User owes money
          const owedAmount = Math.abs(balance);
          
          // Get username for the expense description
          const userName = await User.getUsernameById(userId).catch(() => 'Unknown User');
          
          // Create a new expense instance for this user to balance their account
          const balancingExpense = new Expense(
            `Settlement - ${userName}`,
            owedAmount,
            'Settlement',
            `Balance settlement expense created by admin`,
            groupId
          );
          
          // Manually set the user_id to the user who owes money
          balancingExpense.user_id = userId;
          balancingExpense.incurred_at = Timestamp.now();

          // Save the balancing expense directly to Firestore
          const expenseData = {
            user_id: balancingExpense.user_id,
            title: balancingExpense.title,
            amount: balancingExpense.amount,
            category: balancingExpense.category,
            description: balancingExpense.description,
            incurred_at: balancingExpense.incurred_at,
            group_id: balancingExpense.group_id,
            is_settlement: true, // Mark as settlement expense
            settled_by: currentUser.uid
          };

          const expensesCollection = collection(db, 'expenses');
          const docRef = await addDoc(expensesCollection, expenseData);

          expensesCreated.push({
            id: docRef.id,
            userId: userId,
            userName: userName,
            amount: owedAmount,
            title: balancingExpense.title
          });

          totalSettled += owedAmount;

          // Create notification for the user
          const userNotification = new Notification(
            currentUser.uid,
            userId,
            'settlement_expense',
            `Settlement expense of ${owedAmount} has been added to balance your account`
          );
          userNotification.groupId = groupId;
          userNotification.expenseId = docRef.id;
          await userNotification.save();
        }
      }

      // Create notifications for all group members about the settlement
      const groupMembers = group.members || [];
      const adminNotificationPromises = [];
      
      for (const member of groupMembers) {
        if (member && member.id && member.id !== currentUser.uid) {
          const notification = new Notification(
            currentUser.uid,
            member.id,
            'group_settled',
            `Group expenses have been settled up by admin. ${expensesCreated.length} balancing expenses were created.`
          );
          notification.groupId = groupId;
          adminNotificationPromises.push(notification.save());
        }
      }

      await Promise.all(adminNotificationPromises);

      return {
        success: true,
        message: `Successfully created ${expensesCreated.length} balancing expenses`,
        expensesCreated,
        totalSettled: parseFloat(totalSettled.toFixed(2)),
        summary: {
          totalExpenses: expensesCreated.length,
          usersBalanced: expensesCreated.length
        }
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
      return {
        id: expenseDoc.id,
        ...expenseDoc.data(),
      };
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
