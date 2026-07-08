import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
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
        setError("");

        try {
            const response = await api.post("/auth/register", form);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("name", response.data.name);

            navigate("/");

        } catch (err) {
            setError(err.response?.data || "Registration Failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary p-4">
            
            <form
                onSubmit={handleSubmit}
                className="bg-bg-secondary border border-border-primary shadow-2xl rounded-2xl p-8 w-full max-w-md relative overflow-hidden"
            >
                {/* Decorative gold gradient border line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

                {/* Logo and title */}
                <div className="flex flex-col items-center justify-center mb-8 mt-2">
                    <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-black font-serif italic text-2xl font-bold shadow-md shadow-accent-primary/10 mb-3">
                        J
                    </div>
                    <h1 className="text-3xl font-serif italic font-bold text-center text-text-primary">
                        Create Account
                    </h1>
                    <p className="text-xs text-text-secondary mt-1.5 uppercase tracking-wider font-semibold">
                        Begin your mindful finance journey
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center mb-6">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5 block">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Hiranya Raut"
                            className="w-full bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5 block">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="e.g. name@domain.com"
                            className="w-full bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase mb-1.5 block">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-accent-primary hover:bg-accent-hover text-black font-bold p-3 rounded-lg text-sm transition-all shadow-lg shadow-accent-primary/15 cursor-pointer"
                >
                    Register
                </button>

                <p className="text-center mt-6 text-sm text-text-secondary">
                    Already have an account?
                    <Link
                        to="/login"
                        className="text-accent-primary hover:underline ml-1.5 font-semibold"
                    >
                        Log In
                    </Link>
                </p>

            </form>

        </div>
    );
}


