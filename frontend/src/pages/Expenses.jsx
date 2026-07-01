import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Expenses() {

    const [expenses, setExpenses] = useState([]);

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "",
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

        <div className="p-8 min-h-screen bg-gray-100">

            <h1 className="text-4xl font-bold mb-8">
                Expenses
            </h1>

            <form
                onSubmit={addExpense}
                className="bg-white p-6 rounded-xl shadow mb-8 grid grid-cols-4 gap-4"
            >

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    className="border p-3 rounded"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    className="border p-3 rounded"
                    value={form.amount}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    className="border p-3 rounded"
                    value={form.category}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="date"
                    className="border p-3 rounded"
                    value={form.date}
                    onChange={handleChange}
                    required
                />

                <button
                    className="bg-red-600 text-white rounded p-3 col-span-4 hover:bg-red-700"
                >
                    Add Expense
                </button>

            </form>

            <div className="bg-white rounded-xl shadow">

                <table className="w-full">

                    <thead className="bg-red-600 text-white">

                    <tr>

                        <th className="p-4">Title</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Action</th>

                    </tr>

                    </thead>

                    <tbody>

                    {expenses.map((item) => (

                        <tr
                            key={item.id}
                            className="border-b text-center"
                        >

                            <td className="p-4">
                                {item.title}
                            </td>

                            <td>
                                ₹ {item.amount}
                            </td>

                            <td>
                                {item.category}
                            </td>

                            <td>
                                {item.date}
                            </td>

                            <td>

                                <button
                                    onClick={() => deleteExpense(item.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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