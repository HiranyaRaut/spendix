import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function GroupLedger() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Group creation form state
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupMembers, setNewGroupMembers] = useState(["", "", "", ""]); // 4 default empty fields
    const [createError, setCreateError] = useState("");

    // Group expense form state
    const [expenseForm, setExpenseForm] = useState({
        description: "",
        amount: "",
        paidBy: "",
        date: new Date().toISOString().split("T")[0],
        participants: [] // names of members involved
    });
    const [expenseError, setExpenseError] = useState("");

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await api.get("/groups");
            setGroups(res.data);
        } catch (err) {
            console.error("Error fetching groups:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupDetails = async (id) => {
        try {
            const res = await api.get(`/groups/${id}`);
            const groupData = res.data;
            setSelectedGroup(groupData);
            
            // Set default values for expense form
            setExpenseForm({
                description: "",
                amount: "",
                paidBy: groupData.members[0] || "",
                date: new Date().toISOString().split("T")[0],
                participants: [...groupData.members] // default to all members
            });
            setExpenseError("");
        } catch (err) {
            console.error("Error fetching group details:", err);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setCreateError("");

        const filteredMembers = newGroupMembers
            .map(m => m.trim())
            .filter(m => m !== "");

        if (!newGroupName.trim()) {
            setCreateError("Group name is required");
            return;
        }
        if (filteredMembers.length < 2) {
            setCreateError("Please enter at least 2 members");
            return;
        }

        try {
            const res = await api.post("/groups", {
                name: newGroupName,
                members: filteredMembers
            });
            setNewGroupName("");
            setNewGroupMembers(["", "", "", ""]);
            fetchGroups();
            fetchGroupDetails(res.data.id);
        } catch (err) {
            console.error("Error creating group:", err);
            setCreateError(err.response?.data || "Failed to create group");
        }
    };

    const handleDeleteGroup = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this group? All expenses will be deleted.")) {
            return;
        }
        try {
            await api.delete(`/groups/${id}`);
            if (selectedGroup && selectedGroup.id === id) {
                setSelectedGroup(null);
            }
            fetchGroups();
        } catch (err) {
            console.error("Error deleting group:", err);
        }
    };

    const handleMemberChange = (index, value) => {
        const updated = [...newGroupMembers];
        updated[index] = value;
        setNewGroupMembers(updated);
    };

    const addMemberField = () => {
        setNewGroupMembers([...newGroupMembers, ""]);
    };

    const removeMemberField = (index) => {
        if (newGroupMembers.length <= 2) return;
        const updated = newGroupMembers.filter((_, i) => i !== index);
        setNewGroupMembers(updated);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setExpenseError("");

        if (!expenseForm.description.trim()) {
            setExpenseError("Description is required");
            return;
        }
        const amt = parseFloat(expenseForm.amount);
        if (isNaN(amt) || amt <= 0) {
            setExpenseError("Please enter a valid amount greater than 0");
            return;
        }
        if (!expenseForm.paidBy) {
            setExpenseError("Payer is required");
            return;
        }
        if (expenseForm.participants.length === 0) {
            setExpenseError("Select at least one member to split the expense with");
            return;
        }

        try {
            await api.post(`/groups/${selectedGroup.id}/expenses`, {
                description: expenseForm.description,
                amount: amt,
                paidBy: expenseForm.paidBy,
                date: expenseForm.date,
                participants: expenseForm.participants
            });
            // Reset expense fields keeping date and participants (defaults to all)
            setExpenseForm(prev => ({
                ...prev,
                description: "",
                amount: "",
                participants: [...selectedGroup.members]
            }));
            fetchGroupDetails(selectedGroup.id);
        } catch (err) {
            console.error("Error adding expense:", err);
            setExpenseError(err.response?.data || "Failed to add expense");
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            await api.delete(`/groups/${selectedGroup.id}/expenses/${expenseId}`);
            fetchGroupDetails(selectedGroup.id);
        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    };

    const toggleParticipant = (name) => {
        const current = expenseForm.participants;
        if (current.includes(name)) {
            setExpenseForm({
                ...expenseForm,
                participants: current.filter(p => p !== name)
            });
        } else {
            setExpenseForm({
                ...expenseForm,
                participants: [...current, name]
            });
        }
    };

    const selectAllParticipants = () => {
        setExpenseForm({
            ...expenseForm,
            participants: [...selectedGroup.members]
        });
    };

    const clearAllParticipants = () => {
        setExpenseForm({
            ...expenseForm,
            participants: []
        });
    };

    // Calculate details for rendering balances
    const getBalances = () => {
        if (!selectedGroup) return {};
        const balances = {};
        selectedGroup.members.forEach(m => {
            balances[m] = 0.0;
        });

        selectedGroup.expenses.forEach(exp => {
            const amount = exp.amount;
            const paidBy = exp.paidBy;
            const parts = exp.participants || selectedGroup.members;
            const split = amount / parts.size; // in backend, or parts.length in frontend
            const splitAmt = amount / parts.length;

            balances[paidBy] += amount;
            parts.forEach(p => {
                balances[p] -= splitAmt;
            });
        });

        return balances;
    };

    const totalSpending = selectedGroup?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;

    return (
        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">
            {!selectedGroup ? (
                // Dashboard View: List of Groups and Group Creation
                <div>
                    <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                        Group Ledger
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* List of Groups */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <h2 className="text-xl font-semibold mb-2 text-text-primary border-b border-border-primary/40 pb-2">
                                Active Ledgers
                            </h2>
                            {loading ? (
                                <p className="text-text-secondary text-sm">Loading groups...</p>
                            ) : groups.length === 0 ? (
                                <div className="bg-bg-secondary p-8 rounded-xl border border-border-primary text-center">
                                    <p className="text-text-secondary mb-4 text-sm">No active group ledgers yet.</p>
                                    <p className="text-xs text-text-secondary/70">Create a group on the right to start tracking split expenses with friends!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groups.map(g => (
                                        <div
                                            key={g.id}
                                            onClick={() => fetchGroupDetails(g.id)}
                                            className="bg-bg-secondary p-5 rounded-xl border border-border-primary shadow-md hover:border-accent-primary/60 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-lg text-text-primary group-hover:text-accent-primary transition-colors">
                                                        {g.name}
                                                    </h3>
                                                    <button
                                                        onClick={(e) => handleDeleteGroup(e, g.id)}
                                                        className="text-text-secondary hover:text-red-400 p-1 rounded transition-colors"
                                                        title="Delete Ledger"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-text-secondary leading-relaxed">
                                                    {g.members.length} members: {g.members.join(", ")}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center text-xs text-accent-primary font-medium">
                                                <span>View settlements</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Group Creation Form */}
                        <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg self-start">
                            <h2 className="text-xl font-semibold mb-4 text-text-primary border-b border-border-primary/40 pb-2">
                                Create Group
                            </h2>
                            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Group Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Goa Trip, Room Expenses"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="bg-bg-primary border border-border-primary p-3 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Members (Min 2)</label>
                                        <button
                                            type="button"
                                            onClick={addMemberField}
                                            className="text-xs text-accent-primary hover:text-accent-hover font-semibold cursor-pointer"
                                        >
                                            + Add Field
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                        {newGroupMembers.map((member, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder={`Member ${idx + 1}`}
                                                    value={member}
                                                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                                                    className="bg-bg-primary border border-border-primary p-2.5 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm flex-1"
                                                />
                                                {newGroupMembers.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMemberField(idx)}
                                                        className="text-red-400 hover:text-red-300 font-bold p-1 cursor-pointer"
                                                        title="Remove member"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {createError && (
                                    <p className="text-red-400 text-xs mt-1 font-semibold">{createError}</p>
                                )}

                                <button
                                    type="submit"
                                    className="bg-accent-primary hover:bg-accent-hover text-black font-semibold rounded p-3 shadow-lg shadow-accent-primary/10 transition-all cursor-pointer text-sm mt-2"
                                >
                                    Create Ledger Group
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                // Details View for Selected Group
                <div>
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <button
                                onClick={() => {
                                    setSelectedGroup(null);
                                    fetchGroups();
                                }}
                                className="text-xs text-accent-primary hover:text-accent-hover font-semibold flex items-center gap-1.5 mb-2 cursor-pointer"
                            >
                                <span>←</span> Back to Groups
                            </button>
                            <h1 className="text-3xl font-serif italic font-bold text-text-primary">
                                {selectedGroup.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary">
                                Members: <strong className="text-text-primary">{selectedGroup.members.join(", ")}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Stats Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-bg-secondary p-5 rounded-xl border border-border-primary shadow">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Total Spent</span>
                            <span className="text-2xl font-bold text-[#c5a059]">₹ {totalSpending.toLocaleString()}</span>
                        </div>
                        <div className="bg-bg-secondary p-5 rounded-xl border border-border-primary shadow">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Total Expenses</span>
                            <span className="text-2xl font-bold text-text-primary">{selectedGroup.expenses.length} items</span>
                        </div>
                        <div className="bg-bg-secondary p-5 rounded-xl border border-border-primary shadow">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Equal Share per Friend</span>
                            <span className="text-2xl font-bold text-text-secondary">
                                ₹ {(selectedGroup.members.length > 0 ? Math.round((totalSpending / selectedGroup.members.length) * 100) / 100 : 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side: Add Expense and Expenses List */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            
                            {/* Add Expense Form */}
                            <form
                                onSubmit={handleAddExpense}
                                className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg flex flex-col gap-4"
                            >
                                <h2 className="font-semibold text-lg text-text-primary border-b border-border-primary/40 pb-2">
                                    Add Group Expense
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Description</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Cake, Hotel, Uber"
                                            value={expenseForm.description}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            className="bg-bg-primary border border-border-primary p-2.5 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Amount (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 500"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            className="bg-bg-primary border border-border-primary p-2.5 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Paid By</label>
                                        <select
                                            value={expenseForm.paidBy}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                                            className="bg-bg-primary border border-border-primary p-2.5 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm cursor-pointer"
                                            required
                                        >
                                            {selectedGroup.members.map(member => (
                                                <option key={member} value={member} className="bg-bg-secondary text-text-primary">
                                                    {member}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Date</label>
                                        <input
                                            type="date"
                                            value={expenseForm.date}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                            className="bg-bg-primary border border-border-primary p-2.5 rounded text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Custom Participants Selection (The Cake Split Scenario) */}
                                <div className="border-t border-border-primary/30 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                                            Split Share Participants (Checked members split this cost)
                                        </span>
                                        <div className="flex gap-3 text-xs">
                                            <button
                                                type="button"
                                                onClick={selectAllParticipants}
                                                className="text-accent-primary hover:text-accent-hover font-semibold cursor-pointer"
                                            >
                                                Select All
                                            </button>
                                            <span className="text-border-primary">|</span>
                                            <button
                                                type="button"
                                                onClick={clearAllParticipants}
                                                className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {selectedGroup.members.map(member => {
                                            const isChecked = expenseForm.participants.includes(member);
                                            return (
                                                <button
                                                    key={member}
                                                    type="button"
                                                    onClick={() => toggleParticipant(member)}
                                                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                        isChecked
                                                            ? "bg-accent-primary/10 border-accent-primary text-accent-primary"
                                                            : "bg-bg-primary/40 border-border-primary text-text-secondary hover:text-text-primary"
                                                    }`}
                                                >
                                                    <span className="text-sm leading-none">{isChecked ? "✓" : "○"}</span>
                                                    {member}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-text-secondary/70 mt-2">
                                        💡 Tip: If Hiranya and Alice bought a cake, select only Hiranya and Alice. Other members won't be charged.
                                    </p>
                                </div>

                                {expenseError && (
                                    <p className="text-red-400 text-xs font-semibold">{expenseError}</p>
                                )}

                                <button
                                    type="submit"
                                    className="bg-accent-primary hover:bg-accent-hover text-black font-semibold rounded p-2.5 shadow-lg shadow-accent-primary/15 transition-all cursor-pointer text-sm h-[42px]"
                                >
                                    Add Expense
                                </button>
                            </form>

                            {/* Expenses List */}
                            <div className="bg-bg-secondary border border-border-primary rounded-xl shadow-lg overflow-hidden">
                                <div className="p-4 bg-bg-sidebar/50 border-b border-border-primary flex justify-between items-center">
                                    <h2 className="font-semibold text-text-primary text-base">Expense Log</h2>
                                    <span className="text-xs text-text-secondary font-medium">{selectedGroup.expenses.length} records</span>
                                </div>
                                {selectedGroup.expenses.length === 0 ? (
                                    <p className="p-8 text-center text-text-secondary text-sm">No expenses added yet.</p>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-bg-sidebar text-text-secondary text-[10px] font-bold tracking-wider uppercase border-b border-border-primary">
                                            <tr>
                                                <th className="p-4 text-left">Description</th>
                                                <th className="p-4 text-left">Paid By</th>
                                                <th className="p-4 text-left">Split Participants</th>
                                                <th className="p-4 text-left">Date</th>
                                                <th className="p-4 text-right">Amount</th>
                                                <th className="p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#26221c]/40 text-xs">
                                            {selectedGroup.expenses.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-bg-secondary/40 transition-colors">
                                                    <td className="p-4 font-semibold text-text-primary">{exp.description}</td>
                                                    <td className="p-4 text-text-secondary font-medium">{exp.paidBy}</td>
                                                    <td className="p-4 text-text-secondary">
                                                        <span className="inline-block max-w-[200px] truncate" title={exp.participants.join(", ")}>
                                                            {exp.participants.length === selectedGroup.members.length
                                                                ? "Everyone"
                                                                : exp.participants.join(", ")}
                                                        </span>
                                                        <span className="text-[10px] bg-bg-primary px-1.5 py-0.5 rounded text-text-secondary/70 ml-1.5 font-bold">
                                                            {exp.participants.length} Split
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-text-secondary">{exp.date}</td>
                                                    <td className="p-4 text-right font-bold text-accent-primary">₹ {exp.amount.toLocaleString()}</td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleDeleteExpense(exp.id)}
                                                            className="text-red-400 hover:text-red-300 font-semibold cursor-pointer px-2 py-1 rounded"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                        </div>

                        {/* Right Side: Balances & Settlement Summary */}
                        <div className="flex flex-col gap-6">
                            
                            {/* Net Balances */}
                            <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg">
                                <h2 className="font-semibold text-lg text-text-primary border-b border-border-primary/40 pb-2 mb-4">
                                    Net Balances
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {Object.entries(getBalances()).map(([name, balance]) => {
                                        let textClass = "text-text-secondary";
                                        let sign = "";
                                        let badge = "Settled";
                                        let bgClass = "bg-bg-primary/20 border-border-primary";

                                        if (balance > 0.01) {
                                            textClass = "text-emerald-400 font-bold";
                                            sign = "+";
                                            badge = "Is Owed";
                                            bgClass = "bg-emerald-500/5 border-emerald-500/10";
                                        } else if (balance < -0.01) {
                                            textClass = "text-rose-400 font-bold";
                                            badge = "Owes";
                                            bgClass = "bg-rose-500/5 border-rose-500/10";
                                        }

                                        return (
                                            <div
                                                key={name}
                                                className={`p-3 rounded-lg border flex justify-between items-center transition-all ${bgClass}`}
                                            >
                                                <div>
                                                    <span className="font-semibold text-sm text-text-primary block">{name}</span>
                                                    <span className="text-[10px] text-text-secondary font-medium tracking-wide uppercase">{badge}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm ${textClass}`}>
                                                        {sign}₹ {Math.abs(Math.round(balance * 100) / 100).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Settlements (Greedy Minimization) */}
                            <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-lg">
                                <h2 className="font-semibold text-lg text-text-primary border-b border-border-primary/40 pb-2 mb-4">
                                    Debt Transfers
                                </h2>
                                {selectedGroup.debtTransfers.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-text-secondary text-xs">All accounts are settled. No debt transfers needed! 🎉</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {selectedGroup.debtTransfers.map((dt, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-bg-primary/50 p-4 rounded-lg border border-border-primary/60 flex flex-col gap-1.5"
                                            >
                                                <div className="flex justify-between text-xs text-text-secondary font-medium">
                                                    <span>Payee (Debtor)</span>
                                                    <span>Recipient (Creditor)</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-sm text-text-primary text-rose-300">{dt.from}</span>
                                                    <div className="flex-1 flex flex-col items-center justify-center relative">
                                                        <span className="text-xs font-bold text-accent-primary px-2 bg-bg-secondary rounded border border-accent-primary/20 z-10">
                                                            ₹ {dt.amount.toLocaleString()}
                                                        </span>
                                                        <div className="w-full border-b border-dashed border-border-primary absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                                                    </div>
                                                    <span className="font-bold text-sm text-text-primary text-emerald-300">{dt.to}</span>
                                                </div>
                                                <p className="text-[10px] text-text-secondary mt-1 text-center font-medium">
                                                    <strong>{dt.from}</strong> needs to transfer <strong>₹ {dt.amount.toLocaleString()}</strong> to <strong>{dt.to}</strong>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
