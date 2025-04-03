import React, { useState, useEffect } from "react";
import { cn } from "./lib/utils";
import Scene3D from "./components/Scene3D";
import Joystick from "./components/Joystick";
import TopHUD from "./components/TopHUD";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  Menu,
  X,
  Sun,
  Flashlight,
  Zap,
  Square,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Move GaugeDisplay component definition BEFORE App function
const GaugeDisplay = ({
  value,
  label,
  direction,
}: {
  value: number;
  label: string;
  direction: string;
}) => {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Outer circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          stroke="#4B5563"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Direction markers */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 50 + 38 * Math.sin(angle);
          const y1 = 50 - 38 * Math.cos(angle);
          const x2 = 50 + 45 * Math.sin(angle);
          const y2 = 50 - 45 * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#6B7280"
              strokeWidth="2"
            />
          );
        })}

        {/* Inner circle */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="transparent"
          stroke="#374151"
          strokeWidth="1"
        />

        {/* Value indicator line */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="#F59E0B"
          strokeWidth="3"
          transform={`rotate(${value}, 50, 50)`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm md:text-2xl font-bold text-white">
          {Math.abs(value)}°
        </div>
        {direction && (
          <div className="text-xs md:text-sm text-yellow-500">{direction}</div>
        )}
        {label && (
          <div className="text-xs md:text-sm text-gray-400">{label}</div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [driveMode, setDriveMode] = useState<"Auto" | "Semi-Auto" | "Manual">(
    "Manual"
  );
  const [speed, setSpeed] = useState(0.5);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.5 | 1 | 2>(0.5);
  const [activeMap, setActiveMap] = useState<"3D Map" | "Camera" | "2D Map">(
    "Camera"
  );
  const [lights, setLights] = useState({
    light: false,
    spotLight: false,
    laser: false,
  });
  const [joystickLeft, setJoystickLeft] = useState({ x: 0, y: 0 });
  const [joystickRight, setJoystickRight] = useState({ x: 0, y: 0 });
  const [pitch, setPitch] = useState(0);
  const [heading, setHeading] = useState(35);
  const [roll, setRoll] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [batteryLevel, setBatteryLevel] = useState(89);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMoving, setIsMoving] = useState(false);
  const [cameraReset, setCameraReset] = useState(false);

  // Position data
  const [positionData, setPositionData] = useState({
    distance: 2.456,
    latitude: 60.2828,
    longitude: 25.0267,
    elevation: 127,
  });

  // Runtime counter - start with 2h 34m in seconds for the initial display
  const [runtime, setRuntime] = useState(2 * 3600 + 34 * 60); // 2h 34m in seconds

  // Format runtime as "Xh XXm XXs"
  const formatRuntime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${secs
      .toString()
      .padStart(2, "0")}s`;
  };

  // Format latitude and longitude to DMS (degrees, minutes, seconds)
  const formatDMS = (decimal: number, isLatitude: boolean) => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude
      ? decimal >= 0
        ? "N"
        : "S"
      : decimal >= 0
      ? "E"
      : "W";

    return `${degrees}°${minutes}'${seconds}" ${direction}`;
  };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update time and runtime every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setRuntime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle position updates from the 3D scene
  const handlePositionUpdate = (data: {
    distance: number;
    latitude: number;
    longitude: number;
    elevation: number;
  }) => {
    setPositionData(data);
  };

  // Handle emergency stop
  const handleStop = () => {
    // Reset joysticks to center position
    setJoystickLeft({ x: 0, y: 0 });
    setJoystickRight({ x: 0, y: 0 });
    setSpeed(0);
    setIsMoving(false);

    // Reset camera orientation
    setPitch(0);
    setHeading(35); // Reset to initial heading
    setRoll(10); // Reset to initial roll

    // Reset zoom level
    setZoomLevel(1);

    // Turn off all lights
    setLights({
      light: false,
      spotLight: false,
      laser: false,
    });

    // We'll need to update Scene3D to handle this reset signal
    setCameraReset((prev) => !prev); // Toggle this value to trigger a reset in Scene3D
  };

  // Toggle light functions
  const toggleMainLight = () => {
    setLights((prev) => ({ ...prev, light: !prev.light }));
  };

  const toggleSpotLight = () => {
    setLights((prev) => ({ ...prev, spotLight: !prev.spotLight }));
  };

  const toggleLaser = () => {
    setLights((prev) => ({ ...prev, laser: !prev.laser }));
  };

  // Left joystick controls movement
  const handleLeftJoystickChange = (x: number, y: number) => {
    setJoystickLeft({ x, y });
    setSpeed(Math.abs(y));
    setRoll(Math.round(x * 180));
    setIsMoving(Math.abs(x) > 0.1 || Math.abs(y) > 0.1);
  };

  // Right joystick controls camera
  const handleRightJoystickChange = (x: number, y: number) => {
    setJoystickRight({ x, y });

    // Update heading based on x movement (rotate camera left/right)
    setHeading((prev) => {
      const scaleFactor = 2;
      let newHeading = prev - x * scaleFactor;
      newHeading = ((newHeading % 360) + 360) % 360;
      return Math.round(newHeading);
    });

    // Update pitch based on y movement (look up/down)
    setPitch((prev) => {
      return Math.round(Math.max(-180, Math.min(180, prev - y * 180)));
    });
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 2));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  // Convert zoom level to percentage
  const zoomToPercentage = (zoom: number) => {
    return Math.round(zoom * 100);
  };

  // Helper function to get compass direction
  const getCompassDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Get icon for light type
  const getLightIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "light":
        return <Sun className="mr-2 h-4 w-4" />;
      case "spotlight":
        return <Flashlight className="mr-2 h-4 w-4" />;
      case "laser":
        return <Zap className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Main content area with 3D scene */}
      <div className="absolute inset-0">
        <Scene3D
          joystickLeft={joystickLeft}
          joystickRight={joystickRight}
          pitch={pitch}
          heading={heading}
          zoomLevel={zoomLevel}
          lights={lights}
          onPositionUpdate={handlePositionUpdate}
          resetCamera={cameraReset}
        />
      </div>

      {/* Top HUD - Responsive */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <TopHUD
          distance={`${positionData.distance.toFixed(3)} m`}
          runtime={formatRuntime(runtime)}
          latitude={formatDMS(positionData.latitude, true)}
          longitude={formatDMS(positionData.longitude, false)}
          elevation={`${Math.round(positionData.elevation)} m`}
          temperature="21 °C"
          status="OK"
          batteryLevel={batteryLevel}
          notifications={notifications}
          currentTime={currentTime}
          isMobile={isMobile}
        />
      </div>

      {/* Left side controls - Responsive */}
      <div className="absolute left-2 sm:left-3 md:left-4 top-36 sm:top-40 md:top-24 space-y-2 sm:space-y-3 md:space-y-4 z-10 transition-all duration-300 scale-75 sm:scale-90 md:scale-100 origin-top-left">
        {/* Drive mode selection */}
        <Card className="bg-gray-900/70 backdrop-blur-sm border-gray-800 p-1 sm:p-2 rounded-lg w-28 sm:w-36 md:w-44">
          <div className="space-y-0.5 sm:space-y-1">
            {["Auto", "Semi-Auto", "Manual"].map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-xs sm:text-sm md:text-base py-1 sm:py-1.5 md:py-2",
                  driveMode === mode
                    ? "bg-gray-800 text-white border-r-4 border-yellow-500 rounded-r-none"
                    : "text-gray-400"
                )}
                onClick={() => setDriveMode(mode as any)}>
                {mode}
              </Button>
            ))}
          </div>
        </Card>

        {/* Speed multiplier */}
        <Card className="bg-gray-900/70 backdrop-blur-sm border-gray-800 p-1 sm:p-2 rounded-lg w-28 sm:w-36 md:w-44">
          <div className="space-y-0.5 sm:space-y-1">
            {[
              { label: "2x", value: 2 },
              { label: "1x", value: 1 },
              { label: "0.5x", value: 0.5 },
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-xs sm:text-sm md:text-base py-1 sm:py-1.5 md:py-2",
                  speedMultiplier === item.value
                    ? "bg-gray-800 text-white border-r-4 border-yellow-500 rounded-r-none"
                    : "text-gray-400"
                )}
                onClick={() => setSpeedMultiplier(item.value as any)}>
                {item.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Right side controls - Responsive */}
      <div className="absolute right-2 sm:right-3 md:right-4 lg:right-6 top-16 sm:top-20 md:top-24 lg:top-28 space-y-3 sm:space-y-4 md:space-y-6 z-10 scale-75 sm:scale-90 md:scale-100 origin-top-right">
        {/* Light controls */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-md bg-gray-800/70 border-gray-700 hover:bg-gray-700 transition-all duration-200",
              lights.light && "bg-yellow-600/70 border-yellow-500"
            )}
            onClick={toggleMainLight}>
            <Sun className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-md bg-gray-800/70 border-gray-700 hover:bg-gray-700 transition-all duration-200",
              lights.spotLight && "bg-yellow-600/70 border-yellow-500"
            )}
            onClick={toggleSpotLight}>
            <Flashlight className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-md bg-gray-800/70 border-gray-700 hover:bg-gray-700 transition-all duration-200",
              lights.laser && "bg-red-600/70 border-red-500"
            )}
            onClick={toggleLaser}>
            <Zap className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
          </Button>
        </div>

        {/* Emergency Stop Button - responsive sizing */}
        <div className="flex flex-col items-center mt-2 sm:mt-3 md:mt-6 lg:mt-8">
          <Button
            variant="destructive"
            size="icon"
            className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-full bg-red-600 border-2 border-red-400 hover:bg-red-700 shadow-lg active:scale-95 transition-all duration-200"
            onClick={handleStop}>
            <Square
              className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white"
              fill="white"
            />
          </Button>
        </div>
      </div>

      {/* Zoom controls - Responsive */}
      <div className="absolute right-2 sm:right-3 md:right-4 lg:right-6 bottom-32 sm:bottom-32 md:bottom-48 space-y-2 z-10 scale-75 sm:scale-90 md:scale-100 origin-bottom-right">
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 md:h-12 md:w-12 rounded-md bg-gray-800/70 border-gray-700 hover:bg-gray-700 transition-all duration-200"
            onClick={handleZoomIn}>
            <ZoomIn className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </Button>
          <div className="text-white text-xs bg-gray-800/70 px-2 py-1 rounded-md">
            {zoomToPercentage(zoomLevel)}%
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 md:h-12 md:w-12 rounded-md bg-gray-800/70 border-gray-700 hover:bg-gray-700 transition-all duration-200"
            onClick={handleZoomOut}>
            <ZoomOut className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Gauges - Responsive, visible on all screens */}
      <div className="absolute top-16 sm:top-20 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-4 sm:space-x-6 md:space-x-16 scale-50 sm:scale-75 md:scale-100 origin-top">
        <GaugeDisplay value={pitch} label="Pitch" direction="" />
        <GaugeDisplay
          value={heading}
          label="Heading"
          direction={getCompassDirection(heading)}
        />
        <GaugeDisplay value={roll} label="Roll" direction="" />
      </div>

      {/* Joysticks and speed display - Responsive */}
      <div className="absolute bottom-0 inset-x-0 flex justify-between items-end p-2 sm:p-4 md:p-8">
        {/* Left joystick */}
        <div className="transform scale-50 sm:scale-75 md:scale-100 origin-bottom-left">
          <Joystick id="joystick-left" onChange={handleLeftJoystickChange} />
        </div>

        {/* Speed Display */}
        <div className="absolute left-1/2 bottom-10 sm:bottom-16 md:bottom-32 -translate-x-1/2 text-center scale-75 sm:scale-90 md:scale-100">
          <Card className="bg-zinc-900/70 backdrop-blur-sm border-zinc-800 p-2 md:p-4 rounded-xl">
            <div className="text-2xl sm:text-4xl md:text-8xl font-bold tracking-wider text-white">
              {speed.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm md:text-xl text-orange-400 mt-1 md:mt-2">
              m/s
            </div>
          </Card>
        </div>

        {/* Right joystick */}
        <div className="transform scale-50 sm:scale-75 md:scale-100 origin-bottom-right">
          <Joystick id="joystick-right" onChange={handleRightJoystickChange} />
        </div>
      </div>

      {/* Map Controls - Responsive */}
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto z-10 scale-75 sm:scale-90 md:scale-100 origin-bottom">
        <Card className="bg-zinc-900/70 backdrop-blur-sm border-zinc-800 p-1 md:p-2 rounded-xl">
          <div className="flex">
            {["3D Map", "Camera", "2D Map"].map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                className={cn(
                  "px-2 sm:px-4 md:px-8 py-1 sm:py-2 md:py-4 rounded-none border-t-2 text-xs md:text-base",
                  activeMap === mode
                    ? "bg-gray-700/70 border-t-yellow-500 text-white"
                    : "bg-gray-800/70 border-t-transparent text-gray-400"
                )}
                onClick={() => setActiveMap(mode as any)}>
                {mode}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
