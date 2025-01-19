import React, { useState } from 'react';
import { useStore, Table } from '../store/useStore';
import * as Papa from 'papaparse';
import TableDetailsModal from './TableDetailsModal';
import { Button } from '@/components/ui/button'
import { parseCSV } from '@/utils/csvParser'

const TablesListPage: React.FC = () => {
	const { tables, joinColumns } = useStore();
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

	// Utility to create a Cartesian product from multiple arrays
	const cartesianProduct = (arrays: string[][]): string[][] => {
		return arrays.reduce<string[][]>(
			(acc, curr) =>
				acc
					.map((item) => curr.map((val) => [...item, val]))
					.reduce((a, b) => [...a, ...b], []),
			[[]]
		);
	};

	// Generate a string array of placeholder values, if the column is "random generated"
	const generatePlaceholderValues = (count: number, prefix = 'value_') => {
		return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
	};

	const handleGenerateData = () => {
		const joinValuesMap: { [columnName: string]: string[] } = {};
		joinColumns.forEach((joinCol) => {
			const { columnName, setting, values } = joinCol;
			switch (setting) {
				case 'use_all':
					// Use all values provided by the user
					joinValuesMap[columnName] = values ?? [];
					break;
				case 'random_from_list':
					// For simplicity, we’ll store the entire list in the map;
					// in an advanced scenario, you might randomize picks per row
					joinValuesMap[columnName] = values ?? [];
					break;
				case 'random_generated':
				default:
					// Generate some placeholder values (e.g., 10)
					joinValuesMap[columnName] = generatePlaceholderValues(10, `${columnName}_`);
					break;
			}
		});

		let insertStatements = '';
		tables.forEach((table) => {
			const columns = table.columns;
			const columnNames = columns.map((c) => c.columnName);
			const pkJoinColumns = columns.filter((col) => col.isPrimaryKey && col.isJoinColumn);
			const pkJoinValueArrays = pkJoinColumns.map((col) => {
				const colName = col.columnName;
				return joinValuesMap[colName] ?? [];
			});

			const pkJoinCombinations =
				pkJoinValueArrays.length > 0 ? cartesianProduct(pkJoinValueArrays) : [[]];
			const totalRows = pkJoinCombinations.length;

			// Prepare a list of rows to insert
			const tableRowValues: string[][] = [];

			for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
				const pkJoinCombo = pkJoinCombinations[rowIdx] || [];

				// Build a single row of data
				const rowData = columnNames.map((colName) => {
					const columnDef = columns.find((c) => c.columnName === colName);
					if (!columnDef) return 'NULL';

					// 3) Decide what to place in this cell depending on the column type
					if (columnDef.isPrimaryKey && columnDef.isJoinColumn) {
						const indexInCombo = pkJoinColumns.findIndex((c) => c.columnName === colName);
						const value = pkJoinCombo[indexInCombo];
						// TODO: should probably generate an error here when the index is out of range.
						return value ? `'${value}'` : `'${colName}_${rowIdx + 1}'`;
					} else {
						// Placeholder: 'data_colName_1'
						return `'data_${colName}_${rowIdx + 1}'`;
					}
				});

				tableRowValues.push(rowData);
			}

			// Build the INSERT statement for the table
			const insertStatement = `
INSERT INTO ${table.tableName} (${columnNames.join(', ')}) VALUES
${tableRowValues
					.map((row) => `(${row.join(', ')})`)
					.join(',\n')};
			`;
			insertStatements += insertStatement;
		});

		// download the generated SQL as a file
		const blob = new Blob([insertStatements], { type: 'text/sql' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'insert_statements.sql';
		a.click();
		URL.revokeObjectURL(url);
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
