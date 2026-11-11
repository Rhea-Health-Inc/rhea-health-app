const CDN = "https://images.unsplash.com";
const q = "auto=format&fit=crop&w=240&h=240&q=80&crop=faces";

export const PORTRAITS = {
  drChen: `${CDN}/photo-1559839734-2b71ea197ec2?${q}`,
  drOkafor: `${CDN}/photo-1612349317150-e413f6a5b16d?${q}`,
  nurseRivera: `${CDN}/photo-1594824476967-48c8b964273f?${q}`,
  drLindqvist: `${CDN}/photo-1651008376811-b90baee60c1f?${q}`,
  drAmari: `${CDN}/photo-1537368910025-700350fe46c7?${q}`,
  drMoreau: `${CDN}/photo-1622253692010-333f2da6031d?${q}`,
};

type P = { src: string; name: string; role: string };

export function Portrait({
  src,
  alt,
  size = 56,
  ring = true,
  className = "",
}: {
  src: string;
  alt: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full overflow-hidden bg-muted ${
        ring ? "ring-4 ring-background shadow-[var(--shadow-clinik)]" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
    </span>
  );
}

export function TeamRow({ people }: { people: P[] }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {people.map((p) => (
        <div key={p.name} className="flex items-center gap-3">
          <Portrait src={p.src} alt={p.name} size={44} />
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-foreground">{p.name}</div>
            <div className="text-[13px] text-muted-foreground">{p.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
