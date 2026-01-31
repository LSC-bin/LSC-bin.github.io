import { useState, useEffect } from 'react';

interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    assets: GitHubAsset[];
    html_url: string;
    tag_name: string;
    body: string;
}

interface ReleaseInfo {
    windows: string;
    mac: string;
    version: string;
    releaseNotesUrl: string;
    notes: string;
}

export function useLatestRelease() {
    const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo>({
        windows: "https://github.com/wi4077/DAy-oN/releases",
        mac: "https://github.com/wi4077/DAy-oN/releases",
        version: "v1.0.0",
        releaseNotesUrl: "https://github.com/wi4077/DAy-oN/releases",
        notes: "Loading release notes..."
    });

    useEffect(() => {
        const fetchLatestRelease = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/wi4077/DAy-oN/releases/latest');
                if (!response.ok) return;

                const data: GitHubRelease = await response.json();

                const windowsAsset = data.assets.find(asset => asset.name.endsWith('.exe'));
                const macAsset = data.assets.find(asset => asset.name.endsWith('.dmg') || asset.name.endsWith('.zip'));

                setReleaseInfo({
                    windows: windowsAsset ? windowsAsset.browser_download_url : data.html_url,
                    mac: macAsset ? macAsset.browser_download_url : data.html_url,
                    version: data.tag_name,
                    releaseNotesUrl: data.html_url,
                    notes: data.body
                });
            } catch (error) {
                console.error('Failed to fetch latest release:', error);
            }
        };

        fetchLatestRelease();
    }, []);

    return releaseInfo;
}
