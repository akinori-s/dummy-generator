import React, { useState } from 'react';
import { useStore, JoinColumn, JoinColumnSetting } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

const JoinColumnsPage: React.FC = () => {
	const joinColumns = useStore((state) => state.joinColumns);
	const addJoinColumn = useStore((state) => state.addJoinColumn);
	const updateJoinColumn = useStore((state) => state.updateJoinColumn);
	const deleteJoinColumn = useStore((state) => state.deleteJoinColumn);

	const [newColumnName, setNewColumnName] = useState('');

	const handleAdd = () => {
		if (newColumnName.trim() === '') return;
		const newJoinColumn: JoinColumn = {
			id: uuidv4(),
			columnName: newColumnName.trim(),
			setting: 'random_generated',
		};
		addJoinColumn(newJoinColumn);
		setNewColumnName('');
	};

	const handleSettingChange = (id: string, setting: JoinColumnSetting) => {
		updateJoinColumn(id, { setting, values: setting === 'random_generated' ? undefined : [] });
	};

	const handleValuesChange = (id: string, values: string[]) => {
		updateJoinColumn(id, { values });
	};

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-4">Join Columns</h1>
			<div className="mb-4 flex">
				<input
					type="text"
					className="flex-1 border rounded px-3 py-2 mr-2"
					placeholder="Enter column name"
					value={newColumnName}
					onChange={(e) => setNewColumnName(e.target.value)}
				/>
				<button
					className="bg-blue-500 text-white px-4 py-2 rounded"
					onClick={handleAdd}
				>
					Add
				</button>
			</div>
			<ul className="space-y-4">
				{joinColumns
					.slice()
					.sort((a, b) => a.columnName.localeCompare(b.columnName))
					.map((col) => (
						<li key={col.id} className="p-4 bg-white shadow rounded">
							<div className="flex justify-between items-center">
								<h2 className="text-lg font-medium">{col.columnName}</h2>
								<button
									className="text-red-500 hover:underline"
									onClick={() => deleteJoinColumn(col.id)}
								>
									Delete
								</button>
							</div>
							<div className="mt-2">
								<label className="block font-medium">Setting:</label>
								<div className="flex items-center space-x-4 mt-1">
									<label className="flex items-center">
										<input
											type="radio"
											name={`setting-${col.id}`}
											value="use_all"
											checked={col.setting === 'use_all'}
											onChange={() => handleSettingChange(col.id, 'use_all')}
											className="mr-2"
										/>
										Use all values
									</label>
									<label className="flex items-center">
										<input
											type="radio"
											name={`setting-${col.id}`}
											value="random_from_list"
											checked={col.setting === 'random_from_list'}
											onChange={() => handleSettingChange(col.id, 'random_from_list')}
											className="mr-2"
										/>
										Random from list
									</label>
									<label className="flex items-center">
										<input
											type="radio"
											name={`setting-${col.id}`}
											value="random_generated"
											checked={col.setting === 'random_generated'}
											onChange={() => handleSettingChange(col.id, 'random_generated')}
											className="mr-2"
										/>
										Randomly generated
									</label>
								</div>
							</div>
							{(col.setting === 'use_all' || col.setting === 'random_from_list') && (
								<div className="mt-2">
									<label className="block font-medium">Values:</label>
									<textarea
										className="w-full border rounded px-3 py-2 mt-1"
										rows={3}
										placeholder="Enter values separated by commas"
										value={col.values?.join(', ') || ''}
										onChange={(e) =>
											handleValuesChange(
												col.id,
												e.target.value.split(',').map((val) => val.trim())
											)
										}
									></textarea>
								</div>
							)}
						</li>
					))}
			</ul>
		</div>
	);
};

export default JoinColumnsPage;
