import { useEffect, useState } from "react";
import api from "../api/axios";

export default function MindfulPauseModal({ isOpen, onClose, onConfirm, expenseData, summaryStats }) {
    const [timeLeft, setTimeLeft] = useState(5);
    const [questions, setQuestions] = useState({
        goalAligned: false,
        planned: false,
        essential: false,
        rare: false,
    });

    useEffect(() => {
        if (!isOpen) return;

        setTimeLeft(5);
        setQuestions({
            goalAligned: false,
            planned: false,
            essential: false,
            rare: false,
        });

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCheckboxChange = (name) => {
        setQuestions(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Calculate Joy Score based on exact weights specified:
    // Goal Alignment (40%), Planned Purchase (20%), Category Importance/Essential (20%), Spending Frequency/Rare (20%)
    const calculatedJoyScore = 
        (questions.goalAligned ? 40 : 0) + 
        (questions.planned ? 20 : 0) + 
        (questions.essential ? 20 : 0) + 
        (questions.rare ? 20 : 0);

    const handleConfirm = () => {
        onConfirm({
            joyScore: calculatedJoyScore,
            planned: questions.planned,
            goalAligned: questions.goalAligned
        });
    };

    // When the user cancels, record it as an Avoided Impulse Purchase!
    const handleCancelAndLog = async () => {
        try {
            const payload = {
                title: expenseData.title || "Avoided Impulse",
                amount: parseFloat(expenseData.amount || 0),
                category: expenseData.category || "General",
                date: expenseData.date || new Date().toISOString().split("T")[0]
            };
            await api.post("/expenses/avoided", payload);
        } catch (err) {
            console.error("Error logging avoided impulse purchase:", err);
        } finally {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-bg-secondary border border-border-primary rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                
                {/* Decorative gold gradient border line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

                <h2 className="text-2xl font-serif italic font-bold text-center text-text-primary mb-2 mt-2">
                    Mindful Pause
                </h2>
                
                <p className="text-sm text-text-secondary text-center mb-6 italic">
                    "Will this purchase bring you lasting happiness?"
                </p>

                <div className="bg-bg-primary/60 border border-border-primary/60 p-4 rounded-xl mb-6">
                    <div className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-bold">
                        Pending Purchase
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-primary font-semibold text-lg">{expenseData.title || "Untitled Purchase"}</span>
                        <span className="text-accent-primary font-bold text-lg font-mono">₹{parseFloat(expenseData.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                        Category: {expenseData.category || "General"}
                    </div>
                </div>

                {/* Checklist with exact weight mapping */}
                <div className="flex flex-col gap-3 mb-6">
                    
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-primary/60 bg-bg-primary/30 hover:bg-bg-primary/50 transition-all cursor-pointer">
                        <input
                            type="checkbox"
                            checked={questions.goalAligned}
                            onChange={() => handleCheckboxChange("goalAligned")}
                            className="accent-accent-primary w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div>
                            <span className="text-sm text-text-primary font-semibold block">Does this support your long-term goals?</span>
                            <span className="text-[10px] text-text-secondary font-mono block mt-0.5">Goal Alignment (40% Weight)</span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-primary/60 bg-bg-primary/30 hover:bg-bg-primary/50 transition-all cursor-pointer">
                        <input
                            type="checkbox"
                            checked={questions.planned}
                            onChange={() => handleCheckboxChange("planned")}
                            className="accent-accent-primary w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div>
                            <span className="text-sm text-text-primary font-semibold block">Was this a planned purchase?</span>
                            <span className="text-[10px] text-text-secondary font-mono block mt-0.5">Intentional spending (20% Weight)</span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-primary/60 bg-bg-primary/30 hover:bg-bg-primary/50 transition-all cursor-pointer">
                        <input
                            type="checkbox"
                            checked={questions.essential}
                            onChange={() => handleCheckboxChange("essential")}
                            className="accent-accent-primary w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div>
                            <span className="text-sm text-text-primary font-semibold block">Is this an essential category?</span>
                            <span className="text-[10px] text-text-secondary font-mono block mt-0.5">Category Importance (20% Weight)</span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-primary/60 bg-bg-primary/30 hover:bg-bg-primary/50 transition-all cursor-pointer">
                        <input
                            type="checkbox"
                            checked={questions.rare}
                            onChange={() => handleCheckboxChange("rare")}
                            className="accent-accent-primary w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div>
                            <span className="text-sm text-text-primary font-semibold block">Is this a low-frequency / rare purchase?</span>
                            <span className="text-[10px] text-text-secondary font-mono block mt-0.5">Spending Frequency (20% Weight)</span>
                        </div>
                    </label>

                </div>

                {/* Score and Stats */}
                <div className="grid grid-cols-2 gap-4 bg-bg-primary/40 p-4 rounded-xl border border-border-primary/50 mb-6">
                    <div className="text-center">
                        <div className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1">
                            Calculated Joy Score
                        </div>
                        <div className="text-2xl font-bold font-mono text-accent-primary">
                            {calculatedJoyScore} <span className="text-xs text-text-secondary">/ 100</span>
                        </div>
                    </div>

                    <div className="text-center border-l border-border-primary/80">
                        <div className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1">
                            Goal Progress
                        </div>
                        <div className="text-2xl font-bold font-mono text-text-primary">
                            {summaryStats.goalProgress || 0}%
                        </div>
                    </div>
                </div>

                {/* Wait Countdown & Confirm buttons */}
                <div className="flex flex-col gap-3">
                    {timeLeft > 0 ? (
                        <div className="bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold p-3 rounded-xl text-center">
                            Pausing to reflect for {timeLeft} seconds...
                        </div>
                    ) : null}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleCancelAndLog}
                            className="flex-1 bg-transparent hover:bg-bg-secondary border border-red-500/20 hover:border-red-500/40 text-red-400 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                        >
                            Avoid Purchase
                        </button>
                        <button
                            type="button"
                            disabled={timeLeft > 0}
                            onClick={handleConfirm}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer ${
                                timeLeft > 0
                                    ? "bg-[#26221c] text-text-secondary cursor-not-allowed shadow-none"
                                    : "bg-accent-primary hover:bg-accent-hover text-black shadow-accent-primary/10"
                            }`}
                        >
                            Confirm Purchase
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}



