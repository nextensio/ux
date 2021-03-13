import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
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

const healthyNum = 21
const overworkedNum = 10
const compromisedNum = 3

const Map = () => {
  const mapContainer = useRef();
  const [lng, setLng] = useState(-122.0820);
  const [lat, setLat] = useState(37.3685);
  const [zoom, setZoom] = useState(8.47);

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
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
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
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className="legend">
        <CBadge className="mr-1" color="success">{healthyNum}</CBadge>
        <CBadge className="mr-1" color="warning">{overworkedNum}</CBadge>
        <CBadge className="mr-1" color="danger">{compromisedNum}</CBadge>
      </div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
};

export default Map