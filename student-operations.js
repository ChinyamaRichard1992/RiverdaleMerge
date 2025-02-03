// Student Operations

// Edit student
async function editStudent(student) {
    try {
        // Fill form with student data
        document.getElementById('studentNumber').value = student.studentNumber;
        document.getElementById('studentName').value = student.studentName;
        document.getElementById('grade').value = student.grade;
        document.getElementById('fees').value = '';
        document.getElementById('date').value = student.date;
        document.getElementById('phoneNumber').value = student.phoneNumber;
        document.getElementById('gender').value = student.gender;
        document.getElementById('address').value = student.address;
        document.getElementById('email').value = student.email;
        document.getElementById('term').value = student.term;
        document.getElementById('year').value = student.year;

        // Add event listener for form submission
        const form = document.getElementById('studentForm');
        if (form) {
            form.onsubmit = async function(e) {
                e.preventDefault();
                
                // Get updated data
                const updatedData = {
                    studentNumber: student.studentNumber,
                    studentName: document.getElementById('studentName').value,
                    grade: parseInt(document.getElementById('grade').value),
                    fees: parseFloat(document.getElementById('fees').value) || 0,
                    date: document.getElementById('date').value,
                    phoneNumber: document.getElementById('phoneNumber').value,
                    gender: document.getElementById('gender').value,
                    address: document.getElementById('address').value,
                    email: document.getElementById('email').value,
                    term: document.getElementById('term').value,
                    year: parseInt(document.getElementById('year').value),
                    timestamp: new Date().toISOString()
                };

                try {
                    // Update in Supabase
                    const { data, error } = await supabase
                        .from('students')
                        .update(updatedData)
                        .eq('studentNumber', student.studentNumber)
                        .select();

                    if (error) throw error;

                    // Update local data
                    const index = students.findIndex(s => s.studentNumber === student.studentNumber);
                    if (index !== -1) {
                        students[index] = data[0];
                    }

                    // Update UI
                    updateStudentTable();
                    updateDashboard();
                    updateGradeSummary();
                    updateAllVisualizations();

                    // Show success message
                    showNotification('Student updated successfully!', '#4CAF50');

                    // Reset form
                    form.reset();
                    form.onsubmit = null; // Remove this event listener

                } catch (error) {
                    console.error('Error updating student:', error);
                    showNotification('Error updating student. Please try again.', '#f44336');
                }
            };
        }
    } catch (error) {
        console.error('Error in editStudent:', error);
        showNotification('Error editing student. Please try again.', '#f44336');
    }
}

// Delete student
async function deleteStudent(studentNumber) {
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

// Add student
async function addStudent(studentData) {
    try {
        // Generate student number if not provided
        if (!studentData.studentNumber) {
            studentData.studentNumber = generateStudentNumber();
        }

        // Add timestamp
        studentData.timestamp = new Date().toISOString();

        // Add to Supabase
        const { data, error } = await supabase
            .from('students')
            .insert([studentData])
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
        console.error('Error adding student:', error);
        showNotification('Error adding student. Please try again.', '#f44336');
        return false;
    }
}

// Generate student number
function generateStudentNumber() {
    const timestamp = Date.now().toString();
    return `STD${timestamp.slice(-6)}`;
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

// Initialize form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                studentNumber: document.getElementById('studentNumber').value || generateStudentNumber(),
                studentName: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                fees: parseFloat(document.getElementById('fees').value),
                date: document.getElementById('date').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                gender: document.getElementById('gender').value,
                address: document.getElementById('address').value,
                email: document.getElementById('email').value,
                term: document.getElementById('term').value,
                year: parseInt(document.getElementById('year').value),
                timestamp: new Date().toISOString()
            };

            const success = await addStudent(studentData);
            if (success) {
                form.reset();
            }
        });
    }
});
