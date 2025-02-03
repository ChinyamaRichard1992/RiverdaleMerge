// Initialize Supabase client
const supabaseUrl = 'https://cwqfyzjeoadyvfvtekef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWZ5emplb2FkeXZmdnRla2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MjQyNjMsImV4cCI6MjA1NDEwMDI2M30.OX4xc3As06ua_4VFNmQLxwfPktfxGFIGAglt5ZRJbDw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Save student data
async function saveStudent(studentData) {
    try {
        const { data, error } = await supabase
            .from('students')
            .insert([studentData])
            .select();

        if (error) throw error;
        console.log('Student saved:', data);
        return data[0];
    } catch (error) {
        console.error('Error saving student:', error);
        return null;
    }
}

// Load students
async function loadStudents() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error loading students:', error);
        return [];
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
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    }
}

// Initialize real-time subscription
function initializeRealtime() {
    const channel = supabase
        .channel('students_channel')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'students' 
            },
            (payload) => {
                console.log('Change received!', payload);
                switch (payload.eventType) {
                    case 'INSERT':
                        handleNewStudent(payload.new);
                        break;
                    case 'DELETE':
                        handleDeletedStudent(payload.old);
                        break;
                    case 'UPDATE':
                        handleUpdatedStudent(payload.new);
                        break;
                }
            }
        )
        .subscribe();

    return channel;
}

// Handle new student
function handleNewStudent(student) {
    if (typeof students !== 'undefined') {
        students.push(student);
    }
    if (typeof updateStudentTable === 'function') {
        updateStudentTable();
    }
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    if (typeof updateGradeSummary === 'function') {
        updateGradeSummary();
    }
    if (typeof updateAllVisualizations === 'function') {
        updateAllVisualizations();
    }
}

// Handle deleted student
function handleDeletedStudent(student) {
    if (typeof students !== 'undefined') {
        const index = students.findIndex(s => s.studentNumber === student.studentNumber);
        if (index !== -1) {
            students.splice(index, 1);
        }
    }
    if (typeof updateStudentTable === 'function') {
        updateStudentTable();
    }
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    if (typeof updateGradeSummary === 'function') {
        updateGradeSummary();
    }
    if (typeof updateAllVisualizations === 'function') {
        updateAllVisualizations();
    }
}

// Handle updated student
function handleUpdatedStudent(student) {
    if (typeof students !== 'undefined') {
        const index = students.findIndex(s => s.studentNumber === student.studentNumber);
        if (index !== -1) {
            students[index] = student;
        }
    }
    if (typeof updateStudentTable === 'function') {
        updateStudentTable();
    }
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    if (typeof updateGradeSummary === 'function') {
        updateGradeSummary();
    }
    if (typeof updateAllVisualizations === 'function') {
        updateAllVisualizations();
    }
}

// Connect to existing work.js functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize real-time updates
    initializeRealtime();

    // Load existing students
    loadStudents().then(loadedStudents => {
        if (typeof students !== 'undefined') {
            students = loadedStudents;
        }
        if (typeof updateStudentTable === 'function') {
            updateStudentTable();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        if (typeof updateGradeSummary === 'function') {
            updateGradeSummary();
        }
        if (typeof updateAllVisualizations === 'function') {
            updateAllVisualizations();
        }
    });

    // Handle form submission
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                studentNumber: document.getElementById('studentNumber').value,
                name: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                term: document.getElementById('term').value,
                gender: document.getElementById('gender').value,
                timestamp: new Date().toISOString()
            };

            // Save to IndexedDB first
            if (typeof saveStudentToDB === 'function') {
                saveStudentToDB(studentData);
            }

            // Then save to Supabase
            const savedStudent = await saveStudent(studentData);
            if (savedStudent) {
                form.reset();
                showNotification('Student added successfully!', '#4CAF50');
            } else {
                showNotification('Error saving student. Please try again.', '#f44336');
            }
        });
    }
});
