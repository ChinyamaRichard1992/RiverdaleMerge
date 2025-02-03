// Data Management Functions
let students = [];

// Generate student number
function generateStudentNumber() {
    const timestamp = Date.now().toString();
    return `STD${timestamp.slice(-6)}`;
}

// Initialize data
async function initializeData() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        students = data || [];
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        updateAllVisualizations();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data. Please refresh the page.', '#f44336');
    }
}

// Save student data
async function saveStudentData(formData) {
    try {
        // Generate student number if not provided
        if (!formData.studentNumber) {
            formData.studentNumber = generateStudentNumber();
        }

        // Add timestamp
        formData.timestamp = new Date().toISOString();

        // Add to Supabase
        const { data, error } = await supabase
            .from('students')
            .insert([formData])
            .select();

        if (error) throw error;

        // Update local data
        students.unshift(data[0]);
        
        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        updateAllVisualizations();
        
        showNotification('Student added successfully!', '#4CAF50');
        return true;
    } catch (error) {
        console.error('Error saving student:', error);
        showNotification('Error saving student. Please try again.', '#f44336');
        return false;
    }
}

// Delete student
async function deleteStudentData(studentNumber) {
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('studentNumber', studentNumber);

        if (error) throw error;

        // Update local data
        students = students.filter(s => s.studentNumber !== studentNumber);
        
        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        updateAllVisualizations();
        
        showNotification('Student deleted successfully!', '#4CAF50');
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Error deleting student. Please try again.', '#f44336');
        return false;
    }
}

// Update student
async function updateStudentData(studentNumber, updatedData) {
    try {
        const { data, error } = await supabase
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
        
        // Update UI
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        updateAllVisualizations();
        
        showNotification('Student updated successfully!', '#4CAF50');
        return true;
    } catch (error) {
        console.error('Error updating student:', error);
        showNotification('Error updating student. Please try again.', '#f44336');
        return false;
    }
}

// Show notification
function showNotification(message, color) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.backgroundColor = color;
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeData();

    // Set up form submission
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                studentNumber: document.getElementById('studentNumber').value || generateStudentNumber(),
                name: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                term: document.getElementById('term').value,
                gender: document.getElementById('gender').value,
                fees: parseFloat(document.getElementById('fees').value),
                date: document.getElementById('date').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                address: document.getElementById('address').value,
                email: document.getElementById('email').value,
                year: parseInt(document.getElementById('year').value),
                timestamp: new Date().toISOString()
            };

            const success = await saveStudentData(studentData);
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
                await deleteStudentData(studentNumber);
            }
        }
    });
});
