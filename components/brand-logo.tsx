import Image from "next/image";
import { configuracion } from "@/utils/configuracion";

export function BrandLogo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <picture className="inline-flex shrink-0">
      <source media="(min-width: 640px)" srcSet="/beemo_negro_solo_nombre.png" />
      <Image
        src="/beemo_negro_solo_nombre_200x200.png"
        width={200}
        height={200}
        alt={configuracion.nameCompany}
        unoptimized
        className={`${className} object-cover ${inverted ? "brightness-0 invert" : ""}`}
      />
    </picture>
  );
}