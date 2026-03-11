import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface RadarDataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

function RadarShape({ data, color }: { data: RadarDataPoint[]; color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const n = data.length;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const { shape, gridLines, axes, labels } = useMemo(() => {
    const radius = 2.2;
    const angleStep = (Math.PI * 2) / n;

    // Build the filled radar shape
    const shapePoints: THREE.Vector3[] = [];
    data.forEach((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (d.score / 100) * radius;
      shapePoints.push(new THREE.Vector3(Math.cos(angle) * r, 0.05, Math.sin(angle) * r));
    });

    const shapeGeom = new THREE.BufferGeometry();
    const vertices: number[] = [];
    for (let i = 1; i < shapePoints.length - 1; i++) {
      vertices.push(shapePoints[0].x, shapePoints[0].y, shapePoints[0].z);
      vertices.push(shapePoints[i].x, shapePoints[i].y, shapePoints[i].z);
      vertices.push(shapePoints[i + 1].x, shapePoints[i + 1].y, shapePoints[i + 1].z);
    }
    shapeGeom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    shapeGeom.computeVertexNormals();

    // Grid rings
    const gridRings = [0.25, 0.5, 0.75, 1.0];
    const gridLinePoints: THREE.Vector3[][] = gridRings.map((pct) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= n; i++) {
        const angle = (i % n) * angleStep - Math.PI / 2;
        const r = pct * radius;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
      }
      return pts;
    });

    // Axis lines
    const axisLines: THREE.Vector3[][] = data.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
      ];
    });

    // Label positions
    const labelPositions = data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius + 0.45;
      return { text: d.subject, position: [Math.cos(angle) * r, 0.1, Math.sin(angle) * r] as [number, number, number] };
    });

    return { shape: shapeGeom, gridLines: gridLinePoints, axes: axisLines, labels: labelPositions };
  }, [data, n]);

  // Build edge line for the radar shape
  const edgePoints = useMemo(() => {
    const radius = 2.2;
    const angleStep = (Math.PI * 2) / n;
    const pts: THREE.Vector3[] = [];
    data.forEach((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (d.score / 100) * radius;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, 0.06, Math.sin(angle) * r));
    });
    if (pts.length > 0) pts.push(pts[0].clone());
    return pts;
  }, [data, n]);

  // Score pillars
  const pillars = useMemo(() => {
    const radius = 2.2;
    const angleStep = (Math.PI * 2) / n;
    return data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (d.score / 100) * radius;
      const height = (d.score / 100) * 0.8;
      return {
        position: [Math.cos(angle) * r, height / 2, Math.sin(angle) * r] as [number, number, number],
        height,
        score: d.score,
      };
    });
  }, [data, n]);

  return (
    <group ref={meshRef}>
      {/* Grid rings */}
      {gridLines.map((pts, i) => (
        <line key={`grid-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pts.length}
              array={new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#555" transparent opacity={0.3} />
        </line>
      ))}

      {/* Axis lines */}
      {axes.map((pts, i) => (
        <line key={`axis-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#666" transparent opacity={0.4} />
        </line>
      ))}

      {/* Filled radar area */}
      <mesh geometry={shape}>
        <meshStandardMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Radar edge line */}
      {edgePoints.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={edgePoints.length}
              array={new Float32Array(edgePoints.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} linewidth={2} />
        </line>
      )}

      {/* Score pillars at vertices */}
      {pillars.map((p, i) => (
        <mesh key={`pillar-${i}`} position={p.position}>
          <cylinderGeometry args={[0.06, 0.06, p.height, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Vertex spheres */}
      {pillars.map((p, i) => (
        <mesh key={`sphere-${i}`} position={[p.position[0], p.height, p.position[2]]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <Text
          key={`label-${i}`}
          position={l.position}
          fontSize={0.22}
          color="#999"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {l.text}
        </Text>
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[2.8, 64]} />
        <meshStandardMaterial color="#111" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default function RubricRadar3D({
  data,
  color = "#6366f1",
}: {
  data: RadarDataPoint[];
  color?: string;
}) {
  if (!data.length) return null;

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 4, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <pointLight position={[-3, 4, -3]} intensity={0.3} color="#6366f1" />
        <RadarShape data={data} color={color} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
