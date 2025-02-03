// Data Management Functions
let students = [];
let isInitialized = false;

// Generate student number
function generateStudentNumber() {
    const timestamp = Date.now().toString();
    return `STD${timestamp.slice(-6)}`;
}

// Initialize data
async function initializeData() {
    if (isInitialized) return;
    
    try {
        // Load from Supabase
        const { data: supabaseData, error: supabaseError } = await window.supabase
            .from('students')
            .select('*')
            .order('timestamp', { ascending: false });

        if (supabaseError) throw supabaseError;

        // Load from localStorage as backup
        const localData = localStorage.getItem('students');
        const localStudents = localData ? JSON.parse(localData) : [];

        // Merge data, preferring Supabase data
        const mergedStudents = [...(supabaseData || [])];
        
        // Add any local students that aren't in Supabase
        localStudents.forEach(localStudent => {
            if (!mergedStudents.find(s => s.studentNumber === localStudent.studentNumber)) {
                mergedStudents.push(localStudent);
            }
        });

        students = mergedStudents;
        isInitialized = true;

        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        if (window.visualizations) {
            window.visualizations.updateAll();
        }

        // Sync any local data to Supabase
        if (localStudents.length > 0) {
            syncLocalDataToSupabase(localStudents);
        }

    } catch (error) {
        console.error('Error loading data:', error);
        
        // Try loading from localStorage as fallback
        try {
            const localData = localStorage.getItem('students');
            if (localData) {
                students = JSON.parse(localData);
                updateStudentTable();
                updateDashboard();
                updateGradeSummary();
                if (window.visualizations) {
                    window.visualizations.updateAll();
                }
                window.studentOperations.showNotification('Using offline data. Some features may be limited.', '#ff9800');
            } else {
                throw new Error('No offline data available');
            }
        } catch (localError) {
            console.error('Error loading local data:', localError);
            window.studentOperations.showNotification('Error loading data. Please refresh the page.', '#f44336');
        }
    }
}

// Save student data
async function saveStudentData(formData) {
    try {
        // Validate required fields
        const requiredFields = ['studentName', 'grade', 'term', 'gender'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Generate student number if not provided
        if (!formData.studentNumber) {
            formData.studentNumber = generateStudentNumber();
        }

        // Add timestamp
        formData.timestamp = new Date().toISOString();

        // Try saving to Supabase
        try {
            const { data, error } = await window.supabase
                .from('students')
                .insert([formData])
                .select();

            if (error) throw error;

            // Update local data
            students.unshift(data[0]);
            
            // Save to localStorage as backup
            localStorage.setItem('students', JSON.stringify(students));
            
        } catch (supabaseError) {
            console.error('Error saving to Supabase:', supabaseError);
            
            // Save to localStorage as fallback
            students.unshift(formData);
            localStorage.setItem('students', JSON.stringify(students));
            
            window.studentOperations.showNotification('Saved offline. Will sync when connection is restored.', '#ff9800');
        }
        
        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        if (window.visualizations) {
            window.visualizations.updateAll();
        }
        
        window.studentOperations.showNotification('Student added successfully!', '#4CAF50');
        return true;
    } catch (error) {
        console.error('Error saving student:', error);
        window.studentOperations.showNotification(error.message || 'Error saving student. Please try again.', '#f44336');
        return false;
    }
}

// Delete student
async function deleteStudentData(studentNumber) {
    try {
        // Try deleting from Supabase
        try {
            const { error } = await window.supabase
                .from('students')
                .delete()
                .eq('studentNumber', studentNumber);

            if (error) throw error;
        } catch (supabaseError) {
            console.error('Error deleting from Supabase:', supabaseError);
            window.studentOperations.showNotification('Delete will sync when connection is restored.', '#ff9800');
        }

        // Update local data
        students = students.filter(s => s.studentNumber !== studentNumber);
        localStorage.setItem('students', JSON.stringify(students));
        
        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        if (window.visualizations) {
            window.visualizations.updateAll();
        }
        
        window.studentOperations.showNotification('Student deleted successfully!', '#4CAF50');
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        window.studentOperations.showNotification('Error deleting student. Please try again.', '#f44336');
        return false;
    }
}

// Update student
async function updateStudentData(studentNumber, updatedData) {
    try {
        // Validate required fields
        const requiredFields = ['studentName', 'grade', 'term', 'gender'];
        for (const field of requiredFields) {
            if (!updatedData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Update timestamp
        updatedData.timestamp = new Date().toISOString();

        // Try updating in Supabase
        try {
            const { data, error } = await window.supabase
                .from('students')
                .update(updatedData)
                .eq('studentNumber', studentNumber)
                .select();

            if (error) throw error;

            // Update local data
            const index = students.findIndex(s => s.studentNumber === studentNumber);
            if (index !== -1) {
                students[index] = data[0];
            }
        } catch (supabaseError) {
            console.error('Error updating in Supabase:', supabaseError);
            
            // Update local data
            const index = students.findIndex(s => s.studentNumber === studentNumber);
            if (index !== -1) {
                students[index] = { ...students[index], ...updatedData };
            }
            
            window.studentOperations.showNotification('Updated offline. Will sync when connection is restored.', '#ff9800');
        }
        
        // Save to localStorage
        localStorage.setItem('students', JSON.stringify(students));
        
        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        if (window.visualizations) {
            window.visualizations.updateAll();
        }
        
        window.studentOperations.showNotification('Student updated successfully!', '#4CAF50');
        return true;
    } catch (error) {
        console.error('Error updating student:', error);
        window.studentOperations.showNotification(error.message || 'Error updating student. Please try again.', '#f44336');
        return false;
    }
}

// Sync local data to Supabase
async function syncLocalDataToSupabase(localStudents) {
    try {
        for (const student of localStudents) {
            try {
                const { error } = await window.supabase
                    .from('students')
                    .upsert([student]);

                if (error) throw error;
            } catch (error) {
                console.error('Error syncing student:', student.studentNumber, error);
            }
        }
    } catch (error) {
        console.error('Error syncing local data:', error);
    }
}

// Export functions
window.dataManager = {
    init: initializeData,
    save: saveStudentData,
    update: updateStudentData,
    delete: deleteStudentData,
    sync: syncLocalDataToSupabase
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    window.dataManager.init();

    // Set up form submission
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                studentNumber: document.getElementById('studentNumber').value || generateStudentNumber(),
                studentName: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                term: document.getElementById('term').value,
                gender: document.getElementById('gender').value,
                fees: parseFloat(document.getElementById('fees').value) || 0,
                date: document.getElementById('date').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                address: document.getElementById('address').value,
                email: document.getElementById('email').value,
                year: parseInt(document.getElementById('year').value)
            };

            const success = await window.dataManager.save(studentData);
            if (success) {
                form.reset();
            }
        });
    }

    // Set up delete buttons
    document.addEventListener('click', async function(e) {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const studentNumber = e.target.getAttribute('data-student-number');
            if (confirm('Are you sure you want to delete this student?')) {
                await window.dataManager.delete(studentNumber);
            }
        }
    });

    // Set up offline sync
    window.addEventListener('online', function() {
        const localData = localStorage.getItem('students');
        if (localData) {
            const localStudents = JSON.parse(localData);
            window.dataManager.sync(localStudents);
        }
    });
});
