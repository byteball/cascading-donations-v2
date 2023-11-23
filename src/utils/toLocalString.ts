export const toLocalString = (numberOrString: string | number) => {
	return Number(numberOrString).toLocaleString(undefined, {
		maximumFractionDigits: 18,
	});
};
