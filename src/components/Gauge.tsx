import React from "react";

interface GaugeProps {
  value: number;
  label: string;
  direction?: string;
  rotation?: number; // Added for compass-like rotation
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  label,
  direction,
  rotation = 0,
}) => {
  // Convert compass directions to degrees
  const getDirectionDegrees = (dir: string) => {
    const directions: { [key: string]: number } = {
      N: 0,
      NE: 45,
      E: 90,
      SE: 135,
      S: 180,
      SW: 225,
      W: 270,
      NW: 315,
    };
    return directions[dir] || 0;
  };

  return (
    <div className="relative w-32 h-32">
      <svg className={`transform -rotate-90 w-full h-full`}>
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r="56"
          stroke="#FFF"
          strokeWidth="4"
          fill="none"
          strokeDasharray="2 10"
        />
        {/* Value indicator */}
        <circle
          cx="64"
          cy="64"
          r="56"
          stroke="#EAB308"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${value * 3.51} 551`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        />
        {/* Direction indicator */}
        <line
          x1="64"
          y1="64"
          x2="64"
          y2="20"
          transform={`rotate(${getDirectionDegrees(direction || "N")}, 64, 64)`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
        <div className="text-2xl text-yellow-400 font-bold">{value}°</div>
        {direction && (
          <div className="text-sm text-yellow-300">{direction}</div>
        )}
        <div className="text-sm">{label}</div>
      </div>
    </div>
  );
};

export default Gauge;
