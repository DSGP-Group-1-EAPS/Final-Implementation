import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GridLoader from "react-spinners/GridLoader";

const override = {
  justifyContent: "center",
  alignItems: "center",
  padding: "5% 0% 10% 0%",
};

function Predict() {
  const [animation,setAnimation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState("Connecting to S3");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8080/status");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const responseData = await response.text(); // Get response as text
        console.log(responseData); // Log the received data
        setData(responseData); // Set received data to state
        if (responseData === "Done") { // Check for string "Done"
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after receiving data
      }
    };

    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup the interval

  }, [navigate]);

  return (
    <>
      <center>
        <h1
          style={{
            color: "#ffffff",
            fontWeight: "bold",
            fontFamily: "Arial",
            fontSize: "55px",
            marginTop: '10%'
          }}
        >
          {data} {/* Render the received data */}
        </h1>

        {animation && ( // Conditionally render GridLoader only when loading is true
          <div className="GridLoaderContainer" style={override}>
            <GridLoader
              color={"#FFC436"}
              loading={animation}
              cssOverride={override}
              size={60}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
      </center>
    </>
  );
}

export default Predict;
