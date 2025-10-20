const patterns = {
    // Regex explanation: checks title character min, the title should start with capital letter, and contain only letters and single spaces
    title: /^[A-Z][a-zA-Z]*( [a-zA-Z]+)*$/,

    // Regex explanation: checks if the number is only postive with two decimals places 
    duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

    // Regex explanation: checks if date follows the dat, month, year format, should check for current year and future years.
    date: /^(202[5-9]|20[3-9]\d|2[1-9]\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

    // Regex explanation: Check if the category only contains letters, sibgle space and  hyphens 
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

    // Regex explanation: The time to be in 12 and 24 hour format with am or pm in capital and samll letters 
    time: /^(([01]?[0-9]|2[0-3]):[0-5][0-9]|((0?[1-9]|1[0-2]):[0-5][0-9]\s?[AaPp][Mm]))$/,

    // Regex explanation: regex detect duplicate words within the text
    duplicateWord: /\b(\w+)\s+\1\b/i,
};


function validateField(name, value) {
    const pattern = patterns[name];
    if (!pattern) return { valid: true };

    const trimmedValue = value.trim();
    const isValid = pattern.test(trimmedValue);

    return {
        valid: isValid,
        message: isValid ? '' : getErrorMessage(name)
    };
}

function getErrorMessage(fieldName) {
    const messages = {
        title: 'Title must be 6–20 letters, start with a capital, and contain only letters and spaces.',
        duration: 'Duration must be a positive number with up to 2 decimal places and no leading zeros',
        date: 'Date must be in YYYY-MM-DD format, with the year as the current or a future year, month between 01–12, and day between 01–31',
        category: 'Category can only contain letters, spaces, and single hyphens, with no leading or trailing spaces',
        time: 'Time must be in HH:MM (24-hour) or HH:MM AM/PM (12-hour) format',
        duplicateWord: 'Text contains duplicate words'
    };
    return messages[fieldName] || 'Invalid format';
}

function hasDuplicateWords(text) {
    return patterns.duplicateWord.test(text);
}

function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return null;
    }
}

function highlightMatches(text, regex) {
    if (!regex) return text;
    return text.replace(regex, match => `<mark>${match}</mark>`);
}


