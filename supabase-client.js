// Initialize Supabase client
const supabaseUrl = 'https://cwqfyzjeoadyvfvtekef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWZ5emplb2FkeXZmdnRla2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjU5MjQ2NjMsImV4cCI6MjA1NDEwMDI2M30.OX4xc3As06ua_4VFNmQLxwfPktfxGFIGAglt5ZRJbDw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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

// Connect to existing work.js functions
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                name: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                term: document.getElementById('term').value,
                gender: document.getElementById('gender').value,
                timestamp: new Date().toISOString()
            };

            // Save to IndexedDB first (using existing function)
            if (typeof saveStudentToDB === 'function') {
                saveStudentToDB(studentData);
            }

            // Then save to Supabase
            const savedStudent = await saveStudent(studentData);
            if (savedStudent) {
                // Use existing functions to update UI
                if (typeof updateStudentTable === 'function') {
                    updateStudentTable();
                }
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
                if (typeof updateGradeSummary === 'function') {
                    updateGradeSummary();
                }
                form.reset();
            }
        });
    }

    // Load existing students
    loadStudents().then(loadedStudents => {
        // Update UI using existing functions
        if (typeof updateStudentTable === 'function') {
            updateStudentTable(loadedStudents);
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        if (typeof updateGradeSummary === 'function') {
            updateGradeSummary();
        }
    });
});
