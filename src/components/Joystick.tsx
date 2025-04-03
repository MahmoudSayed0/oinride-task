import React, { useState, useEffect, useCallback, useRef } from "react";

interface JoystickProps {
  onChange: (x: number, y: number) => void;
  id?: string;
}

const Joystick: React.FC<JoystickProps> = ({ onChange, id = "joystick" }) => {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setActive(true);

        // Calculate initial position
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((clientY - rect.top) / rect.height) * 2 - 1;

        // Clamp values to -1 to 1 range
        const clampedX = Math.max(-1, Math.min(1, x));
        const clampedY = Math.max(-1, Math.min(1, y));

        setPosition({ x: clampedX, y: clampedY });
        onChange(clampedX, clampedY);
      }
    },
    [onChange]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (active && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate position relative to center
        const x = (clientX - center.x) / (rect.width / 2);
        const y = (clientY - center.y) / (rect.height / 2);

        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y);

        // Normalize if distance > 1 (outside the unit circle)
        const normalizedX = distance > 1 ? x / distance : x;
        const normalizedY = distance > 1 ? y / distance : y;

        setPosition({ x: normalizedX, y: normalizedY });
        onChange(normalizedX, normalizedY);
      }
    },
    [active, center, onChange]
  );

  const handleEnd = useCallback(() => {
    if (active) {
      setActive(false);
      setPosition({ x: 0, y: 0 });
      onChange(0, 0); // Reset joystick values when released
    }
  }, [active, onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (active) handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (active && e.touches[0]) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (active) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [active, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800/70 relative cursor-pointer select-none border-4 border-gray-700"
      onMouseDown={(e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}>
      {/* Directional markers */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>

      {/* Joystick handle */}
      <div
        className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-900 transform -translate-x-1/2 -translate-y-1/2 border-2"
        style={{
          left: `${50 + position.x * 40}%`,
          top: `${50 + position.y * 40}%`,
          borderColor: "#F59E0B",
          boxShadow: "0 0 10px rgba(245, 158, 11, 0.5)",
        }}>
        <div className="absolute inset-0 rounded-full border-4 border-yellow-500 opacity-50"></div>
      </div>
    </div>
  );
};

export default Joystick;
