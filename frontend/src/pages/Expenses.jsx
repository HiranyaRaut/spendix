import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Expenses() {

    const [expenses, setExpenses] = useState([]);

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "",
        paymentMethod: "Cash",
        date: "",
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {

        try {

            const response = await api.get("/expenses");

            setExpenses(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    const addExpense = async (e) => {

        e.preventDefault();

        try {

            await api.post("/expenses", form);

            setForm({
                title: "",
                amount: "",
                category: "",
                paymentMethod: "Cash",
                date: "",
            });

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
                className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg mb-8 grid grid-cols-5 gap-4"
            >

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                    value={form.amount}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                    value={form.category}
                    onChange={handleChange}
                    required
                />

                <select
                    name="paymentMethod"
                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm cursor-pointer"
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
                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                    value={form.date}
                    onChange={handleChange}
                    required
                />

                <button
                    className="bg-accent-primary hover:bg-accent-hover text-black font-semibold rounded p-3 col-span-5 shadow-lg shadow-accent-primary/15 transition-all cursor-pointer"
                >
                    Add Expense
                </button>

            </form>

            <div className="bg-bg-secondary border border-border-primary rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-bg-sidebar text-text-secondary text-xs font-bold tracking-wider uppercase border-b border-border-primary">

                    <tr>

                        <th className="p-4 text-left">Title</th>
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">Category</th>
                        <th className="p-4 text-left">Payment Method</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-center">Action</th>

                    </tr>

                    </thead>

                    <tbody className="divide-y divide-[#26221c]/40 text-sm">

                    {expenses.map((item) => (

                        <tr
                            key={item.id}
                            className="hover:bg-bg-secondary/50"
                        >

                            <td className="p-4 font-medium text-text-primary">
                                {item.title}
                            </td>

                            <td className="p-4 font-bold text-[#e15a5a]">
                                ₹ {item.amount.toLocaleString()}
                            </td>

                            <td className="p-4 text-text-secondary">
                                {item.category}
                            </td>

                            <td className="p-4 text-text-secondary">
                                {item.paymentMethod || "N/A"}
                            </td>

                            <td className="p-4 text-text-secondary">
                                {item.date}
                            </td>

                            <td className="p-4 text-center">

                                <button
                                    onClick={() => deleteExpense(item.id)}
                                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/25 transition-all text-xs font-semibold cursor-pointer"
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}


