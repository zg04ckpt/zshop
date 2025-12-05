// Helper function to check if string is a date
export const isDateString = (value: any): boolean => {
	if (typeof value !== "string") return false;
	return /^\d{4}-\d{2}-\d{2}(T|\s).*$/.test(value) && !isNaN(new Date(value).getTime());
};

// Convert date strings to Date objects
export const convertDates = (data: any): any => {
	if (data === null || data === undefined) return data;
	if (Array.isArray(data)) {
		return data.map((item) => convertDates(item));
	}
	if (typeof data === "object") {
		const newObj: any = { ...data };
		for (const key in newObj) {
			if (Object.prototype.hasOwnProperty.call(newObj, key)) {
				if (isDateString(newObj[key])) {
					newObj[key] = new Date(newObj[key]);
				} else {
					newObj[key] = convertDates(newObj[key]);
				}
			}
		}
		return newObj;
	}
	return data;
};