import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function Reports() {
    const [preset, setPreset] = useState("THIS_MONTH");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [categories, setCategories] = useState([]);
    
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        totalTransactions: 0,
        categorySummaries: [],
        recentTransactions: []
    });
    
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);

    useEffect(() => {
        fetchCategories();
        applyPreset("THIS_MONTH");
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchSummary();
        }
    }, [startDate, endDate, categoryFilter]);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data || []);
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };

    const applyPreset = (presetKey) => {
        setPreset(presetKey);
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (presetKey === "THIS_MONTH") {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = today;
        } else if (presetKey === "LAST_MONTH") {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else if (presetKey === "THIS_YEAR") {
            start = new Date(today.getFullYear(), 0, 1);
            end = today;
        } else if (presetKey === "LAST_30_DAYS") {
            start.setDate(today.getDate() - 30);
            end = today;
        }

        const formatIso = (d) => d.toISOString().split("T")[0];
        if (presetKey !== "CUSTOM") {
            setStartDate(formatIso(start));
            setEndDate(formatIso(end));
        }
    };

    const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await api.get("/reports/summary", {
                params: {
                    startDate,
                    endDate,
                    category: categoryFilter !== "ALL" ? categoryFilter : ""
                }
            });
            setSummary(res.data);
        } catch (err) {
            console.error("Failed to load report summary", err);
        } finally {
            setLoadingSummary(false);
        }
    };

    const downloadReport = async (type) => {
        const isPdf = type === "pdf";
        if (isPdf) setDownloadingPdf(true);
        else setDownloadingExcel(true);

        try {
            const endpoint = isPdf ? "/reports/pdf" : "/reports/excel";
            const response = await api.get(endpoint, {
                params: {
                    startDate,
                    endDate,
                    category: categoryFilter !== "ALL" ? categoryFilter : ""
                },
                responseType: "blob"
            });

            const blob = new Blob([response.data], {
                type: isPdf 
                    ? "application/pdf" 
                    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Spendix_Statement_${startDate}_to_${endDate}.${isPdf ? "pdf" : "xlsx"}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Failed to download ${type} report`, err);
            alert(`Could not download ${type.toUpperCase()} statement. Please try again.`);
        } finally {
            if (isPdf) setDownloadingPdf(false);
            else setDownloadingExcel(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight font-serif italic">
                        Financial Reports & Statements
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Generate and download itemized PDF reports and Excel spreadsheets with custom date ranges.
                    </p>
                </div>
                
                {/* Download Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => downloadReport("pdf")}
                        disabled={downloadingPdf || loadingSummary}
                        className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {downloadingPdf ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        Export PDF
                    </button>

                    <button
                        onClick={() => downloadReport("excel")}
                        disabled={downloadingExcel || loadingSummary}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {downloadingExcel ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-bg-sidebar border border-border-primary rounded-xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                    Report Parameters
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Preset Selector */}
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Time Period</label>
                        <select
                            value={preset}
                            onChange={(e) => applyPreset(e.target.value)}
                            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        >
                            <option value="THIS_MONTH">This Month</option>
                            <option value="LAST_MONTH">Last Month</option>
                            <option value="LAST_30_DAYS">Last 30 Days</option>
                            <option value="THIS_YEAR">This Year</option>
                            <option value="CUSTOM">Custom Range</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPreset("CUSTOM");
                            }}
                            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPreset("CUSTOM");
                            }}
                            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.icon} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-sidebar border border-border-primary p-5 rounded-xl">
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                        ${summary.totalIncome ? summary.totalIncome.toFixed(2) : "0.00"}
                    </p>
                </div>

                <div className="bg-bg-sidebar border border-border-primary p-5 rounded-xl">
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400 mt-2 font-mono">
                        ${summary.totalExpense ? summary.totalExpense.toFixed(2) : "0.00"}
                    </p>
                </div>

                <div className="bg-bg-sidebar border border-border-primary p-5 rounded-xl">
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Net Balance</p>
                    <p className={`text-2xl font-bold mt-2 font-mono ${
                        summary.netBalance >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                        ${summary.netBalance ? summary.netBalance.toFixed(2) : "0.00"}
                    </p>
                </div>

                <div className="bg-bg-sidebar border border-border-primary p-5 rounded-xl">
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Records</p>
                    <p className="text-2xl font-bold text-accent-primary mt-2 font-mono">
                        {summary.totalTransactions || 0}
                    </p>
                </div>
            </div>

            {/* Content Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Summary Breakdown */}
                <div className="bg-bg-sidebar border border-border-primary rounded-xl p-6 lg:col-span-1">
                    <h2 className="text-base font-semibold text-text-primary mb-4 font-serif italic">
                        Expenses by Category
                    </h2>

                    {summary.categorySummaries && summary.categorySummaries.length > 0 ? (
                        <div className="space-y-4">
                            {summary.categorySummaries.map((cat) => {
                                const pct = summary.totalExpense > 0 
                                    ? ((cat.amount / summary.totalExpense) * 100).toFixed(1) 
                                    : 0;
                                return (
                                    <div key={cat.category} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-primary font-medium flex items-center gap-2">
                                                <span>{cat.icon}</span> {cat.category}
                                            </span>
                                            <span className="text-text-secondary font-mono">${cat.amount.toFixed(2)} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(pct, 100)}%`,
                                                    backgroundColor: cat.color || "#eab308"
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary italic">No category expenses found for this period.</p>
                    )}
                </div>

                {/* Ledger Preview Table */}
                <div className="bg-bg-sidebar border border-border-primary rounded-xl p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-text-primary font-serif italic">
                            Statement Item Ledger
                        </h2>
                        <span className="text-xs text-text-secondary font-mono">
                            {summary.recentTransactions ? summary.recentTransactions.length : 0} items
                        </span>
                    </div>

                    {loadingSummary ? (
                        <div className="py-12 text-center text-text-secondary text-sm">
                            Loading report summary data...
                        </div>
                    ) : summary.recentTransactions && summary.recentTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-border-primary text-xs uppercase text-text-secondary tracking-wider">
                                        <th className="pb-3 font-semibold">Date</th>
                                        <th className="pb-3 font-semibold">Type</th>
                                        <th className="pb-3 font-semibold">Title</th>
                                        <th className="pb-3 font-semibold">Category</th>
                                        <th className="pb-3 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-primary/50">
                                    {summary.recentTransactions.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-bg-primary/50 transition-colors">
                                            <td className="py-3 text-text-secondary font-mono text-xs">{tx.date}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    tx.type === "INCOME" 
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-3 font-medium text-text-primary">{tx.title}</td>
                                            <td className="py-3 text-text-secondary text-xs">{tx.category}</td>
                                            <td className={`py-3 text-right font-mono font-semibold ${
                                                tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"
                                            }`}>
                                                {tx.type === "INCOME" ? "+" : "-"}${tx.amount ? tx.amount.toFixed(2) : "0.00"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-text-secondary text-sm italic">
                            No transaction records matched the selected period and category parameters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
