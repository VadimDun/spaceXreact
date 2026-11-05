class SpaceX{

    constructor(baseUrl = "https://lldev.thespacedevs.com/2.3.0/") {
        this.baseUrl = baseUrl;
        this.pendingRequests = new Map();
    }

    async request(url) {
        const fullUrl = url.startsWith("http")
            ? url
            : new URL(url, this.baseUrl).toString();

        const cacheKey = `ll2-cache:${fullUrl}`;

        try {
            const saved = sessionStorage.getItem(cacheKey);

            if (saved) {
                const cached = JSON.parse(saved);

                if (Date.now() - cached.savedAt < 60 * 60 * 1000) {
                    return cached.data;
                }
            }
        } catch (error) {
            console.warn("Cache read failed:", error);
        }

        if (this.pendingRequests.has(fullUrl)) {
            return this.pendingRequests.get(fullUrl);
        }

        const requestPromise = (async () => {
            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    savedAt: Date.now(),
                    data
                }));
            } catch (error) {
                console.warn("Cache write failed:", error);
            }

            return data;
        })();

        this.pendingRequests.set(fullUrl, requestPromise);

        try {
            return await requestPromise;
        } finally {
            this.pendingRequests.delete(fullUrl);
        }
    }

    async getAll(path) {
        let next = new URL(path, this.baseUrl).toString();
        const items = [];
        const visited = new Set();

        while (next) {
            if (visited.has(next)) {
                throw new Error("Repeated pagination URL detected");
            }

            visited.add(next);

            const data = await this.request(next);

            items.push(...(data.results ?? []));
            next = data.next;
        }

        return items;
    }

    async launches() {
        const params = new URLSearchParams({
            format: "json",
            limit: "100",
            lsp__name: "SpaceX",
            ordering: "-net"
        });

        const launches = await this.getAll(
            `launches/previous/?${params.toString()}`
        );

        return launches.map(launch => ({
            id: launch.id,
            name: launch.name,
            launchpad: launch.pad?.id ?? null,
            padName: launch.pad?.name ?? "Unknown"
        }));
    }

    async launchpads() {
        const pads = await this.getAll("pads/?format=json&limit=100");

        return pads.map(pad => ({
            id: pad.id,
            name: pad.name,
            latitude: pad.latitude,
            longitude: pad.longitude
        }));
    }

    async launchpad(id) {
        const pad = await this.request(
            `pads/${encodeURIComponent(id)}/?format=json`
        );

        return {
            id: pad.id,
            name: pad.name,
            latitude: pad.latitude,
            longitude: pad.longitude
        };
    }
}

export { SpaceX };
