import { MetatronLogo3D } from "@/tools/logo/metatronLogo3D";
/**
 * Ícono 3D + nombre. El nombre queda quieto; solo el ícono se mueve.
 * Cambia `name` o reemplaza el <span> por tu imagen del nombre si prefieres.
 */
export function BrandLogo({
  className = "",
  inverted = false,
  size = 56,
  name = "Metatron",
}: {
  className?: string;
  inverted?: boolean;
  size?: number;
  name?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <MetatronLogo3D size={size} inverted={inverted} label="" />
      <span
        className={`font-semibold tracking-tight leading-none ${
          inverted ? "text-white" : "text-black"
        }`}
        style={{ fontSize: size * 0.5 }}
      >
        {name}
      </span>
    </span>
  );
}