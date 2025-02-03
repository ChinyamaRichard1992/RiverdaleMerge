// Visualization Functions
let charts = {
    gender: null,
    grade: null,
    term: null
};

// Update all visualizations
function updateAllVisualizations() {
    if (typeof students === 'undefined' || !students) return;
    
    updateGenderDistribution();
    updateGradeDistribution();
    updateTermDistribution();
}

// Update Gender Distribution
function updateGenderDistribution() {
    const ctx = document.getElementById('genderChart');
    if (!ctx) return;

    const genderData = {
        male: students.filter(s => s.gender === 'Male').length,
        female: students.filter(s => s.gender === 'Female').length
    };

    if (charts.gender) {
        charts.gender.destroy();
    }

    charts.gender = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [genderData.male, genderData.female],
                backgroundColor: ['#3498db', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = genderData.male + genderData.female;
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update Grade Distribution
function updateGradeDistribution() {
    const ctx = document.getElementById('gradeChart');
    if (!ctx) return;

    const gradeData = Array(9).fill(0);
    students.forEach(s => {
        if (s.grade >= 1 && s.grade <= 9) {
            gradeData[s.grade - 1]++;
        }
    });

    if (charts.grade) {
        charts.grade.destroy();
    }

    charts.grade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'],
            datasets: [{
                label: 'Number of Students',
                data: gradeData,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update Term Distribution
function updateTermDistribution() {
    const ctx = document.getElementById('termChart');
    if (!ctx) return;

    const termData = {
        1: students.filter(s => s.term === '1').length,
        2: students.filter(s => s.term === '2').length,
        3: students.filter(s => s.term === '3').length
    };

    if (charts.term) {
        charts.term.destroy();
    }

    charts.term = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Term 1', 'Term 2', 'Term 3'],
            datasets: [{
                label: 'Number of Students',
                data: [termData[1], termData[2], termData[3]],
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Initialize visualizations when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateAllVisualizations();
});
