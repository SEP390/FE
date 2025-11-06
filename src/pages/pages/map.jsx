import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import dormIcon from "../../assets/images/dormimg1.png"
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {MapContainer, Marker, TileLayer, useMap} from 'react-leaflet';
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card} from "antd";
import {useEffect, useRef} from "react";
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import {create} from 'zustand'

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
    {
        title: "Dorm D",
        position: [21.012351, 105.525374]
    },
    {
        title: "Dorm E",
        position: [21.012737, 105.523633]
    },
    {
        title: "Dorm F",
        position: [21.012421, 105.523896]
    },
    {
        title: "Dorm G",
        position: [21.012514, 105.523027]
    },
    {
        title: "Dorm H",
        position: [21.012201, 105.523325]
    }
]

const useWaypointsStore = create(set => ({
    startPoint: [21.013516, 105.527024],
    endPoint: dorms[2].position,
    setStartPoint: (startPoint) => set({startPoint}),
    setEndPoint: (endPoint) => set({endPoint}),
}))

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

function RoutingMachine() {
    const startPoint = useWaypointsStore(state => state.startPoint);
    const endPoint = useWaypointsStore(state => state.endPoint);
    const map = useMap();
    const controlRef = useRef();
    useEffect(() => {
        if (controlRef.current) {
            controlRef.current.setWaypoints([
                L.latLng(startPoint[0], startPoint[1]),
                L.latLng(endPoint[0], endPoint[1]),
            ]);
        } else {
            controlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(),
                    L.latLng(endPoint[0], endPoint[1])
                ],
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1'
                }),
                routeWhileDragging: true,
                lineOptions: {
                    styles: [{color: '#6FA1EC', weight: 4}]
                },
                show: true, // Show the instructions panel
                addWaypoints: false, // Don't let users add more stops
                draggableWaypoints: false // Don't let users drag the markers
            }).addTo(map);
        }
    }, [map, startPoint, endPoint, controlRef]);
    return null;
}

function DormMarker({title, position}) {
    const marker = useRef();
    const setEndPoint = useWaypointsStore(state => state.setEndPoint);
    const eventHandlers = {
        click: (event) => {
            const {lat, lng} = event.latlng;
            setEndPoint([lat, lng]);
        }
    }
    return (
        <Marker eventHandlers={eventHandlers} ref={marker} position={position} icon={DormIcon}>
        </Marker>
    )
}

function OpenStreetMap() {
    const position = [21.012745, 105.525717];
    return (
        <MapContainer
            center={position}
            zoom={18}
            style={{height: '500px', width: '100%'}}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {dorms.map(({title, position}) => <DormMarker key={title} position={position} title={title}/>)}
            <RoutingMachine />
        </MapContainer>
    );
}

export default function MapPage() {
    return <>
        <AppLayout activeSidebar={"map"}>
            <Card title={"Bản đồ trường học"} className={"!h-full !box-border"}>
                <OpenStreetMap/>
            </Card>
        </AppLayout>
    </>
}
