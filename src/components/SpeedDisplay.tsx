import React from "react";

interface SpeedDisplayProps {
  speed: number;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ speed }) => {
  return (
    <div className="absolute left-1/2 bottom-32 -translate-x-1/2 text-center text-white">
      <div className="text-8xl font-bold tracking-wider">
        {speed.toFixed(1)}
      </div>
      <div className="text-xl text-white mt-2">m/s</div>
    </div>
  );
};

export default SpeedDisplay;
