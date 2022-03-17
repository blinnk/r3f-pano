import React, { useState, useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Canvas,
  extend,
  useThree,
  useFrame,
  useLoader,
  Dom
} from "react-three-fiber";
import "./styles.css";

extend({ OrbitControls });

const places = [
  // Photo by Bryan Goff on Unsplash
  { color: "green", position: [10, 0, -15], url: "/aurora.jpg", link: 1 },
  // Photo by Timothy Oldfield on Unsplash
  { color: "white", position: [0, 0, -15], url: "/docks.jpg", link: 0 }
];

function Controls(props) {
  const orbitRef = useRef();
  const { camera, gl } = useThree();

  useFrame(() => {
    orbitRef.current.update();
  });

  return (
    <orbitControls
      ref={orbitRef}
      target={[0, 0, 0]}
      args={[camera, gl.domElement]}
      {...props}
    />
  );
}

function Dome({ position, color, texture, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useEffect(
    () => void (document.body.style.cursor = hovered ? "pointer" : "auto"),
    [hovered]
  );

  return (
    <group>
      <mesh>
        <sphereBufferGeometry attach="geometry" args={[500, 60, 40]} />
        <meshBasicMaterial
          attach="material"
          map={texture}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh
        scale={hovered ? [1.5, 1.5, 1.5] : [1, 1, 1]}
        ref={ref}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry attach="geometry" args={[1, 30, 30]} />
        <meshBasicMaterial attach="material" color={color} />
      </mesh>
    </group>
  );
}

function Portals() {
  const [which, set] = useState(0);
  const { color, position, link } = places[which];
  const maps = useLoader(
    THREE.TextureLoader,
    places.map((place) => place.url)
  );
  return (
    <Dome
      onClick={() => set(link)}
      color={color}
      position={position}
      texture={maps[which]}
    />
  );
}

function Preload() {
  // This component pre-loads textures in order to lessen loading impact when clicking portals
  const { gl } = useThree();
  const maps = useLoader(
    THREE.TextureLoader,
    places.map((place) => place.url)
  );
  useEffect(() => maps.forEach(gl.initTexture), [maps, gl.initTexture]);
  return null;
}

export default function App() {
  return (
    <Canvas concurrent camera={{ position: [0, 0, 0.1] }}>
      <Controls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.2}
        autoRotate={false}
        rotateSpeed={-0.5}
      />
      <Suspense fallback={<Dom center>Loading...</Dom>}>
        <Preload />
        <Portals />
      </Suspense>
    </Canvas>
  );
}
