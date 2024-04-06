import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    color: '#101418',
    border: '1px solid #101418',
    borderRadius: '20px',
    paddingTop: '30px',
    paddingBottom: '30px'
  },
  counter: {
    fontSize: '4rem',
    fontWeight: 'bold',
    margin: '8px' ,
    color:'#212636',

  },
  label: {
    marginTop: '8px',
    color: '#939aa9',
    textAlign : 'center'
  },
};

const CounterComponent = ({ data, total, department, label }) => {
  // Check if data is null or undefined
  if (!data || !data.departments || !data.probabilities) {
    return null; // or handle the case where data is missing
  }

  // Calculate the sum of probabilities for the given department
  let departmentTotal = 0;
  for (let i = 0; i < data.departments.length; i++) {
    if (data.departments[i] === department) {
      departmentTotal += 1;
    }
  }

  // Calculate percentage
  const percentage = (departmentTotal / total) * 100;

  return (
    <Paper style={styles.container}>
      <Typography variant="h1" style={styles.counter}>
        {percentage.toFixed(2)}%
      </Typography>
      <Typography variant="body1" style={styles.label}>
        {label}
      </Typography>
    </Paper>
  );
};

export default CounterComponent;
