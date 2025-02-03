// Main initialization function
function initializeApp() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAfterLoad);
    } else {
        initializeAfterLoad();
    }
}

// Initialize after DOM is loaded
function initializeAfterLoad() {
    console.log('Initializing application...');
    
    // Initialize data persistence
    if (typeof initializeDataPersistence === 'function') {
        initializeDataPersistence();
    }
    
    // Load data and update UI
    if (typeof loadDataFromDB === 'function') {
        loadDataFromDB().then(() => {
            if (typeof updateStudentTable === 'function') updateStudentTable();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof updateGradeSummary === 'function') updateGradeSummary();
            if (typeof initializeAndUpdateChartsRealTime === 'function') initializeAndUpdateChartsRealTime();
        }).catch(err => console.error('Error loading data:', err));
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
            
            const studentData = {
                studentNumber: document.getElementById('studentNumber').value || window.studentOperations.generateStudentNumber(),
                studentName: document.getElementById('studentName').value,
                grade: parseInt(document.getElementById('grade').value),
                fees: parseFloat(document.getElementById('fees').value) || 0,
                date: document.getElementById('date').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                gender: document.getElementById('gender').value,
                address: document.getElementById('address').value,
                email: document.getElementById('email').value,
                term: document.getElementById('term').value,
                year: parseInt(document.getElementById('year').value)
            };
            
            try {
                const success = await window.studentOperations.addStudent(studentData);
                if (success) {
                    form.reset();
                }
            } catch (error) {
                console.error('Error in form submission:', error);
                window.studentOperations.showNotification('Error submitting form. Please try again.', '#f44336');
            }
        });
    }
    initializeFormHandlers();
    
    // Initialize search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', searchStudents);
        }
    }
    initializeSearch();
    
    // Initialize payment search
    if (document.getElementById('studentForm')) {
        if (typeof addFormPaymentSearch === 'function') addFormPaymentSearch();
        if (typeof addMainFormPaymentSearch === 'function') addMainFormPaymentSearch();
    }
    
    // Initialize grade summary search
    if (document.querySelector('.grade-summary')) {
        if (typeof addGradeSummaryPaymentSearch === 'function') {
            addGradeSummaryPaymentSearch();
        }
    }
    
    // Initialize analytics
    if (typeof analyzePaymentData === 'function') {
        analyzePaymentData();
    }
    
    // Add Chart.js
    function loadChartJS() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initializeAndUpdateChartsRealTime;
        document.head.appendChild(script);
    }
    loadChartJS();
    
    // Initialize payroll handlers
    if (document.getElementById('payrollForm')) {
        if (typeof attachPayrollEventListeners === 'function') {
            attachPayrollEventListeners();
        }
    }

    console.log('Application initialization completed');
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
