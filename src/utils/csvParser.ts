import { Table, Column } from '../store/useStore';

export const parseCSV = (data: any[]): Table[] => {
	const tablesMap: { [key: string]: Table } = {};

	data.forEach((row) => {
		const tableName = row.table_name;
		if (!tablesMap[tableName]) {
			tablesMap[tableName] = {
				tableName,
				columns: [],
				pkOrdering: [],
			};
		}
		const column: Column = {
			columnName: row.column_name,
			dataType: row.data_type,
			charLength: row.char_length ? parseInt(row.char_length) : undefined,
			numericPrecision: row.numeric_precision
				? parseInt(row.numeric_precision)
				: undefined,
			numericScale: row.numeric_scale ? parseInt(row.numeric_scale) : undefined,
			notNull: row.nnot_null === 'TRUE' || row.nnot_null === 'true',
			isPrimaryKey: row.is_primary_key === 'TRUE' || row.is_primary_key === 'true',
			isJoinColumn: false, // Default, can be updated later
		};
		tablesMap[tableName].columns.push(column);
		if (column.isPrimaryKey) {
			tablesMap[tableName].pkOrdering.push(column.columnName);
		}
	});

	return Object.values(tablesMap);
};
