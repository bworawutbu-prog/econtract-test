export const checkSum = (data: string) => {
    if (data.length !== 13) {
        return false;
    }
	// Ensure all characters are digits
	if (!/^\d{13}$/.test(data)) {
		return false;
	}

	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += Number(data[i]) * (13 - i);
	}
	const checkDigit = (11 - (sum % 11)) % 10;
	return checkDigit === Number(data[12]);
  }