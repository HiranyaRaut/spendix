import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

    const [form, setForm] = useState({
        title: "",
        amount: "",
        categoryId: "",
        paymentMethod: "Cash",
        date: new Date().toISOString().split("T")[0],
        merchant: "",
        joyReason: "",
        receiptImageUrl: "",
        location: "",
    });

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get("/expenses");
            setExpenses(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            const expenseCats = response.data.filter(
                c => c.type === "EXPENSE" || c.type === "BOTH"
            );
            setCategories(expenseCats);
            if (expenseCats.length > 0) {
                // Pre-select first category
                setForm(f => ({
                    ...f,
                    categoryId: expenseCats[0].id
                }));
            }
        } catch (error) {
            console.log("Error fetching categories:", error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                amount: parseFloat(form.amount),
                categoryId: parseInt(form.categoryId)
            };
            await api.post("/expenses", payload);

            setForm({
                title: "",
                amount: "",
                categoryId: categories.length > 0 ? categories[0].id : "",
                paymentMethod: "Cash",
                date: new Date().toISOString().split("T")[0],
                merchant: "",
                joyReason: "",
                receiptImageUrl: "",
                location: "",
            });
            setShowAdvanced(false);

            fetchExpenses();
        } catch (error) {
            console.log(error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">
            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Expenses
            </h1>

            <form
                onSubmit={addExpense}
                className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg mb-8 flex flex-col gap-4"
            >
                <div className="grid grid-cols-5 gap-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                        value={form.amount}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="categoryId"
                        className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm cursor-pointer h-[46px]"
                        value={form.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="" className="bg-bg-secondary text-text-secondary">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-bg-secondary text-text-primary">
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="paymentMethod"
                        className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm cursor-pointer h-[46px]"
                        value={form.paymentMethod}
                        onChange={handleChange}
                        required
                    >
                        <option value="Cash" className="bg-bg-secondary text-text-primary">Cash</option>
                        <option value="Card" className="bg-bg-secondary text-text-primary">Card</option>
                        <option value="UPI" className="bg-bg-secondary text-text-primary">UPI</option>
                        <option value="Net Banking" className="bg-bg-secondary text-text-primary">Net Banking</option>
                    </select>

                    <input
                        type="date"
                        name="date"
                        className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Collapsible Advanced section */}
                <div className="border-t border-border-primary/40 pt-4 mt-2">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 hover:text-accent-hover transition-colors cursor-pointer"
                    >
                        <span>{showAdvanced ? "▼" : "▶"} Advanced Details</span>
                    </button>

                    {showAdvanced && (
                        <div className="grid grid-cols-4 gap-4 mt-4 animate-fadeIn">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5">Merchant</label>
                                <input
                                    type="text"
                                    name="merchant"
                                    value={form.merchant}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                                    placeholder="e.g. Starbucks"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                                    placeholder="e.g. Bandra"
                                />
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5">Joy Reason</label>
                                <input
                                    type="text"
                                    name="joyReason"
                                    value={form.joyReason}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                                    placeholder="Why did this purchase make you happy?"
                                />
                            </div>
                            <div className="flex flex-col col-span-4 mt-2">
                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5">Receipt Image URL</label>
                                <input
                                    type="text"
                                    name="receiptImageUrl"
                                    value={form.receiptImageUrl}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm h-[46px]"
                                    placeholder="https://example.com/receipt.jpg"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className="bg-accent-primary hover:bg-accent-hover text-black font-semibold rounded p-3 shadow-lg shadow-accent-primary/15 transition-all cursor-pointer h-[46px]"
                >
                    Add Expense
                </button>
            </form>

            <div className="bg-bg-secondary border border-border-primary rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-bg-sidebar text-text-secondary text-xs font-bold tracking-wider uppercase border-b border-border-primary">
                        <tr>
                            <th className="p-4 text-left w-5"></th>
                            <th className="p-4 text-left">Title</th>
                            <th className="p-4 text-left">Amount</th>
                            <th className="p-4 text-left">Category</th>
                            <th className="p-4 text-left">Payment Method</th>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#26221c]/40 text-sm">
                        {expenses.map((item) => {
                            const isExpanded = !!expandedRows[item.id];
                            const hasDetails = !!(item.merchant || item.location || item.joyReason || item.receiptImageUrl);
                            return (
                                <>
                                    <tr 
                                        key={item.id} 
                                        onClick={() => hasDetails && toggleRow(item.id)}
                                        className={`hover:bg-bg-secondary/50 transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
                                    >
                                        <td className="p-4 text-center">
                                            {hasDetails && (
                                                <span className="text-text-secondary text-xs">
                                                    {isExpanded ? "▼" : "▶"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-text-primary">
                                            {item.title}
                                        </td>

                                        <td className="p-4 font-bold text-[#e15a5a]">
                                            ₹ {item.amount.toLocaleString()}
                                        </td>

                                        <td className="p-4 text-text-secondary">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-5.5 h-5.5 rounded flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: `${item.category?.color}20`, border: `1px solid ${item.category?.color}30`, color: item.category?.color }}>
                                                    {item.category?.icon || "💰"}
                                                </span>
                                                <span>{item.category?.name || "General"}</span>
                                            </span>
                                        </td>

                                        <td className="p-4 text-text-secondary">
                                            {item.paymentMethod || "N/A"}
                                        </td>

                                        <td className="p-4 text-text-secondary">
                                            {item.date}
                                        </td>

                                        <td className="p-4 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteExpense(item.id);
                                                }}
                                                className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/25 transition-all text-xs font-semibold cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && hasDetails && (
                                        <tr key={`details-${item.id}`} className="bg-bg-primary/40 border-l border-accent-primary">
                                            <td colSpan="7" className="p-5">
                                                <div className="grid grid-cols-3 gap-6 text-sm">
                                                    <div className="flex flex-col gap-2">
                                                        {item.merchant && (
                                                            <div>
                                                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Merchant</span>
                                                                <span className="text-text-primary font-semibold">{item.merchant}</span>
                                                            </div>
                                                        )}
                                                        {item.location && (
                                                            <div className="mt-2">
                                                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Location</span>
                                                                <span className="text-text-primary font-semibold">{item.location}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-1 col-span-2">
                                                        {item.joyReason && (
                                                            <div className="bg-bg-secondary p-3.5 rounded-lg border border-border-primary/60">
                                                                <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Joy Reflection</span>
                                                                <p className="text-text-primary font-medium font-serif italic text-sm">"{item.joyReason}"</p>
                                                            </div>
                                                        )}
                                                        {item.receiptImageUrl && (
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <span className="text-[10px] uppercase font-bold text-text-secondary">Receipt Reference:</span>
                                                                <a 
                                                                    href={item.receiptImageUrl} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="text-accent-primary hover:underline text-xs flex items-center gap-1"
                                                                >
                                                                    View Receipt ↗
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
