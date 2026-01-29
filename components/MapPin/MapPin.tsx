import React from 'react';
import {
  Images,
  ShapeSource,
  SymbolLayer
} from '@maplibre/maplibre-react-native';
import GeoJSON from 'geojson';

interface MapPinProps {
  id: string;
  coordinate: [number, number];
  pinImage: any; // Image source
}

export const MapPin: React.FC<MapPinProps> = ({ id, coordinate, pinImage }) => {
  return (
    <React.Fragment key={id}>
      <Images images={pinImage} />
      <ShapeSource
        id={`${id}-shape`}
        shape={{
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: id,
              geometry: {
                type: 'Point',
                coordinates: coordinate,
              },
              properties: {},
            } as GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>,
          ],
        }}
      >
        <SymbolLayer
          id={`${id}-symbols`}
          style={{ iconImage: pinImage, iconSize: 0.3, iconAllowOverlap: true }}
        />
      </ShapeSource>
    </React.Fragment>
  );
};
