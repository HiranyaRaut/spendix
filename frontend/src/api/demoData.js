// Demo data store and mock adapter for live Vercel demo
// Allows Spendix to be explored interactively with full functionality without requiring an active backend

const DEMO_STORAGE_KEY = "spendix_demo_data_v1";

const DEFAULT_CATEGORIES = [
    { id: 1, name: "Housing", icon: "🏠", color: "#6b7280", type: "EXPENSE" },
    { id: 2, name: "Groceries & Food", icon: "🍔", color: "#f97316", type: "EXPENSE" },
    { id: 3, name: "Mindful Coffee & Dining", icon: "☕", color: "#c5a059", type: "EXPENSE" },
    { id: 4, name: "Transportation", icon: "🚗", color: "#3b82f6", type: "EXPENSE" },
    { id: 5, name: "Tech & Gear", icon: "💻", color: "#14b8a6", type: "EXPENSE" },
    { id: 6, name: "Health & Fitness", icon: "🩺", color: "#ec4899", type: "EXPENSE" },
    { id: 7, name: "Entertainment", icon: "🎬", color: "#a855f7", type: "EXPENSE" },
    { id: 8, name: "Utilities & Bills", icon: "⚡", color: "#ffd166", type: "EXPENSE" },
    { id: 9, name: "Primary Salary", icon: "💼", color: "#2d9d5c", type: "INCOME" },
    { id: 10, name: "Freelance & Consulting", icon: "📈", color: "#10b981", type: "INCOME" },
    { id: 11, name: "Investments & Dividends", icon: "💰", color: "#c5a059", type: "INCOME" },
];

const getToday = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split("T")[0];
};

const DEFAULT_INCOMES = [
    {
        id: 101,
        title: "Senior Tech Consultant Salary",
        amount: 110000,
        date: getToday(2),
        category: DEFAULT_CATEGORIES[8], // Primary Salary
    },
    {
        id: 102,
        title: "FinTech Design & UI Sprint",
        amount: 28000,
        date: getToday(8),
        category: DEFAULT_CATEGORIES[9], // Freelance
    },
    {
        id: 103,
        title: "Quarterly Index Dividends",
        amount: 9500,
        date: getToday(15),
        category: DEFAULT_CATEGORIES[10], // Investments
    },
];

const DEFAULT_EXPENSES = [
    {
        id: 201,
        title: "Monthly Apartment Rent",
        amount: 18000,
        date: getToday(1),
        category: DEFAULT_CATEGORIES[0],
        paymentMethod: "Bank Transfer",
        merchant: "Greenwood Residences",
        joyReason: "Quiet, sunlit workspace that brings peace",
        joyScore: 85,
        planned: true,
        goalAligned: true,
        location: "Bengaluru",
    },
    {
        id: 202,
        title: "Organic Supermarket Restock",
        amount: 4650,
        date: getToday(3),
        category: DEFAULT_CATEGORIES[1],
        paymentMethod: "Credit Card",
        merchant: "Nature's Basket",
        joyReason: "Cooking nourishing meals at home",
        joyScore: 78,
        planned: true,
        goalAligned: true,
        location: "Indiranagar",
    },
    {
        id: 203,
        title: "Mechanical Keyboard & Wrist Rest",
        amount: 5800,
        date: getToday(5),
        category: DEFAULT_CATEGORIES[4],
        paymentMethod: "UPI",
        merchant: "Keychron Official",
        joyReason: "Ergonomics for daily coding and writing",
        joyScore: 92,
        planned: true,
        goalAligned: true,
        location: "Online",
    },
    {
        id: 204,
        title: "Pour-over Coffee & Reading Session",
        amount: 680,
        date: getToday(6),
        category: DEFAULT_CATEGORIES[2],
        paymentMethod: "UPI",
        merchant: "Blue Tokai Roasters",
        joyReason: "Reflective Sunday journaling hour",
        joyScore: 90,
        planned: true,
        goalAligned: false,
        location: "Koramangala",
    },
    {
        id: 205,
        title: "High-Speed Fiber Internet & Cloud",
        amount: 2350,
        date: getToday(9),
        category: DEFAULT_CATEGORIES[7],
        paymentMethod: "Auto Debit",
        merchant: "Airtel Xstream",
        joyReason: "Seamless remote work connection",
        joyScore: 70,
        planned: true,
        goalAligned: true,
        location: "Online",
    },
    {
        id: 206,
        title: "Gym & Swimming Quarterly Pass",
        amount: 6500,
        date: getToday(11),
        category: DEFAULT_CATEGORIES[5],
        paymentMethod: "Credit Card",
        merchant: "Cult.Fit Elite",
        joyReason: "Physical stamina and mental clarity",
        joyScore: 96,
        planned: true,
        goalAligned: true,
        location: "HSR Layout",
    },
    {
        id: 207,
        title: "Weekend Dinner & Live Jazz",
        amount: 3200,
        date: getToday(13),
        category: DEFAULT_CATEGORIES[2],
        paymentMethod: "Credit Card",
        merchant: "Windmills Craftworks",
        joyReason: "Celebrating milestone with close friends",
        joyScore: 88,
        planned: true,
        goalAligned: false,
        location: "Whitefield",
    },
    {
        id: 208,
        title: "Metro Smart Card Recharge",
        amount: 1200,
        date: getToday(16),
        category: DEFAULT_CATEGORIES[3],
        paymentMethod: "UPI",
        merchant: "Namma Metro",
        joyReason: "Green transit around town",
        joyScore: 65,
        planned: true,
        goalAligned: false,
        location: "Metro Station",
    },
];

