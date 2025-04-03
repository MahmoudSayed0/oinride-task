import React, { useState } from "react";
import {
  Bell,
  BatteryMedium,
  Wifi,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "./ui/badge";

interface TopHUDProps {
  distance: string;
  runtime: string;
  latitude: string;
  longitude: string;
  elevation: string;
  temperature: string;
  status: string;
  batteryLevel: number;
  notifications: number;
  currentTime: Date;
  isMobile?: boolean;
}

const TopHUD: React.FC<TopHUDProps> = ({
  distance,
  runtime,
  latitude,
  longitude,
  elevation,
  temperature,
  status,
  batteryLevel,
  notifications,
  currentTime,
  isMobile = false,
}) => {
  const [expandedMobile, setExpandedMobile] = useState(false);

  const statusColors = {
    OK: "bg-green-600 text-white",
    Warning: "bg-yellow-600 text-white",
    Error: "bg-red-600 text-white",
  };

  // Format time as HH:MM:SS
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Format date
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block w-full bg-black/80 backdrop-blur-sm text-white border-b border-gray-800">
        <div className="flex items-center h-12">
          {/* Logo section */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Oinride" className="w-24" />
            </div>
            <span className="text-xs text-gray-400 ml-2">ControlWire®</span>
          </div>

          {/* Distance */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Distance</span>
              <span className="text-sm">{distance}</span>
            </div>
          </div>

          {/* Running time */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Running</span>
              <span className="text-xs">{runtime}</span>
            </div>
          </div>

          {/* Latitude */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Latitude</span>
              <span className="text-xs">{latitude}</span>
            </div>
          </div>

          {/* Status - centered */}
          <div className="flex items-center justify-center px-4 border-r border-gray-800 h-full flex-1">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400">STATUS</span>
              <div
                className={`px-4 py-1 rounded text-xs ${statusColors[status]}`}>
                {status}
              </div>
            </div>
          </div>

          {/* Longitude */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Longitude</span>
              <span className="text-xs">{longitude}</span>
            </div>
          </div>

          {/* Elevation */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Elevation</span>
              <span className="text-xs">{elevation}</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center px-4 border-r border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Temperature</span>
              <span className="text-xs">{temperature}</span>
            </div>
          </div>

          {/* Right section with notifications, battery, etc */}
          <div className="flex items-center px-4 h-full ml-auto">
            {/* Notifications */}
            {notifications > 0 && (
              <div className="relative mr-4">
                <Bell className="h-5 w-5 text-gray-300" />
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </div>
              </div>
            )}

            {/* Signal strength */}
            <div className="mr-4">
              <Wifi className="h-5 w-5 text-gray-300" />
            </div>

            {/* Battery */}
            <div className="flex items-center mr-4">
              <div className="w-6 h-3 border border-gray-400 rounded-xs relative">
                <div
                  className={`absolute top-0 left-0 bottom-0 ${
                    batteryLevel > 20 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${batteryLevel}%` }}></div>
              </div>
              <span className="ml-1 text-xs">{batteryLevel}%</span>
            </div>

            {/* Date and time */}
            <div className="text-right">
              <div className="text-xs text-gray-300">{`${formattedDate}`}</div>
              <div className="text-xs">{formattedTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view - collapsed */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-2 py-2 bg-black/80 backdrop-blur-sm text-white border-b border-gray-800">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <img src="/logo.png" alt="Oinride" className="w-16" />
          </div>

          {/* Status in center */}
          <div
            className={`px-2 py-0.5 rounded-md text-xs ${statusColors[status]}`}>
            {status}
          </div>

          {/* Essential info */}
          <div className="flex items-center gap-2 text-xs">
            <div>{distance}</div>
            <div className="flex items-center">
              <div className="w-4 h-2 border border-gray-400 rounded-sm relative">
                <div
                  className={`absolute top-0 left-0 bottom-0 ${
                    batteryLevel > 20 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${batteryLevel}%` }}></div>
              </div>
              <span className="ml-1 text-xs">{batteryLevel}%</span>
            </div>
            {notifications > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications}
              </div>
            )}
            <button
              onClick={() => setExpandedMobile(!expandedMobile)}
              className="ml-1 p-1 rounded-full hover:bg-gray-800">
              {expandedMobile ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile expanded view */}
        {expandedMobile && (
          <div className="px-2 py-2 bg-black/80 backdrop-blur-sm text-white text-xs border-b border-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Running:</span> {runtime}
              </div>
              <div>
                <span className="text-gray-400">Lat:</span> {latitude}
              </div>
              <div>
                <span className="text-gray-400">Long:</span> {longitude}
              </div>
              <div>
                <span className="text-gray-400">Elev:</span> {elevation}
              </div>
              <div>
                <span className="text-gray-400">Temp:</span> {temperature}
              </div>
              <div>
                <span className="text-gray-400">Time:</span> {formattedTime}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TopHUD;
