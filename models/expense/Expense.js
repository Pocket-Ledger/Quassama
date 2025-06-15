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
} from 'firebase/firestore';
import { app, db } from '../../firebase';

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

    const expensesCollection = collection(db, 'expenses'); // Reference to the "expenses" collection
    const docRef = await addDoc(expensesCollection, expenseData); // Add document to the collection
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
    if (!groupId || typeof groupId !== "string") {
      throw new Error("A valid groupId (string) is required");
    }

    const expensesCol = collection(db, "expenses");
    const q = query(
      expensesCol,
      where("group_id", "==", groupId),
      orderBy("incurred_at", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
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
    if (!groupId || typeof groupId !== "string") {
      throw new Error("A valid groupId (string) is required");
    }
    if (
      typeof n !== "number" ||
      !Number.isInteger(n) ||
      n <= 0
    ) {
      throw new Error("Limit `n` must be a positive integer");
    }

    const expensesCol = collection(db, "expenses");
    const q = query(
      expensesCol,
      where("group_id", "==", groupId),
      orderBy("incurred_at", "desc"),
      limit(n)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // function that return the total amount of expenses for a given group
  static async getTotalExpensesByGroup(groupId) {
    if (!groupId || typeof groupId !== "string") {
      throw new Error("A valid groupId (string) is required");
    }

    const expenses = await this.getExpensesByGroup(groupId);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // function that return the total amount of expenses for the current user and the giving group
  static async getTotalExpensesByUserAndGroup(groupId) {
    if (!groupId || typeof groupId !== "string") {
      throw new Error("A valid groupId (string) is required");
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const expenses = await this.getExpensesByGroup(groupId);
    const userExpenses = expenses.filter(expense => expense.user_id === currentUser.uid);
    
    return userExpenses.reduce((total, expense) => total + expense.amount, 0);
  }
}

export default Expense;
