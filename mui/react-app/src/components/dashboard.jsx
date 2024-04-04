import React, { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputFileUpload from './upload';
import EmployeeTable from './EmployeeTable';
import Progress from './progress';// Import the EmployeeTable component

export default function HomeBody() {
  const [jsonData, setJsonData] = useState(null);
  const [predictions, setPredictions] = useState(null); // State for predictions
  const [displayTable, setDisplayTable] = useState(false); // State to control table display
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
  }, []); // Empty dependency array to ensure this runs only once

  useEffect(() => {
    // Set displayTable to true after 2 seconds
    const timeoutId = setTimeout(() => {
      setDisplayTable(true);
    }, 250);

    return () => clearTimeout(timeoutId); // Cleanup the timeout
  }, []);

  return (
    <>
        <Progress />
      <EmployeeTable jsonData={jsonData} predictions={predictions} /> {/* Integrate the EmployeeTable component */}
    </>
  );
}
