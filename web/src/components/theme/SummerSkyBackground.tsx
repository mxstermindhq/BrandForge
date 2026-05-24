"use client";

type CloudSpec = {
  id: string;
  top: string;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
  layer: "far" | "mid" | "near";
};

const CLOUDS: CloudSpec[] = [
  { id: "c1", top: "6%", scale: 0.85, duration: 140, delay: 0, opacity: 0.55, layer: "far" },
  { id: "c2", top: "14%", scale: 1.1, duration: 110, delay: -35, opacity: 0.65, layer: "far" },
  { id: "c3", top: "22%", scale: 0.75, duration: 95, delay: -12, opacity: 0.5, layer: "far" },
  { id: "c4", top: "10%", scale: 1.25, duration: 88, delay: -48, opacity: 0.78, layer: "mid" },
  { id: "c5", top: "28%", scale: 1, duration: 72, delay: -22, opacity: 0.82, layer: "mid" },
  { id: "c6", top: "38%", scale: 1.35, duration: 64, delay: -58, opacity: 0.88, layer: "mid" },
  { id: "c7", top: "18%", scale: 1.5, duration: 52, delay: -8, opacity: 0.92, layer: "near" },
  { id: "c8", top: "32%", scale: 1.15, duration: 46, delay: -30, opacity: 0.9, layer: "near" },
  { id: "c9", top: "48%", scale: 1.65, duration: 58, delay: -44, opacity: 0.85, layer: "near" },
  { id: "c10", top: "55%", scale: 0.95, duration: 80, delay: -18, opacity: 0.7, layer: "mid" },
  { id: "c11", top: "62%", scale: 1.2, duration: 100, delay: -62, opacity: 0.6, layer: "far" },
  { id: "c12", top: "72%", scale: 1.4, duration: 68, delay: -26, opacity: 0.75, layer: "near" },
];

function CloudShape({ scale }: { scale: number }) {
  const s = scale;
  return (
    <div className="summer-cloud-shape" style={{ transform: `scale(${s})` }}>
      <span className="summer-cloud-puff summer-cloud-puff-a" />
      <span className="summer-cloud-puff summer-cloud-puff-b" />
      <span className="summer-cloud-puff summer-cloud-puff-c" />
      <span className="summer-cloud-puff summer-cloud-puff-d" />
    </div>
  );
}

export function SummerSkyBackground() {
  return (
    <div className="summer-sky-root" aria-hidden>
      <div className="summer-sky-gradient" />
      <div className="summer-sky-haze" />
      <div className="summer-sun" />
      <div className="summer-sun-rays" />
      {CLOUDS.map((cloud) => (
        <div
          key={cloud.id}
          className={`summer-cloud-track summer-cloud-track--${cloud.layer}`}
          style={{
            top: cloud.top,
            opacity: cloud.opacity,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <CloudShape scale={cloud.scale} />
        </div>
      ))}
    </div>
  );
}
