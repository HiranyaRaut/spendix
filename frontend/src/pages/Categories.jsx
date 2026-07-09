import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [totals, setTotals] = useState({ expense: 0, income: 0 });
    const [expenseSummaries, setExpenseSummaries] = useState({});
    const [incomeSummaries, setIncomeSummaries] = useState({});

    // Form state
    const [form, setForm] = useState({
        name: "",
        icon: "💰",
        color: "#c5a059",
        type: "EXPENSE"
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const PRESET_EMOJIS = ["💰", "🏠", "🍔", "🚗", "⚡", "🎬", "🎁", "🛍️", "✈️", "💼", "💻", "📈", "🩺", "🎓", "🏋️", "🐾"];
    const PRESET_COLORS = ["#c5a059", "#2d9d5c", "#3b82f6", "#6b7280", "#a855f7", "#f97316", "#14b8a6", "#ec4899", "#f43f5e", "#06b6d4", "#ff85a2", "#ffd166"];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch categories
            const catRes = await api.get("/categories");
            setCategories(catRes.data);

            // Fetch summaries
            const expSumRes = await api.get("/dashboard/category-summary");
            const expSumMap = {};
            let totalExp = 0;
            expSumRes.data.forEach(item => {
                expSumMap[item.category.toLowerCase()] = item.amount;
                totalExp += item.amount;
            });
            setExpenseSummaries(expSumMap);

            // Fetch income to summarize manually since there is no backend income summary yet
            const incRes = await api.get("/income");
            const incSumMap = {};
            let totalInc = 0;
            incRes.data.forEach(item => {
                const catName = item.category ? item.category.name.toLowerCase() : "salary";
                incSumMap[catName] = (incSumMap[catName] || 0) + item.amount;
                totalInc += item.amount;
            });
            setIncomeSummaries(incSumMap);

            setTotals({ expense: totalExp, income: totalInc });
        } catch (error) {
            console.error("Error loading category data:", error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await api.post("/categories", form);
            setSuccess("Category created successfully!");
            setForm({
                name: "",
                icon: "💰",
                color: "#c5a059",
                type: "EXPENSE"
            });
            loadData();
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            console.error("Error creating category:", err);
            setError(err.response?.data || "Failed to create category");
            setTimeout(() => setError(""), 4000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this custom category?")) return;
        try {
            await api.delete(`/categories/${id}`);
            loadData();
        } catch (err) {
            console.error("Error deleting category:", err);
            alert(err.response?.data || "Failed to delete category");
        }
    };

    const expenseCats = categories.filter(c => c.type === "EXPENSE" || c.type === "BOTH");
    const incomeCats = categories.filter(c => c.type === "INCOME" || c.type === "BOTH");

    return (
        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">
            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Categories
            </h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/35 text-red-400 text-sm p-3 rounded-lg mb-6 max-w-5xl">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-[#2d9d5c]/10 border border-[#2d9d5c]/35 text-[#2d9d5c] text-sm p-3 rounded-lg mb-6 max-w-5xl">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-3 gap-8 max-w-5xl">
                {/* Left and Mid columns: List Categories */}
                <div className="col-span-2 flex flex-col gap-8">
                    {/* Expense Categories Panel */}
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 flex justify-between items-center border-b border-border-primary pb-3">
                            <span>Expense Categories</span>
                            <span className="text-[#e15a5a] font-mono">
                                Total: ₹ {totals.expense.toLocaleString()}
                            </span>
                        </h2>

                        <div className="flex flex-col gap-5">
                            {expenseCats.length > 0 ? (
                                expenseCats.map((cat) => {
                                    const amount = expenseSummaries[cat.name.toLowerCase()] || 0;
                                    const percentage = totals.expense > 0 ? Math.round((amount / totals.expense) * 100) : 0;

                                    return (
                                        <div key={cat.id} className="flex flex-col border-b border-border-primary/20 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center text-sm font-medium mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40`, color: cat.color }}>
                                                        {cat.icon || "💰"}
                                                    </span>
                                                    <span className="text-text-primary font-semibold">
                                                        {cat.name}
                                                    </span>
                                                    {cat.isCustom && (
                                                        <span className="text-[8px] bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-1 py-0.5 rounded uppercase font-bold">
                                                            Custom
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-text-primary font-bold">
                                                            ₹ {amount.toLocaleString()}
                                                        </span>
                                                        <span className="text-text-secondary ml-1.5 text-xs font-normal">
                                                            ({percentage}%)
                                                        </span>
                                                    </div>
                                                    {cat.isCustom && (
                                                        <button
                                                            onClick={() => handleDelete(cat.id)}
                                                            className="text-red-400 hover:text-red-300 text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/20 transition-all cursor-pointer font-bold uppercase"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-primary">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-text-secondary italic">
                                    No expense categories found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Income Categories Panel */}
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 flex justify-between items-center border-b border-border-primary pb-3">
                            <span>Income Categories</span>
                            <span className="text-[#2d9d5c] font-mono">
                                Total: ₹ {totals.income.toLocaleString()}
                            </span>
                        </h2>

                        <div className="flex flex-col gap-5">
                            {incomeCats.length > 0 ? (
                                incomeCats.map((cat) => {
                                    const amount = incomeSummaries[cat.name.toLowerCase()] || 0;
                                    const percentage = totals.income > 0 ? Math.round((amount / totals.income) * 100) : 0;

                                    return (
                                        <div key={cat.id} className="flex flex-col border-b border-border-primary/20 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center text-sm font-medium mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40`, color: cat.color }}>
                                                        {cat.icon || "💼"}
                                                    </span>
                                                    <span className="text-text-primary font-semibold">
                                                        {cat.name}
                                                    </span>
                                                    {cat.isCustom && (
                                                        <span className="text-[8px] bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-1 py-0.5 rounded uppercase font-bold">
                                                            Custom
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-text-primary font-bold">
                                                            ₹ {amount.toLocaleString()}
                                                        </span>
                                                        <span className="text-text-secondary ml-1.5 text-xs font-normal">
                                                            ({percentage}%)
                                                        </span>
                                                    </div>
                                                    {cat.isCustom && (
                                                        <button
                                                            onClick={() => handleDelete(cat.id)}
                                                            className="text-red-400 hover:text-red-300 text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/20 transition-all cursor-pointer font-bold uppercase"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-primary">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-text-secondary italic">
                                    No income categories found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Create Category Form */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg h-fit">
                    <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 border-b border-border-primary pb-3">
                        Create Category
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Travel, Coffee, Gifts"
                                required
                                className="bg-bg-primary border border-border-primary p-3 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                        </div>

                        {/* Type */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Category Type</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                            >
                                <option value="EXPENSE" className="bg-bg-secondary text-text-primary">Expense</option>
                                <option value="INCOME" className="bg-bg-secondary text-text-primary">Income</option>
                            </select>
                        </div>

                        {/* Emoji Selection Grid */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Select Icon</label>
                            <div className="grid grid-cols-6 gap-2 bg-bg-primary p-2.5 rounded-lg border border-border-primary max-h-32 overflow-y-auto">
                                {PRESET_EMOJIS.map((emoji) => (
                                    <button
                                        type="button"
                                        key={emoji}
                                        onClick={() => setForm({ ...form, icon: emoji })}
                                        className={`w-8 h-8 flex items-center justify-center text-lg rounded-md hover:bg-bg-secondary transition-all cursor-pointer ${form.icon === emoji ? 'bg-accent-primary/20 border border-accent-primary/45 scale-110' : 'opacity-70'}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Picker Grid */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Select Color</label>
                            <div className="grid grid-cols-6 gap-2.5 bg-bg-primary p-2.5 rounded-lg border border-border-primary">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        type="button"
                                        key={color}
                                        onClick={() => setForm({ ...form, color })}
                                        className={`w-6 h-6 rounded-full hover:scale-110 transition-all cursor-pointer border ${form.color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-85'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-hover text-black font-bold p-3 rounded-lg text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-accent-primary/15"
                        >
                            Create Category
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
