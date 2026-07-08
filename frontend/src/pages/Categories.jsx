import { useEffect, useState } from "react";
import api from "../api/axios";

const CATEGORY_COLORS = {
    rent: "bg-accent-primary",       // gold
    food: "bg-[#2d9d5c]",       // green
    transport: "bg-[#3b82f6]",  // blue
    utilities: "bg-[#6b7280]",  // grey
    entertainment: "bg-[#a855f7]", // purple
};
const FALLBACK_COLORS = ["bg-[#f97316]", "bg-[#14b8a6]", "bg-[#ec4899]", "bg-[#f43f5e]", "bg-[#06b6d4]"];

const getCategoryColorClass = (categoryName, index) => {
    const key = categoryName.toLowerCase();
    return CATEGORY_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export default function Categories() {

    const [expenseCategories, setExpenseCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [totals, setTotals] = useState({ expense: 0, income: 0 });

    useEffect(() => {
        fetchCategoryData();
    }, []);

    const fetchCategoryData = async () => {
        try {
            // Get expense categories
            const expenseCatRes = await api.get("/dashboard/category-summary");
            const expCats = expenseCatRes.data;
            setExpenseCategories(expCats);

            // Get total expense amount
            const totalExp = expCats.reduce((sum, item) => sum + item.amount, 0);

            // Get income to group by category manually
            const incomeRes = await api.get("/income");
            const incomes = incomeRes.data;

            const totalInc = incomes.reduce((sum, item) => sum + item.amount, 0);

            // Group incomes by category
            const incGroups = {};
            incomes.forEach(item => {
                const cat = item.category || "Salary";
                incGroups[cat] = (incGroups[cat] || 0) + item.amount;
            });

            const formattedIncCats = Object.entries(incGroups).map(([category, amount]) => ({
                category,
                amount
            }));
            // Sort by amount descending
            formattedIncCats.sort((a, b) => b.amount - a.amount);

            setIncomeCategories(formattedIncCats);
            setTotals({ expense: totalExp, income: totalInc });

        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    return (

        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Categories
            </h1>

            <div className="grid grid-cols-2 gap-8">

                {/* Expense Categories Panel */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">

                    <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 flex justify-between items-center">

                        <span>Expense Categories</span>

                        <span className="text-[#e15a5a] font-mono">
                            Total: ₹ {totals.expense.toLocaleString()}
                        </span>

                    </h2>

                    <div className="flex flex-col gap-6">

                        {expenseCategories.length > 0 ? (

                            expenseCategories.map((item, idx) => {

                                const percentage = totals.expense > 0
                                    ? Math.round((item.amount / totals.expense) * 100)
                                    : 0;

                                const colorClass = getCategoryColorClass(item.category, idx);

                                return (

                                    <div key={item.category} className="flex flex-col">

                                        <div className="flex justify-between items-center text-sm font-medium mb-2">

                                            <div className="flex items-center gap-2">

                                                <span className={`w-3 h-3 rounded-full ${colorClass}`} />

                                                <span className="text-text-primary font-semibold">
                                                    {item.category}
                                                </span>

                                            </div>

                                            <div className="text-right">

                                                <span className="text-text-primary font-bold">
                                                    ₹ {item.amount.toLocaleString()}
                                                </span>

                                                <span className="text-text-secondary ml-2 text-xs">
                                                    ({percentage}%)
                                                </span>

                                            </div>

                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-primary">

                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                                style={{ width: `${percentage}%` }}
                                            />

                                        </div>

                                    </div>

                                );

                            })

                        ) : (

                            <div className="text-center py-10 text-text-secondary italic">
                                No expense data found.
                            </div>

                        )}

                    </div>

                </div>

                {/* Income Categories Panel */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">

                    <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 flex justify-between items-center">

                        <span>Income Categories</span>

                        <span className="text-[#2d9d5c] font-mono">
                            Total: ₹ {totals.income.toLocaleString()}
                        </span>

                    </h2>

                    <div className="flex flex-col gap-6">

                        {incomeCategories.length > 0 ? (

                            incomeCategories.map((item, idx) => {

                                const percentage = totals.income > 0
                                    ? Math.round((item.amount / totals.income) * 100)
                                    : 0;

                                const colorClass = "bg-[#2d9d5c]"; // Always green for income

                                return (

                                    <div key={item.category} className="flex flex-col">

                                        <div className="flex justify-between items-center text-sm font-medium mb-2">

                                            <div className="flex items-center gap-2">

                                                <span className={`w-3 h-3 rounded-full ${colorClass}`} />

                                                <span className="text-text-primary font-semibold">
                                                    {item.category}
                                                </span>

                                            </div>

                                            <div className="text-right">

                                                <span className="text-text-primary font-bold">
                                                    ₹ {item.amount.toLocaleString()}
                                                </span>

                                                <span className="text-text-secondary ml-2 text-xs">
                                                    ({percentage}%)
                                                </span>

                                            </div>

                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-primary">

                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                                style={{ width: `${percentage}%` }}
                                            />

                                        </div>

                                    </div>

                                );

                            })

                        ) : (

                            <div className="text-center py-10 text-text-secondary italic">
                                No income data found.
                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}



