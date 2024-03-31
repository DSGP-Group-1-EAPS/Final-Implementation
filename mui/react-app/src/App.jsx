import React, { useState, useEffect } from 'react';
import TemporaryDrawer from './components/navbar';

function App() {
  const [data,setData] = useState([{}])
  // Fetch data when the component

  // useEffect(() => {
  //   fetch("http://192.168.1.115:8080/EAPSPage").then(
  //     res => res.json()
  //   ).then(
  //     data => {
  //       setData(data)
  //       console.log(data)
  //     }
  //   )
  // },[])

  return (
    <div>
        <TemporaryDrawer/>
    </div>
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
