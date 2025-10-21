const KEY = "tasks"; // LocalStorage key for storing tasks

// Load all records from localstorage 
function loadRecords() {
    try {
        console.log("Storage")
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (error) {
        console.error('Error loading records:', error);
        return [];
    }
}

// Save all records to localStorage 
function saveRecords(records) {
    try {
        localStorage.setItem(KEY, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving records:', error);
    }
}

// Add a new record
function saveRecord(newRecord) {
    const records = loadRecords();
    records.push(newRecord);
    saveRecords(records);
}

// Update an existing record by ID
function updateRecord(updatedRecord) {
    const records = loadRecords();
    const index = records.findIndex(record => record.id === updatedRecord.id);
    if (index !== -1) {
        records[index] = updatedRecord;
        saveRecords(records);
    }
}

// Delete a record by ID
function deleteRecord(id) {
    const records = loadRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    saveRecords(filteredRecords);
}

// Export records to a JSON file
function exportToJSON() {
    const records = loadRecords();
    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'campuslife-data.json';
    link.click();
}

// Import records from a JSON file
function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Ensure imported data is an array of valid records 
                if (Array.isArray(data) && data.every(record => 
                    record.id && record.type && record.createdAt
                )) {
                    saveRecords(data);
                    resolve(data);
                } else {
                    reject(new Error('Invalid data structure'));
                }
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.readAsText(file);
    });
}
