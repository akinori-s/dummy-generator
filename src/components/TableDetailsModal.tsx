import React, { useState } from 'react';
import { Table, useStore, Column } from '../store/useStore';
import {
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

const TableDetailsModal: React.FC = () => {
	const { updateTable, modalTable } = useStore();

	const [pkOrdering, setPkOrdering] = useState<string[]>(modalTable ? [...modalTable.pkOrdering] : []);
	const [columns, setColumns] = useState<Column[]>(modalTable ? [...modalTable.columns] : []);

	if (!modalTable) return null;

	const handleSelectPK = (columnName: string) => {
		if (!pkOrdering.includes(columnName)) {
			setPkOrdering([...pkOrdering, columnName]);
		}
	};

	const handleDeselectPK = (columnName: string) => {
		setPkOrdering(pkOrdering.filter((col) => col !== columnName));
	};

	const handleJoinColumnToggle = (columnName: string) => {
		setColumns(
			columns.map((col) =>
				col.columnName === columnName
					? { ...col, isJoinColumn: !col.isJoinColumn }
					: col
			)
		);
	};

	const handleSave = () => {
		const updatedTable: Table = {
			...modalTable,
			pkOrdering,
			columns,
		};
		updateTable(updatedTable);
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>
					{modalTable.tableName} Details
				</DialogTitle>
			</DialogHeader>

			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead>
						<tr className="bg-gray-50">
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column Name</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precision/Length</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Key</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Column</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{columns.map((col) => (
							<tr key={col.columnName}>
								<td className="px-6 py-4 whitespace-nowrap">{col.columnName}</td>
								<td className="px-6 py-4 whitespace-nowrap">{col.dataType}</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{col.numericPrecision ? `Precision: ${col.numericPrecision}` : ''}
									{col.numericScale ? `, Scale: ${col.numericScale}` : ''}
									{col.charLength ? `Length: ${col.charLength}` : ''}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center space-x-2">
										<input
											type="checkbox"
											checked={pkOrdering.includes(col.columnName)}
											onChange={() =>
												pkOrdering.includes(col.columnName)
													? handleDeselectPK(col.columnName)
													: handleSelectPK(col.columnName)
											}
											className="h-4 w-4"
										/>
										{pkOrdering.includes(col.columnName) && (
											<span className="text-sm text-gray-500">
												Order: {pkOrdering.indexOf(col.columnName) + 1}
											</span>
										)}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<input
										type="checkbox"
										checked={col.isJoinColumn}
										onChange={() => handleJoinColumnToggle(col.columnName)}
										className="h-4 w-4"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="mt-6 flex justify-end space-x-2">
				<button
					className="px-4 py-2 bg-gray-300 rounded"
				>
					Cancel
				</button>
				<button
					className="px-4 py-2 bg-blue-500 text-white rounded"
					onClick={handleSave}
				>
					Save
				</button>
			</div>
		</>
	);
};

export default TableDetailsModal;
