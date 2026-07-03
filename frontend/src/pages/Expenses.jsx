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

        <div className="p-8 bg-[#13110e] text-[#eae5db] min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-[#eae5db]">
                Expenses
            </h1>

            <form
                onSubmit={addExpense}
                className="bg-[#1a1613] p-6 rounded-xl border border-[#26221c] shadow-lg mb-8 grid grid-cols-5 gap-4"
            >

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm"
                    value={form.amount}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm"
                    value={form.category}
                    onChange={handleChange}
                    required
                />

                <select
                    name="paymentMethod"
                    className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm cursor-pointer"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    required
                >
                    <option value="Cash" className="bg-[#1a1613] text-[#eae5db]">Cash</option>
                    <option value="Card" className="bg-[#1a1613] text-[#eae5db]">Card</option>
                    <option value="UPI" className="bg-[#1a1613] text-[#eae5db]">UPI</option>
                    <option value="Net Banking" className="bg-[#1a1613] text-[#eae5db]">Net Banking</option>
                </select>

                <input
                    type="date"
                    name="date"
                    className="bg-[#13110e] border border-[#26221c] p-3 rounded text-[#eae5db] focus:outline-none focus:border-[#dfa935] text-sm"
                    value={form.date}
                    onChange={handleChange}
                    required
                />

                <button
                    className="bg-[#dfa935] hover:bg-[#e5b84c] text-black font-semibold rounded p-3 col-span-5 shadow-lg shadow-[#dfa935]/15 transition-all cursor-pointer"
                >
                    Add Expense
                </button>

            </form>

            <div className="bg-[#1a1613] border border-[#26221c] rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-[#0d0b09] text-[#8f8a82] text-xs font-bold tracking-wider uppercase border-b border-[#26221c]">

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
                            className="hover:bg-[#1a1613]/50"
                        >

                            <td className="p-4 font-medium text-[#eae5db]">
                                {item.title}
                            </td>

                            <td className="p-4 font-bold text-[#e15a5a]">
                                ₹ {item.amount.toLocaleString()}
                            </td>

                            <td className="p-4 text-[#8f8a82]">
                                {item.category}
                            </td>

                            <td className="p-4 text-[#8f8a82]">
                                {item.paymentMethod || "N/A"}
                            </td>

                            <td className="p-4 text-[#8f8a82]">
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