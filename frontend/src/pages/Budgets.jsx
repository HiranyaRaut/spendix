import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Budgets() {
    const [summary, setSummary] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState({
        categoryId: "",
        amount: "",
    });
    
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const MONTHS = [
        { value: 1, name: "January" },
        { value: 2, name: "February" },
        { value: 3, name: "March" },
        { value: 4, name: "April" },
        { value: 5, name: "May" },
        { value: 6, name: "June" },
        { value: 7, name: "July" },
        { value: 8, name: "August" },
        { value: 9, name: "September" },
        { value: 10, name: "October" },
        { value: 11, name: "November" },
        { value: 12, name: "December" },
    ];

    const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const loadData = async () => {
        try {
            // Fetch budget summary
            const summaryRes = await api.get(`/budgets/summary?month=${selectedMonth}&year=${selectedYear}`);
            setSummary(summaryRes.data);

            // Fetch categories to populate dropdown
            const catsRes = await api.get("/categories");
            const expCats = catsRes.data.filter(c => c.type === "EXPENSE" || c.type === "BOTH");
            setCategories(expCats);

            if (expCats.length > 0 && !modalForm.categoryId) {
                setModalForm(f => ({ ...f, categoryId: expCats[0].id }));
            }
        } catch (err) {
            console.error("Error loading budget data:", err);
            setError("Failed to load budget data.");
        }
    };

    const handleOpenModal = (categoryId = "", amount = "") => {
        setModalForm({
            categoryId: categoryId || (categories.length > 0 ? categories[0].id : ""),
            amount: amount || "",
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError("");
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!modalForm.amount || parseFloat(modalForm.amount) <= 0) {
            setError("Please enter a valid budget amount.");
            return;
        }

        try {
            await api.post("/budgets", {
                categoryId: parseInt(modalForm.categoryId),
                amount: parseFloat(modalForm.amount),
                month: selectedMonth,
                year: selectedYear
            });

            setSuccess("Budget limit set successfully!");
            handleCloseModal();
            loadData();
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            console.error("Error setting budget:", err);
            setError(err.response?.data || "Failed to save budget.");
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!window.confirm("Are you sure you want to delete this budget limit?")) return;
        try {
            await api.delete(`/budgets/${budgetId}`);
            setSuccess("Budget limit removed successfully!");
            loadData();
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            console.error("Error deleting budget:", err);
            setError("Failed to delete budget limit.");
        }
    };

    // Calculate totals
    const totalBudgeted = summary.reduce((acc, item) => acc + item.budgetedAmount, 0);
    const totalSpentInBudgeted = summary
        .filter(item => item.budgetedAmount > 0)
        .reduce((acc, item) => acc + item.actualSpent, 0);
    const totalSpentOverall = summary.reduce((acc, item) => acc + item.actualSpent, 0);
    
    const overallProgress = totalBudgeted > 0 ? (totalSpentInBudgeted / totalBudgeted) * 100 : 0;
    
    // Categorize summary items
    const budgetedItems = summary.filter(item => item.budgetedAmount > 0);
    
    // Find categories that have no budgets set
    const budgetedCategoryIds = new Set(budgetedItems.map(item => item.categoryId));
    const unbudgetedCategories = categories.filter(cat => !budgetedCategoryIds.has(cat.id));

    // Get unbudgeted items that have spending
    const unbudgetedSpentItems = summary.filter(item => item.budgetedAmount === 0 && item.actualSpent > 0);

    return (
        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">
            {/* Header section with Month/Year picker */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-serif italic font-bold text-text-primary leading-tight">
                        Budgets
                    </h1>
                    <p className="text-xs text-text-secondary mt-1 font-medium">
                        Set spending limits and keep your finances aligned with your goals.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Month Select */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-bg-secondary border border-border-primary rounded-lg text-text-primary px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                        {MONTHS.map(m => (
                            <option key={m.value} value={m.value}>{m.name}</option>
                        ))}
                    </select>

                    {/* Year Select */}
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-bg-secondary border border-border-primary rounded-lg text-text-primary px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {/* Add Budget Button */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-accent-primary hover:bg-accent-hover text-black px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md shadow-accent-primary/10 flex items-center gap-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Set Limit
                    </button>
                </div>
            </div>

            {/* Notification messages */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/35 text-red-400 text-sm p-4 rounded-lg mb-6 max-w-5xl">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-[#2d9d5c]/10 border border-[#2d9d5c]/35 text-[#2d9d5c] text-sm p-4 rounded-lg mb-6 max-w-5xl">
                    {success}
                </div>
            )}

            {/* Overall Monthly Budget Dashboard Card */}
            {totalBudgeted > 0 && (
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg mb-8 max-w-5xl">
                    <h2 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-4">
                        Monthly Budget Overview
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Budget Limit Card */}
                        <div className="bg-bg-primary/50 border border-border-primary/50 p-4 rounded-lg">
                            <span className="text-[10px] text-text-secondary uppercase font-bold block">Total Budgeted</span>
                            <span className="text-2xl font-semibold text-text-primary mt-1 block">
                                ₹ {totalBudgeted.toLocaleString()}
                            </span>
                        </div>
                        
                        {/* Spent in Budgeted Card */}
                        <div className="bg-bg-primary/50 border border-border-primary/50 p-4 rounded-lg">
                            <span className="text-[10px] text-text-secondary uppercase font-bold block">Spent under Budget</span>
                            <span className="text-2xl font-semibold text-text-primary mt-1 block">
                                ₹ {totalSpentInBudgeted.toLocaleString()}
                            </span>
                        </div>

                        {/* Remaining Card */}
                        <div className="bg-bg-primary/50 border border-border-primary/50 p-4 rounded-lg">
                            <span className="text-[10px] text-text-secondary uppercase font-bold block">Remaining Budget</span>
                            <span className={`text-2xl font-semibold mt-1 block ${totalBudgeted - totalSpentInBudgeted < 0 ? "text-red-400" : "text-[#2d9d5c]"}`}>
                                ₹ {(totalBudgeted - totalSpentInBudgeted).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                            <span className="text-text-secondary">Overall Usage</span>
                            <span className={overallProgress >= 100 ? "text-red-400" : overallProgress >= 80 ? "text-amber-500" : "text-accent-primary"}>
                                {Math.round(overallProgress)}% Spent
                            </span>
                        </div>
                        <div className="w-full h-3 bg-bg-primary rounded-full overflow-hidden border border-border-primary">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    overallProgress >= 100 
                                        ? "bg-red-500" 
                                        : overallProgress >= 80 
                                            ? "bg-amber-500" 
                                            : "bg-accent-primary"
                                }`}
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                            />
                        </div>
                        {overallProgress >= 100 && (
                            <p className="text-red-400 text-xs mt-3 flex items-center gap-1.5 font-medium">
                                ⚠️ You have exceeded your total monthly budget limit!
                            </p>
                        )}
                        {overallProgress >= 80 && overallProgress < 100 && (
                            <p className="text-amber-500 text-xs mt-3 flex items-center gap-1.5 font-medium">
                                ⚠️ Caution: You have used over 80% of your total budget.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
                {/* Active Budgets Section */}
                <div className="col-span-2 flex flex-col gap-6">
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 border-b border-border-primary pb-3 flex justify-between items-center">
                            <span>Active Category Budgets</span>
                            <span className="text-xs font-semibold normal-case text-text-secondary">
                                {budgetedItems.length} Budgets
                            </span>
                        </h2>

                        <div className="flex flex-col gap-6">
                            {budgetedItems.length > 0 ? (
                                budgetedItems.map((item) => {
                                    const percent = item.budgetedAmount > 0 ? (item.actualSpent / item.budgetedAmount) * 100 : 0;
                                    const isWarning = percent >= 80 && percent < 100;
                                    const isExceeded = percent >= 100;
                                    
                                    return (
                                        <div key={item.categoryId} className="flex flex-col border-b border-border-primary/20 pb-5 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span 
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base" 
                                                        style={{ 
                                                            backgroundColor: `${item.categoryColor}20`, 
                                                            border: `1px solid ${item.categoryColor}40`, 
                                                            color: item.categoryColor 
                                                        }}
                                                    >
                                                        {item.categoryIcon || "💰"}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-semibold text-text-primary text-sm">
                                                            {item.categoryName}
                                                        </h3>
                                                        <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider font-bold">
                                                            Spent: ₹ {item.actualSpent.toLocaleString()} of ₹ {item.budgetedAmount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(item.categoryId, item.budgetedAmount)}
                                                        className="bg-bg-primary hover:bg-bg-primary/80 border border-border-primary text-text-secondary hover:text-text-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBudget(item.budgetId)}
                                                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Category Progress Bar */}
                                            <div className="mt-1">
                                                <div className="w-full h-2.5 bg-bg-primary rounded-full overflow-hidden border border-border-primary">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${
                                                            isExceeded 
                                                                ? "bg-red-500" 
                                                                : isWarning 
                                                                    ? "bg-amber-500" 
                                                                    : "bg-accent-primary"
                                                        }`}
                                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center mt-1.5">
                                                    <span className={`text-[10px] font-semibold uppercase ${
                                                        isExceeded ? "text-red-400" : isWarning ? "text-amber-500" : "text-[#2d9d5c]"
                                                    }`}>
                                                        {isExceeded ? "Exceeded Limit" : isWarning ? "Warning limit" : "On track"}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-text-secondary">
                                                        {Math.round(percent)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-text-secondary italic text-sm">
                                    No budgets set for this month. Use "Set Limit" to define a category budget.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unbudgeted Categories with Spending */}
                    {unbudgetedSpentItems.length > 0 && (
                        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
                            <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 border-b border-border-primary pb-3">
                                Unbudgeted Category Spending
                            </h2>
                            <div className="flex flex-col gap-5">
                                {unbudgetedSpentItems.map(item => (
                                    <div key={item.categoryId} className="flex justify-between items-center border-b border-border-primary/20 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-base" 
                                                style={{ 
                                                    backgroundColor: `${item.categoryColor}20`, 
                                                    border: `1px solid ${item.categoryColor}40`, 
                                                    color: item.categoryColor 
                                                }}
                                            >
                                                {item.categoryIcon || "💰"}
                                            </span>
                                            <div>
                                                <h3 className="font-semibold text-text-primary text-sm">{item.categoryName}</h3>
                                                <p className="text-[10px] text-red-400/90 font-bold uppercase tracking-wider">
                                                    Unbudgeted Spend: ₹ {item.actualSpent.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal(item.categoryId)}
                                            className="bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 text-accent-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                        >
                                            Set Budget
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right panel: Set/Quick Budget Setup */}
                <div className="flex flex-col gap-6">
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 border-b border-border-primary pb-3">
                            Set Category Budget
                        </h2>
                        
                        {unbudgetedCategories.length > 0 ? (
                            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                                {unbudgetedCategories.map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center border-b border-border-primary/10 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2.5">
                                            <span 
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" 
                                                style={{ 
                                                    backgroundColor: `${cat.color}20`, 
                                                    border: `1px solid ${cat.color}40`, 
                                                    color: cat.color 
                                                }}
                                            >
                                                {cat.icon || "💰"}
                                            </span>
                                            <span className="text-text-primary font-medium text-xs">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal(cat.id)}
                                            className="border border-border-primary hover:border-accent-primary/40 text-text-secondary hover:text-accent-primary text-[10px] font-bold uppercase px-2 py-1 rounded transition-all cursor-pointer"
                                        >
                                            + Limit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-text-secondary italic text-center py-4">
                                All categories have budgets configured.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Set/Edit Budget Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-border-primary w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-border-primary flex justify-between items-center">
                            <h2 className="text-lg font-bold text-text-primary font-serif italic">
                                Configure Spending Limit
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleModalSubmit} className="p-6 flex flex-col gap-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/35 text-red-400 text-xs p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Category Select */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                                    Category
                                </label>
                                <select
                                    value={modalForm.categoryId}
                                    onChange={(e) => setModalForm(f => ({ ...f, categoryId: e.target.value }))}
                                    className="w-full bg-bg-primary border border-border-primary rounded-lg text-text-primary px-4 py-3 focus:outline-none focus:border-accent-primary cursor-pointer text-sm"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon || "💰"} {cat.name} ({cat.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                                    Monthly Budget Limit (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter budget limit e.g. 5000"
                                    value={modalForm.amount}
                                    onChange={(e) => setModalForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full bg-bg-primary border border-border-primary rounded-lg text-text-primary px-4 py-3 focus:outline-none focus:border-accent-primary text-sm font-medium"
                                    autoFocus
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {/* Info */}
                            <div className="text-[10px] text-text-secondary bg-bg-primary/45 border border-border-primary/45 p-3 rounded-lg leading-relaxed">
                                This budget applies for <strong>{MONTHS.find(m => m.value === selectedMonth)?.name} {selectedYear}</strong>. You will be alerted on the dashboard when spending in this category exceeds 80% and 100% of the limit.
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-border-primary/30 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 border border-border-primary text-text-secondary hover:text-text-primary rounded-lg font-medium transition-all text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-accent-primary hover:bg-accent-hover text-black rounded-lg font-semibold transition-all shadow-md shadow-accent-primary/10 text-sm cursor-pointer"
                                >
                                    Save Limit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
