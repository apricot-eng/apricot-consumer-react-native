/**
 * Location data structure used for saving and caching user locations
 */

export interface Coordinates {
  lat: number;
  long: number;
}

export interface Address {
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface NominatimMetadata {
  place_id?: string | null;
  osm_type?: string;
  osm_id?: number;
  display_name?: string;
}

export interface LocationData extends Coordinates, NominatimMetadata {
  address_components?: Address & {
    [key: string]: any;
  };
}
