import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import JoinColumnsPage from './components/JoinColumnsPage';
import TablesListPage from './components/TablesListPage';

const App: React.FC = () => {
	return (
		<Router>
			<div className="flex h-screen">
				<Sidebar />
				<main className="flex-1 bg-gray-100 p-4 overflow-auto">
					<Routes>
						<Route path="/" element={<JoinColumnsPage />} />
						<Route path="/tables" element={<TablesListPage />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
};

export default App;