const DEFAULT_GOALS = [
    {
        id: 301,
        title: "Japan Autumn Kyoto Trip",
        targetAmount: 250000,
        currentAmount: 172000,
        targetDate: "2027-10-15",
        description: "Exploring temples, gardens, and food culture in Kyoto and Tokyo.",
        priority: "High",
        status: "Active",
    },
    {
        id: 302,
        title: "Emergency Runway Fund (6 Months)",
        targetAmount: 300000,
        currentAmount: 245000,
        targetDate: "2027-04-01",
        description: "Peace-of-mind liquidity covering full essential expenses.",
        priority: "High",
        status: "Active",
    },
    {
        id: 303,
        title: "Home Studio Acoustic Upgrade",
        targetAmount: 75000,
        currentAmount: 42000,
        targetDate: "2026-12-31",
        description: "Acoustic wall panels and monitor speakers for focus.",
        priority: "Medium",
        status: "Active",
    },
];

const DEFAULT_BUDGETS = [
    { id: 401, categoryId: 1, amount: 20000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 402, categoryId: 2, amount: 15000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 403, categoryId: 3, amount: 5000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 404, categoryId: 4, amount: 4000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 405, categoryId: 5, amount: 8000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    { id: 406, categoryId: 6, amount: 7000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
];

const DEFAULT_GROUPS = [
    {
        id: 501,
        name: "Goa Coastal Trip 🌴",
        members: ["Hiranya", "Alex", "Priya", "Rohan"],
        createdAt: "2026-07-14",
        expenses: [
            {
                id: 601,
                description: "Beachfront Villa Booking",
                amount: 18000,
                paidBy: "Hiranya",
                date: getToday(4),
                participants: ["Hiranya", "Alex", "Priya", "Rohan"],
                note: "3 nights split equally",
            },
            {
                id: 602,
                description: "Seafood Shack & Cocktails",
                amount: 5200,
                paidBy: "Priya",
                date: getToday(3),
                participants: ["Hiranya", "Alex", "Priya", "Rohan"],
                note: "Dinner by Anjuna beach",
            },
            {
                id: 603,
                description: "Scuba & Kayak Rental",
                amount: 4400,
                paidBy: "Alex",
                date: getToday(2),
                participants: ["Hiranya", "Alex", "Rohan"],
                note: "Priya opted for beach reading",
            },
        ],
    },
];

export function getInitialDemoData() {
    return {
        user: {
            name: "Hiranya Raut",
            email: "demo@spendix.app",
            profilePicture: "",
            currency: "₹",
            theme: "Dark Gold",
            personality: "BALANCED",
            motivation: "SECURITY",
        },
        categories: DEFAULT_CATEGORIES,
        incomes: DEFAULT_INCOMES,
        expenses: DEFAULT_EXPENSES,
        goals: DEFAULT_GOALS,
        budgets: DEFAULT_BUDGETS,
        groups: DEFAULT_GROUPS,
        avoidedImpulses: [
            { id: 1, title: "Impulse Gadget Purchase", amount: 4500, date: getToday(7) },
            { id: 2, title: "Fast-fashion Sale items", amount: 3200, date: getToday(12) },
            { id: 3, title: "Unnecessary Tech Subscription", amount: 1800, date: getToday(18) },
        ],
    };
}

export function loadDemoData() {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Failed to parse demo data from localStorage, resetting", e);
    }
    const fresh = getInitialDemoData();
    saveDemoData(fresh);
    return fresh;
}

export function saveDemoData(data) {
    try {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Failed to save demo data to localStorage", e);
    }
}

export function isDemoMode() {
    return (
        localStorage.getItem("spendix_demo_mode") === "true" ||
        localStorage.getItem("token") === "demo-token"
    );
}

export function enableDemoMode() {
    localStorage.setItem("spendix_demo_mode", "true");
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("name", "Hiranya Raut");
    localStorage.setItem("email", "demo@spendix.app");
    if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        saveDemoData(getInitialDemoData());
    }
}

