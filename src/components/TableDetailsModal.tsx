import React, { useState } from 'react';
import { Table, useStore, Column } from '../store/useStore';
import { Dialog } from '@headlessui/react';

interface Props {
	table: Table;
	isOpen: boolean;
	onClose: () => void;
}

const TableDetailsModal: React.FC<Props> = ({ table, isOpen, onClose }) => {
	const updateTable = useStore((state) => state.updateTable);

	const [pkOrdering, setPkOrdering] = useState<string[]>([...table.pkOrdering]);
	const [columns, setColumns] = useState<Column[]>([...table.columns]);

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
			...table,
			pkOrdering,
			columns,
		};
		updateTable(updatedTable);
		onClose();
	};

	return (
		<Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen px-4">
				<Dialog.Description className="fixed inset-0 bg-black opacity-30" />
				<div className="bg-white rounded max-w-lg mx-auto p-6 z-20">
					<Dialog.Title className="text-xl font-semibold mb-4">
						{table.tableName} Details
					</Dialog.Title>
					<div>
						<h3 className="font-medium">Primary Key Ordering</h3>
						<ul className="list-decimal list-inside">
							{pkOrdering.map((pk) => (
								<li key={pk}>{pk}</li>
							))}
						</ul>
						<div className="mt-2">
							<h4 className="font-medium">Set Primary Keys</h4>
							<div className="flex flex-wrap">
								{columns.map((col) => (
									<button
										key={col.columnName}
										className={`m-1 px-3 py-1 rounded ${pkOrdering.includes(col.columnName)
												? 'bg-blue-500 text-white'
												: 'bg-gray-200 text-gray-700'
											}`}
										onClick={() =>
											pkOrdering.includes(col.columnName)
												? handleDeselectPK(col.columnName)
												: handleSelectPK(col.columnName)
										}
									>
										{col.columnName}
									</button>
								))}
							</div>
						</div>
					</div>
					<div className="mt-4">
						<h3 className="font-medium">Join Columns</h3>
						<ul className="space-y-2">
							{columns.map((col) => (
								<li key={col.columnName} className="flex items-center">
									<input
										type="checkbox"
										checked={col.isJoinColumn}
										onChange={() => handleJoinColumnToggle(col.columnName)}
										className="mr-2"
									/>
									<span>{col.columnName}</span>
								</li>
							))}
						</ul>
					</div>
					<div className="mt-6 flex justify-end space-x-2">
						<button
							className="px-4 py-2 bg-gray-300 rounded"
							onClick={onClose}
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
				</div>
			</div>
		</Dialog>
	);
};

export default TableDetailsModal;
