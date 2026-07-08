import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [form, setForm] = useState({
        title: "",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
        description: "",
        priority: "Medium",
        status: "Active",
    });
    
    // Deposit inputs tracked per goal ID
    const [deposits, setDeposits] = useState({});

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get("/goals");
            setGoals(res.data);
        } catch (error) {
            console.error("Error fetching goals:", error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: form.title,
                targetAmount: parseFloat(form.targetAmount),
                currentAmount: parseFloat(form.currentAmount || 0),
                targetDate: form.targetDate,
                description: form.description,
                priority: form.priority,
                status: form.status,
            };
            await api.post("/goals", payload);
            setForm({
                title: "",
                targetAmount: "",
                currentAmount: "0",
                targetDate: "",
                description: "",
                priority: "Medium",
                status: "Active",
            });
            fetchGoals();
        } catch (error) {
            console.error("Error creating goal:", error);
        }
    };

    const handleDeleteGoal = async (id) => {
        try {
            await api.delete(`/goals/${id}`);
            fetchGoals();
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const handleDepositChange = (goalId, val) => {
        setDeposits({
            ...deposits,
            [goalId]: val
        });
    };

    const handleAddSavings = async (goal) => {
        const depositVal = parseFloat(deposits[goal.id] || 0);
        if (depositVal <= 0) return;

        try {
            const updatedCurrent = goal.currentAmount + depositVal;
            const isCompleted = updatedCurrent >= goal.targetAmount;
            
            const payload = {
                title: goal.title,
                targetAmount: goal.targetAmount,
                currentAmount: updatedCurrent,
                targetDate: goal.targetDate,
                description: goal.description,
                priority: goal.priority,
                status: isCompleted ? "Completed" : goal.status,
            };
            await api.put(`/goals/${goal.id}`, payload);
            setDeposits({
                ...deposits,
                [goal.id]: ""
            });
            fetchGoals();
        } catch (error) {
            console.error("Error adding savings:", error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "No date set";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getPriorityBadgeClass = (priority) => {
        if (priority === "High") return "bg-red-500/10 text-red-400 border border-red-500/20";
        if (priority === "Low") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        return "bg-accent-primary/10 text-accent-primary border border-accent-primary/20";
    };

    const getStatusBadgeClass = (status) => {
        if (status === "Completed") return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
        return "bg-[#2d9d5c]/10 text-[#2d9d5c] border border-[#2d9d5c]/20";
    };

    // Calculate Summary Stats
    const totalGoals = goals.length;
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return (
        <div className="p-8 bg-bg-primary text-text-primary min-h-screen">
            <h1 className="text-4xl font-serif italic font-bold mb-8 text-text-primary">
                Joy Goals
            </h1>

            {/* Stats Summary cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-accent-primary" />
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Total Goal savings</div>
                    <div className="text-2xl font-bold font-mono text-accent-primary">₹{totalSaved.toLocaleString()}</div>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-[#2d9d5c]" />
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Active Goals</div>
                    <div className="text-2xl font-bold font-mono text-text-primary">{totalGoals}</div>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-[#3b82f6]" />
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Overall Progress</div>
                    <div className="text-2xl font-bold font-mono text-text-primary">{overallProgress}%</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                
                {/* Goals list */}
                <div className="col-span-2 flex flex-col gap-6">
                    <h2 className="text-lg font-bold tracking-wider text-text-secondary uppercase border-b border-border-primary pb-3 mb-2">
                        Your Savings Goals
                    </h2>

                    {goals.length > 0 ? (
                        goals.map((goal) => {
                            const progress = goal.targetAmount > 0 
                                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                                : 0;

                            return (
                                <div key={goal.id} className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg flex flex-col gap-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-text-primary">{goal.title}</h3>
                                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityBadgeClass(goal.priority)}`}>
                                                    {goal.priority}
                                                </span>
                                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getStatusBadgeClass(goal.status)}`}>
                                                    {goal.status}
                                                </span>
                                            </div>
                                            {goal.description && (
                                                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed bg-bg-primary/40 p-2.5 rounded border border-border-primary/40 font-serif italic">
                                                    {goal.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-text-secondary mt-2">Target Date: {formatDate(goal.targetDate)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/25 transition-all text-xs font-semibold cursor-pointer shrink-0"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {/* Progress Details */}
                                    <div className="flex justify-between items-end text-sm font-semibold mt-2">
                                        <span className="text-text-secondary">
                                            ₹{goal.currentAmount.toLocaleString()} <span className="text-xs font-normal">saved of</span> ₹{goal.targetAmount.toLocaleString()}
                                        </span>
                                        <span className="text-accent-primary font-mono">{progress}%</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-bg-primary h-3 rounded-full overflow-hidden border border-border-primary relative">
                                        <div
                                            className="h-full rounded-full bg-accent-primary transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {/* Quick Deposit Section */}
                                    <div className="flex items-center gap-3 mt-2 border-t border-border-primary/40 pt-4">
                                        <span className="text-xs font-bold text-text-secondary uppercase shrink-0">Add Savings:</span>
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            className="bg-bg-primary border border-border-primary rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary w-28 font-mono"
                                            value={deposits[goal.id] || ""}
                                            onChange={(e) => handleDepositChange(goal.id, e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleAddSavings(goal)}
                                            className="bg-accent-primary hover:bg-accent-hover text-black text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-accent-primary/5 cursor-pointer"
                                        >
                                            Deposit
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-bg-secondary border border-border-primary rounded-xl p-10 text-center text-text-secondary italic">
                            No savings goals created yet. Establish a goal to track your mindful savings!
                        </div>
                    )}
                </div>

                {/* Create Goal Form */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg h-fit">
                    <h2 className="text-sm font-bold tracking-wider text-text-secondary uppercase mb-6 border-b border-border-primary pb-3">
                        Create New Goal
                    </h2>

                    <form onSubmit={handleCreateGoal} className="flex flex-col gap-5">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Goal Name</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. MacBook Pro, Europe Trip"
                                className="bg-bg-primary border border-border-primary p-3 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="For software development / travel plans"
                                rows="2"
                                className="bg-bg-primary border border-border-primary p-3 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Priority</label>
                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                                >
                                    <option value="High" className="bg-bg-secondary text-text-primary">High</option>
                                    <option value="Medium" className="bg-bg-secondary text-text-primary">Medium</option>
                                    <option value="Low" className="bg-bg-secondary text-text-primary">Low</option>
                                </select>
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="bg-bg-primary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                                >
                                    <option value="Active" className="bg-bg-secondary text-text-primary">Active</option>
                                    <option value="Completed" className="bg-bg-secondary text-text-primary">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Target Amount (₹)</label>
                            <input
                                type="number"
                                name="targetAmount"
                                value={form.targetAmount}
                                onChange={handleChange}
                                placeholder="e.g. 150000"
                                className="bg-bg-primary border border-border-primary p-3 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Initial Savings (₹)</label>
                            <input
                                type="number"
                                name="currentAmount"
                                value={form.currentAmount}
                                onChange={handleChange}
                                placeholder="0"
                                className="bg-bg-primary border border-border-primary p-3 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1.5">Target Date</label>
                            <input
                                type="date"
                                name="targetDate"
                                value={form.targetDate}
                                onChange={handleChange}
                                className="bg-bg-primary border border-border-primary p-3 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-hover text-black font-bold p-3 rounded-lg text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-accent-primary/15"
                        >
                            Create Goal
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}



