// Initialize Supabase client
const supabaseUrl = 'https://cwqfyzjeoadyvfvtekef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWZ5emplb2FkeXZmdnRla2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MjQyNjMsImV4cCI6MjA1NDEwMDI2M30.OX4xc3As06ua_4VFNmQLxwfPktfxGFIGAglt5ZRJbDw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Update connection status
function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

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

// Add student to table
function addStudentToTable(student) {
    const table = document.querySelector('table tbody');
    if (!table) return;

    const row = table.insertRow(0);
    row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.grade}</td>
        <td>${student.term}</td>
        <td>${student.gender}</td>
        <td>${new Date(student.timestamp).toLocaleString()}</td>
    `;
}

// Initialize real-time subscription
function initializeRealtime() {
    const channel = supabase
        .channel('students')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'students' },
            payload => {
                console.log('Real-time update:', payload);
                if (payload.eventType === 'INSERT') {
                    addStudentToTable(payload.new);
                }
            }
        )
        .subscribe(status => {
            if (status === 'SUBSCRIBED') {
                updateConnectionStatus('Connected - Real-time updates active');
            }
        });
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeRealtime();
    
    // Load existing students
    loadStudents().then(students => {
        students.forEach(student => {
            addStudentToTable(student);
        });
    });

    // Handle form submission
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                name: document.getElementById('name').value,
                grade: parseInt(document.getElementById('grade').value),
                term: document.getElementById('term').value,
                gender: document.getElementById('gender').value,
                timestamp: new Date().toISOString()
            };

            const saved = await saveStudent(studentData);
            if (saved) {
                alert('Student data saved successfully!');
                this.reset();
            } else {
                alert('Error saving student data. Please try again.');
            }
        });
    }
});
