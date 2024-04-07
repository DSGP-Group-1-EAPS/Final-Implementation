import React from 'react';
import MUIDataTable from "mui-datatables";
import Paper from '@mui/material/Paper';
import { Box } from '@mui/system';


const EmployeeTable = ({ jsonData }) => {
    console.log(jsonData)
  const columns = [
    {
      name: "employeeCode",
      label: "Employee Code",
    },
    {
      name: "department",
      label: "Department",
      options: {
        customBodyRender: (value) => {
          switch (value) {
            case 0:
              return 'Jumper';
            case 1:
              return 'Mat';
            case 2:
              return 'Sewing';
            default:
              return 'Unknown';
          }
        }
      }
    },
    {
      name: "probability",
      label: "Probability",
      options: {
        customBodyRender: (value) => `${(value * 100).toFixed(2)}%`, // Convert probability to percentage format
      },
    },
  ];

  const data = jsonData.employee_codes.map((code, index) => ({
    employeeCode: code,
    department: jsonData.departments[index],
    probability: jsonData.probabilities[index],
  }));

  const options = {
    selectableRows: "none", // Disable row selection
    responsive: "standard", // Enable responsive display
    filter: true, // Disable filter
    search: true, // Disable search
    print: false, // Disable print
    download: true, // Disable download
    pagination: true, // Disable pagination
    viewColumns: true, // Disable column visibility toggle
  };

  return (

        <MUIDataTable
          title={<h1 style ={{fontFamily: 'Arial', marginLeft: '35%'}}>Predicted Employee's Details</h1>}
          data={data}
          columns={columns}
          options={options}
          style={{ width:'70%', marginTop: '50px', marginBottom: '50px', border: '1px solid white', borderRadius: '25px'}}
        />

  );
};

export default EmployeeTable;
