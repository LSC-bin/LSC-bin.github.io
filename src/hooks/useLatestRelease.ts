import { useState, useEffect } from 'react';

interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    assets: GitHubAsset[];
}

export function useLatestRelease() {
    const [downloadUrl, setDownloadUrl] = useState<string>("https://github.com/wi4077/DAy-oN/releases");

    useEffect(() => {
        const fetchLatestRelease = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/wi4077/DAy-oN/releases/latest');
                if (!response.ok) return;

                const data: GitHubRelease = await response.json();
                const exeAsset = data.assets.find(asset => asset.name.endsWith('.exe'));

                if (exeAsset) {
                    setDownloadUrl(exeAsset.browser_download_url);
                }
            } catch (error) {
                console.error('Failed to fetch latest release:', error);
            }
        };

        fetchLatestRelease();
    }, []);

    return downloadUrl;
}
