import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Settings() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        profilePicture: "",
        currency: "₹",
        theme: "Dark Gold",
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [pwSuccessMessage, setPwSuccessMessage] = useState("");
    const [pwErrorMessage, setPwErrorMessage] = useState("");

    useEffect(() => {
        fetchProfile();
        // Load local preferences if any
        const storedCurrency = localStorage.getItem("currency") || "₹";
        const storedTheme = localStorage.getItem("theme") || "Dark Gold";
        setForm(f => ({
            ...f,
            currency: storedCurrency,
            theme: storedTheme
        }));
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/users/me");
            setForm(f => ({
                ...f,
                name: res.data.name || "",
                email: res.data.email || "",
                profilePicture: res.data.profilePicture || "",
            }));
        } catch (err) {
            console.error("Error fetching profile details:", err);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1.5 * 1024 * 1024) {
                setErrorMessage("Profile picture must be smaller than 1.5MB");
                setTimeout(() => setErrorMessage(""), 4000);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    profilePicture: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setErrorMessage("");
            setSuccessMessage("");
            
            const payload = {
                name: form.name,
                email: form.email,
                profilePicture: form.profilePicture
            };
            
            const res = await api.put("/users/me", payload);
            
            // Sync values in local storage
            localStorage.setItem("name", res.data.name);
            localStorage.setItem("email", res.data.email);
            localStorage.setItem("currency", form.currency);
            localStorage.setItem("theme", form.theme);
            
            // Apply theme class to document.documentElement (html element)
            const root = document.documentElement;
            root.className = "";
            if (form.theme === "Emerald Forest") {
                root.classList.add("theme-emerald");
            } else if (form.theme === "Royal Blue") {
                root.classList.add("theme-royal-blue");
            } else if (form.theme === "Rose Crimson") {
                root.classList.add("theme-rose-wood");
            }
            
            setSuccessMessage("Profile and preferences saved successfully!");
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            console.error("Error saving profile details:", err);
            setErrorMessage(err.response?.data || "Failed to update profile details.");
            setTimeout(() => setErrorMessage(""), 4000);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPwErrorMessage("");
        setPwSuccessMessage("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPwErrorMessage("New passwords do not match!");
            setTimeout(() => setPwErrorMessage(""), 4000);
            return;
        }

        try {
            const payload = {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            };
            await api.put("/users/me/password", payload);
            setPwSuccessMessage("Password changed successfully!");
            setPasswordForm({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setTimeout(() => setPwSuccessMessage(""), 4000);
        } catch (err) {
            console.error("Error changing password:", err);
            setPwErrorMessage(err.response?.data || "Failed to change password. Double check current password.");
            setTimeout(() => setPwErrorMessage(""), 4000);
        }
    };

    return (

        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">

            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Settings
            </h1>

            <div className="grid grid-cols-2 gap-8 max-w-5xl">

                {/* Left panel: Profile Info & Preferences */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-8 shadow-lg flex flex-col gap-6">

                    <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase border-b border-border-primary pb-3">
                        👤 User Profile & Preferences
                    </h2>

                    {successMessage && (
                        <div className="bg-[#2d9d5c]/10 border border-[#2d9d5c]/35 text-[#2d9d5c] text-sm p-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}
                    
                    {errorMessage && (
                        <div className="bg-red-500/10 border border-red-500/35 text-red-400 text-sm p-3 rounded-lg">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">

                        {/* Profile Picture Upload */}
                        <div className="flex items-center gap-6 p-4 rounded-lg bg-bg-primary/40 border border-border-primary/40">
                            
                            {form.profilePicture ? (
                                <img 
                                    src={form.profilePicture} 
                                    alt="Profile Preview" 
                                    className="w-16 h-16 rounded-full object-cover border border-accent-primary/40"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-accent-primary/15 border border-accent-primary/30 text-accent-primary flex items-center justify-center font-bold text-xl">
                                    {(form.name || "J").charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">
                                    Profile Picture
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-primary file:text-black hover:file:bg-accent-hover file:cursor-pointer"
                                />
                            </div>

                        </div>

                        {/* Full Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                placeholder="Full Name"
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            {/* Currency */}
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                    Preferred Currency
                                </label>
                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                                >
                                    <option value="₹" className="bg-bg-secondary text-text-primary">INR (₹)</option>
                                    <option value="$" className="bg-bg-secondary text-text-primary">USD ($)</option>
                                    <option value="€" className="bg-bg-secondary text-text-primary">EUR (€)</option>
                                    <option value="£" className="bg-bg-secondary text-text-primary">GBP (£)</option>
                                </select>
                            </div>

                            {/* Theme */}
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                    App Theme
                                </label>
                                <select
                                    name="theme"
                                    value={form.theme}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                                >
                                    <option value="Dark Gold" className="bg-bg-secondary text-text-primary">Premium Dark Gold</option>
                                    <option value="Emerald Forest" className="bg-bg-secondary text-text-primary">Emerald Forest</option>
                                    <option value="Royal Blue" className="bg-bg-secondary text-text-primary">Royal Blue</option>
                                    <option value="Rose Crimson" className="bg-bg-secondary text-text-primary">Rose Crimson</option>
                                </select>
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-hover text-black font-bold p-3 rounded-lg text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-accent-primary/15"
                        >
                            Save Settings
                        </button>

                    </form>

                </div>

                {/* Right panel: Security / Change Password */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-8 shadow-lg flex flex-col gap-6 h-fit">

                    <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase border-b border-border-primary pb-3">
                        🔑 Change Password
                    </h2>

                    {pwSuccessMessage && (
                        <div className="bg-[#2d9d5c]/10 border border-[#2d9d5c]/35 text-[#2d9d5c] text-sm p-3 rounded-lg">
                            {pwSuccessMessage}
                        </div>
                    )}

                    {pwErrorMessage && (
                        <div className="bg-red-500/10 border border-red-500/35 text-red-400 text-sm p-3 rounded-lg">
                            {pwErrorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSavePassword} className="flex flex-col gap-5">

                        {/* Current Password */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordForm.oldPassword}
                                onChange={handlePasswordChange}
                                required
                                className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                                className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                className="bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-hover text-black font-bold p-3 rounded-lg text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-accent-primary/15"
                        >
                            Update Password
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}



