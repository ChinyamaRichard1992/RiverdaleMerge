// Visualization Functions
let charts = {
    gender: null,
    grade: null,
    term: null
};

// Update all visualizations
function updateAllVisualizations() {
    try {
        if (typeof students === 'undefined' || !students) {
            console.warn('No student data available for visualizations');
            return;
        }
        
        updateGenderDistribution();
        updateGradeDistribution();
        updateTermDistribution();
    } catch (error) {
        console.error('Error updating visualizations:', error);
        if (window.studentOperations) {
            window.studentOperations.showNotification('Error updating visualizations', '#f44336');
        }
    }
}

// Update Gender Distribution
function updateGenderDistribution() {
    try {
        const ctx = document.getElementById('genderChart');
        if (!ctx) {
            console.warn('Gender chart canvas not found');
            return;
        }

        const genderData = {
            male: students.filter(s => s.gender?.toLowerCase() === 'male').length,
            female: students.filter(s => s.gender?.toLowerCase() === 'female').length,
            other: students.filter(s => !s.gender || (s.gender.toLowerCase() !== 'male' && s.gender.toLowerCase() !== 'female')).length
        };

        if (charts.gender) {
            charts.gender.destroy();
        }

        const total = genderData.male + genderData.female + genderData.other;
        const colors = ['#3498db', '#e74c3c', '#95a5a6'];
        const labels = ['Male', 'Female', 'Other'];
        const data = [genderData.male, genderData.female, genderData.other];

        charts.gender = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors
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
                                const value = context.raw;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating gender distribution:', error);
    }
}

// Update Grade Distribution
function updateGradeDistribution() {
    try {
        const ctx = document.getElementById('gradeChart');
        if (!ctx) {
            console.warn('Grade chart canvas not found');
            return;
        }

        const gradeData = Array(9).fill(0);
        students.forEach(s => {
            const grade = parseInt(s.grade);
            if (grade >= 1 && grade <= 9) {
                gradeData[grade - 1]++;
            }
        });

        if (charts.grade) {
            charts.grade.destroy();
        }

        charts.grade = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 9}, (_, i) => `Grade ${i + 1}`),
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
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = gradeData.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `Students: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating grade distribution:', error);
    }
}

// Update Term Distribution
function updateTermDistribution() {
    try {
        const ctx = document.getElementById('termChart');
        if (!ctx) {
            console.warn('Term chart canvas not found');
            return;
        }

        const termData = {
            1: students.filter(s => s.term === '1').length,
            2: students.filter(s => s.term === '2').length,
            3: students.filter(s => s.term === '3').length
        };

        if (charts.term) {
            charts.term.destroy();
        }

        const total = termData[1] + termData[2] + termData[3];

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
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `Students: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating term distribution:', error);
    }
}

// Initialize visualizations when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateAllVisualizations();
});

// Export functions
window.visualizations = {
    updateAll: updateAllVisualizations,
    updateGender: updateGenderDistribution,
    updateGrade: updateGradeDistribution,
    updateTerm: updateTermDistribution
};
