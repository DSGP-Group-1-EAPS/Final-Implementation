import React from 'react';
import { Bar } from 'react-chartjs-2';

import { Chart, registerables} from 'chart.js';

Chart.register(...registerables);

const MyChart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: [65, 59, 80, 81, 56, 55, 40]
      }
    ]
  };

  const options = {
    title: {
      display: true,
      text: 'Custom Chart Title'
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  };

  return (
    <div>
      
      <Bar
        data={data}
        options={options}
      />
    </div>
  );
};

export default MyChart;
