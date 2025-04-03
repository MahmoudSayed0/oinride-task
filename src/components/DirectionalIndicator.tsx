import React from "react";

interface DirectionalIndicatorProps {
  value: number;
  label?: string;
  direction?: string;
  size?: "small" | "large";
  showDirection?: boolean;
  isCompass?: boolean;
}

const DirectionalIndicator: React.FC<DirectionalIndicatorProps> = ({
  value,
  label,
  direction,
  size = "large",
  showDirection = false,
  isCompass = false,
}) => {
  const width = size === "large" ? 160 : 120;
  const height = size === "large" ? 48 : 36;

  // Generate tick marks with directional labels
  const generateTicks = () => {
    const ticks = [];
    const tickCount = 9; // W to E with N in the middle
    const tickWidth = width / (tickCount - 1);

    // Define direction labels
    const directions = ["W", "NW", "N", "NE", "E", "SE", "S", "SW", "W"];

    for (let i = 0; i < tickCount; i++) {
      const x = i * tickWidth;
      const tickHeight = i % 2 === 0 ? height * 0.4 : height * 0.2;

      ticks.push(
        <g key={i}>
          <line
            x1={x}
            y1={height * 0.5 - tickHeight / 2}
            x2={x}
            y2={height * 0.5 + tickHeight / 2}
            stroke="#374151"
            strokeWidth="1"
          />
          {i % 2 === 0 && (
            <text
              x={x}
              y={height * 0.85}
              textAnchor="middle"
              fill="#9CA3AF"
              fontSize={size === "large" ? "10" : "8"}>
              {directions[i / 2]}
            </text>
          )}
        </g>
      );
    }
    return ticks;
  };

  // Calculate arrow position based on value (-180 to 180 degrees mapped to width)
  const normalizedValue = ((value + 180) % 360) - 180; // Ensure value is between -180 and 180
  const arrowPosition = ((normalizedValue + 180) / 360) * width;

  // Format the value to show degrees
  const formattedValue = `${Math.round(value)}°`;

  return (
    <div className={`relative ${size === "large" ? "w-40" : "w-32"} h-12`}>
      <svg width={width} height={height}>
        {/* Background line */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#374151"
          strokeWidth="1"
        />

        {/* Tick marks and values */}
        {generateTicks()}

        {/* Arrow indicator with integrated label */}
        <g>
          {/* Arrow */}

          {/* Current value */}
          <text
            x={arrowPosition}
            y={height * 0.35}
            textAnchor="middle"
            fill="#F59E0B"
            fontSize={size === "large" ? "12" : "10"}
            fontWeight="bold">
            {formattedValue}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default DirectionalIndicator;
