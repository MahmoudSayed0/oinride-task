import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  cameraPosition?: [number, number, number];
  joystickLeft?: { x: number; y: number };
  joystickRight?: { x: number; y: number };
  pitch?: number;
  heading?: number;
  zoomLevel?: number;
  lights?: {
    light: boolean;
    spotLight: boolean;
    laser: boolean;
  };
  onPositionUpdate?: (data: {
    distance: number;
    latitude: number;
    longitude: number;
    elevation: number;
  }) => void;
  resetCamera: boolean;
}

// Movement indicator component
const MovementIndicator = ({ position, active, axis }) => {
  const color = active ? "#F59E0B" : "#9CA3AF";
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Tunnel: React.FC<{
  joystickLeft?: { x: number; y: number };
  joystickRight?: { x: number; y: number };
  pitch?: number;
  heading?: number;
  zoomLevel?: number;
  lights?: {
    light: boolean;
    spotLight: boolean;
    laser: boolean;
  };
  onPositionUpdate?: (data: {
    distance: number;
    latitude: number;
    longitude: number;
    elevation: number;
  }) => void;
  resetCamera?: boolean;
}> = ({
  joystickLeft,
  joystickRight,
  pitch,
  heading,
  zoomLevel = 1,
  lights,
  onPositionUpdate,
  resetCamera,
}) => {
  const tunnelRef = useRef<THREE.Mesh>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const startPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 10));
  const [indicators, setIndicators] = useState({
    left: false,
    right: false,
    forward: false,
    backward: false,
    up: false,
    down: false,
  });

  // Apply zoom level to camera
  useEffect(() => {
    if (cameraRef.current) {
      // Adjust field of view based on zoom level
      // Lower FOV = more zoom in, Higher FOV = more zoom out
      const baseFOV = 75;
      const newFOV = baseFOV / zoomLevel;
      cameraRef.current.fov = newFOV;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [zoomLevel]);

  // Define a dead zone to prevent small movements from affecting the scene
  const applyDeadZone = (value, threshold = 0.1) => {
    return Math.abs(value) < threshold ? 0 : value;
  };

  // Calculate simulated GPS coordinates based on position
  const calculateGPSCoordinates = (position: THREE.Vector3) => {
    // Base coordinates (simulated starting point)
    const baseLatitude = 60.2828; // 60°16'58" N
    const baseLongitude = 25.0267; // 25°01'96" E

    // Calculate distance from start
    const distance = position.distanceTo(startPositionRef.current);

    // Convert 3D position to GPS coordinates (simplified model)
    // In a real app, this would use proper geospatial calculations
    const latOffset = position.z * 0.0001; // North/South movement affects latitude
    const longOffset = position.x * 0.0001; // East/West movement affects longitude
    const elevation = position.y * 10; // Height in meters

    return {
      distance,
      latitude: baseLatitude + latOffset,
      longitude: baseLongitude + longOffset,
      elevation: 127 + elevation, // Base elevation + current height
    };
  };

  useFrame(() => {
    if (tunnelRef.current && cameraRef.current) {
      // Right joystick controls camera rotation AND can affect movement
      if (joystickRight) {
        // Apply dead zone to joystick values
        const rotX = applyDeadZone(joystickRight.x);
        const rotY = applyDeadZone(joystickRight.y);

        // Camera rotation (look around)
        if (rotX !== 0) {
          // Rotate camera horizontally (heading)
          cameraRef.current.rotation.y -= rotX * 0.02; // Inverted to make right movement rotate right
        }

        if (rotY !== 0) {
          // Rotate camera vertically (pitch)
          cameraRef.current.rotation.x = THREE.MathUtils.clamp(
            cameraRef.current.rotation.x - rotY * 0.02,
            -Math.PI / 3, // -60 degrees
            Math.PI / 3 // 60 degrees
          );
        }

        // Update left/right indicators for camera rotation
        setIndicators((prev) => ({
          ...prev,
          left: joystickRight.x < -0.2,
          right: joystickRight.x > 0.2,
        }));

        // Right joystick can also affect forward/backward movement
        const speed = 0.05; // Half the speed of the left joystick
        const moveY = applyDeadZone(-joystickRight.y); // Forward/backward from right joystick

        if (moveY !== 0) {
          // Calculate forward/backward movement based on camera rotation
          const angle = cameraRef.current.rotation.y;
          const moveXPos = Math.sin(angle) * moveY * speed;
          const moveZPos = Math.cos(angle) * moveY * speed;

          // Apply forward/backward movement
          cameraRef.current.position.x += moveXPos;
          cameraRef.current.position.z -= moveZPos;

          // Update forward/backward indicators
          setIndicators((prev) => ({
            ...prev,
            forward: prev.forward || joystickRight.y < -0.2,
            backward: prev.backward || joystickRight.y > 0.2,
          }));
        }
      }

      // Left joystick controls movement (forward/backward/strafe)
      if (joystickLeft) {
        const speed = 0.1;

        // Apply dead zone to joystick values
        const moveY = applyDeadZone(-joystickLeft.y); // Invert Y axis for intuitive forward/backward
        const moveX = applyDeadZone(joystickLeft.x); // Don't invert X axis for strafe

        if (moveY !== 0) {
          // Calculate forward/backward movement based on camera rotation
          const angle = cameraRef.current.rotation.y;
          const moveXPos = Math.sin(angle) * moveY * speed;
          const moveZPos = Math.cos(angle) * moveY * speed;

          // Apply forward/backward movement
          cameraRef.current.position.x += moveXPos;
          cameraRef.current.position.z -= moveZPos;
        }

        if (moveX !== 0) {
          // Calculate strafe movement (perpendicular to forward direction)
          const angle = cameraRef.current.rotation.y;
          const moveXPos = Math.sin(angle + Math.PI / 2) * moveX * speed;
          const moveZPos = Math.cos(angle + Math.PI / 2) * moveX * speed;

          // Apply strafe movement
          cameraRef.current.position.x += moveXPos;
          cameraRef.current.position.z -= moveZPos;

          // Left joystick can also affect camera rotation slightly
          cameraRef.current.rotation.y -= moveX * 0.01; // Slight rotation when strafing
        }

        // Update movement indicators
        setIndicators((prev) => ({
          ...prev,
          forward: joystickLeft.y < -0.2, // Push up to move forward
          backward: joystickLeft.y > 0.2, // Pull down to move backward
          left: joystickLeft.x < -0.2, // Push left to strafe left
          right: joystickLeft.x > 0.2, // Push right to strafe right
        }));
      }

      // Update position data
      if (onPositionUpdate && cameraRef.current) {
        const positionData = calculateGPSCoordinates(
          cameraRef.current.position
        );
        onPositionUpdate(positionData);
      }
    }
  });

  const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 32, 32, true);
  const tunnelMaterial = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    roughness: 0.8,
    metalness: 0.2,
    color: 0xe5e7eb, // Light gray color
    wireframe: true, // Show grid lines
  });

  // Grid texture for the tunnel floor
  const gridTexture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/grid.png"
  );
  gridTexture.wrapS = THREE.RepeatWrapping;
  gridTexture.wrapT = THREE.RepeatWrapping;
  gridTexture.repeat.set(100, 100);

  useEffect(() => {
    if (resetCamera && cameraRef.current) {
      // Reset camera position to starting position
      cameraRef.current.position.set(0, 2, 10);

      // Reset camera rotation
      cameraRef.current.rotation.set(0, 0, 0);

      // Update the start position reference
      startPositionRef.current = new THREE.Vector3(0, 2, 10);
    }
  }, [resetCamera]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 2, 10]}
        fov={75}
      />
      <mesh
        ref={tunnelRef}
        geometry={tunnelGeometry}
        material={tunnelMaterial}
        rotation={[0, 0, Math.PI / 2]}
      />

      {/* Floor with grid texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#FFFFFF" map={gridTexture} />
      </mesh>

      {/* Movement indicators */}
      <group position={[0, 0, -3]}>
        <MovementIndicator
          position={[-0.5, 0, 0]}
          active={indicators.left}
          axis="left"
        />
        <MovementIndicator
          position={[0.5, 0, 0]}
          active={indicators.right}
          axis="right"
        />
        <MovementIndicator
          position={[0, 0.5, 0]}
          active={indicators.up}
          axis="up"
        />
        <MovementIndicator
          position={[0, -0.5, 0]}
          active={indicators.down}
          axis="down"
        />
        <MovementIndicator
          position={[0, 0, -0.5]}
          active={indicators.forward}
          axis="forward"
        />
        <MovementIndicator
          position={[0, 0, 0.5]}
          active={indicators.backward}
          axis="backward"
        />
      </group>
    </>
  );
};

const Scene3D: React.FC<Scene3DProps> = ({
  cameraPosition = [0, 0, 5],
  joystickLeft = { x: 0, y: 0 },
  joystickRight = { x: 0, y: 0 },
  pitch = 0,
  heading = 0,
  zoomLevel = 1,
  lights = { light: false, spotLight: false, laser: false },
  onPositionUpdate,
  resetCamera,
}) => {
  return (
    <Canvas
      className="w-full h-full"
      onCreated={({ gl, events }) => {
        // Disable all mouse controls
        events.connect = () => {}; // Disable default event handlers
      }}
      camera={{ manual: true }} // Prevent auto camera controls
    >
      <color attach="background" args={["#111111"]} />
      <Tunnel
        joystickLeft={joystickLeft}
        joystickRight={joystickRight}
        pitch={pitch}
        heading={heading}
        zoomLevel={zoomLevel}
        lights={lights}
        onPositionUpdate={onPositionUpdate}
        resetCamera={resetCamera}
      />

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.2} />

      <fog attach="fog" args={["#111111", 5, 50]} />
    </Canvas>
  );
};

export default Scene3D;
