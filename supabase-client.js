// Initialize Supabase client
const supabaseUrl = 'https://cwqfyzjeoadyvfvtekef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWZ5emplb2FkeXZmdnRla2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjU5MjU2NjMsImV4cCI6MjA1NDEwMDI2M30.OX4xc3As06ua_4VFNmQLxwfPktfxGFIGAglt5ZRJbDw';
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
        return true;
    } catch (error) {
        console.error('Error saving student:', error);
        return false;
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

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                name: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                term: document.getElementById('term').value || '1',
                gender: document.getElementById('gender').value || 'Male',
                timestamp: new Date().toISOString()
            };

            const saved = await saveStudent(studentData);
            if (saved) {
                // Use your existing displayStudent function
                if (typeof displayStudent === 'function') {
                    displayStudent(studentData);
                }
                // Clear the form
                form.reset();
            } else {
                alert('Error saving student data. Please try again.');
            }
        });
    }

    // Load existing students
    loadStudents().then(students => {
        students.forEach(student => {
            if (typeof displayStudent === 'function') {
                displayStudent(student);
            }
        });
    });

    // Subscribe to real-time updates
    const channel = supabase
        .channel('students')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'students' },
            payload => {
                if (payload.eventType === 'INSERT') {
                    if (typeof displayStudent === 'function') {
                        displayStudent(payload.new);
                    }
                }
            }
        )
        .subscribe();
});
