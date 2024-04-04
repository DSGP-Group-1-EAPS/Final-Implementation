import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Charts = ({ departmentCounts, probabilityCounts }) => {
  const departmentChartRef = useRef(null);
  const probabilityChartRef = useRef(null);
  const departmentChartInstanceRef = useRef(null);
  const probabilityChartInstanceRef = useRef(null);

  useEffect(() => {
    // Create pie chart when department counts change
    if (Object.keys(departmentCounts).length > 0) {
      const canvas = departmentChartRef.current;
      if (canvas) {
        if (departmentChartInstanceRef.current) {
          departmentChartInstanceRef.current.destroy(); // Destroy existing chart if it exists
        }
        departmentChartInstanceRef.current = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: Object.keys(departmentCounts),
            datasets: [{
              data: Object.values(departmentCounts),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
            },
          },
        });
      }
    }

    // Create bar chart for probability counts
    if (Object.keys(probabilityCounts).length > 0) {
      const probabilityLabels = [];
      const probabilityData = [];

      // Group probabilities into bins of 0.01 width
      for (let i = 0.75; i <= 0.86; i += 0.01) {
        const binLabel = `${i.toFixed(2)} - ${(i + 0.01).toFixed(2)}`;
        probabilityLabels.push(binLabel);
        probabilityData.push(probabilityCounts[i] || 0);
      }

      const canvas = probabilityChartRef.current;
      if (canvas) {
        if (probabilityChartInstanceRef.current) {
          probabilityChartInstanceRef.current.destroy(); // Destroy existing chart if it exists
        }
        probabilityChartInstanceRef.current = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: probabilityLabels,
            datasets: [{
              label: 'Probability Counts',
              data: probabilityData,
              backgroundColor: '#4CAF50',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }, [departmentCounts, probabilityCounts]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ width: '20%' }}>
        <canvas ref={departmentChartRef} id="departmentPieChart" width="400" height="400"></canvas>
      </div>

    </div>
  );
};

export default Charts;