export function disableDemoMode() {
    localStorage.removeItem("spendix_demo_mode");
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
}

export function resetDemoData() {
    const fresh = getInitialDemoData();
    saveDemoData(fresh);
    return fresh;
}

// Group settlement calculator
function computeGroupSettlements(group) {
    const balances = {};
    group.members.forEach((m) => (balances[m] = 0));

    group.expenses.forEach((exp) => {
        const splitCount = exp.participants?.length || group.members.length;
        const splitAmount = exp.amount / splitCount;
        balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
        (exp.participants || group.members).forEach((p) => {
            balances[p] = (balances[p] || 0) - splitAmount;
        });
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([member, balance]) => {
        const rounded = Math.round(balance * 100) / 100;
        if (rounded < -0.01) debtors.push({ member, amount: -rounded });
        else if (rounded > 0.01) creditors.push({ member, amount: rounded });
    });

    const settlements = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
        const debtor = debtors[dIdx];
        const creditor = creditors[cIdx];
        const settleAmount = Math.min(debtor.amount, creditor.amount);

        if (settleAmount > 0.01) {
            settlements.push({
                from: debtor.member,
                to: creditor.member,
                amount: Math.round(settleAmount * 100) / 100,
            });
        }

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount < 0.01) dIdx++;
        if (creditor.amount < 0.01) cIdx++;
    }

    return { balances, settlements };
}

