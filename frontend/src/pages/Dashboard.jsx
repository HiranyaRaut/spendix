import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import MindfulPauseModal from "../components/MindfulPauseModal";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        joyScore: 0,
        goalProgress: 0,
        savings: 0,
        purchasesSupportingGoals: 0,
        avoidedCount: 0,
        avoidedMoney: 0,
    });
    const [categoryData, setCategoryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [userName, setUserName] = useState("Hiranya");
    const [budgetAlerts, setBudgetAlerts] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [modalForm, setModalForm] = useState({
        type: "expense",
        title: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        merchant: "",
        joyReason: "",
        receiptImageUrl: "",
        location: "",
    });

    // Mindful Pause state
    const [isPauseOpen, setIsPauseOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        const storedName = localStorage.getItem("name");
        if (storedName) {
            setUserName(storedName.split(" ")[0]); // Only first name
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            const summaryRes = await api.get("/dashboard/summary");
            setSummary(summaryRes.data);

            const catRes = await api.get("/dashboard/category-summary");
            setCategoryData(catRes.data);

            // Fetch goals
            const goalsRes = await api.get("/goals");
            setGoals(goalsRes.data);

            // Fetch categories
            const catsRes = await api.get("/categories");
            setCategories(catsRes.data);
            
            const expCats = catsRes.data.filter(c => c.type === "EXPENSE" || c.type === "BOTH");
            if (expCats.length > 0) {
                setModalForm(f => ({
                    ...f,
                    categoryId: expCats[0].id
                }));
            }

            // Fetch recent transactions
            const [incomeRes, expenseRes] = await Promise.all([
                api.get("/income"),
                api.get("/expenses")
            ]);

            const combined = [
                ...incomeRes.data.map(item => ({ ...item, type: "income" })),
                ...expenseRes.data.map(item => ({ ...item, type: "expense" }))
            ];

            // Sort by date descending
            combined.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentTransactions(combined.slice(0, 6));

            // Fetch budget alerts
            const now = new Date();
            const budgetRes = await api.get(`/budgets/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
            const alerts = budgetRes.data.filter(item => item.status === "WARNING" || item.status === "EXCEEDED");
            setBudgetAlerts(alerts);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const getCategoryAvatar = (item) => {
        if (item.type === "income") {
            const icon = item.category?.icon || "💼";
            const color = item.category?.color || "#2d9d5c";
            return {
                letter: icon,
                bg: "border border-opacity-30",
                style: { backgroundColor: `${color}20`, borderColor: `${color}30`, color: color }
            };
        }
        
        const catIcon = item.category?.icon || "💰";
        const catColor = item.category?.color || "#c5a059";

        return {
            letter: catIcon,
            bg: "border border-opacity-30",
            style: { backgroundColor: `${catColor}20`, borderColor: `${catColor}30`, color: catColor }
        };
    };

    // Chart configs
    const chartData = {
        labels: categoryData.map(item => item.category),
        datasets: [
            {
                data: categoryData.map(item => item.amount),
                backgroundColor: categoryData.map(item => item.color || "#c5a059"),
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const chartOptions = {
        cutout: "75%",
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: "#1a1613",
                titleColor: "#eae5db",
                bodyColor: "#eae5db",
                borderColor: "#26221c",
                borderWidth: 1,
            }
        },
        maintainAspectRatio: false,
    };

    // Quick Add submission
    const handleModalChange = (e) => {
        const { name, value } = e.target;
        if (name === "type") {
            const filtered = categories.filter(c => value === "expense" ? (c.type === "EXPENSE" || c.type === "BOTH") : (c.type === "INCOME" || c.type === "BOTH"));
            setModalForm(prev => ({
                ...prev,
                type: value,
                categoryId: filtered.length > 0 ? filtered[0].id : ""
            }));
        } else {
            setModalForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleQuickAddSubmit = async (e) => {
        e.preventDefault();
        
        if (modalForm.type === "expense") {
            // Intercept with Mindful Pause
            setPendingPayload({
                title: modalForm.title,
                amount: parseFloat(modalForm.amount),
                categoryId: parseInt(modalForm.categoryId),
                date: modalForm.date,
                paymentMethod: modalForm.paymentMethod,
                merchant: modalForm.merchant,
                joyReason: modalForm.joyReason,
                receiptImageUrl: modalForm.receiptImageUrl,
                location: modalForm.location
            });
            setIsModalOpen(false);
            setIsPauseOpen(true);
        } else {
            // Income, post immediately
            try {
                const payload = {
                    title: modalForm.title,
                    amount: parseFloat(modalForm.amount),
                    categoryId: parseInt(modalForm.categoryId),
                    date: modalForm.date
                };
                await api.post("/income", payload);
                setIsModalOpen(false);
                resetModalForm();
                fetchDashboardData();
            } catch (err) {
                console.error("Error creating quick income:", err);
            }
        }
    };

    const handleConfirmPause = async ({ joyScore, planned, goalAligned }) => {
        try {
            const finalPayload = {
                ...pendingPayload,
                joyScore,
                planned,
                goalAligned
            };
            await api.post("/expenses", finalPayload);
            setIsPauseOpen(false);
            setPendingPayload(null);
            resetModalForm();
            fetchDashboardData();
        } catch (err) {
            console.error("Error creating quick expense:", err);
        }
    };

    const resetModalForm = () => {
        const expCats = categories.filter(c => c.type === "EXPENSE" || c.type === "BOTH");
        setModalForm({
            type: "expense",
            title: "",
            amount: "",
            categoryId: expCats.length > 0 ? expCats[0].id : "",
            date: new Date().toISOString().split("T")[0],
            paymentMethod: "Cash",
            merchant: "",
            joyReason: "",
            receiptImageUrl: "",
            location: "",
        });
        setShowAdvanced(false);
    };

    // Dynamic AI Insights generator
    const getJoyInsights = () => {
        if (categoryData.length === 0) {
            return "Add some expenses to get customized AI spending & happiness recommendations.";
        }
        if (goals.length === 0) {
            return "Create a Joy Goal to get customized recommendations on accelerating your savings.";
        }
        
        const targetCats = categoryData.filter(c => c.category.toLowerCase() !== "rent" && c.category.toLowerCase() !== "utilities");
        if (targetCats.length === 0) return "Great job tracking! Create a new spending category to get deeper insights.";
        
        const highestSpend = [...targetCats].sort((a, b) => b.amount - a.amount)[0];
        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
        
        if (activeGoals.length === 0) return "All your goals are fully funded! Excellent mindful money management!";
        
        const targetGoal = activeGoals[0];
        const savingsAmount = Math.round(highestSpend.amount * 0.2);
        
        if (savingsAmount <= 0) return "You're spending very mindfully! Keep saving towards your goals.";
        
        const daysEarlier = Math.max(3, Math.round((savingsAmount / targetGoal.targetAmount) * 120));
        
        return `Reducing your spending on "${highestSpend.category}" by 20% (₹${savingsAmount.toLocaleString()}) would help you reach your "${targetGoal.title}" goal ${daysEarlier} days earlier!`;
    };

    const getPriorityColor = (priority) => {
        if (priority === "High") return "text-red-400 border border-red-500/20 bg-red-500/5";
        if (priority === "Low") return "text-blue-400 border border-blue-500/20 bg-blue-500/5";
        return "text-accent-primary border border-accent-primary/20 bg-accent-primary/5";
    };

    return (

        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">

            {/* Header section */}
            <div className="flex justify-between items-start mb-10">

                <div>

                    <h1 className="text-4xl font-serif italic font-bold text-text-primary">
                        {getGreeting()}, {userName}
                    </h1>

                    <p className="text-text-secondary mt-2 font-medium">
                        Welcome to JoySpend. Here's where your money and happiness stand today.
                    </p>

                </div>

                <button
                    onClick={() => {
                        resetModalForm();
                        setIsModalOpen(true);
                    }}
                    className="bg-accent-primary hover:bg-accent-hover text-black font-semibold px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-accent-primary/15 transition-all duration-200 cursor-pointer"
                >

                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>

                    Add transaction

                </button>

            </div>

            {/* Budget Alerts Notifications */}
            {budgetAlerts.length > 0 && (
                <div className="mb-8 flex flex-col gap-3.5 max-w-5xl">
                    {budgetAlerts.map(alert => (
                        <div 
                            key={alert.categoryId}
                            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                                alert.status === "EXCEEDED"
                                    ? "bg-red-500/10 border-red-500/35 text-red-400"
                                    : "bg-amber-500/10 border-amber-500/35 text-amber-500"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg leading-none">
                                    {alert.status === "EXCEEDED" ? "⚠️" : "⚡"}
                                </span>
                                <span className="leading-relaxed">
                                    {alert.status === "EXCEEDED" ? (
                                        <>
                                            Budget Exceeded: You've spent <span className="font-bold font-mono">₹{alert.actualSpent.toLocaleString()}</span> in <span className="font-bold">{alert.categoryIcon} {alert.categoryName}</span>, exceeding your monthly limit of <span className="font-bold font-mono">₹{alert.budgetedAmount.toLocaleString()}</span>!
                                        </>
                                    ) : (
                                        <>
                                            Budget Warning: You've used <span className="font-bold font-mono">{Math.round((alert.actualSpent / alert.budgetedAmount) * 100)}%</span> of your <span className="font-bold font-mono">₹{alert.budgetedAmount.toLocaleString()}</span> limit in <span className="font-bold">{alert.categoryIcon} {alert.categoryName}</span> (Spent: <span className="font-bold font-mono">₹{alert.actualSpent.toLocaleString()}</span>).
                                        </>
                                    )}
                                </span>
                            </div>
                            <Link to="/budgets" className="underline hover:opacity-85 text-[10px] font-bold uppercase tracking-wider shrink-0 ml-4 cursor-pointer">
                                Manage &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Core Stats row */}
            <div className="grid grid-cols-4 gap-6 mb-6">

                {/* Balance Card */}
                <div className="bg-bg-secondary rounded-xl shadow-lg border border-accent-primary/30 p-6 relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                            Balance
                        </span>
                        <div className="w-7 h-7 rounded bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-text-primary tracking-tight font-mono">
                            ₹ {summary.balance.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Available Funds
                    </div>
                </div>

                {/* Joy Score Card */}
                <div className="bg-bg-secondary rounded-xl shadow-lg border border-[#e15a5a]/20 p-6 relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                            Joy Score
                        </span>
                        <div className="w-7 h-7 rounded bg-[#e15a5a]/10 flex items-center justify-center text-[#e15a5a]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-accent-primary tracking-tight font-mono">
                            {summary.joyScore || 0} <span className="text-xs text-text-secondary">/ 100</span>
                        </p>
                    </div>
                    <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Happiness Index
                    </div>
                </div>

                {/* Goal Progress Card */}
                <div className="bg-bg-secondary rounded-xl shadow-lg border border-[#3b82f6]/20 p-6 relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                            Goal Progress
                        </span>
                        <div className="w-7 h-7 rounded bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-text-primary tracking-tight font-mono">
                            {summary.goalProgress || 0}%
                        </p>
                    </div>
                    <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Targets Alignment
                    </div>
                </div>

                {/* Savings Card */}
                <div className="bg-bg-secondary rounded-xl shadow-lg border border-[#2d9d5c]/20 p-6 relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div className="flex justify-between items-start">
                        <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                            Total Savings
                        </span>
                        <div className="w-7 h-7 rounded bg-[#2d9d5c]/10 flex items-center justify-center text-[#2d9d5c]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-text-primary tracking-tight font-mono">
                            ₹ {summary.savings.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Goals + Saved Impulses
                    </div>
                </div>

            </div>

            {/* Behavioral stats row */}
            <div className="grid grid-cols-3 gap-6 mb-10">

                {/* Purchases Supporting Goals % */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] border border-[#a855f7]/20 text-lg shrink-0">
                        🎯
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Supporting Goals</div>
                        <div className="text-xl font-bold font-mono text-text-primary mt-0.5">{summary.purchasesSupportingGoals || 0}%</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Aligned purchases</div>
                    </div>
                </div>

                {/* Impulse Purchases Avoided Count */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#2d9d5c]/10 flex items-center justify-center text-[#2d9d5c] border border-[#2d9d5c]/20 text-lg shrink-0">
                        🛡️
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Impulses Avoided</div>
                        <div className="text-xl font-bold font-mono text-text-primary mt-0.5">{summary.avoidedCount || 0}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Purchases stopped</div>
                    </div>
                </div>

                {/* Money Saved from Avoided Purchases */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 shadow flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20 text-lg shrink-0">
                        💰
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Avoidance Savings</div>
                        <div className="text-xl font-bold font-mono text-accent-primary mt-0.5">₹{(summary.avoidedMoney || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Retained in wallet</div>
                    </div>
                </div>

            </div>

            {/* Middle row: Category and Insights */}
            <div className="grid grid-cols-5 gap-6 mb-8">

                {/* Spending by Category */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 col-span-2 shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-6">
                            Spending by Category
                        </h2>

                        <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                            {categoryData.length > 0 ? (
                                <Doughnut data={chartData} options={chartOptions} />
                            ) : (
                                <div className="absolute inset-0 rounded-full border border-dashed border-border-primary flex items-center justify-center text-xs text-text-secondary">
                                    No data
                                </div>
                            )}

                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                                    Total Exp.
                                </span>
                                <span className="text-xl font-bold text-text-primary mt-1 font-mono">
                                    ₹{summary.totalExpense.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <div className="flex flex-col gap-1.5 mt-2">
                            {categoryData.map((item) => (
                                <div key={item.category} className="flex items-center justify-between py-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5.5 h-5.5 rounded flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}30`, color: item.color }}>
                                            {item.icon || "💰"}
                                        </span>
                                        <span className="text-text-primary font-medium">{item.category}</span>
                                    </div>
                                    <div className="flex-1 mx-3 border-b border-dotted border-border-primary" />
                                    <span className="font-semibold text-text-primary font-mono">₹{item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Insights Card */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 col-span-3 shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-4 flex items-center gap-2">
                            <span className="text-accent-primary">✦</span> Joy Insights
                        </h2>

                        <div className="bg-bg-primary/60 border border-border-primary/60 p-6 rounded-xl flex items-start gap-4 mb-6">
                            <div className="text-2xl text-accent-primary shrink-0 mt-0.5">💡</div>
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary mb-2">AI Recommendation</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {getJoyInsights()}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-border-primary/40 pt-4">
                            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Joy Stats Breakdown</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-bg-primary/30 border border-border-primary/30 rounded-lg">
                                    <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">Total Income</span>
                                    <span className="text-base font-bold text-[#2d9d5c] font-mono">₹{summary.totalIncome.toLocaleString()}</span>
                                </div>
                                <div className="p-3 bg-bg-primary/30 border border-border-primary/30 rounded-lg">
                                    <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">Total Expenses</span>
                                    <span className="text-base font-bold text-[#e15a5a] font-mono">₹{summary.totalExpense.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row: Recent Transactions and Goals Progress */}
            <div className="grid grid-cols-5 gap-6">

                {/* Recent Transactions */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 col-span-3 shadow-lg">
                    <h2 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-6">
                        Recent Transactions
                    </h2>

                    <div className="flex flex-col gap-4">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((item) => {
                                const avatar = getCategoryAvatar(item);
                                return (
                                    <div key={`${item.type}-${item.id}`} className="flex flex-col border-b border-border-primary/30 last:border-0 pb-2">
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${avatar.bg}`}
                                                    style={avatar.style}
                                                >
                                                    {avatar.letter}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-text-primary leading-snug">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-text-secondary mt-0.5 font-medium">
                                                        {item.type === "income" ? "Income" : (item.category?.name || "General")} &middot; {formatDate(item.date)}
                                                        {item.joyScore !== undefined && item.joyScore !== null && (
                                                            <span className="text-accent-primary ml-2 font-semibold">Joy: {item.joyScore}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${item.type === "income" ? "text-[#2d9d5c]" : "text-[#e15a5a]"}`}>
                                                    {item.type === "income" ? "↗" : "↘"} ₹{item.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Display merchant / location inline if available */}
                                        {item.type === "expense" && (item.merchant || item.location) && (
                                            <div className="pl-12 flex gap-4 text-[10px] text-text-secondary font-medium">
                                                {item.merchant && <span>Store: <strong className="text-text-primary font-semibold">{item.merchant}</strong></span>}
                                                {item.location && <span>Location: <strong className="text-text-primary font-semibold">{item.location}</strong></span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-text-secondary text-sm">
                                No recent transactions.
                            </div>
                        )}
                    </div>
                </div>

                {/* Goals Panel */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 col-span-2 shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-6">
                            Goals
                        </h2>

                        <div className="flex flex-col gap-5">
                            {goals.length > 0 ? (
                                goals.slice(0, 4).map((goal) => {
                                    const progress = goal.targetAmount > 0 
                                        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                                        : 0;
                                    return (
                                        <div key={goal.id} className="flex flex-col">
                                            <div className="flex justify-between items-center text-xs font-semibold mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-text-primary">{goal.title}</span>
                                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded leading-none shrink-0 ${getPriorityColor(goal.priority)}`}>
                                                        {goal.priority}
                                                    </span>
                                                </div>
                                                <span className="text-accent-primary font-mono">{progress}%</span>
                                            </div>

                                            {/* Progress bar container */}
                                            <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-primary">
                                                <div
                                                    className="h-full rounded-full bg-accent-primary"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-text-secondary text-xs italic">
                                    No active savings goals. Create a goal in the Goals tab!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Add Modal */}
            {isModalOpen && (

                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                    <div className="bg-bg-secondary border border-border-primary rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-lg font-bold text-text-primary mb-4">
                            Add New Transaction
                        </h3>

                        <form onSubmit={handleQuickAddSubmit} className="flex flex-col gap-4">

                            {/* Type Toggle */}
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Type</label>
                                <div className="grid grid-cols-2 gap-2 bg-bg-primary p-1 rounded-lg border border-border-primary">
                                    <button
                                        type="button"
                                        onClick={() => handleModalChange({ target: { name: "type", value: "expense" } })}
                                        className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                            modalForm.type === "expense"
                                                ? "bg-[#e15a5a] text-white shadow"
                                                : "text-text-secondary hover:text-text-primary"
                                        }`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleModalChange({ target: { name: "type", value: "income" } })}
                                        className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                            modalForm.type === "income"
                                                ? "bg-[#2d9d5c] text-white shadow"
                                                : "text-text-secondary hover:text-text-primary"
                                        }`}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={modalForm.title}
                                    onChange={handleModalChange}
                                    required
                                    className="w-full bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                    placeholder="e.g. Pizza party, Salary payout"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Amount */}
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={modalForm.amount}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                        placeholder="₹ 0.00"
                                    />
                                </div>

                                {/* Category Dropdown */}
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase mb-1.5 block">Category</label>
                                    <select
                                        name="categoryId"
                                        value={modalForm.categoryId}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                                    >
                                        <option value="" className="bg-bg-secondary text-text-secondary">Select Category</option>
                                        {categories.filter(c => modalForm.type === "expense" ? (c.type === "EXPENSE" || c.type === "BOTH") : (c.type === "INCOME" || c.type === "BOTH")).map(cat => (
                                            <option key={cat.id} value={cat.id} className="bg-bg-secondary text-text-primary">
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date & Payment Method */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={modalForm.date}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                    />
                                </div>

                                {modalForm.type === "expense" && (
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Payment Method</label>
                                        <select
                                            name="paymentMethod"
                                            value={modalForm.paymentMethod}
                                            onChange={handleModalChange}
                                            required
                                            className="w-full bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                                        >
                                            <option value="Cash" className="bg-bg-secondary text-text-primary">Cash</option>
                                            <option value="Card" className="bg-bg-secondary text-text-primary">Card</option>
                                            <option value="UPI" className="bg-bg-secondary text-text-primary">UPI</option>
                                            <option value="Net Banking" className="bg-bg-secondary text-text-primary">Net Banking</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Collapsible Advanced Details section */}
                            {modalForm.type === "expense" && (
                                <div className="border-t border-border-primary/45 pt-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 hover:text-accent-hover transition-colors cursor-pointer"
                                    >
                                        <span>{showAdvanced ? "▼" : "▶"} Advanced Details</span>
                                    </button>

                                    {showAdvanced && (
                                        <div className="flex flex-col gap-4 mt-4 animate-fadeIn">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Merchant</label>
                                                    <input
                                                        type="text"
                                                        name="merchant"
                                                        value={modalForm.merchant}
                                                        onChange={handleModalChange}
                                                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                                                        placeholder="e.g. Starbucks"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Location</label>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={modalForm.location}
                                                        onChange={handleModalChange}
                                                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                                                        placeholder="e.g. Bandra"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Joy Reason</label>
                                                <input
                                                    type="text"
                                                    name="joyReason"
                                                    value={modalForm.joyReason}
                                                    onChange={handleModalChange}
                                                    className="w-full bg-bg-primary border border-border-primary rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                                                    placeholder="e.g. Hanging out with close friends"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Receipt Image URL</label>
                                                <input
                                                    type="text"
                                                    name="receiptImageUrl"
                                                    value={modalForm.receiptImageUrl}
                                                    onChange={handleModalChange}
                                                    className="w-full bg-bg-primary border border-border-primary rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                                                    placeholder="https://example.com/receipt.jpg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                type="submit"
                                className="bg-accent-primary hover:bg-accent-hover text-black font-bold p-3 rounded-lg text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-accent-primary/10"
                            >
                                Save Transaction
                            </button>

                        </form>

                    </div>

                </div>

            )}

            {/* Mindful Pause Overlay Modal */}
            <MindfulPauseModal
                isOpen={isPauseOpen}
                onClose={() => {
                    setIsPauseOpen(false);
                    setPendingPayload(null);
                }}
                onConfirm={handleConfirmPause}
                expenseData={pendingPayload || {}}
                summaryStats={summary}
            />

        </div>

    );

}
