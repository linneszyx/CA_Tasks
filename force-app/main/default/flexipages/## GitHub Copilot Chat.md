## GitHub Copilot Chat

- Extension: 0.45.1 (prod)
- VS Code: 1.117.0 (10c8e557c8b9f9ed0a87f61f1c9a44bde731c409)
- OS: win32 10.0.26200 x64
- GitHub Account: linneszyx

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (129 ms)
- DNS ipv6 Lookup: Error (51 ms): getaddrinfo ENOENT api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (112 ms)
- Node.js https: HTTP 200 (178 ms)
- Node.js fetch: HTTP 200 (159 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (57 ms)
- DNS ipv6 Lookup: Error (62 ms): getaddrinfo ENOENT api.individual.githubcopilot.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (281 ms)
- Node.js https: HTTP 200 (883 ms)
- Node.js fetch: HTTP 200 (936 ms)

Connecting to https://proxy.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 52.175.140.176 (119 ms)
- DNS ipv6 Lookup: Error (50 ms): getaddrinfo ENOENT proxy.individual.githubcopilot.com
- Proxy URL: None (18 ms)
- Electron fetch (configured): HTTP 200 (698 ms)
- Node.js https: HTTP 200 (594 ms)
- Node.js fetch: HTTP 200 (585 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (284 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (1189 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (1060 ms)
Connecting to https://telemetry.individual.githubcopilot.com/_ping: HTTP 200 (1081 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (536 ms)

Number of system certificates: 61

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).