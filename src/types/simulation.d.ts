export interface PValueDist {
  controlHazardDist: Float64Array;
  treatHazardDist: Float64Array;
  pValueDist: Float64Array;
  rmstPValueDist?: Float64Array;
}
