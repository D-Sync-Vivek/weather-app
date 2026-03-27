import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const navLinks = [
        { name: 'Current Weather', path: '/' },
        { name: 'Historical Trends', path: '/historical' },
    ];

    return (
        <nav className="w-full bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="shrink flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">W</div>
                        <span className="text-white font-bold text-xl hidden sm:block">
                            Weather<span className="text-blue-500">Hub</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="flex space-x-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => 
                                    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;