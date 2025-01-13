import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
	const location = useLocation();

	const navItems = [
		{ name: 'Join Columns', path: '/' },
		{ name: 'Tables', path: '/tables' },
	];

	return (
		<aside className="w-64 bg-white shadow-md">
			<div className="p-4 text-xl font-bold">Dummy Data Generator</div>
			<nav className="mt-10">
				{navItems.map((item) => (
					<Link
						key={item.name}
						to={item.path}
						className={`block py-2.5 px-4 rounded transition duration-200 ${location.pathname === item.path
								? 'bg-blue-500 text-white'
								: 'text-gray-700 hover:bg-gray-200'
							}`}
					>
						{item.name}
					</Link>
				))}
			</nav>
		</aside>
	);
};

export default Sidebar;
