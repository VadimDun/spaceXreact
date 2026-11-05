import { LaunchList } from "./launchList";
import { Map } from "./map";
import { useEffect, useMemo, useState } from "react";
import { SpaceX } from "../api/spacex";

function App() {
    const [launches, setLaunches] = useState([]);
    const [launchpads, setLaunchpads] = useState([]);
    const [selectedLaunchpadId, setSelectedLaunchpadId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const spacex = useMemo(() => new SpaceX(), []);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            spacex.launches(),
            spacex.launchpads()
        ])
            .then(([launchData, allPads]) => {
                if (cancelled) return;

                const usedPadIds = new Set(
                    launchData
                        .map(launch => launch.launchpad)
                        .filter(id => id !== null)
                        .map(String)
                );

                const usedPads = allPads.filter(
                    pad => usedPadIds.has(String(pad.id))
                );

                setLaunches(launchData);
                setLaunchpads(usedPads);
            })
            .catch(error => {
                console.error("Failed to load SpaceX data:", error);

                if (!cancelled) {
                    setError("Failed to load SpaceX data.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [spacex]);

    return (
        <main className="main">
            <LaunchList
                launches={launches}
                onLaunchHover={setSelectedLaunchpadId}
                loading={loading}
                error={error}
            />

            <Map
                launchpads={launchpads}
                selectedLaunchpadId={selectedLaunchpadId}
            />
        </main>
    );
}

export { App };
