import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {MapContainer, Marker, Popup, TileLayer, useMapEvents} from 'react-leaflet';
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card} from "antd";
import {useRef, useState} from "react";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function DormMarker({ data }) {
    const marker = useRef();

    return (
        <Marker ref={marker} position={data.position}>
            <Popup>{data.name}</Popup>
        </Marker>
    )
}

function OpenStreetMap() {
    const position = [21.012745, 105.525717];
    return (
        <MapContainer
            center={position}
            zoom={18}
            style={{ height: '500px', width: '100%' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
    );
}
export default function MapPage() {
    return <>
        <AppLayout>
            <Card title={"Bản đồ trường học"} className={"!h-full !box-border"}>
                <OpenStreetMap />
            </Card>
        </AppLayout>
    </>
}