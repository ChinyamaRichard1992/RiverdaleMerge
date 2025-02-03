// Function to update visualizations
function updateVisualizations() {
    // Calculate data for charts
    const genderData = {
        male: students.filter(s => s.gender === 'Male').length,
        female: students.filter(s => s.gender === 'Female').length
    };

    const gradeData = Array(9).fill(0);
    students.forEach(s => {
        if (s.grade >= 1 && s.grade <= 9) {
            gradeData[s.grade - 1]++;
        }
    });

    const termData = {
        1: students.filter(s => s.term === '1').length,
        2: students.filter(s => s.term === '2').length,
        3: students.filter(s => s.term === '3').length
    };

    // Update Gender Distribution Chart
    const genderCtx = document.getElementById('genderChart');
    if (genderCtx) {
        if (genderCtx.chart) {
            genderCtx.chart.destroy();
        }
        genderCtx.chart = new Chart(genderCtx, {
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

    // Update Grade Distribution Chart
    const gradeCtx = document.getElementById('gradeChart');
    if (gradeCtx) {
        if (gradeCtx.chart) {
            gradeCtx.chart.destroy();
        }
        gradeCtx.chart = new Chart(gradeCtx, {
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

    // Update Term Distribution Chart
    const termCtx = document.getElementById('termChart');
    if (termCtx) {
        if (termCtx.chart) {
            termCtx.chart.destroy();
        }
        termCtx.chart = new Chart(termCtx, {
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
}

// Update visualizations when data changes
function updateAllVisualizations() {
    if (typeof students !== 'undefined') {
        updateVisualizations();
    }
}

// Initialize visualizations when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateAllVisualizations();

    // Update when form is submitted
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', function() {
            setTimeout(updateAllVisualizations, 100);
        });
    }
});
