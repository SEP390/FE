import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import dormIcon from "../../assets/images/dormimg1.png"
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {MapContainer, Marker, Popup, SVGOverlay, TileLayer, useMap} from 'react-leaflet';
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card} from "antd";
import {useEffect, useRef, useState} from "react";
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import {create} from 'zustand'
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {RequireRole} from "../../components/authorize/RequireRole.jsx";

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
    slot: null,
    setSlot: (slot) => set({slot}),
    startPoint: [21.013516, 105.527024],
    endPoint: null,
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

function CurrentLocationMarker() {
    const setStartPoint = useWaypointsStore(state => state.setStartPoint);
    const map = useMap();
    const [position, setPosition] = useState(null);

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            const {lat, lng} = e.latlng;
            setPosition(e.latlng);
            setStartPoint([lat, lng]);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon}>
            <Popup>
                You are here. <br/>
            </Popup>
        </Marker>
    );
}

function RoutingComponent(props) {
    return L.Routing.control({});
}

function RoutingMachine() {
    const startPoint = useWaypointsStore(state => state.startPoint);
    const endPoint = useWaypointsStore(state => state.endPoint);
    const setStartPoint = useWaypointsStore(state => state.setStartPoint);
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
                    L.latLng(startPoint[0], startPoint[1]),
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
    }, [map, startPoint, endPoint, controlRef, setStartPoint]);
    return null;
}

function DormMarker({title, position}) {
    const {slot} = useWaypointsStore()
    const dormName = slot?.room?.dorm?.dormName;
    return (
        <Marker position={position} icon={DormIcon}>
            <Popup>
                <div className={"flex flex-col gap-2"}>
                    <div className={"!font-medium text-lg"}>{title}</div>
                    {title === dormName && (
                        <>
                            <div>
                                <div className={"font-bold"}>Phòng của bạn</div>
                                <div>Phòng: {slot?.room?.roomNumber}</div>
                                <div>Giường: {slot?.slotName}</div>
                            </div>
                        </>
                    )}
                </div>
            </Popup>
        </Marker>
    )
}

function SVGLayer() {
    return <>
        <SVGOverlay bounds={[
            [17.454, 110.720],
            [15.069, 115.521]
        ]}>
            <rect x="0" y="0" width="100%" height="100%" fill={"rgba(0,0,0,0)"}/>
            <svg viewBox="0 0 480 238" width="100%" height="100%">
                <polygon points="50,0 200,0 440,100 440 200 400 230 0 230" fill="rgba(0, 0, 0, 0.4)" stroke={"red"}></polygon>
                <text fill={"white"} fontSize={30} x="10%" y="50%">
                    Hoàng sa (Việt Nam)
                </text>
            </svg>
        </SVGOverlay>
        <SVGOverlay bounds={[
            [11.99, 111.16],
            [6.61, 117.14]
        ]}>
            <rect x="0" y="0" width="100%" height="100%" fill={"rgba(0,0,0,0)"}/>
            <svg viewBox="0 0 500 500" width="100%" height="100%">
                <polygon points="0,250 250,0 500,100 500,250 240,470 0,400" fill="rgba(0, 0, 0, 0.4)" stroke={"red"}></polygon>
                <text fill={"white"} fontSize={30} x="10%" y="50%">
                    Trường sa (Việt Nam)
                </text>
            </svg>
        </SVGOverlay>
    </>
}

function OpenStreetMap() {
    const {startPoint, endPoint, setEndPoint, setSlot} = useWaypointsStore()
    const {data} = useQuery({
        queryKey: ["current-slot"],
        queryFn: () => axiosClient.get("/slots/current").then(res => res.data)
    })


    useEffect(() => {
        if (data) {
            const dormName = data.room.dorm.dormName;
            const dorm = dorms.find(d => d.title === dormName)
            if (dorm) {
                setEndPoint(dorm.position)
                setSlot(data)
            }
        }
    }, [data, setEndPoint, setSlot]);
    const position = [21.012745, 105.525717];
    return (
        <MapContainer
            center={position}
            zoom={18}
            style={{height: '500px', width: '100%'}}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {dorms.map(({title, position}) => <DormMarker key={title} position={position} title={title}/>)}
            {startPoint && endPoint && <RoutingMachine/>}
            <CurrentLocationMarker/>
            <SVGLayer />
        </MapContainer>
    );
}

export default function MapPage() {
    return <>
            <Card title={"Bản đồ trường học"} className={"!h-full !box-border"}>
                <OpenStreetMap/>
            </Card>
    </>
}
