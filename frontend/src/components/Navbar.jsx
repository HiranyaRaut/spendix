import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        {
            name: "Dashboard",
            path: "/",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: "Transactions",
            path: "/transactions",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: "Categories",
            path: "/categories",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: "Settings",
            path: "/settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    return (

        <aside className="w-64 bg-[#0d0b09] border-r border-[#26221c] flex flex-col justify-between p-6 min-h-screen sticky top-0 shrink-0">

            <div>

                {/* Brand / Logo */}
                <div className="flex items-center gap-3 mb-10 mt-2">

                    <div className="w-10 h-10 rounded-full bg-[#dfa935] flex items-center justify-center text-black font-serif italic text-xl font-bold shadow-md shadow-[#dfa935]/10">
                        S
                    </div>

                    <div>

                        <span className="text-2xl font-serif italic font-bold text-[#eae5db] tracking-wide block leading-none">
                            Spendix
                        </span>

                        <span className="text-[10px] text-[#8f8a82] font-medium tracking-wider block mt-1 uppercase">
                            A ledger for everyday money
                        </span>

                    </div>

                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">

                    {navItems.map((item) => {

                        const active = isActive(item.path);

                        return (

                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-[#dfa935] text-black shadow-md shadow-[#dfa935]/20 font-semibold"
                                        : "text-[#8f8a82] hover:text-[#eae5db] hover:bg-[#1a1613]"
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>

                        );

                    })}

                </nav>

            </div>

            {/* Logout button at bottom */}
            <div className="pt-6 border-t border-[#26221c]">

                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-red-400 hover:text-red-300 hover:bg-[#1a0808]/40 transition-all duration-200"
                >

                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>

                    Logout

                </button>

            </div>

        </aside>

    );

}