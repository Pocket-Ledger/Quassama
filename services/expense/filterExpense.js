import { app, db } from '../../firebase';
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

class filterExpenses {
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
}

export default filterExpenses;