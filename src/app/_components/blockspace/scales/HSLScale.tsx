import { CylindricalScale } from "./CylindricalScale";

export function HSLReference({ scaleRadius, scaleHeight }: { scaleRadius: number; scaleHeight: number }) {
  return <CylindricalScale radialLabel="S" scaleRadius={scaleRadius} scaleHeight={scaleHeight} />;
}
