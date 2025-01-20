import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type JoinColumnSetting = 'use_all' | 'random_from_list' | 'random_generated';

export type ColumnDataTypes = 'varchar' | 'int' | 'numeric' | 'timestamp';

export interface JoinColumn {
	id: string;
	columnName: string;
	setting: JoinColumnSetting;
	values?: string[];
}

export interface Column {
	columnName: string;
	dataType: ColumnDataTypes;
	charLength?: number;
	numericPrecision?: number;
	numericScale?: number;
	notNull: boolean;
	isPrimaryKey: boolean;
	isJoinColumn: boolean;
}

export interface Table {
	tableName: string;
	columns: Column[];
	pkOrdering: string[];
}

interface StoreState {
	joinColumns: JoinColumn[];
	tables: Table[];

	addJoinColumn: (joinColumn: JoinColumn) => void;
	updateJoinColumn: (id: string, updated: Partial<JoinColumn>) => void;
	deleteJoinColumn: (id: string) => void;
	setTables: (tables: Table[]) => void;
	updateTable: (updatedTable: Table) => void;

	modalTable: Table | null;
	setModalTable: (table: Table | null) => void;
	// Additional actions as needed
}

export const useStore = create<StoreState>()(
	persist((set, _get) => ({
		joinColumns: [],
		tables: [],

		addJoinColumn: (joinColumn) =>
			set((state) => ({ joinColumns: [...state.joinColumns, joinColumn] })),

		updateJoinColumn: (id, updated) =>
			set((state) => ({
				joinColumns: state.joinColumns.map((col) =>
					col.id === id ? { ...col, ...updated } : col
				),
			})),

		deleteJoinColumn: (id) =>
			set((state) => ({
				joinColumns: state.joinColumns.filter((col) => col.id !== id),
			})),

		setTables: (tables) => set({ tables }),

		updateTable: (updatedTable) =>
			set((state) => ({
				tables: state.tables.map((table) =>
					table.tableName === updatedTable.tableName ? updatedTable : table
				),
			})),

		modalTable: null,

		setModalTable: (table) => set({ modalTable: table }),
	}),
		{
			name: 'dummy-generator-storage',
			storage: createJSONStorage(() => localStorage),
			// Only persist these fields if you want to keep them across reloads
			partialize: (state) => ({
				joinColumns: state.joinColumns,
			}),
		})
);
