import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';
import './mapbox.css'
import {
  CBadge,
  CPopover,
} from '@coreui/react'

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dC0xMjMiLCJhIjoiY2treGZ1ZDE5MXlrZTJ2cDZib2U1djZlMiJ9.5GTBI6mCCRGkNvRw6Hixew';

const onlineNum = 21
const offlineNum = 10

const Map = () => {
  const mapContainer = useRef();
  const [lng, setLng] = useState(-97.57);
  const [lat, setLat] = useState(38.46);
  const [zoom, setZoom] = useState(3);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/matt-123/ckkyvk8t707y617peqpfmfp73',
      center: [lng, lat],
      zoom: zoom
    });

    map.on('load', () => {
      map.resize();
    })

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(2));
      setLat(map.getCenter().lat.toFixed(2));
      setZoom(map.getZoom().toFixed(2));
    });

    map.on('click', function(e) {
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['silicon-valley'] // replace this with the name of the layer
      });

      if (!features.length) {
          return;
      }

      var feature = features[0];

      var popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setLngLat(feature.geometry.coordinates)
          .setHTML('<h3>' + feature.properties.title + '</h3><p>' + feature.properties.description + '</p>')
          .addTo(map);
    });
            
    return () => map.remove();
  }, []);

  return (
    <div>
      <div className="legend">
        <CBadge className="mr-1" color="success">{onlineNum}</CBadge>
        <CBadge className="mr-1" color="secondary">{offlineNum}</CBadge>
      </div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
};

export default Map