import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Transactions() {

    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all"); // 'all', 'income', 'expense'

    const [form, setForm] = useState({
        type: "expense",
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
    });

    useEffect(() => {
        fetchTransactions();
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
        try {
            const endpoint = form.type === "income" ? "/income" : "/expenses";
            const payload = form.type === "income"
                ? {
                    title: form.title,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    date: form.date
                }
                : {
                    title: form.title,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    date: form.date,
                    paymentMethod: form.paymentMethod
                };

            await api.post(endpoint, payload);

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
            console.error("Error adding transaction:", error);
        }
    };

    const deleteTransaction = async (id, type) => {
        try {
            const endpoint = type === "income" ? `/income/${id}` : `/expenses/${id}`;
            await api.delete(endpoint);
            fetchTransactions();
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

        <div className="p-8 bg-[#13110e] text-[#eae5db] min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-[#eae5db]">
                Transactions
            </h1>

            {/* Quick Add Form */}
            <div className="bg-[#1a1613] p-6 rounded-xl border border-[#26221c] shadow-lg mb-8">

                <h2 className="text-sm font-bold tracking-wider text-[#8f8a82] uppercase mb-4">
                    Add New Transaction
                </h2>

                <form onSubmit={addTransaction} className="grid grid-cols-6 gap-4 items-end">

                    {/* Type selection */}
                    <div className="flex flex-col">

                        <span className="text-xs font-bold text-[#8f8a82] uppercase mb-1.5">
                            Type
                        </span>

                        <div className="flex bg-[#13110e] p-1 rounded-lg border border-[#26221c] h-[46px] items-center">

                            <button
                                type="button"
                                onClick={() => handleTypeChange("expense")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    form.type === "expense"
                                        ? "bg-[#e15a5a] text-white"
                                        : "text-[#8f8a82] hover:text-[#eae5db]"
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
                                        : "text-[#8f8a82] hover:text-[#eae5db]"
                                }`}
                            >
                                Income
                            </button>

                        </div>

                    </div>

                    {/* Title */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1.5">
                            Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm h-[46px]"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1.5">
                            Amount
                        </label>

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm h-[46px]"
                            value={form.amount}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Category */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1.5">
                            Category
                        </label>

                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm h-[46px]"
                            value={form.category}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Date */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1.5">
                            Date
                        </label>

                        <input
                            type="date"
                            name="date"
                            className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm h-[46px]"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* Payment Method / Placeholder */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-1.5">
                            Payment Method
                        </label>

                        {form.type === "expense" ? (

                            <select
                                name="paymentMethod"
                                className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm h-[46px] cursor-pointer"
                                value={form.paymentMethod}
                                onChange={handleChange}
                                required
                            >
                                <option value="Cash" className="bg-[#1a1613] text-[#eae5db]">Cash</option>
                                <option value="Card" className="bg-[#1a1613] text-[#eae5db]">Card</option>
                                <option value="UPI" className="bg-[#1a1613] text-[#eae5db]">UPI</option>
                                <option value="Net Banking" className="bg-[#1a1613] text-[#eae5db]">Net Banking</option>
                            </select>

                        ) : (

                            <div className="bg-[#13110e]/40 border border-[#26221c]/40 p-3 rounded text-[#8f8a82] text-sm h-[46px] flex items-center justify-center italic">
                                N/A (Income)
                            </div>

                        )}

                    </div>

                    <button
                        className="bg-[#dfa935] hover:bg-[#e5b84c] text-black font-semibold rounded p-3 col-span-6 shadow-lg shadow-[#dfa935]/15 transition-all cursor-pointer h-[46px] mt-2"
                    >
                        Add Transaction
                    </button>

                </form>

            </div>

            {/* Filter Tabs */}
            <div className="flex bg-[#1a1613] p-1 rounded-xl border border-[#26221c] max-w-xs mb-6">

                <button
                    onClick={() => setFilter("all")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filter === "all"
                            ? "bg-[#dfa935] text-black font-semibold"
                            : "text-[#8f8a82] hover:text-[#eae5db]"
                    }`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("income")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filter === "income"
                            ? "bg-[#dfa935] text-black font-semibold"
                            : "text-[#8f8a82] hover:text-[#eae5db]"
                    }`}
                >
                    Income
                </button>

                <button
                    onClick={() => setFilter("expense")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filter === "expense"
                            ? "bg-[#dfa935] text-black font-semibold"
                            : "text-[#8f8a82] hover:text-[#eae5db]"
                    }`}
                >
                    Expenses
                </button>

            </div>

            {/* Combined Transactions Table */}
            <div className="bg-[#1a1613] border border-[#26221c] rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-[#0d0b09] text-[#8f8a82] text-xs font-bold tracking-wider uppercase border-b border-[#26221c]">

                    <tr>

                        <th className="p-4 text-left">Title</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">Category</th>
                        <th className="p-4 text-left">Payment Method</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-center">Action</th>

                    </tr>

                    </thead>

                    <tbody className="divide-y divide-[#26221c]/40 text-sm">

                    {filteredTransactions.length > 0 ? (

                        filteredTransactions.map((item) => (

                            <tr
                                key={`${item.type}-${item.id}`}
                                className="hover:bg-[#1a1613]/50"
                            >

                                <td className="p-4 font-medium text-[#eae5db]">
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

                                <td className="p-4 text-[#8f8a82]">
                                    {item.category}
                                </td>

                                <td className="p-4 text-[#8f8a82]">
                                    {item.paymentMethod || <span className="italic opacity-60">N/A</span>}
                                </td>

                                <td className="p-4 text-[#8f8a82]">
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

                            <td colSpan="7" className="p-10 text-center text-[#8f8a82] italic">
                                No transactions found.
                            </td>

                        </tr>

                    )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}
