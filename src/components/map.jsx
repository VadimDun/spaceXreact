import * as d3 from "d3";
import Geo from "../geo.json";
import { useEffect, useMemo, useRef } from "react";

function Map({ launchpads, selectedLaunchpadId }) {
    const width = 640;
    const height = 480;

    const margin = {
        top: 20,
        right: 10,
        bottom: 40,
        left: 100
    };

    const containerRef = useRef(null);

    const projection = useMemo(() => {
        return d3.geoMercator()
            .scale(100)
            .center([0, 20])
            .translate([width / 2, height / 2]);
    }, []);

    useEffect(() => {
        const container = d3.select(containerRef.current);

        container.selectAll("*").remove();

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const map = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const mapGroup = map.append("g");

        const path = d3.geoPath().projection(projection);

        mapGroup.append("g")
            .selectAll("path")
            .data(Geo.features)
            .enter()
            .append("path")
            .attr("class", "topo")
            .attr("d", path)
            .attr("fill", "#e4e9ed")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5);

        mapGroup.append("g")
            .attr("class", "launchpad-markers");

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", event => {
                mapGroup.attr("transform", event.transform);
            });

        svg.call(zoom);

        return () => {
            container.selectAll("*").remove();
        };
    }, [projection]);

    useEffect(() => {
        const markerLayer = d3.select(containerRef.current)
            .select(".launchpad-markers");

        if (markerLayer.empty()) return;

        const geoJSON = {
            type: "FeatureCollection",
            features: launchpads
                .filter(pad =>
                    Number.isFinite(Number(pad.latitude)) &&
                    Number.isFinite(Number(pad.longitude))
                )
                .map(pad => ({
                    type: "Feature",
                    properties: {
                        id: String(pad.id),
                        name: pad.name
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [
                            Number(pad.longitude),
                            Number(pad.latitude)
                        ]
                    }
                }))
        };

        const markers = markerLayer.selectAll("circle")
            .data(
                geoJSON.features,
                pad => pad.properties.id
            )
            .join("circle")
            .attr("class", pad =>
                pad.properties.id === String(selectedLaunchpadId)
                    ? "launchpad-marker active"
                    : "launchpad-marker"
            )
            .attr("cx", pad =>
                projection(pad.geometry.coordinates)[0]
            )
            .attr("cy", pad =>
                projection(pad.geometry.coordinates)[1]
            )
            .attr("r", pad =>
                pad.properties.id === String(selectedLaunchpadId) ? 8 : 4
            );

        markers.selectAll("title")
            .data(pad => [pad])
            .join("title")
            .text(pad => pad.properties.name);

    }, [launchpads, selectedLaunchpadId, projection]);

    return (
        <div className="content">
            <div className="map" ref={containerRef}></div>
        </div>
    );
}

export { Map };
