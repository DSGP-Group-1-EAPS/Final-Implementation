import * as React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';




function CircularProgressWithLabel({ value, targetProgress }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', paddingTop: '8%' }}>
      <CircularProgress color="secondary" variant="determinate" size={300} thickness={8} value={value} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.500',
          paddingLeft: '20%',
          paddingTop: "30%"
        }}
      >

        {value >= 50 && (
          <Typography
            variant="body1"
            component="div"
            color="white"
            sx={{ position: 'absolute', zIndex: 1, fontSize: "75px", marginTop: "5%", marginBottom: "20%", marginRight: "30%", marginLeft: "13%", color:"#101418"}}
          >
            {`${targetProgress}%`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
  targetProgress: PropTypes.number.isRequired,
};

export default function Progress({ jsonData }) {
  const [progress, setProgress] = React.useState(0);
  const [lmpa, setLmpa] = React.useState(null); // State to store lmpa value

  React.useEffect(() => {
    if (jsonData && jsonData.lmpa) {
      setLmpa(jsonData.lmpa);
    }
  }, [jsonData]);

  const targetProgress = lmpa || 0; // Use lmpa if available, otherwise default to 85

  React.useEffect(() => {
    if (progress < targetProgress) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 1);
      }, 10);
      return () => clearInterval(timer);
    }
  }, [progress, targetProgress]);

  return (
    <div style={{    backgroundColor: '#fff', color: '#101418', border: '1px solid #101418', borderRadius: '20px', paddingTop:'10%'}}>
      <CircularProgressWithLabel value={progress} targetProgress={targetProgress} />
            <Typography variant="body1" style={{marginTop: '8px', color: '#939aa9', textAlign : 'center',paddingTop:"5%", paddingBottom:'15%'}}>
        <b>Last month prediction accuracy</b>
      </Typography>

    </div>
  );
}
