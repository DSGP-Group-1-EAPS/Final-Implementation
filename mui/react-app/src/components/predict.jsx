import { useState, CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";

const override = {
  justifyContent: "center",
  alignItems: "center",

  padding:"15% 35% 10% 35%",
};

function Predict() {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");

  return (
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
  );
}

export default Predict;
