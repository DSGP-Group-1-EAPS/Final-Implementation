import * as React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', paddingLeft:'10%', paddingTop:'8%' }}>
      <CircularProgress color="secondary" variant="determinate" size={350} thickness={8} {...props}  /> {/* Adjusted size to 120 */}
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
          paddingLeft:'32%',
          paddingTop:"30%"
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
        {props.value >= 50 && (
          <Typography
            variant="body1"
            component="div"
            color="white"
            sx={{ position: 'absolute', zIndex: 1, fontSize:"75px" }}
          >
            85%
          </Typography>
        )}
      </Box>

    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function Progress() {
  const targetProgress = 85; // Set the target progress value here
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (progress < targetProgress) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 1);
      }, 10);
      return () => clearInterval(timer);
    }
  }, [progress, targetProgress]);

  return (
    <div>
      <CircularProgressWithLabel value={progress} />
      <h1 style={{ fontFamily: 'Arial',textAlign: 'center'}}>Last month <br/>prediction accuracy</h1>
    </div>
  );
}
