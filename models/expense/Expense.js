import { getAuth } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { app, db } from "../../firebase"; 

class Expense {
  user_id;
  name;
  amount;
  category;
  description;
  incurred_at;

  constructor(name, amount, category, note) {
    this.name = name;
    this.amount = parseFloat(amount);
    this.category = category;
    this.description = note || "";
    this.user_id = null;
    this.incurred_at = null;
  }

  validate() {
    if (!this.name || !this.amount || !this.category) {
      throw new Error("All fields (name, amount, category) are required");
    }
    if (isNaN(this.amount) || this.amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    return true;
  }

  async save() {
    this.validate();

    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    this.user_id = currentUser.uid;

    this.incurred_at = Timestamp.now();

    const expenseData = {
      user_id: this.user_id,
      name: this.name,
      amount: this.amount,
      category: this.category,
      description: this.description,
      incurred_at: this.incurred_at,
    };

    const expensesCollection = collection(db, "expenses"); // Reference to the "expenses" collection
    const docRef = await addDoc(expensesCollection, expenseData); // Add document to the collection
    return docRef.id;
  }
  
}

export default Expense;