import { CylindricalScale } from "./CylindricalScale";

export function OKLCHReference({ scaleRadius, scaleHeight }: { scaleRadius: number; scaleHeight: number }) {
  return <CylindricalScale radialLabel="C" scaleRadius={scaleRadius} scaleHeight={scaleHeight} />;
}
