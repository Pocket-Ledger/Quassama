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

  // function that return expenses by group_id limit 3

  // function that return expenses by group_id all
}

export default Expense;
