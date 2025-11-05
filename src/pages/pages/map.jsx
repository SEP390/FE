import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import {createControlComponent} from '@react-leaflet/core';
import dormIcon from "../../assets/images/dormimg1.png"
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card} from "antd";
import {useRef} from "react";
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

let DormIcon = L.icon({
    iconUrl: dormIcon,
    iconSize: [25, 25],
    iconAnchor: [12, 12]
})

L.Marker.prototype.options.icon = DefaultIcon;

const createRoutineMachineLayer = ({ startPoint, endPoint }) => {
    return L.Routing.control({
        waypoints: [
            L.latLng(21.013516, 105.527024),
            L.latLng(endPoint[0], endPoint[1])
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: true,
        lineOptions: {
            styles: [{color: '#6FA1EC', weight: 4}]
        },
        show: false, // Show the instructions panel
        addWaypoints: false, // Don't let users add more stops
        draggableWaypoints: false // Don't let users drag the markers
    });
};

// 2. Wrap the creation function in a component using createControlComponent
const RoutingMachine = createControlComponent(createRoutineMachineLayer);

const dorms = [
    {
        title: "Dorm A",
        position: [21.013160, 105.525522]
    },
    {
        title: "Dorm B",
        position: [21.012853, 105.525787]
    },
    {
        title: "Dorm C",
        position: [21.012671, 105.525117]
    },
]

function DormMarker({ title, position }) {
    const marker = useRef();
    return (
        <Marker ref={marker} position={position} icon={DormIcon}>
            <Popup>{title}</Popup>
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
            {dorms.map(({ title, position }) => <DormMarker key={title} position={position} title={title} />)}
            <RoutingMachine startPoint={dorms[0].position} endPoint={dorms[2].position} />
        </MapContainer>
    );
}
export default function MapPage() {
    return <>
        <AppLayout activeSidebar={"map"}>
            <Card title={"Bản đồ trường học"} className={"!h-full !box-border"}>
                <OpenStreetMap />
            </Card>
        </AppLayout>
    </>
}