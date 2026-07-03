import { useEffect, useState } from "react";

export default function Settings() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        currency: "₹",
        theme: "Dark Gold",
    });

    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem("name") || "Hiranya Raut";
        const storedEmail = localStorage.getItem("email") || "hiranyaraut16@gmail.com";
        setForm(f => ({
            ...f,
            name: storedName,
            email: storedEmail,
        }));
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem("name", form.name);
        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    return (

        <div className="p-8 bg-[#13110e] text-[#eae5db] min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-[#eae5db]">
                Settings
            </h1>

            <div className="max-w-2xl bg-[#1a1613] border border-[#26221c] rounded-xl p-8 shadow-lg">

                <h2 className="text-sm font-bold tracking-wider text-[#8f8a82] uppercase mb-6">
                    Profile & Preferences
                </h2>

                {successMessage && (

                    <div className="bg-[#2d9d5c]/10 border border-[#2d9d5c]/35 text-[#2d9d5c] text-sm p-3 rounded-lg mb-6">
                        {successMessage}
                    </div>

                )}

                <form onSubmit={handleSave} className="flex flex-col gap-6">

                    {/* Name */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="bg-[#13110e] border border-[#26221c] rounded-lg p-3 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935]"
                            placeholder="Full Name"
                        />

                    </div>

                    {/* Email */}
                    <div className="flex flex-col">

                        <label className="text-xs font-bold text-[#8f8a82] uppercase mb-2">
                            Email Address (Read-only)
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            readOnly
                            className="bg-[#13110e]/40 border border-[#26221c]/40 rounded-lg p-3 text-sm text-[#8f8a82] focus:outline-none cursor-not-allowed italic"
                        />

                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        {/* Currency */}
                        <div className="flex flex-col">

                            <label className="text-xs font-bold text-[#8f8a82] uppercase mb-2">
                                Preferred Currency
                            </label>

                            <select
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                className="bg-[#13110e] border border-[#26221c] rounded-lg p-3 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935] cursor-pointer"
                            >
                                <option value="₹" className="bg-[#1a1613] text-[#eae5db]">INR (₹)</option>
                                <option value="$" className="bg-[#1a1613] text-[#eae5db]">USD ($)</option>
                                <option value="€" className="bg-[#1a1613] text-[#eae5db]">EUR (€)</option>
                                <option value="£" className="bg-[#1a1613] text-[#eae5db]">GBP (£)</option>
                            </select>

                        </div>

                        {/* Theme */}
                        <div className="flex flex-col">

                            <label className="text-xs font-bold text-[#8f8a82] uppercase mb-2">
                                App Theme
                            </label>

                            <select
                                name="theme"
                                value={form.theme}
                                onChange={handleChange}
                                className="bg-[#13110e] border border-[#26221c] rounded-lg p-3 text-sm text-[#eae5db] focus:outline-none focus:border-[#dfa935] cursor-pointer"
                            >
                                <option value="Dark Gold" className="bg-[#1a1613] text-[#eae5db]">Premium Dark Gold</option>
                            </select>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="bg-[#dfa935] hover:bg-[#e5b84c] text-black font-bold p-3 rounded-lg text-sm transition-all mt-4 cursor-pointer shadow-lg shadow-[#dfa935]/15"
                    >
                        Save Settings
                    </button>

                </form>

            </div>

        </div>

    );

}
