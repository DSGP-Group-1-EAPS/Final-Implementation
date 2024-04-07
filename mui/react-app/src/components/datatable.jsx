import React from 'react';
import MUIDataTable from "mui-datatables";

export default function DataTableFromFile({ json }) {
  const columns = [
    { name: 'id', label: 'Employee Code' },
    { name: 'department', label: 'Department' },
    { name: 'probability', label: 'Probability' },
  ];

  const data = json.employee_codes.map((employeeCode, index) => ({
    id: employeeCode,
    department: json.departments[index],
    probability: json.probabilities[index]
  }));

  const options = {
    filterType: 'checkbox',
    selectableRows: 'none', // disable checkbox selection
  };

  return (
    <div>
      <MUIDataTable
        title={"Employee Data"}
        data={data}
        columns={columns}
        options={options}
      />
    </div>
  );
}
