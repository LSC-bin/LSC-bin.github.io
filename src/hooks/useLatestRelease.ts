import { useState, useEffect } from 'react';

interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    assets: GitHubAsset[];
    html_url: string;
}

interface DownloadUrls {
    windows: string;
    mac: string;
}

export function useLatestRelease() {
    const [downloadUrls, setDownloadUrls] = useState<DownloadUrls>({
        windows: "https://github.com/wi4077/DAy-oN/releases",
        mac: "https://github.com/wi4077/DAy-oN/releases"
    });

    useEffect(() => {
        const fetchLatestRelease = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/wi4077/DAy-oN/releases/latest');
                if (!response.ok) return;

                const data: GitHubRelease = await response.json();

                const windowsAsset = data.assets.find(asset => asset.name.endsWith('.exe'));
                const macAsset = data.assets.find(asset => asset.name.endsWith('.dmg') || asset.name.endsWith('.zip'));

                setDownloadUrls({
                    windows: windowsAsset ? windowsAsset.browser_download_url : data.html_url,
                    mac: macAsset ? macAsset.browser_download_url : data.html_url
                });
            } catch (error) {
                console.error('Failed to fetch latest release:', error);
            }
        };

        fetchLatestRelease();
    }, []);

    return downloadUrls;
}
