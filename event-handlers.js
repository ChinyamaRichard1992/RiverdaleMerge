// Main initialization function
function initializeApp() {
    // Initialize data persistence
    initializeDataPersistence();
    
    // Load data and update UI
    loadDataFromDB().then(() => {
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();
        initializeAndUpdateChartsRealTime();
    });

    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize payment search
    if (document.getElementById('studentForm')) {
        addFormPaymentSearch();
        addMainFormPaymentSearch();
    }
    
    // Initialize grade summary search
    if (document.querySelector('.grade-summary')) {
        addGradeSummaryPaymentSearch();
    }
    
    // Initialize analytics
    analyzePaymentData();
    
    // Add Chart.js
    loadChartJS();
    
    // Initialize payroll handlers
    if (document.getElementById('payrollForm')) {
        attachPayrollEventListeners();
    }
}

// Initialize form handlers
function initializeFormHandlers() {
    const form = document.getElementById('studentForm');
    if (!form) {
        console.error('Student form not found!');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const studentData = Object.fromEntries(formData.entries());
        
        try {
            // Save to Supabase
            const { data, error } = await window.supabase
                .from('students')
                .upsert([studentData]);
                
            if (error) throw error;
            
            // Update UI
            updateStudentTable();
            updateDashboard();
            updateGradeSummary();
            initializeAndUpdateChartsRealTime();
            
            showNotification('Student data saved successfully!');
            form.reset();
            
        } catch (error) {
            console.error('Error saving student:', error);
            showNotification('Error saving student data', '#f44336');
        }
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchStudents);
    }
}

// Load Chart.js
function loadChartJS() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = initializeAndUpdateChartsRealTime;
    document.head.appendChild(script);
}

// Single DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', initializeApp);

// Auto-save functionality
let autoSaveInterval = setInterval(saveDataInRealTime, 30000);

// Handle page unload
window.addEventListener('beforeunload', function() {
    saveAllData();
    clearInterval(autoSaveInterval);
});
