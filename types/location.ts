/**
 * Location data structure used for saving and caching user locations
 */
export interface LocationData {
  lat: number;
  long: number;
  place_id?: string | null;
  display_name?: string;
  address_components?: {
    neighbourhood?: string;
    city?: string;
    [key: string]: any;
  };
}
