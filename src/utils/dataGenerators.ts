import { consts } from './consts';

export interface DataGenerationOptions {
	stringFormat?: (rowIndex: number, colName: string) => string;
	intRange?: { min: number; max: number };
	numericRange?: { min: number; max: number };
	timestampRange?: { start: Date; end: Date };
	// Add more as needed
}

export interface ColumnMetadata {
	columnName: string;
	dataType: string;
	charLength?: number;
	numericPrecision?: number;
	numericScale?: number;
	notNull: boolean;
}

export function generateColumnValue(
	column: ColumnMetadata,
	rowIndex: number,
	userOptions?: DataGenerationOptions
): string {
	const { dataType, columnName } = column;

	switch (dataType) {
		case consts.VARCHAR:
			return generateVarcharValue(column, rowIndex, userOptions);

		case consts.TEXT:
			return generateVarcharValue(column, rowIndex, userOptions);

		case consts.INT:
			return generateIntValue(userOptions);

		case consts.BOOL:
			return Math.random() < 0.5 ? 'true' : 'false';

		case consts.NUMERIC:
			return generateNumericValue(column, userOptions);

		case consts.TIMESTAMP_TZ:
			return generateTimestampValue(userOptions);

		default:
			// fallback or unknown data type
			return `'${columnName}_${rowIndex + 1}'`;
	}
}

function generateVarcharValue(
	column: ColumnMetadata,
	rowIndex: number,
	userOptions?: DataGenerationOptions
): string {
	const defaultValue = `${column.columnName}_${rowIndex + 1}`;
	if (userOptions?.stringFormat) {
		return `'${userOptions.stringFormat(rowIndex, column.columnName)}'`;
	}
	return `'${defaultValue}'`;
}

function generateIntValue(
	userOptions?: DataGenerationOptions
): string {
	const range = userOptions?.intRange || { min: 1, max: 1000 };
	const val = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
	return `${val}`;
}

function generateNumericValue(
	column: ColumnMetadata,
	userOptions?: DataGenerationOptions
): string {
	const precision = column.numericPrecision;
	const scale = column.numericScale;
	const range = userOptions?.numericRange || { min: 0, max: 9999 };

	// If no precision/scale specified, return regular random number
	if (!precision) {
		const val = Math.random() * (range.max - range.min) + range.min;
		return val.toString();
	}

	// Calculate maximum possible value based on precision and scale
	const maxIntegerDigits = scale ? precision - scale : precision;
	const maxValue = Math.min(
		range.max,
		Math.pow(10, maxIntegerDigits) - Math.pow(10, -(scale || 0))
	);
	const minValue = Math.max(range.min, -maxValue);

	// Generate random value within constraints
	let val = Math.random() * (maxValue - minValue) + minValue;

	if (scale) {
		// Round to specified decimal places
		const factor = Math.pow(10, scale);
		val = Math.round(val * factor) / factor;
		return val.toFixed(scale);
	} else {
		// For integers, round to whole number
		return Math.round(val).toString();
	}
}

function generateTimestampValue(
	userOptions?: DataGenerationOptions
): string {
	const now = new Date();
	const defaultStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
	const defaultEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

	const range = userOptions?.timestampRange || {
		start: defaultStart,
		end: defaultEnd
	};

	const startTime = range.start.getTime();
	const endTime = range.end.getTime();
	const randomTime = startTime + Math.random() * (endTime - startTime);

	const dateObj = new Date(randomTime);

	// Format to SQL-compatible timestamp string
	const isoString = dateObj.toISOString().split('.')[0].replace('T', ' ');
	return `'${isoString}'`;
}
