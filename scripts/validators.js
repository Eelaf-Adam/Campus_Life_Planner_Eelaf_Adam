// Regex validation patterns for assignment requirements
const patterns = {
    // Title: no leading/trailing spaces, no double spaces
    title: /^\S(?:.*\S)?$/,
    
    // Duration: numeric validation (0|[1-9]\d*)(\.\d{1,2})?
    duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    
    // Date: YYYY-MM-DD format
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    
    // Tag: letters, spaces, hyphens only
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    
    // Advanced regex: detect duplicate words (back-reference)
    duplicateWord: /\b(\w+)\s+\1\b/,
    
    // Time: HH:MM format
    time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
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
        title: 'Title cannot have leading/trailing spaces or double spaces',
        duration: 'Duration must be a valid number (e.g., 60 or 1.5)',
        date: 'Date must be in YYYY-MM-DD format',
        tag: 'Tag can only contain letters, spaces, and hyphens',
        time: 'Time must be in HH:MM format',
        duplicateWord: 'Text contains duplicate words'
    };
    return messages[fieldName] || 'Invalid format';
}

function hasDuplicateWords(text) {
    return patterns.duplicateWord.test(text);
}

// Safe regex compiler for search
function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return null;
    }
}

// Highlight matches in text
function highlightMatches(text, regex) {
    if (!regex) return text;
    return text.replace(regex, match => `<mark>${match}</mark>`);
}

