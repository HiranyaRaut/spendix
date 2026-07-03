import { useEffect, useState } from "react";
import api from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
    rent: "#dfa935",
    food: "#2d9d5c",
    transport: "#3b82f6",
    utilities: "#6b7280",
    entertainment: "#a855f7",
};
const FALLBACK_COLORS = ["#f97316", "#14b8a6", "#ec4899", "#f43f5e", "#06b6d4"];

const getCategoryColor = (categoryName, index) => {
    const key = categoryName.toLowerCase();
    return CATEGORY_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export default function Dashboard() {

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [categoryData, setCategoryData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [userName, setUserName] = useState("Hiranya");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState({
        type: "expense",
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
    });

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
            return {
                letter: "I",
                bg: "bg-[#2d9d5c]/20 text-[#2d9d5c] border border-[#2d9d5c]/30"
            };
        }
        const cat = item.category || "";
        const firstLetter = cat.charAt(0).toUpperCase() || "E";
        let bg = "bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30"; // default

        if (cat.toLowerCase() === "rent") {
            bg = "bg-[#dfa935]/20 text-[#dfa935] border border-[#dfa935]/30";
        } else if (cat.toLowerCase() === "food") {
            bg = "bg-[#2d9d5c]/20 text-[#2d9d5c] border border-[#2d9d5c]/30";
        } else if (cat.toLowerCase() === "transport") {
            bg = "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30";
        } else if (cat.toLowerCase() === "utilities") {
            bg = "bg-[#6b7280]/20 text-[#6b7280] border border-[#6b7280]/30";
        } else if (cat.toLowerCase() === "entertainment") {
            bg = "bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30";
        }

        return { letter: firstLetter, bg };
    };

    // Chart configs
    const chartData = {
        labels: categoryData.map(item => item.category),
        datasets: [
            {
                data: categoryData.map(item => item.amount),
                backgroundColor: categoryData.map((item, idx) => getCategoryColor(item.category, idx)),
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
        setModalForm({
            ...modalForm,
            [e.target.name]: e.target.value
        });
    };

    const handleQuickAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = modalForm.type === "income" ? "/income" : "/expenses";
            const payload = modalForm.type === "income"
                ? {
                    title: modalForm.title,
                    amount: parseFloat(modalForm.amount),
                    category: modalForm.category,
                    date: modalForm.date
                }
                : {
                    title: modalForm.title,
                    amount: parseFloat(modalForm.amount),
                    category: modalForm.category,
                    date: modalForm.date,
                    paymentMethod: modalForm.paymentMethod
                };

            await api.post(endpoint, payload);
            setIsModalOpen(false);
            setModalForm({
                type: "expense",
                title: "",
                amount: "",
                category: "",
                date: new Date().toISOString().split("T")[0],
                paymentMethod: "Cash",
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Error creating quick transaction:", err);
        }
    };

    return (

        <div className="p-8 bg-[#13110e] text-[#eae5db] min-h-screen">

            {/* Header section */}
            <div className="flex justify-between items-start mb-10">

                <div>

                    <h1 className="text-4xl font-serif italic font-bold text-[#eae5db]">
                        {getGreeting()}, {userName}
                    </h1>

                    <p className="text-[#8f8a82] mt-2 font-medium">
                        Here's where your money stands today.
                    </p>

                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#dfa935] hover:bg-[#e5b84c] text-black font-semibold px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-[#dfa935]/15 transition-all duration-200"
                >

                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>

                    Add transaction

                </button>

            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 mb-10">

                {/* Income Card */}
                <div className="bg-[#1a1613] rounded-xl shadow-lg border border-[#26221c] p-6 relative overflow-hidden flex flex-col justify-between h-[180px]">

                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2d9d5c]" />

                    <div className="flex justify-between items-start">

                        <span className="text-[#8f8a82] text-xs font-semibold tracking-wider uppercase">
                            Income
                        </span>

                        <div className="w-7 h-7 rounded bg-[#2d9d5c]/10 flex items-center justify-center text-[#2d9d5c]">

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>

                        </div>

                    </div>

                    <div className="mt-2">

                        <p className="text-3xl font-bold text-[#eae5db] tracking-tight">
                            ₹ {summary.totalIncome.toLocaleString()}
                        </p>

                    </div>

                    <div className="flex justify-between items-center mt-4">

                        <div className="flex items-center gap-1.5">

                            <span className="text-[#8f8a82] text-xs">this month</span>

                            <span className="text-[#2d9d5c] text-xs font-semibold">+12.4%</span>

                        </div>

                        <svg className="w-12 h-6 text-[#2d9d5c]" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 15 Q 12 10, 25 12 T 50 3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                        </svg>

                    </div>

                </div>

                {/* Expenses Card */}
                <div className="bg-[#1a1613] rounded-xl shadow-lg border border-[#26221c] p-6 relative overflow-hidden flex flex-col justify-between h-[180px]">

                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#e15a5a]" />

                    <div className="flex justify-between items-start">

                        <span className="text-[#8f8a82] text-xs font-semibold tracking-wider uppercase">
                            Expenses
                        </span>

                        <div className="w-7 h-7 rounded bg-[#e15a5a]/10 flex items-center justify-center text-[#e15a5a]">

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>

                        </div>

                    </div>

                    <div className="mt-2">

                        <p className="text-3xl font-bold text-[#eae5db] tracking-tight">
                            ₹ {summary.totalExpense.toLocaleString()}
                        </p>

                    </div>

                    <div className="mt-4 flex items-center gap-1.5">

                        <span className="text-[#8f8a82] text-xs">this month</span>

                        <span className="text-[#e15a5a] text-xs font-semibold">+4.1%</span>

                    </div>

                </div>

                {/* Balance Card */}
                <div className="bg-[#1a1613] rounded-xl shadow-lg border border-[#dfa935]/30 p-6 relative overflow-hidden flex flex-col justify-between h-[180px]">

                    <div className="absolute top-2 right-2 rotate-12 bg-[#2d9d5c]/20 text-[#2d9d5c] text-[8px] font-bold px-1.5 py-0.5 rounded border border-[#2d9d5c]/30 uppercase tracking-wider">
                        on track
                    </div>

                    <div className="flex justify-between items-start">

                        <span className="text-[#8f8a82] text-xs font-semibold tracking-wider uppercase">
                            Balance
                        </span>

                        <div className="w-7 h-7 rounded bg-[#dfa935]/10 flex items-center justify-center text-[#dfa935] mr-12">

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>

                        </div>

                    </div>

                    <div className="mt-2">

                        <p className="text-3xl font-bold text-[#eae5db] tracking-tight">
                            ₹ {summary.balance.toLocaleString()}
                        </p>

                    </div>

                    <div className="mt-4 flex items-center gap-1.5">

                        <span className="text-[#8f8a82] text-xs">vs last month</span>

                        <span className="text-[#2d9d5c] text-xs font-semibold">+8.7%</span>

                    </div>

                </div>

            </div>

            {/* Bottom sections */}
            <div className="grid grid-cols-5 gap-6">

                {/* Left panel: Spending by Category */}
                <div className="bg-[#1a1613] border border-[#26221c] rounded-xl p-6 col-span-2 shadow-lg flex flex-col justify-between">

                    <div>

                        <h2 className="text-xs font-bold tracking-wider text-[#8f8a82] uppercase mb-6">
                            Spending by Category
                        </h2>

                        <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">

                            {categoryData.length > 0 ? (
                                <Doughnut data={chartData} options={chartOptions} />
                            ) : (
                                <div className="absolute inset-0 rounded-full border border-dashed border-[#26221c] flex items-center justify-center text-xs text-[#8f8a82]">
                                    No data
                                </div>
                            )}

                            <div className="absolute flex flex-col items-center justify-center text-center">

                                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f8a82]">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-[#eae5db] mt-1">
                                    ₹{summary.totalExpense.toLocaleString()}
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* Custom Legend */}
                    <div className="flex flex-col gap-1 mt-2">

                        {categoryData.map((item, idx) => (

                            <div
                                key={item.category}
                                className="flex items-center justify-between py-1.5 text-xs"
                            >

                                <div className="flex items-center gap-2">

                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: getCategoryColor(item.category, idx) }}
                                    />

                                    <span className="text-[#eae5db] font-medium">
                                        {item.category}
                                    </span>

                                </div>

                                <div className="flex-1 mx-3 border-b border-dotted border-[#26221c]" />

                                <span className="font-semibold text-[#eae5db]">
                                    ₹{item.amount.toLocaleString()}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

                {/* Right panel: Recent Transactions */}
                <div className="bg-[#1a1613] border border-[#26221c] rounded-xl p-6 col-span-3 shadow-lg">

                    <h2 className="text-xs font-bold tracking-wider text-[#8f8a82] uppercase mb-6">
                        Recent Transactions
                    </h2>

                    <div className="flex flex-col gap-4">

                        {recentTransactions.length > 0 ? (

                            recentTransactions.map((item) => {

                                const avatar = getCategoryAvatar(item);

                                return (

                                    <div
                                        key={`${item.type}-${item.id}`}
                                        className="flex items-center justify-between py-2 border-b border-[#26221c]/30 last:border-0"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${avatar.bg}`}>
                                                {avatar.letter}
                                            </div>

                                            <div>

                                                <p className="font-semibold text-sm text-[#eae5db] leading-snug">
                                                    {item.title}
                                                </p>

                                                <p className="text-xs text-[#8f8a82] mt-0.5 font-medium">
                                                    {item.type === "income" ? "Income" : item.category} &middot; {formatDate(item.date)}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="text-right">

                                            <p className={`font-bold text-sm ${
                                                item.type === "income" ? "text-[#2d9d5c]" : "text-[#e15a5a]"
                                            }`}>
                                                {item.type === "income" ? "↗" : "↘"} ₹{item.amount.toLocaleString()}
                                            </p>

                                        </div>

                                    </div>

                                );

                            })

                        ) : (

                            <div className="text-center py-10 text-[#8f8a82] text-sm">
                                No recent transactions.
                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* Quick Add Modal */}
            {isModalOpen && (

                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                    <div className="bg-[#1a1613] border border-[#26221c] rounded-xl shadow-2xl w-full max-w-md p-6 relative">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-[#8f8a82] hover:text-[#eae5db] transition-colors"
                        >

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>

                        </button>

                        <h3 className="text-lg font-bold text-[#eae5db] mb-4">
                            Add New Transaction
                        </h3>

                        <form onSubmit={handleQuickAddSubmit} className="flex flex-col gap-4">

                            {/* Type Toggle */}
                            <div>

                                <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1 block">
                                    Type
                                </label>

                                <div className="grid grid-cols-2 gap-2 bg-[#13110e] p-1 rounded-lg border border-[#26221c]">

                                    <button
                                        type="button"
                                        onClick={() => setModalForm({ ...modalForm, type: "expense" })}
                                        className={`py-2 text-xs font-semibold rounded-md transition-all ${
                                            modalForm.type === "expense"
                                                ? "bg-[#e15a5a] text-white shadow"
                                                : "text-[#8f8a82] hover:text-[#eae5db]"
                                        }`}
                                    >
                                        Expense
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setModalForm({ ...modalForm, type: "income" })}
                                        className={`py-2 text-xs font-semibold rounded-md transition-all ${
                                            modalForm.type === "income"
                                                ? "bg-[#2d9d5c] text-white shadow"
                                                : "text-[#8f8a82] hover:text-[#eae5db]"
                                        }`}
                                    >
                                        Income
                                    </button>

                                </div>

                            </div>

                            {/* Title */}
                            <div>

                                <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1 block">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={modalForm.title}
                                    onChange={handleModalChange}
                                    required
                                    className="w-full bg-[#13110e] border border-[#26221c] rounded-lg p-2.5 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935]"
                                    placeholder="e.g. PG rent, Freelance payout"
                                />

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                {/* Amount */}
                                <div>

                                    <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1 block">
                                        Amount
                                    </label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={modalForm.amount}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full bg-[#13110e] border border-[#26221c] rounded-lg p-2.5 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935]"
                                        placeholder="₹ 0.00"
                                    />

                                </div>

                                {/* Category */}
                                <div>

                                    <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1 block">
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        name="category"
                                        value={modalForm.category}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full bg-[#13110e] border border-[#26221c] rounded-lg p-2.5 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935]"
                                        placeholder="e.g. Food, Rent, Salary"
                                    />

                                </div>

                            </div>

                            {/* Date & Payment Method */}
                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1 block">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={modalForm.date}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full bg-[#13110e] border border-[#26221c] rounded-lg p-2.5 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935]"
                                    />

                                </div>

                                {modalForm.type === "expense" && (

                                    <div>

                                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1 block">
                                            Payment Method
                                        </label>

                                        <select
                                            name="paymentMethod"
                                            value={modalForm.paymentMethod}
                                            onChange={handleModalChange}
                                            required
                                            className="w-full bg-[#13110e] border border-[#26221c] rounded-lg p-2.5 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935] cursor-pointer"
                                        >
                                            <option value="Cash" className="bg-[#1a1613] text-[#eae5db]">Cash</option>
                                            <option value="Card" className="bg-[#1a1613] text-[#eae5db]">Card</option>
                                            <option value="UPI" className="bg-[#1a1613] text-[#eae5db]">UPI</option>
                                            <option value="Net Banking" className="bg-[#1a1613] text-[#eae5db]">Net Banking</option>
                                        </select>

                                    </div>

                                )}

                            </div>

                            {/* Save Button */}
                            <button
                                type="submit"
                                className="bg-[#dfa935] hover:bg-[#e5b84c] text-black font-bold p-3 rounded-lg text-sm transition-all mt-2"
                            >
                                Save Transaction
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}