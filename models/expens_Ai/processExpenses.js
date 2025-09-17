class ProcessExpenses {
    constructor(expenses) {
        this.expenses = expenses;
    }

    // Calculate total amount
    getTotalAmount() {
        return this.expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    // Group expenses by category
    groupByCategory() {
        return this.expenses.reduce((groups, expense) => {
            const category = expense.category || 'other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(expense);
            return groups;
        }, {});
    }

    // Get expense summary
    getSummary() {
        const total = this.getTotalAmount();
        const categorized = this.groupByCategory();
        const categoryTotals = {};
        
        for (const [category, expenses] of Object.entries(categorized)) {
            categoryTotals[category] = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        }

        return {
            totalExpenses: this.expenses.length,
            totalAmount: total,
            categories: categoryTotals,
            expenses: this.expenses
        };
    }

    // Process and log the data
    processAndLog() {
        const summary = this.getSummary();
        console.log('=== PROCESSED EXPENSES DATA ===');
        console.log('Total Expenses:', summary.totalExpenses);
        console.log('Total Amount:', summary.totalAmount);
        console.log('Category Breakdown:', summary.categoryTotals);
        console.log('Individual Expenses:');
        summary.expenses.forEach((expense, index) => {
            console.log(`  ${index + 1}. ${expense.title} - ${expense.amount} (${expense.category})`);
            if (expense.note) {
                console.log(`     Note: ${expense.note}`);
            }
        });
        console.log('==============================');
        return summary;
    }
}

export default ProcessExpenses;