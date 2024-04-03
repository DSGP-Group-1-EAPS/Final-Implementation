import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const InputFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    // Implement logic to upload the selected file to your backend
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('http://127.0.0.1:8080', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('File uploaded successfully:', data);
        // Handle successful upload response from your backend (optional)
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  return (
    <div>
      <TextField
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.docx,.xlsx" // Restrict file types (optional)
      />
      <center>
        <Button variant="contained" sx={{ py: 2, px: 4, my: 2, mb: 10, fontWeight: 'bold' }} onClick={handleUpload}>
            Upload File
        </Button>
      </center>

    </div>
  );
};

export default InputFileUpload;
