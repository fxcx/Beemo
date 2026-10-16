export type BrandLogoProps = {
  className?: string;
  inverted?: boolean;
};

export type BrandLogo3DProps = BrandLogoProps & {
  size?: number;
  speed?: number;
  iconOnly?: boolean;
};

export type TesseractVertex = readonly [x: number, y: number, z: number, w: number];

export type TesseractEdge = readonly [start: number, end: number];

export type BrandLogo3DScene = {
  render: (
    projectionPhase: number,
    spinPhase: number,
    tiltX: number,
    tiltY: number,
  ) => void;
  dispose: () => void;
};
