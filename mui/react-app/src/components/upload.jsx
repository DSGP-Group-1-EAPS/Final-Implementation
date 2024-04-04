import React, { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';

const InputFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
      navigate('/predict');
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.docx,.xlsx" // Restrict file types (optional)
        style={{ display: 'none'}} // Hide the default file input
        ref={fileInputRef}
      />
      <TextField
        value={selectedFile ? selectedFile.name : ''}
        disabled
        // Display the selected file name in the text field
      />
      <center>
        <div style={{ marginTop: '20px' }}>
          <Button
            variant="contained"
            sx={{ py: 2, px: 4, fontWeight: 'bold', width: '80%', paddingTop: '5%', paddingBottom: '5%', fontSize: '2rem', backgroundColor: '#FFC436', color: '#101418', border: '2px solid #FFC436', position: 'relative', '&::after': { content: '""', position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: '2px dashed black', borderRadius: 'inherit' }, '&:hover': { backgroundColor: 'white', color: 'black' } }}
            onClick={handleButtonClick}
          >
            <div style={{ margin: '5px' }}>{selectedFile ? selectedFile.name : 'Choose File'}</div>
          </Button>
        </div>
        <div style={{ marginTop: '50px' }}>
          <Button
            variant="contained"
            sx={{ py: 2, px: 4, fontWeight: 'bold',backgroundColor: '#FFC436',color: '#101418' }}
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload File
          </Button>
        </div>
      </center>
    </div>
  );
};

export default InputFileUpload;
