import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

function AppLayout({ children }) {
    return (
        <PrivateRoute>
            <div className="flex min-h-screen bg-[#13110e] text-[#eae5db]">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </PrivateRoute>
    );
}

export default function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />

                <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />

                <Route path="/categories" element={<AppLayout><Categories /></AppLayout>} />

                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

                <Route path="/income" element={<AppLayout><Income /></AppLayout>} />

                <Route path="/expenses" element={<AppLayout><Expenses /></AppLayout>} />

            </Routes>

        </BrowserRouter>

    );

}