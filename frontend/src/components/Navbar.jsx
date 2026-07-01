import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("name");

        navigate("/login");

    };

    return (

        <nav className="bg-blue-600 text-white shadow-md">

            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                <Link
                    to="/"
                    className="text-2xl font-bold"
                >
                    Spendix
                </Link>

                <div className="flex items-center gap-6">

                    <Link
                        to="/"
                        className="hover:text-gray-200"
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/income"
                        className="hover:text-gray-200"
                    >
                        Income
                    </Link>

                    <Link
                        to="/expenses"
                        className="hover:text-gray-200"
                    >
                        Expenses
                    </Link>

                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>

    );

}