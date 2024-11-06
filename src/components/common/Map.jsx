/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "../../css/Leaflet.css"
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { markerIcon } from "../../utils/data";

const mapURL = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
const defaultPosition = [10.8751292, 106.8006254];

function RoutingMachine({ suggestion, autoSetDistance }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (map && suggestion.form && suggestion.to) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(suggestion.form),
          L.latLng(suggestion.to),
        ],
        lineOptions: {
          styles: [{ color: "none", weight: 4 }],
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
      }).addTo(map);

      routingControlRef.current.on("routesfound", function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        autoSetDistance((summary.totalDistance / 1000).toFixed(2));
      });
    }

    return () => {
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, suggestion, autoSetDistance]);

  return null;
}

export default function DeliveryMap({ suggestion, autoSetDistance }) {
  const [distance, setDistance] = useState(null);

  const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={suggestion?.form ? suggestion.form : defaultPosition}
        zoom={16}
        style={{
          height: "95vh",
          width: "100%",
        }}
      >
        <TileLayer url={mapURL} />
        <Marker position={suggestion?.form ? suggestion.form : defaultPosition} icon={customIcon}>
          {/* <Popup>Chiều đi: {fromAddress}</Popup> */}
        </Marker>
        <Marker position={suggestion?.to ? suggestion.to : defaultPosition} icon={customIcon}>
          {/* <Popup>Chiều về: {toAddress}</Popup> */}
        </Marker>
        <RoutingMachine suggestion={suggestion} autoSetDistance={autoSetDistance} />
      </MapContainer>

      {distance && (
        <p className="distance">Khoảng cách giữa hai điểm: {distance} km</p>
      )}
    </div>
  );
}
