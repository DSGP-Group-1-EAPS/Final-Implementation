import React, { useState, useRef } from 'react';
import Stack from '@mui/material/Stack';
import InputFileUpload from './upload';
import EmployeeTable from './EmployeeTable'; // Import the EmployeeTable component
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

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
    <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none', marginTop:'20px' }}>
      <Toolbar style={{ justifyContent: 'center' }}>
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit', margin: '0 20px'}}>
          Home
        </Typography>
        <Typography variant="h6" component={Link} to="/about" style={{ textDecoration: 'none', color: 'inherit', margin: '0 20px' }}>
          About
        </Typography>
        <Typography variant="h6" component={Link} to="/contact" style={{ textDecoration: 'none', color: 'inherit', margin: '0 20px' }}>
          Contact
        </Typography>
        {/* Add more navigation links as needed */}
      </Toolbar>
    </AppBar>
        <center>
            <h1 style={{ fontFamily: 'Arial', marginBottom: '3%', marginTop: '3%', fontSize:"75px" }}>Employees Absenteeism Prediction System</h1> <br />



      <Button variant="h6" component={Link} to="/file_upload" style={{ textDecoration: 'none', color: '#101418', margin: '5% 30px', backgroundColor:'#FFC436'}}>
        <h4 style={{ fontFamily: 'Arial', marginBottom: '3%', margin: '3% 5%', fontSize:"35px" }}>Get predictions for next month</h4>

      </Button><br/>
      <Button variant="h6" component={Link} to="/last_month" style={{ textDecoration: 'none', color: '#101418', margin: '0 30px', backgroundColor:'#FFC436' }}>
        <h4 style={{ fontFamily: 'Arial', marginBottom: '3%', margin: '3% 5%', fontSize:"35px" }}>View Last month predictions</h4>
      </Button>
  </center>
      <center>
{/*  <Button variant="contained" sx={{ py: 2, px: 4, my: 2, mb: 10, fontWeight: 'bold' }} onClick={handleGetPredictions}> */}
{/*   Get Predictions */}
{/* </Button> */}

      </center>


       </>
  );
}
