import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Income() {

    const [income, setIncome] = useState([]);

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "",
        date: "",
    });

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {

        try {

            const response = await api.get("/income");

            setIncome(response.data);

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

    const addIncome = async (e) => {

        e.preventDefault();

        try {

            await api.post("/income", form);

            setForm({
                title: "",
                amount: "",
                category: "",
                date: "",
            });

            fetchIncome();

        } catch (error) {

            console.log(error);

        }

    };

    const deleteIncome = async (id) => {

        try {

            await api.delete(`/income/${id}`);

            fetchIncome();

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Income
            </h1>

            <form
                onSubmit={addIncome}
                className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg mb-8 grid grid-cols-4 gap-4"
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

                <input
                    type="date"
                    name="date"
                    className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                    value={form.date}
                    onChange={handleChange}
                    required
                />

                <button
                    className="bg-accent-primary hover:bg-accent-hover text-black font-semibold rounded p-3 col-span-4 shadow-lg shadow-accent-primary/15 transition-all cursor-pointer"
                >
                    Add Income
                </button>

            </form>

            <div className="bg-bg-secondary border border-border-primary rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-bg-sidebar text-text-secondary text-xs font-bold tracking-wider uppercase border-b border-border-primary">

                    <tr>

                        <th className="p-4 text-left">Title</th>
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">Category</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-center">Action</th>

                    </tr>

                    </thead>

                    <tbody className="divide-y divide-[#26221c]/40 text-sm">

                    {income.map((item) => (

                        <tr
                            key={item.id}
                            className="hover:bg-bg-secondary/50"
                        >

                            <td className="p-4 font-medium text-text-primary">
                                {item.title}
                            </td>

                            <td className="p-4 font-bold text-[#2d9d5c]">
                                ₹ {item.amount.toLocaleString()}
                            </td>

                            <td className="p-4 text-text-secondary">
                                {item.category}
                            </td>

                            <td className="p-4 text-text-secondary">
                                {item.date}
                            </td>

                            <td className="p-4 text-center">

                                <button
                                    onClick={() => deleteIncome(item.id)}
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


