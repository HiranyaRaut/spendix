import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <>
                                <Navbar />
                                <Dashboard />
                            </>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/income"
                    element={
                        <PrivateRoute>
                            <>
                                <Navbar />
                                <Income />
                            </>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/expenses"
                    element={
                        <PrivateRoute>
                            <>
                                <Navbar />
                                <Expenses />
                            </>
                        </PrivateRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}