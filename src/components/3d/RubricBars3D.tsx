import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface BarDataPoint {
  name: string;
  score: number;
  lost: number;
}

function AnimatedBar({
  position,
  height,
  color,
  label,
  score,
  index,
}: {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  score: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = Math.max(height, 0.05);

  return (
    <group position={position}>
      {/* Score bar */}
      <RoundedBox
        ref={meshRef}
        args={[0.6, targetHeight, 0.6]}
        radius={0.06}
        smoothness={4}
        position={[0, targetHeight / 2, 0]}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.85}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Lost portion (ghost bar on top) */}
      {height < 3 && (
        <RoundedBox
          args={[0.6, 3 - targetHeight, 0.6]}
          radius={0.06}
          smoothness={4}
          position={[0, targetHeight + (3 - targetHeight) / 2, 0]}
        >
          <meshStandardMaterial
            color="#ef4444"
            transparent
            opacity={0.08}
            roughness={0.5}
          />
        </RoundedBox>
      )}

      {/* Score text on top */}
      <Text
        position={[0, Math.max(targetHeight + 0.25, 0.4), 0]}
        fontSize={0.22}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {Math.round(score)}
      </Text>

      {/* Label below */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.16}
        color="#888"
        anchorX="center"
        anchorY="middle"
        maxWidth={1}
      >
        {label}
      </Text>
    </group>
  );
}

function BarScene({ data, color }: { data: BarDataPoint[]; color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const bars = useMemo(() => {
    const spacing = 1.1;
    const totalWidth = (data.length - 1) * spacing;
    return data.map((d, i) => ({
      position: [i * spacing - totalWidth / 2, 0, 0] as [number, number, number],
      height: (d.score / 100) * 3,
      label: d.name,
      score: d.score,
    }));
  }, [data]);

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <AnimatedBar
          key={bar.label}
          position={bar.position}
          height={bar.height}
          color={color}
          label={bar.label}
          score={bar.score}
          index={i}
        />
      ))}

      {/* Ground grid */}
      <gridHelper args={[8, 8, "#333", "#222"]} position={[0, -0.01, 0]} />
    </group>
  );
}

export default function RubricBars3D({
  data,
  color = "#6366f1",
}: {
  data: BarDataPoint[];
  color?: string;
}) {
  if (!data.length) return null;

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 4, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={0.7} />
        <pointLight position={[-3, 4, -3]} intensity={0.3} color="#6366f1" />
        <BarScene data={data} color={color} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={0.4}
          maxPolarAngle={Math.PI / 2.3}
        />
      </Canvas>
    </div>
  );
}
