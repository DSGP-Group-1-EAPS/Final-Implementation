import React, { useState, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputFileUpload from './upload';
import EmployeeTable from './EmployeeTable'; // Import the EmployeeTable component

export default function HomeBody() {
  const [jsonData, setJsonData] = useState(null);
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

  return (
    <>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        marginTop={5}
      >
        <h1 style={{ fontFamily: 'Arial', marginBottom: '20px' }}>Employees Absenteeism Prediction for the Next Month</h1>
      </Stack>


      <InputFileUpload inputRef={fileInputRef} />

      <center>
{/*       <Button variant="contained" sx={{ py: 2, px: 4, my: 2, mb: 10, fontWeight: 'bold' }} onClick={handleGetPredictions}> */}
{/*   Get Predictions */}
{/* </Button> */}

      </center>

      <EmployeeTable jsonData={jsonData} /> {/* Integrate the EmployeeTable component */}
       </>
  );
}
