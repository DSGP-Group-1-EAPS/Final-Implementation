import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GridLoader from "react-spinners/GridLoader";

const override = {
  justifyContent: "center",
  alignItems: "center",
  padding: "5% 0% 10% 0%",
};

function Predict() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8080/status");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.text(); // Get response as text
        console.log(data); // Log the received data
        if (data === "Done") { // Check for string "true"
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup the interval

  }, [navigate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5 * 60 * 1000); // 5 minutes timeout

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <center>
        <h1
          style={{
            color: "#ffffff",
            fontWeight: "bold",
            fontFamily: "Arial",
            fontSize: "55px",
            marginTop: "5%",
          }}
        >
          Retraining Model
        </h1>

        <div className="GridLoaderContainer" style={override}>
          <GridLoader
            color={"#FFC436"}
            loading={loading}
            cssOverride={override}
            size={60}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </center>
    </>
  );
}

export default Predict;