// Mock HTTP response adapter for Axios
export async function handleDemoRequest(config) {
    const method = (config.method || "get").toLowerCase();
    let url = config.url || "";
    // Remove base URL prefix if present
    url = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "");
    if (!url.startsWith("/")) url = "/" + url;

    const [path, queryString] = url.split("?");
    const params = new URLSearchParams(queryString || "");
    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

    const data = loadDemoData();

    // Helper for success response
    const ok = (payload, status = 200) => ({
        data: payload,
        status,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        config,
    });

    // 1. Auth routes
    if (path === "/auth/login") {
        return ok({
            token: "demo-token",
            name: data.user.name,
            email: data.user.email,
        });
    }

    if (path === "/auth/register") {
        data.user.name = body.name || "Demo User";
        data.user.email = body.email || "demo@spendix.app";
        saveDemoData(data);
        return ok({
            token: "demo-token",
            name: data.user.name,
            email: data.user.email,
        });
    }

    // 2. User Profile
    if (path === "/users/me") {
        if (method === "get") {
            return ok(data.user);
        }
        if (method === "put") {
            data.user = { ...data.user, ...body };
            saveDemoData(data);
            return ok(data.user);
        }
    }

    if (path === "/users/change-password") {
        return ok({ message: "Password updated successfully in demo mode." });
    }

    // 3. Dashboard endpoints
    if (path === "/dashboard/summary") {
        const totalIncome = data.incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
        const totalExpense = data.expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
        const balance = totalIncome - totalExpense;

        const totalJoy = data.expenses.reduce((acc, e) => acc + (Number(e.joyScore) || 75), 0);
        const joyScore = data.expenses.length > 0 ? Math.round(totalJoy / data.expenses.length) : 85;

        const totalGoalTarget = data.goals.reduce((acc, g) => acc + Number(g.targetAmount || 0), 0);
        const totalGoalCurrent = data.goals.reduce((acc, g) => acc + Number(g.currentAmount || 0), 0);
        const goalProgress = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;

        const avoidedCount = data.avoidedImpulses.length;
        const avoidedMoney = data.avoidedImpulses.reduce((acc, a) => acc + Number(a.amount || 0), 0);
        const purchasesSupportingGoals = data.expenses.filter((e) => e.goalAligned).length;

        return ok({
            totalIncome,
            totalExpense,
            balance,
            joyScore,
            goalProgress,
            savings: balance > 0 ? balance : 0,
            purchasesSupportingGoals,
            avoidedCount,
            avoidedMoney,
        });
    }

    if (path === "/dashboard/category-summary") {
        const categoryMap = {};
        let totalExp = 0;

        data.expenses.forEach((e) => {
            const catName = e.category?.name || "General";
            const catColor = e.category?.color || "#c5a059";
            const amt = Number(e.amount || 0);
            totalExp += amt;

            if (!categoryMap[catName]) {
                categoryMap[catName] = { category: catName, amount: 0, color: catColor };
            }
            categoryMap[catName].amount += amt;
        });

        const summary = Object.values(categoryMap).map((c) => ({
            ...c,
            percentage: totalExp > 0 ? Math.round((c.amount / totalExp) * 100) : 0,
        }));

        summary.sort((a, b) => b.amount - a.amount);
        return ok(summary);
    }

    // 4. Categories
    if (path === "/categories") {
        if (method === "get") {
            return ok(data.categories);
        }
        if (method === "post") {
            const newCat = {
                id: Date.now(),
                name: body.name || "New Category",
                icon: body.icon || "🏷️",
                color: body.color || "#c5a059",
                type: body.type || "EXPENSE",
            };
            data.categories.push(newCat);
            saveDemoData(data);
            return ok(newCat, 201);
        }
    }

    const catMatch = path.match(/^\/categories\/(\d+)$/);
    if (catMatch) {
        const id = parseInt(catMatch[1]);
        if (method === "delete") {
            data.categories = data.categories.filter((c) => c.id !== id);
            saveDemoData(data);
            return ok({ message: "Category deleted" });
        }
        if (method === "put") {
            const idx = data.categories.findIndex((c) => c.id === id);
            if (idx !== -1) {
                data.categories[idx] = { ...data.categories[idx], ...body };
                saveDemoData(data);
                return ok(data.categories[idx]);
            }
        }
    }

    // 5. Income
    if (path === "/income") {
        if (method === "get") {
            return ok([...data.incomes].sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
        if (method === "post") {
            const cat = data.categories.find((c) => c.id === parseInt(body.categoryId)) || {
                name: "Salary",
                icon: "💼",
                color: "#2d9d5c",
            };
            const newIncome = {
                id: Date.now(),
                title: body.title,
                amount: parseFloat(body.amount),
                date: body.date || getToday(),
                category: cat,
            };
            data.incomes.unshift(newIncome);
            saveDemoData(data);
            return ok(newIncome, 201);
        }
    }

    const incomeMatch = path.match(/^\/income\/(\d+)$/);
    if (incomeMatch && method === "delete") {
        const id = parseInt(incomeMatch[1]);
        data.incomes = data.incomes.filter((i) => i.id !== id);
        saveDemoData(data);
        return ok({ message: "Income deleted" });
    }

    // 6. Expenses
    if (path === "/expenses") {
        if (method === "get") {
            return ok([...data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
        if (method === "post") {
            const cat = data.categories.find((c) => c.id === parseInt(body.categoryId)) || {
                name: "General",
                icon: "💰",
                color: "#c5a059",
            };
            const newExpense = {
                id: Date.now(),
                title: body.title,
                amount: parseFloat(body.amount),
                date: body.date || getToday(),
                paymentMethod: body.paymentMethod || "Cash",
                merchant: body.merchant || "",
                joyReason: body.joyReason || "",
                receiptImageUrl: body.receiptImageUrl || "",
                location: body.location || "",
                joyScore: body.joyScore !== undefined ? body.joyScore : 80,
                planned: body.planned !== undefined ? body.planned : true,
                goalAligned: body.goalAligned !== undefined ? body.goalAligned : false,
                category: cat,
            };
            data.expenses.unshift(newExpense);
            saveDemoData(data);
            return ok(newExpense, 201);
        }
    }

    const expenseMatch = path.match(/^\/expenses\/(\d+)$/);
    if (expenseMatch && method === "delete") {
        const id = parseInt(expenseMatch[1]);
        data.expenses = data.expenses.filter((e) => e.id !== id);
        saveDemoData(data);
        return ok({ message: "Expense deleted" });
    }

    if (path === "/expenses/avoided") {
        const avoided = {
            id: Date.now(),
            title: body.title || "Avoided Purchase",
            amount: parseFloat(body.amount || 0),
            date: body.date || getToday(),
        };
        data.avoidedImpulses.push(avoided);
        saveDemoData(data);
        return ok({ message: "Impulse avoided logged", item: avoided });
    }

    // 7. Goals
    if (path === "/goals") {
        if (method === "get") {
            return ok(data.goals);
        }
        if (method === "post") {
            const newGoal = {
                id: Date.now(),
                title: body.title,
                targetAmount: parseFloat(body.targetAmount),
                currentAmount: parseFloat(body.currentAmount || 0),
                targetDate: body.targetDate,
                description: body.description || "",
                priority: body.priority || "Medium",
                status: body.status || "Active",
            };
            data.goals.push(newGoal);
            saveDemoData(data);
            return ok(newGoal, 201);
        }
    }

    const depositMatch = path.match(/^\/goals\/(\d+)\/deposit$/);
    if (depositMatch && method === "post") {
        const id = parseInt(depositMatch[1]);
        const g = data.goals.find((goal) => goal.id === id);
        if (g) {
            g.currentAmount = (Number(g.currentAmount) || 0) + parseFloat(body.amount || 0);
            saveDemoData(data);
            return ok(g);
        }
    }

    const goalMatch = path.match(/^\/goals\/(\d+)$/);
    if (goalMatch) {
        const id = parseInt(goalMatch[1]);
        if (method === "delete") {
            data.goals = data.goals.filter((g) => g.id !== id);
            saveDemoData(data);
            return ok({ message: "Goal deleted" });
        }
        if (method === "put") {
            const idx = data.goals.findIndex((g) => g.id === id);
            if (idx !== -1) {
                data.goals[idx] = { ...data.goals[idx], ...body };
                saveDemoData(data);
                return ok(data.goals[idx]);
            }
        }
    }

    // 8. Budgets
    if (path === "/budgets/summary") {
        const summary = data.budgets.map((b) => {
            const cat = data.categories.find((c) => c.id === b.categoryId) || {
                name: "Category",
                icon: "💰",
                color: "#c5a059",
            };
            const spent = data.expenses
                .filter((e) => e.category?.id === b.categoryId)
                .reduce((acc, e) => acc + Number(e.amount || 0), 0);
            const remaining = Math.max(0, b.amount - spent);
            const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
            let status = "OK";
            if (spent > b.amount) status = "EXCEEDED";
            else if (pct >= 80) status = "WARNING";

            return {
                id: b.id,
                category: cat,
                budgetAmount: b.amount,
                spentAmount: spent,
                remainingAmount: remaining,
                percentage: pct,
                status,
            };
        });
        return ok(summary);
    }

    if (path === "/budgets") {
        if (method === "get") {
            return ok(data.budgets);
        }
        if (method === "post") {
            const newBudget = {
                id: Date.now(),
                categoryId: parseInt(body.categoryId),
                amount: parseFloat(body.amount),
                month: body.month || new Date().getMonth() + 1,
                year: body.year || new Date().getFullYear(),
            };
            data.budgets.push(newBudget);
            saveDemoData(data);
            return ok(newBudget, 201);
        }
    }

    const budgetMatch = path.match(/^\/budgets\/(\d+)$/);
    if (budgetMatch && method === "delete") {
        const id = parseInt(budgetMatch[1]);
        data.budgets = data.budgets.filter((b) => b.id !== id);
        saveDemoData(data);
        return ok({ message: "Budget deleted" });
    }

    // 9. Group Ledger
    if (path === "/groups") {
        if (method === "get") {
            return ok(data.groups);
        }
        if (method === "post") {
            const newGroup = {
                id: Date.now(),
                name: body.name || "New Group",
                members: body.members || [data.user.name.split(" ")[0]],
                createdAt: getToday(),
                expenses: [],
            };
            data.groups.push(newGroup);
            saveDemoData(data);
            return ok(newGroup, 201);
        }
    }

    const groupDetailsMatch = path.match(/^\/groups\/(\d+)$/);
    if (groupDetailsMatch) {
        const id = parseInt(groupDetailsMatch[1]);
        const grp = data.groups.find((g) => g.id === id);
        if (method === "get" && grp) {
            const { balances, settlements } = computeGroupSettlements(grp);
            return ok({ ...grp, balances, settlements });
        }
        if (method === "delete") {
            data.groups = data.groups.filter((g) => g.id !== id);
            saveDemoData(data);
            return ok({ message: "Group deleted" });
        }
    }

    const groupExpenseMatch = path.match(/^\/groups\/(\d+)\/expenses$/);
    if (groupExpenseMatch && method === "post") {
        const id = parseInt(groupExpenseMatch[1]);
        const grp = data.groups.find((g) => g.id === id);
        if (grp) {
            const exp = {
                id: Date.now(),
                description: body.description,
                amount: parseFloat(body.amount),
                paidBy: body.paidBy,
                date: body.date || getToday(),
                participants: body.participants || grp.members,
                note: body.note || "",
            };
            grp.expenses.unshift(exp);
            saveDemoData(data);
            return ok(exp, 201);
        }
    }

    const groupMemberMatch = path.match(/^\/groups\/(\d+)\/members$/);
    if (groupMemberMatch && method === "post") {
        const id = parseInt(groupMemberMatch[1]);
        const grp = data.groups.find((g) => g.id === id);
        if (grp && body.name && !grp.members.includes(body.name)) {
            grp.members.push(body.name);
            saveDemoData(data);
            return ok(grp);
        }
    }

    const expenseNoteMatch = path.match(/^\/groups\/expenses\/(\d+)\/note$/);
    if (expenseNoteMatch && method === "put") {
        const expId = parseInt(expenseNoteMatch[1]);
        for (const grp of data.groups) {
            const e = grp.expenses.find((x) => x.id === expId);
            if (e) {
                e.note = body.note || "";
                saveDemoData(data);
                return ok(e);
            }
        }
    }

    // 10. Reports
    if (path === "/reports/summary") {
        const totalIncome = data.incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
        const totalExpense = data.expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
        const categorySummaries = {};

        data.expenses.forEach((e) => {
            const cName = e.category?.name || "General";
            categorySummaries[cName] = (categorySummaries[cName] || 0) + Number(e.amount || 0);
        });

        const recent = [
            ...data.incomes.map((i) => ({ ...i, type: "income" })),
            ...data.expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return ok({
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            totalTransactions: data.incomes.length + data.expenses.length,
            categorySummaries: Object.entries(categorySummaries).map(([cat, total]) => ({
                categoryName: cat,
                totalAmount: total,
            })),
            recentTransactions: recent.slice(0, 10),
        });
    }

    if (path.startsWith("/reports/export/")) {
        // Mock binary blob download
        const dummyBlob = new Blob(["Spendix Demo Report Generated Successfully"], {
            type: "text/plain",
        });
        return ok(dummyBlob);
    }

    // Fallback for unhandled endpoints in demo mode
    console.warn("[Demo Adapter] Unhandled route:", method, path);
    return ok({ message: "Demo mode response OK", status: 200 });
}
