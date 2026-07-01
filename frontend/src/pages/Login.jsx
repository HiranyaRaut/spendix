import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await api.post("/auth/login", form);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("name", response.data.name);

            navigate("/");

        } catch (err) {
            setError(err.response?.data || "Login Failed");
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
            >

                <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
                    Spendix Login
                </h1>

                {error && (
                    <p className="text-red-500 text-center mb-4">
                        {error}
                    </p>
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border rounded-lg p-3 mb-4"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full border rounded-lg p-3 mb-6"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                >
                    Login
                </button>

                <p className="text-center mt-5">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="text-blue-600 ml-2"
                    >
                        Register
                    </Link>

                </p>

            </form>

        </div>

    );
}