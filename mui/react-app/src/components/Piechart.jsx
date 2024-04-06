import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

const Piechart = ({ jsonData }) => {
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [probabilityCounts, setProbabilityCounts] = useState({});

  useEffect(() => {
    if (jsonData) {
      // Replace department codes with corresponding names
      const updatedDepartments = jsonData.departments.map(code => {
        switch (code) {
                        case 0:
                          return 'Jumper';
                        case 1:
                          return 'Mat';
                        case 2:
                          return 'Sewing';
                        default:
                          return 'Unknown';
        }
      });

      // Count occurrences of each department type
      const departmentCounts = updatedDepartments.reduce((acc, department) => {
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {});

      setDepartmentCounts(departmentCounts);

      // Group probabilities into bins of 0.01 width and count occurrences in each bin
      const probabilityBins = {};
      jsonData.probabilities.forEach(probability => {
        const bin = Math.floor(probability * 100) / 100;
        probabilityBins[bin] = (probabilityBins[bin] || 0) + 1;
      });

      setProbabilityCounts(probabilityBins);
    }
  }, [jsonData]);

  useEffect(() => {
    // Create pie chart when department counts change
    if (Object.keys(departmentCounts).length > 0) {
      const canvas = document.getElementById('departmentPieChart');
      if (canvas) {
        new Chart(canvas, {
          type: 'pie',
          data: {
            labels: Object.keys(departmentCounts),
            datasets: [{
              label: ' Leave Const',
              data: Object.values(departmentCounts),
              backgroundColor: ['#7E2553', '#FF004D', '#FFC436'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // Prevent the chart from maintaining aspect ratio
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

      const probabilityCanvas = document.getElementById('probabilityBarChart');
      if (probabilityCanvas) {
        new Chart(probabilityCanvas, {
          type: 'bar',
          data: {
            labels: probabilityLabels,
            datasets: [{
              label: 'Probability Counts',
              data: probabilityData,
              backgroundColor: '#FFC436',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // Prevent the chart from maintaining aspect ratio
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
<>
        <div style={{backgroundColor: '#fff', color: '#101418', border: '1px solid #101418', width: 'auto', borderRadius: '20px', margineLeft:"15%", margineTop:'35%',paddingTop:'5%'}}><center>
        {Object.keys(departmentCounts).length > 0 && (
          <div style={{backgroundColor: '#fff', color: '#101418', width: '80%'}}>
            <canvas id="departmentPieChart" width="400" height="400"></canvas>
          </div>
        )}</center>
      <Typography variant="body1" style={{marginTop: '5%', color: '#939aa9', textAlign : 'center', marginBottom:"5%"}}>
        <b>Next month absenteeism prediction classification </b>
      </Typography>
        </div>
</>
  );
};

export default Piechart;
