import React, { useState } from 'react';
import { useStore, Table, Column } from '../store/useStore';
import * as Papa from 'papaparse';
import TableDetailsModal from './TableDetailsModal';
import { Button } from '@/components/ui/button'
import { parseCSV } from '@/utils/csvParser'

const TablesListPage: React.FC = () => {
	const tables = useStore((state) => state.tables);
	const setTables = useStore((state) => state.setTables);
	const [selectedTable, setSelectedTable] = useState<Table | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const importedTables = parseCSV(results.data);
				setTables(importedTables);
			},
			error: (error) => {
				console.error('Error parsing CSV:', error);
			},
		});
	};

	const handleGenerateData = () => {
		// Placeholder for data generation logic
		// You can implement the data generation here or send a request to the backend
		console.log('Generating data based on current settings...');
		alert('Data generation is not yet implemented.');
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-semibold">Tables</h1>
				<div className="flex space-x-2">
					<Button onClick={() => document.getElementById('import-json')?.click()}>
						Import
					</Button>
					<input
						type="file"
						id="import-json"
						className="hidden"
						accept=".csv"
						onChange={handleImport}
					/>
					<Button onClick={handleGenerateData}>
						Generate Data
					</Button>
				</div>
			</div>
			{tables.length === 0 ? (
				<p>No tables imported. Please import a CSV file.</p>
			) : (
				<ul className="space-y-4">
					{tables
						.slice()
						.sort((a, b) => a.tableName.localeCompare(b.tableName))
						.map((table) => (
							<li
								key={table.tableName}
								className="p-4 bg-white shadow rounded cursor-pointer"
								onClick={() => {
									setSelectedTable(table);
									setIsModalOpen(true);
								}}
							>
								<div className="flex justify-between items-center">
									<h2 className="text-lg font-medium">{table.tableName}</h2>
									<div>
										<span className="text-sm text-gray-600">
											Columns: {table.columns.length}
										</span>
									</div>
								</div>
								<div className="mt-2">
									<span className="text-sm text-gray-600">
										Primary Keys: {table.pkOrdering.join(', ')}
									</span>
								</div>
							</li>
						))}
				</ul>
			)}
			{selectedTable && (
				<TableDetailsModal
					table={selectedTable}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	);
};

export default TablesListPage;
