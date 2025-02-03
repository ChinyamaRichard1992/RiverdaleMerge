// Initialize Supabase client
const supabaseUrl = 'https://cwqfyzjeoadyvfvtekef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWZ5emplb2FkeXZmdnRla2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MjQyNjMsImV4cCI6MjA1NDEwMDI2M30.OX4xc3As06ua_4VFNmQLxwfPktfxGFIGAglt5ZRJbDw';
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

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Override the original addStudent function
    window.addStudent = async function(event) {
        event.preventDefault();
        
        const studentData = {
            name: document.getElementById('studentName').value,
            grade: parseInt(document.getElementById('grade').value),
            term: document.getElementById('term').value,
            gender: document.getElementById('gender').value,
            timestamp: new Date().toISOString()
        };

        const savedStudent = await saveStudent(studentData);
        if (savedStudent) {
            // Use the existing students array and displayStudent function
            if (typeof students !== 'undefined') {
                students.push(savedStudent);
            }
            if (typeof displayStudent === 'function') {
                displayStudent(savedStudent);
            }
            if (typeof calculateTotalStudents === 'function') {
                calculateTotalStudents();
            }
            document.getElementById('studentForm').reset();
        } else {
            alert('Error saving student data. Please try again.');
        }
    };

    // Load existing students
    loadStudents().then(loadedStudents => {
        // Update the existing students array
        if (typeof students !== 'undefined') {
            students = loadedStudents;
        }
        
        // Display each student using the existing function
        loadedStudents.forEach(student => {
            if (typeof displayStudent === 'function') {
                displayStudent(student);
            }
        });
        
        // Update totals
        if (typeof calculateTotalStudents === 'function') {
            calculateTotalStudents();
        }
    });

    // Subscribe to real-time updates
    const channel = supabase
        .channel('students')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'students' },
            payload => {
                if (payload.eventType === 'INSERT') {
                    const newStudent = payload.new;
                    // Update the existing students array
                    if (typeof students !== 'undefined') {
                        students.push(newStudent);
                    }
                    // Use the existing display function
                    if (typeof displayStudent === 'function') {
                        displayStudent(newStudent);
                    }
                    // Update totals
                    if (typeof calculateTotalStudents === 'function') {
                        calculateTotalStudents();
                    }
                }
            }
        )
        .subscribe();

    // Connect form submit to our addStudent function
    const form = document.getElementById('studentForm');
    if (form) {
        form.removeEventListener('submit', window.addStudent); // Remove any existing listener
        form.addEventListener('submit', window.addStudent);
    }
});
