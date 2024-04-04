// import React, { useState, useEffect } from 'react';
// import TemporaryDrawer from './components/SignInSide';
//
// function App() {
//   const [data,setData] = useState([{}])
//   // Fetch data when the component
//
//   // useEffect(() => {
//   //   fetch("http://192.168.1.115:8080/EAPSPage").then(
//   //     res => res.json()
//   //   ).then(
//   //     data => {
//   //       setData(data)
//   //       console.log(data)
//   //     }
//   //   )
//   // },[])
//
//   return (
//     <div>
//         <SignInSide/>
//     </div>
//   );
// }
//
// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/SignInSide';
import HomeBody from './components/homebody'; // Import your Dashboard component
import Predict from './components/predict';
import Dashboard from './components/dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomeBody />} /> {/* Route to DashboardPage component */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Route to DashboardPage component */}
        <Route path="/predict" element={<Predict />} /> {/* Route to DashboardPage component */}
        <Route path="/" element={<LoginPage />} /> {/* Route to LoginPage component */}
      </Routes>
    </Router>

  );
}

export default App;








/* App.js
import React from 'react';
import BasicButtons from './components/home';


const App = () => {
  return (
    <div>
      <BasicButtons />
    </div>
  );
};

export default App; */
