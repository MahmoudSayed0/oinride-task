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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
  const [leftControlsOpen, setLeftControlsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

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
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isSmallMobile = width < 400;

      setIsMobileView(isMobile);

      // Auto-close left controls on small screens
      if (isMobile) {
        setLeftControlsOpen(false);
      } else {
        setLeftControlsOpen(true);
      }
    };

    // Check on initial load
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Clean up
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

  // Add this function to your App component
  const handleReset = () => {
    // Reset camera view and position
    setCameraReset(true);

    // Reset position data
    setPositionData({
      distance: 0,
      latitude: 60.2828, // Base latitude (60°16'58" N)
      longitude: 25.0267, // Base longitude (25°01'96" E)
      elevation: 127, // Base elevation
    });

    // Reset after animation completes
    setTimeout(() => {
      setCameraReset(false);
    }, 800); // Longer timeout to ensure position reset completes

    // Reset joysticks
    setJoystickLeft({ x: 0, y: 0 });
    setJoystickRight({ x: 0, y: 0 });

    // Reset lights
    setLights({
      light: false,
      spotLight: false,
      laser: false,
    });

    // Reset zoom
    setZoomLevel(1);

    // Reset speed
    setSpeed(0.5);
    setSpeedMultiplier(0.5);

    // Reset orientation
    setPitch(0);
    setHeading(35);
    setRoll(10);
  };

  // Add this function to toggle the left controls
  const toggleLeftControls = () => {
    setLeftControlsOpen((prev) => !prev);
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

      {/* Left side controls - Toggleable for responsive design */}
      <div className="absolute left-0 top-24 sm:top-28 md:top-24 z-20">
        {/* Toggle button - always visible */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-0 h-10 w-10 rounded-md bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:bg-gray-800 transition-all duration-200 z-30"
          onClick={() => setLeftControlsOpen((prev) => !prev)}
          title={leftControlsOpen ? "Close Controls" : "Open Controls"}>
          {leftControlsOpen ? (
            <ChevronLeft className="h-5 w-5 text-white" />
          ) : (
            <Menu className="h-5 w-5 text-white" />
          )}
        </Button>

        {/* Controls container with slide animation */}
        <div
          className={`transition-all duration-300 ease-in-out transform ${
            leftControlsOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0 pointer-events-none"
          } pl-14 space-y-2 sm:space-y-3`}>
          {/* Drive mode selection */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 p-1 sm:p-2 rounded-lg w-28 sm:w-32">
            <div className="space-y-0.5 sm:space-y-1">
              {["Auto", "Semi-Auto", "Manual"].map((mode) => (
                <Button
                  key={mode}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-xs sm:text-sm py-1",
                    driveMode === mode
                      ? "bg-gray-800 text-white border-r-4 border-yellow-500 rounded-r-none"
                      : "text-gray-400"
                  )}
                  onClick={() => {
                    setDriveMode(mode as any);
                    if (isMobileView) setLeftControlsOpen(false);
                  }}>
                  {mode}
                </Button>
              ))}
            </div>
          </Card>

          {/* Speed multiplier */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 p-1 sm:p-2 rounded-lg w-28 sm:w-32">
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
                    "w-full justify-start text-xs sm:text-sm py-1",
                    speedMultiplier === item.value
                      ? "bg-gray-800 text-white border-r-4 border-yellow-500 rounded-r-none"
                      : "text-gray-400"
                  )}
                  onClick={() => {
                    setSpeedMultiplier(item.value as any);
                    if (isMobileView) setLeftControlsOpen(false);
                  }}>
                  {item.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Right side controls - Combined lights and zoom in one area */}
      <div className="absolute right-2 top-36 z-20 flex flex-col items-end gap-3">
        {/* Light controls - Horizontal layout */}
        <div className="flex flex-row space-x-2 items-center bg-gray-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-md bg-gray-900/80 border-gray-800 hover:bg-gray-800 transition-all duration-200",
              lights.light && "bg-yellow-600/90 border-yellow-500"
            )}
            onClick={toggleMainLight}>
            <Sun className="h-5 w-5 text-white" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-md bg-gray-900/80 border-gray-800 hover:bg-gray-800 transition-all duration-200",
              lights.spotLight && "bg-yellow-600/90 border-yellow-500"
            )}
            onClick={toggleSpotLight}>
            <Flashlight className="h-5 w-5 text-white" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-md bg-gray-900/80 border-gray-800 hover:bg-gray-800 transition-all duration-200",
              lights.laser && "bg-red-600/90 border-red-500"
            )}
            onClick={toggleLaser}>
            <Zap className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Zoom controls - Horizontal layout */}
        <div className="flex flex-row space-x-2 items-center bg-gray-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md bg-gray-900/80 border-gray-800 hover:bg-gray-800 transition-all duration-200"
            onClick={handleZoomIn}>
            <ZoomIn className="h-5 w-5 text-white" />
          </Button>

          <div className="text-white text-xs px-2 py-1 bg-gray-800/90 rounded-md min-w-[40px] text-center">
            {zoomToPercentage(zoomLevel)}%
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md bg-gray-900/80 border-gray-800 hover:bg-gray-800 transition-all duration-200"
            onClick={handleZoomOut}>
            <ZoomOut className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Gauges - Better mobile scaling */}
      <div className="absolute top-20 sm:top-24 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-4 md:space-x-16 scale-[0.55] sm:scale-[0.5] md:scale-100 origin-top">
        <GaugeDisplay value={pitch} label="Pitch" direction="" />
        <GaugeDisplay
          value={heading}
          label="Heading"
          direction={getCompassDirection(heading)}
        />
        <GaugeDisplay value={roll} label="Roll" direction="" />
      </div>

      {/* Joysticks - Better mobile layout */}
      <div className="absolute bottom-0 inset-x-0 flex justify-between items-end p-2">
        {/* Left joystick */}
        <div className="transform scale-75 origin-bottom-left">
          <Joystick id="joystick-left" onChange={handleLeftJoystickChange} />
        </div>

        {/* Right joystick */}
        <div className="transform scale-75 origin-bottom-right">
          <Joystick id="joystick-right" onChange={handleRightJoystickChange} />
        </div>
      </div>

      {/* Map Controls - Better mobile positioning */}
      <div className="absolute bottom-1 sm:bottom-2 md:bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto z-10 scale-[0.6] sm:scale-75 md:scale-100 origin-bottom">
        <Card className="bg-zinc-900/90 backdrop-blur-sm border-zinc-800 p-1 md:p-2 rounded-xl shadow-lg">
          <div className="flex">
            {["3D Map", "Camera", "2D Map"].map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                className={cn(
                  "px-2 sm:px-3 md:px-8 py-1 sm:py-2 md:py-4 rounded-none border-t-2 text-xs md:text-base",
                  activeMap === mode
                    ? "bg-gray-700/90 border-t-yellow-500 text-white"
                    : "bg-gray-800/90 border-t-transparent text-gray-400"
                )}
                onClick={() => setActiveMap(mode as any)}>
                {mode}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Speed Display - Better mobile positioning */}
      <div className="absolute left-1/2 md:bottom-36 bottom-16 -translate-x-1/2 text-center z-10">
        <Card className="bg-zinc-900/90 backdrop-blur-sm border-zinc-800 p-2 rounded-xl shadow-lg">
          <div className="text-4xl font-bold tracking-wider text-white">
            {speed.toFixed(1)}
          </div>
          <div className="text-xs text-orange-400 mt-1">m/s</div>
          <div className="flex gap-2 items-center bg-gray-900/70 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
            <div className="">
              <Button
                variant="destructive"
                size="icon"
                className="h-10 w-10 rounded-full bg-red-600 border-2 border-red-400 hover:bg-red-700 shadow-lg active:scale-95 transition-all duration-200"
                onClick={handleStop}>
                <Square className="h-5 w-5 text-white" fill="white" />
              </Button>
            </div>

            {/* Reset button - Fixed position at bottom right */}
            <div className=" right-4 bottom-24 z-20">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-blue-800/80 border-blue-700 hover:bg-blue-700 transition-all duration-200 shadow-lg"
                onClick={handleReset}
                title="Reset Controls">
                <RefreshCw className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
