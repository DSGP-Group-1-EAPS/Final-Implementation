import React, { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputFileUpload from './upload';
import EmployeeTable from './EmployeeTable';
import Progress from './progress';// Import the EmployeeTable component
import Piechart from './Piechart';
import Barchart from './Barchart';
import DataTableFromFile from './datatable';
import CounterComponent from './counter';// Import the EmployeeTable component
import { DataGrid } from '@mui/x-data-grid';

export default function HomeBody_last() {
   const columns = [
  { field: 'id', headerName: 'Employee Code', width: 150 },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'probability', headerName: 'Probability', width: 150 },
];


  const [jsonData, setJsonData] = useState(null);
  const [predictions, setPredictions] = useState(null); // State for predictions
  const [displayComponents, setDisplayComponents] = useState({
    table1: false,
    table2: false,
    progress: false,
    piechart: false,
    barchart: false
  }); // State to control component display

  const fileInputRef = useRef(null);

  const handleGetPredictions = async () => {
    try {
      // Fetch JSON data from Flask when the button is clicked
      const response = await fetch('http://127.0.0.1:8080/last_month_predicts');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      console.log(data); // Log the received JSON data
      setJsonData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

  };

  useEffect(() => {
    // Call handleGetPredictions when the component mounts
    handleGetPredictions();

    // Set displayComponents progressively with timeouts
    const timeouts = [
      setTimeout(() => {
        setDisplayComponents(prevState => ({ ...prevState, progress: true }));
      }, 100),
      setTimeout(() => {
        setDisplayComponents(prevState => ({ ...prevState, table1: true }));
      }, 200),
      setTimeout(() => {
        setDisplayComponents(prevState => ({ ...prevState, table2: true }));
      }, 300),
      setTimeout(() => {
        setDisplayComponents(prevState => ({ ...prevState, piechart: true }));
      }, 600),
      setTimeout(() => {
        setDisplayComponents(prevState => ({ ...prevState, barchart: true }));
      }, 800)
    ];

    return () => {
      // Clear all timeouts to avoid memory leaks
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);



return (
  <center>
    <h1 style={{ fontFamily: 'Arial', marginBottom: '3%', marginTop: '3%', fontSize: "50px" }}>Employees Absenteeism Prediction Report</h1>
    <table style={{ width: '100%' }}>
      <tr>
        <td style={{ paddingLeft: '2%', paddingRight: '2%' }}><CounterComponent data={jsonData} total={241} department={1} label={<b>Total absenteeism prediction for MAT Team</b>} /> </td>
        <td style={{ paddingLeft: '2%', paddingRight: '2%' }}><CounterComponent data={jsonData} total={268} department={0} label={<b>Total absenteeism prediction for Jumper Team</b>} /> </td>
        <td style={{ paddingLeft: '2%', paddingRight: '2%' }}><center><CounterComponent data={jsonData} total={3491} department={2} label={<b>Total absenteeism prediction for Sewing Team</b>} /> </center></td>
      </tr>

    </table>
    <table>
       <tr>
          <td style={{ paddingLeft:'2%', paddingRight:'2%', paddingTop:'4%' }}>{displayComponents.piechart && <Piechart jsonData={jsonData} predictions={predictions} />}</td>
          <td style={{ paddingLeft:'2%', paddingRight:'2%' }}>{displayComponents.barchart && <Barchart jsonData={jsonData} predictions={predictions} />}</td>
        </tr>
    </table>

    {jsonData && (
      <div style={{ width:'70%', marginTop: '50px', marginBottom: '50px' }}>
      {displayComponents.table1 && <EmployeeTable jsonData={jsonData} predictions={predictions} />}
      </div>
    )}
  </center>
);

}
