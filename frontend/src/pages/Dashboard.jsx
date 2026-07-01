import { useEffect, useState } from "react";
import api from "../api/axios";

import { Pie } from "react-chartjs-2";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        fetchSummary();
        fetchCategorySummary();
    }, []);

    const fetchSummary = async () => {

        try {

            const response = await api.get("/dashboard/summary");

            setSummary(response.data);

        } catch (error) {

            console.log(error);

        }

    };
    const fetchCategorySummary = async () => {

        try {

            const response = await api.get("/dashboard/category-summary");

            console.log(response.data);

            setCategoryData(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const chartData = {

        labels: categoryData.map(item => item.category),

        datasets: [

            {

                data: categoryData.map(item => item.amount),

                backgroundColor: [

                    "#22c55e",
                    "#ef4444",
                    "#3b82f6",
                    "#facc15",
                    "#a855f7",
                    "#14b8a6",
                    "#f97316"

                ],

            },

        ],

    };

    return (

        <div className="p-8 bg-gray-100 min-h-screen">

            <h1 className="text-4xl font-bold mb-8">
                Dashboard
            </h1>

            <div className="grid grid-cols-3 gap-6 mb-8">

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-gray-500">
                        Total Income
                    </h2>

                    <p className="text-3xl font-bold text-green-600">
                        ₹ {summary.totalIncome}
                    </p>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-gray-500">
                        Total Expense
                    </h2>

                    <p className="text-3xl font-bold text-red-600">
                        ₹ {summary.totalExpense}
                    </p>

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-gray-500">
                        Balance
                    </h2>

                    <p className="text-3xl font-bold text-blue-600">
                        ₹ {summary.balance}
                    </p>

                </div>

            </div>

            <div className="bg-white p-8 rounded-xl shadow w-[450px]">

                <Pie data={chartData} />

            </div>

        </div>

    );

}