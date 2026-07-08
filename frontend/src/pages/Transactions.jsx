import { useEffect, useState } from "react";
import api from "../api/axios";
import MindfulPauseModal from "../components/MindfulPauseModal";

export default function Transactions() {

    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all"); // 'all', 'income', 'expense'
    const [summaryStats, setSummaryStats] = useState({ goalProgress: 0 });

    const [form, setForm] = useState({
        type: "expense",
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
    });

    // Mindful Pause Modal state
    const [isPauseOpen, setIsPauseOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

    useEffect(() => {
        fetchTransactions();
        fetchSummaryStats();
    }, []);

    const fetchTransactions = async () => {
        try {
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
            setTransactions(combined);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    const fetchSummaryStats = async () => {
        try {
            const res = await api.get("/dashboard/summary");
            setSummaryStats(res.data);
        } catch (err) {
            console.error("Error fetching summary stats:", err);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleTypeChange = (type) => {
        setForm({
            ...form,
            type,
        });
    };

    const addTransaction = async (e) => {
        e.preventDefault();
        
        if (form.type === "expense") {
            // Intercept with Mindful Pause modal
            setPendingPayload({
                title: form.title,
                amount: parseFloat(form.amount),
                category: form.category,
                date: form.date,
                paymentMethod: form.paymentMethod
            });
            setIsPauseOpen(true);
        } else {
            // Income, add immediately
            try {
                const payload = {
                    title: form.title,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    date: form.date
                };
                await api.post("/income", payload);
                setForm({
                    type: "expense",
                    title: "",
                    amount: "",
                    category: "",
                    date: new Date().toISOString().split("T")[0],
                    paymentMethod: "Cash",
                });
                fetchTransactions();
            } catch (error) {
                console.error("Error adding income transaction:", error);
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
            setForm({
                type: "expense",
                title: "",
                amount: "",
                category: "",
                date: new Date().toISOString().split("T")[0],
                paymentMethod: "Cash",
            });
            fetchTransactions();
            fetchSummaryStats();
        } catch (error) {
            console.error("Error adding expense transaction:", error);
        }
    };

    const deleteTransaction = async (id, type) => {
        try {
            const endpoint = type === "income" ? `/income/${id}` : `/expenses/${id}`;
            await api.delete(endpoint);
            fetchTransactions();
            fetchSummaryStats();
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === "all") return true;
        return t.type === filter;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (

        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Transactions
            </h1>

            {/* Quick Add Form */}
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg mb-8">

                <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-4">
                    Add New Transaction
                </h2>

                <form onSubmit={addTransaction} className="grid grid-cols-6 gap-4 items-end">

                    {/* Type selection */}
                    <div className="flex flex-col">

                        <span className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                            Type
                        </span>

                        <div className="flex bg-bg-primary p-1 rounded-lg border border-border-primary h-[46px] items-center">

                            <button
                                type="button"
                                onClick={() => handleTypeChange("expense")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    form.type === "expense"
                                        ? "bg-[#e15a5a] text-white"
                                        : "text-text-secondary hover:text-text-primary"
                                }`}
                            >
                                Expense
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange("income")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    form.type === "income"
                                        ? "bg-[#2d9d5c] text-white"
                                        : "text-text-secondary hover:text-text-primary"
                                }`}
                            >
                                Income
                            </button>

                        </div>

                    </div>

                    {/* Title */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                            Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                            Amount
                        </label>

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                            value={form.amount}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Category */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                            Category
                        </label>

                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                            value={form.category}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Date */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                            Date
                        </label>

                        <input
                            type="date"
                            name="date"
                            className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Payment Method / Placeholder */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                            Payment Method
                        </label>

                        {form.type === "expense" ? (

                            <select
                                name="paymentMethod"
                                className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px] cursor-pointer"
                                value={form.paymentMethod}
                                onChange={handleChange}
                                required
                            >
                                <option value="Cash" className="bg-bg-secondary text-text-primary">Cash</option>
                                <option value="Card" className="bg-bg-secondary text-text-primary">Card</option>
                                <option value="UPI" className="bg-bg-secondary text-text-primary">UPI</option>
                                <option value="Net Banking" className="bg-bg-secondary text-text-primary">Net Banking</option>
                            </select>

                        ) : (

                            <div className="bg-bg-primary/40 border border-border-primary/40 p-3 rounded text-text-secondary text-sm h-[46px] flex items-center justify-center italic">
                                N/A (Income)
                            </div>

                        )}

                    </div>

                    <button
                        className="bg-accent-primary hover:bg-accent-hover text-black font-semibold rounded p-3 col-span-6 shadow-lg shadow-accent-primary/15 transition-all cursor-pointer h-[46px] mt-2"
                    >
                        Add Transaction
                    </button>

                </form>

            </div>

            {/* Filter Tabs */}
            <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-primary max-w-xs mb-6">

                <button
                    onClick={() => setFilter("all")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filter === "all"
                            ? "bg-accent-primary text-black font-semibold"
                            : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("income")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filter === "income"
                            ? "bg-accent-primary text-black font-semibold"
                            : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                    Income
                </button>

                <button
                    onClick={() => setFilter("expense")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filter === "expense"
                            ? "bg-accent-primary text-black font-semibold"
                            : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                    Expenses
                </button>

            </div>

            {/* Combined Transactions Table */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-bg-sidebar text-text-secondary text-xs font-bold tracking-wider uppercase border-b border-border-primary">

                    <tr>

                        <th className="p-4 text-left">Title</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">Category</th>
                        <th className="p-4 text-left">Payment Method</th>
                        <th className="p-4 text-left">Joy Score</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-center">Action</th>

                    </tr>

                    </thead>

                    <tbody className="divide-y divide-[#26221c]/40 text-sm">

                    {filteredTransactions.length > 0 ? (

                        filteredTransactions.map((item) => (

                            <tr
                                key={`${item.type}-${item.id}`}
                                className="hover:bg-bg-secondary/50"
                            >

                                <td className="p-4 font-medium text-text-primary">
                                    {item.title}
                                </td>

                                <td className="p-4">

                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                        item.type === "income"
                                            ? "bg-[#2d9d5c]/10 text-[#2d9d5c] border-[#2d9d5c]/20"
                                            : "bg-[#e15a5a]/10 text-[#e15a5a] border-[#e15a5a]/20"
                                    }`}>
                                        {item.type}
                                    </span>

                                </td>

                                <td className={`p-4 font-bold ${
                                    item.type === "income" ? "text-[#2d9d5c]" : "text-[#e15a5a]"
                                }`}>
                                    {item.type === "income" ? "↗" : "↘"} ₹ {item.amount.toLocaleString()}
                                </td>

                                <td className="p-4 text-text-secondary">
                                    {item.category}
                                </td>

                                <td className="p-4 text-text-secondary">
                                    {item.paymentMethod || <span className="italic opacity-60">N/A</span>}
                                </td>

                                <td className="p-4">
                                    {item.joyScore !== undefined && item.joyScore !== null ? (
                                        <span className="text-accent-primary font-bold font-mono">
                                            {item.joyScore} <span className="text-[10px] text-text-secondary">/100</span>
                                        </span>
                                    ) : (
                                        <span className="italic text-text-secondary/60">N/A</span>
                                    )}
                                </td>

                                <td className="p-4 text-text-secondary">
                                    {formatDate(item.date)}
                                </td>

                                <td className="p-4 text-center">

                                    <button
                                        onClick={() => deleteTransaction(item.id, item.type)}
                                        className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/25 transition-all text-xs font-semibold cursor-pointer"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td colSpan="8" className="p-10 text-center text-text-secondary italic">
                                No transactions found.
                            </td>

                        </tr>

                    )}

                    </tbody>

                </table>

            </div>

            {/* Mindful Pause Modal Overlay */}
            <MindfulPauseModal
                isOpen={isPauseOpen}
                onClose={() => {
                    setIsPauseOpen(false);
                    setPendingPayload(null);
                }}
                onConfirm={handleConfirmPause}
                expenseData={pendingPayload || {}}
                summaryStats={summaryStats}
            />

        </div>

    );

}



