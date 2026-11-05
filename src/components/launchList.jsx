function LaunchList({ launches, onLaunchHover, loading, error }) {
    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>

            <div id="listContainer">
                {loading && <p>Loading launches...</p>}

                {error && <p>{error}</p>}

                <ul>
                    {launches.map(launch => (
                        <li key={launch.id}>
                            <button
                                className="launch-item"
                                type="button"
                                onMouseEnter={() => onLaunchHover(launch.launchpad)}
                                onMouseLeave={() => onLaunchHover(null)}
                                onFocus={() => onLaunchHover(launch.launchpad)}
                                onBlur={() => onLaunchHover(null)}
                            >
                                {launch.name}
                                <small>{launch.padName}</small>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export { LaunchList };