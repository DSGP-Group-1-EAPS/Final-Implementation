import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CenteredContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '2%',
  height: '100%', // Ensure container takes full height
});

const StyledButton = styled(Button)({
  width: '95%',
  height: '200px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'inset 0 0 0 2px black',
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: 'white',
    '& h2, & svg': {
      color: '#1877D2',
    },
  },
});

const DottedLine = styled('div')({
  position: 'absolute',
  top: '-10px',
  left: '-10px',
  right: '-10px',
  bottom: '-10px',
  pointerEvents: 'none',
  borderRadius: '4px',
  border: '2px dashed black',
});

const RedirectButton = styled(Button)({
  marginTop: '20px',
});

export default function InputFileUpload() {
  const [file, setFile] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8080', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);

      // Set redirect to true after successful upload
      setRedirect(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleRedirect = () => {
    // Redirect to another page when the button is clicked
    window.location.href = '/another-page';
  };

  return (
    <CenteredContainer>
      <StyledButton
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        onClick={handleUpload}
      >
        <CloudUploadIcon sx={{ fontSize: 80 }} />
        <h2 style={{ margin: 0 }}>Upload Last month attendance report</h2>
        <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        <DottedLine />
      </StyledButton>

    </CenteredContainer>
  );
}

