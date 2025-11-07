import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app, db } from '../../firebase';

class StatExpense {
    /**
     * Get total spending by user in current month
     * @returns {Promise<number>} - Total spending amount for current month
     */
    static async getTotalSpendingCurrentMonth() {
        try {
            const auth = getAuth(app);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Get current month date range
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const expensesCollection = collection(db, 'expenses');
            const q = query(
                expensesCollection,
                where('user_id', '==', currentUser.uid),
                where('incurred_at', '>=', startOfMonth),
                where('incurred_at', '<=', endOfMonth),
                where('settlement', '==', false) // Exclude settlement transactions
            );

            const snapshot = await getDocs(q);
            let total = 0;

            snapshot.docs.forEach((doc) => {
                const expense = doc.data();
                if (expense.amount && !isNaN(expense.amount)) {
                    total += parseFloat(expense.amount);
                }
            });

            return parseFloat(total.toFixed(2));
        } catch (error) {
            console.error('Error getting total spending for current month:', error);
            throw error;
        }
    }

    /**
     * Get monthly change percentage compared to previous month
     * @returns {Promise<number>} - Percentage change (positive = increase, negative = decrease)
     */
    static async getMonthlyChange() {
        try {
            const auth = getAuth(app);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const now = new Date();
            
            // Current month
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            
            // Previous month
            const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

            const expensesCollection = collection(db, 'expenses');

            // Get current month expenses
            const currentMonthQuery = query(
                expensesCollection,
                where('user_id', '==', currentUser.uid),
                where('incurred_at', '>=', currentMonthStart),
                where('incurred_at', '<=', currentMonthEnd),
                where('settlement', '==', false)
            );

            // Get previous month expenses
            const prevMonthQuery = query(
                expensesCollection,
                where('user_id', '==', currentUser.uid),
                where('incurred_at', '>=', prevMonthStart),
                where('incurred_at', '<=', prevMonthEnd),
                where('settlement', '==', false)
            );

            const [currentSnapshot, prevSnapshot] = await Promise.all([
                getDocs(currentMonthQuery),
                getDocs(prevMonthQuery)
            ]);

            let currentTotal = 0;
            let prevTotal = 0;

            currentSnapshot.docs.forEach((doc) => {
                const expense = doc.data();
                if (expense.amount && !isNaN(expense.amount)) {
                    currentTotal += parseFloat(expense.amount);
                }
            });

            prevSnapshot.docs.forEach((doc) => {
                const expense = doc.data();
                if (expense.amount && !isNaN(expense.amount)) {
                    prevTotal += parseFloat(expense.amount);
                }
            });

            if (prevTotal === 0) {
                return currentTotal > 0 ? 100 : 0; // If no previous spending, 100% increase or 0%
            }

            const changePercentage = ((currentTotal - prevTotal) / prevTotal) * 100;
            return parseFloat(changePercentage.toFixed(1));
        } catch (error) {
            console.error('Error calculating monthly change:', error);
            throw error;
        }
    }

    /**
     * Get largest expense for current month
     * @returns {Promise<Object>} - Object containing amount and category of largest expense
     */
    static async getLargestExpenseCurrentMonth() {
        try {
            const auth = getAuth(app);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Get current month date range
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const expensesCollection = collection(db, 'expenses');
            const q = query(
                expensesCollection,
                where('user_id', '==', currentUser.uid),
                where('incurred_at', '>=', startOfMonth),
                where('incurred_at', '<=', endOfMonth),
                where('settlement', '==', false),
                orderBy('amount', 'desc'),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { amount: 0, category: 'No expenses' };
            }

            const largestExpense = snapshot.docs[0].data();
            return {
                amount: parseFloat(largestExpense.amount.toFixed(2)),
                category: largestExpense.category || 'Uncategorized'
            };
        } catch (error) {
            console.error('Error getting largest expense for current month:', error);
            throw error;
        }
    }

    /**
     * Get total income spent for current month (this would need income tracking)
     * For now, this returns a placeholder value - you may need to implement income tracking
     * @returns {Promise<number>} - Total income for current month
     */
    static async getTotalIncomeCurrentMonth() {
        try {
            // TODO: Implement income tracking in your app
            // For now, returning a placeholder value
            // You might want to create a separate 'income' collection or add income entries to expenses with negative amounts
            
            const auth = getAuth(app);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // This is a placeholder implementation
            // You could either:
            // 1. Store income as separate collection
            // 2. Store income as expenses with negative amounts
            // 3. Have a user profile with monthly income setting
            
            // For now, returning a default value that you can modify based on your needs
            return 4250.00; // Placeholder value matching the component
        } catch (error) {
            console.error('Error getting total income for current month:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive monthly statistics
     * @returns {Promise<Object>} - Object containing all monthly statistics
     */
    static async getMonthlyStatistics() {
        try {
            const [totalSpending, monthlyChange, largestExpense, totalIncome] = await Promise.all([
                this.getTotalSpendingCurrentMonth(),
                this.getMonthlyChange(),
                this.getLargestExpenseCurrentMonth(),
                this.getTotalIncomeCurrentMonth()
            ]);

            return {
                totalSpending,
                monthlyChange,
                largestExpense: largestExpense.amount,
                largestExpenseCategory: largestExpense.category,
                totalIncome
            };
        } catch (error) {
            console.error('Error getting monthly statistics:', error);
            throw error;
        }
    }
}

export default StatExpense;