// Payroll Management System

let employeePayments = [];

// Initialize IndexedDB for payroll
function initPayrollDB() {
    const request = indexedDB.open('RiverdalePayroll', 1);

    request.onerror = function(event) {
        console.error("PayrollDB error:", event.target.error);
    };

    request.onsuccess = function(event) {
        payrollDB = event.target.result;
        console.log("PayrollDB ready");
        loadPayrollData();
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('employees')) {
            const employeeStore = db.createObjectStore('employees', { keyPath: 'employeeNumber' });
            employeeStore.createIndex('nrc', 'nrc', { unique: true });
        }
        if (!db.objectStoreNames.contains('payments')) {
            const paymentStore = db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
            paymentStore.createIndex('employeeNumber', 'employeeNumber', { unique: false });
        }
    };
}

// Generate unique employee number
function generateEmployeeNumber(name, nrc) {
    const prefix = 'EMP';
    const nameInitials = name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    const nrcNumbers = nrc.replace(/\D/g, '');
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${nameInitials}${nrcNumbers}${timestamp}`;
}

// Calculate next payment date
function calculateNextPaymentDate(currentDate) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
}

// Calculate PAYE (Zambian Tax Brackets)
function calculatePAYE(basicSalary) {
    if (basicSalary <= 4800) return 0;
    if (basicSalary <= 6400) return (basicSalary - 4800) * 0.25;
    if (basicSalary <= 8400) return (6400 - 4800) * 0.25 + (basicSalary - 6400) * 0.30;
    return (6400 - 4800) * 0.25 + (8400 - 6400) * 0.30 + (basicSalary - 8400) * 0.375;
}

// Save employee payment data
async function saveEmployeePayment(employeeData) {
    try {
        const transaction = payrollDB.transaction(['employees', 'payments'], 'readwrite');
        const employeeStore = transaction.objectStore('employees');
        const paymentStore = transaction.objectStore('payments');

        await employeeStore.put(employeeData);
        
        const paymentData = {
            employeeNumber: employeeData.employeeNumber,
            amount: employeeData.netPay,
            date: new Date().toISOString(),
            type: 'salary'
        };
        
        await paymentStore.add(paymentData);
        return true;
    } catch (error) {
        console.error('Error saving payment:', error);
        return false;
    }
}

// Generate payslip
function generatePayslip(employee) {
    const basicSalary = parseFloat(employee.basicSalary);
    const housingAllowance = parseFloat(employee.housingAllowance) || 0;
    const transportAllowance = parseFloat(employee.transportAllowance) || 0;
    const overtimeHours = parseInt(employee.overtimeHours) || 0;
    const overtimeRate = parseFloat(employee.overtimeRate) || 0;

    // Calculate components
    const overtimePay = overtimeHours * overtimeRate;
    const grossPay = basicSalary + housingAllowance + transportAllowance + overtimePay;
    
    // Calculate deductions
    const napsa = Math.min(grossPay * 0.05, 1221.60); // 5% of gross up to maximum
    const paye = calculatePAYE(grossPay);
    const healthInsurance = grossPay * 0.01; // 1% for health insurance
    const totalDeductions = napsa + paye + healthInsurance;
    
    // Calculate net pay
    const netPay = grossPay - totalDeductions;

    return {
        employeeName: employee.employeeName,
        employeeNumber: employee.employeeNumber,
        nrcNumber: employee.nrcNumber,
        department: employee.department,
        position: employee.position,
        paymentDate: new Date().toLocaleDateString(),
        nextPaymentDate: calculateNextPaymentDate(new Date()),
        earnings: {
            basicSalary,
            housingAllowance,
            transportAllowance,
            overtimePay,
            grossPay
        },
        deductions: {
            napsa,
            paye,
            healthInsurance,
            totalDeductions
        },
        netPay
    };
}

// Show payslip modal
function showPayslipModal(employee) {
    const payslip = generatePayslip(employee);
    const modal = document.getElementById('payslipModal');
    const content = document.getElementById('payslipContent');
    
    if (!modal || !content) {
        console.error('Payslip modal elements not found');
        return;
    }

    content.innerHTML = `
        <div class="payslip-header">
            <div class="logo-container">
                <img src="eastlogo.jpg" alt="School Logo" class="logo">
                <div class="school-info">
                    <h2>RIVERDALE ACADEMY</h2>
                    <h3>PAYSLIP</h3>
                    <p>For the period ending ${payslip.paymentDate}</p>
                </div>
            </div>
        </div>
        
        <div class="employee-info">
            <div class="info-group">
                <p><strong>Employee Name:</strong> ${payslip.employeeName}</p>
                <p><strong>Employee Number:</strong> ${payslip.employeeNumber}</p>
                <p><strong>NRC Number:</strong> ${payslip.nrcNumber}</p>
            </div>
            <div class="info-group">
                <p><strong>Department:</strong> ${payslip.department}</p>
                <p><strong>Position:</strong> ${payslip.position}</p>
                <p><strong>Next Payment Date:</strong> ${payslip.nextPaymentDate}</p>
            </div>
        </div>

        <div class="salary-breakdown">
            <div class="earnings-section">
                <h3>Earnings</h3>
                <div class="salary-item">
                    <span>Basic Salary</span>
                    <span>K${payslip.earnings.basicSalary.toFixed(2)}</span>
                </div>
                <div class="salary-item">
                    <span>Housing Allowance</span>
                    <span>K${payslip.earnings.housingAllowance.toFixed(2)}</span>
                </div>
                <div class="salary-item">
                    <span>Transport Allowance</span>
                    <span>K${payslip.earnings.transportAllowance.toFixed(2)}</span>
                </div>
                <div class="salary-item">
                    <span>Overtime Pay</span>
                    <span>K${payslip.earnings.overtimePay.toFixed(2)}</span>
                </div>
                <div class="salary-total">
                    <span>Gross Pay</span>
                    <span>K${payslip.earnings.grossPay.toFixed(2)}</span>
                </div>
            </div>

            <div class="deductions-section">
                <h3>Deductions</h3>
                <div class="salary-item">
                    <span>NAPSA</span>
                    <span>K${payslip.deductions.napsa.toFixed(2)}</span>
                </div>
                <div class="salary-item">
                    <span>PAYE</span>
                    <span>K${payslip.deductions.paye.toFixed(2)}</span>
                </div>
                <div class="salary-item">
                    <span>Health Insurance</span>
                    <span>K${payslip.deductions.healthInsurance.toFixed(2)}</span>
                </div>
                <div class="salary-total">
                    <span>Total Deductions</span>
                    <span>K${payslip.deductions.totalDeductions.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="net-salary-section">
            <div class="net-amount">
                <span>Net Pay</span>
                <span>K${payslip.netPay.toFixed(2)}</span>
            </div>
        </div>

        <div class="payslip-footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <div class="qr-section" id="qrCode"></div>
        </div>
    `;

    // Generate QR code with payment details
    const qrData = JSON.stringify({
        employeeNumber: payslip.employeeNumber,
        amount: payslip.netPay,
        date: payslip.paymentDate
    });
    
    new QRCode(document.getElementById('qrCode'), {
        text: qrData,
        width: 100,
        height: 100
    });

    modal.style.display = 'block';
}

// Print payslip
function printPayslip() {
    const printContent = document.getElementById('payslipContent');
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;

    // Reattach event listeners after restoring content
    attachPayrollEventListeners();
}

// Initialize event listeners
function attachPayrollEventListeners() {
    const payrollForm = document.getElementById('payrollForm');
    if (payrollForm) {
        payrollForm.addEventListener('submit', handlePayrollSubmit);
    }

    const printButton = document.querySelector('.print-btn');
    if (printButton) {
        printButton.addEventListener('click', printPayslip);
    }
}

// Handle payroll form submission
function handlePayrollSubmit(e) {
    e.preventDefault();
    
    const employeeData = {
        employeeName: document.getElementById('employeeName').value,
        employeeNumber: document.getElementById('employeeNumber').value,
        nrcNumber: document.getElementById('nrcNumber').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        basicSalary: document.getElementById('basicSalary').value,
        housingAllowance: document.getElementById('housingAllowance').value,
        transportAllowance: document.getElementById('transportAllowance').value,
        overtimeHours: document.getElementById('overtimeHours').value,
        overtimeRate: document.getElementById('overtimeRate').value
    };

    showPayslipModal(employeeData);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initPayrollDB();
    attachPayrollEventListeners();
});
