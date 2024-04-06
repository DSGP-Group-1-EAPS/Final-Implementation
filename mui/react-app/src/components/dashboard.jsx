import React, { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputFileUpload from './upload';
import EmployeeTable from './EmployeeTable';
import Progress from './progress';// Import the EmployeeTable component
import Piechart from './Piechart';
import Barchart from './Barchart';
import CounterComponent from './counter';// Import the EmployeeTable component

export default function HomeBody() {
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
      const response = await fetch('http://127.0.0.1:8080/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      console.log(data); // Log the received JSON data
      setJsonData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8080/predictions', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const predictionsData = await response.json();
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error fetching predictions:', error);
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
      }, 400),
      setTimeout(() => {
        setDisplayComponents(prevState => ({ ...prevState, barchart: true }));
      }, 500)
    ];

    return () => {
      // Clear all timeouts to avoid memory leaks
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);



  return (
    <center>
    <table style={{ width:'100%' }}>
    <tr>
    <td style={{ paddingLeft:'5%', paddingRight:'5%' }}><CounterComponent data={jsonData} total={200} department={1} label={"Total absenteeism prediction for MAT Team"} /> </td>
    <td style={{ paddingLeft:'5%', paddingRight:'5%' }}><CounterComponent data={jsonData} total={200} department={0} label={"Total absenteeism prediction for Jumper Team"} /> </td>
    <td style={{ paddingLeft:'5%', paddingRight:'5%' }}><CounterComponent data={jsonData} total={200} department={2} label={"Total absenteeism prediction for Sewing Team"} /> </td>
    </tr>
    </table>

      <table style={{ width:'100%' }}>
        <tr>
          <td><center>{displayComponents.progress && <Progress jsonData={jsonData}/>}</center></td>
          <td><center>{displayComponents.piechart && <Piechart jsonData={jsonData} predictions={predictions} />}</center></td>
          <td><center>{displayComponents.barchart && <Barchart jsonData={jsonData} predictions={predictions} />}</center></td>
        </tr>
        <tr>
        <td></td>
        </tr>
      </table>
      <div style={{ width:'70%', marginTop: '50px', marginBottom: '50px' }}>
      {displayComponents.table1 && <EmployeeTable jsonData={jsonData} predictions={predictions} />}
      </div>
    </center>
  );
}
