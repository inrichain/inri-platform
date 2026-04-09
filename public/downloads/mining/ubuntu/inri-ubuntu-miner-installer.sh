<!-- INRI CHAIN — Status Bar (desktop + compact mobile) -->
<div class="inri-status-bar-wrapper">
  <div class="inri-status-bar">
    <div class="inri-status-left">
      <span class="inri-dot"></span>
      <span class="name">INRI CHAIN</span>
      <span class="chain-meta">POW • ID 3777</span>
    </div>

    <!-- Desktop / tablet -->
    <div class="inri-status-metrics desktop-metrics">
      <div class="inri-pill">
        <span class="label">Block</span>
        <span class="value" id="bar-block">-</span>
      </div>

      <div class="inri-pill">
        <span class="label">Peers</span>
        <span class="value" id="bar-peers">-</span>
      </div>

      <div class="inri-pill">
        <span class="label">Diff</span>
        <span class="value" id="bar-diff">-</span>
      </div>

      <div class="inri-pill">
        <span class="label">Hashrate</span>
        <span class="value" id="bar-hashrate">-</span>
      </div>
    </div>

    <div class="inri-time desktop-time" id="bar-time">—</div>

    <!-- Compact mobile -->
    <div class="inri-mobile-compact">
      <div class="compact-item">
        <span class="compact-label">Block</span>
        <span class="compact-value" id="m-bar-block">-</span>
      </div>

      <div class="compact-item">
        <span class="compact-label">Peers</span>
        <span class="compact-value" id="m-bar-peers">-</span>
      </div>

      <div class="compact-item">
        <span class="compact-label">Hash</span>
        <span class="compact-value" id="m-bar-hashrate">-</span>
      </div>

      <div class="compact-item compact-time">
        <span class="compact-value" id="m-bar-time">—</span>
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --accent: #22d3ee;
    --accent-strong: #a855f7;
    --text-main: #e5e7eb;
    --text-soft: #9ca3af;
    --border-subtle: rgba(148, 163, 184, 0.45);
    --shadow-soft: 0 10px 26px rgba(15, 23, 42, 0.45);
  }

  .inri-status-bar-wrapper {
    width: 100%;
    padding: 6px 10px;
    box-sizing: border-box;
    background: transparent;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
      "Segoe UI", sans-serif;
    color: var(--text-main);
  }

  .inri-status-bar {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: transparent;
  }

  .inri-status-left {
    display: flex;
    align-items: center;
    gap: 7px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 10px;
    color: var(--text-soft);
    white-space: nowrap;
    min-width: 0;
    flex-shrink: 0;
  }

  .inri-status-left .name {
    font-weight: 800;
    letter-spacing: 0.16em;
    background: linear-gradient(90deg, var(--accent), var(--accent-strong));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .chain-meta {
    color: var(--text-soft);
  }

  .inri-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--accent);
    box-shadow:
      0 0 0 0 rgba(34, 211, 238, 0.9),
      0 0 10px 2px rgba(34, 211, 238, 0.9);
    animation: inri-ping 1.6s infinite;
    flex-shrink: 0;
  }

  .desktop-metrics {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
    min-width: 0;
  }

  .inri-pill {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-soft);
    color: #111827;
    min-height: 28px;
    min-width: 120px;
  }

  .inri-pill .label {
    text-transform: uppercase;
    letter-spacing: 0.09em;
    font-size: 9px;
    line-height: 1;
    color: #6366f1;
    white-space: nowrap;
  }

  .inri-pill .value {
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    font-size: 11px;
  }

  .inri-time {
    font-size: 10px;
    color: var(--text-soft);
    white-space: nowrap;
  }

  .inri-mobile-compact {
    display: none;
  }

  .compact-item {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .compact-label {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8ea0b8;
    white-space: nowrap;
  }

  .compact-value {
    font-size: 10px;
    font-weight: 700;
    color: #f3f4f6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .compact-time {
    justify-content: flex-end;
  }

  @keyframes inri-ping {
    0% {
      transform: scale(1);
      box-shadow:
        0 0 0 0 rgba(34, 211, 238, 0.9),
        0 0 10px 2px rgba(34, 211, 238, 0.9);
    }
    70% {
      transform: scale(1.05);
      box-shadow:
        0 0 0 8px rgba(34, 211, 238, 0),
        0 0 16px 4px rgba(34, 211, 238, 0.7);
    }
    100% {
      transform: scale(1);
      box-shadow:
        0 0 0 0 rgba(34, 211, 238, 0),
        0 0 10px 2px rgba(34, 211, 238, 0.9);
    }
  }

  @media (max-width: 900px) {
    .inri-status-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .inri-status-left {
      justify-content: flex-start;
      white-space: normal;
      flex-wrap: wrap;
    }

    .desktop-metrics {
      justify-content: flex-start;
    }

    .desktop-time {
      padding-left: 0;
    }
  }

  @media (max-width: 640px) {
    .inri-status-bar-wrapper {
      padding: 6px 8px;
    }

    .desktop-metrics,
    .desktop-time {
      display: none;
    }

    .inri-status-bar {
      gap: 7px;
    }

    .inri-status-left {
      font-size: 9px;
      gap: 6px;
      letter-spacing: 0.08em;
    }

    .inri-status-left .name {
      letter-spacing: 0.12em;
    }

    .inri-mobile-compact {
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr auto;
      gap: 10px;
      align-items: center;
      width: 100%;
      min-width: 0;
    }

    .compact-item {
      min-width: 0;
    }

    .compact-value {
      font-size: 10px;
    }
  }

  @media (max-width: 380px) {
    .inri-status-left {
      font-size: 8px;
    }

    .inri-mobile-compact {
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 8px;
    }

    .compact-label {
      font-size: 7px;
    }

    .compact-value {
      font-size: 9px;
    }
  }
</style>

<script>
  (function () {
    const RPC_URL = "https://rpc.inri.life";
    const WIDGET_URL = "https://pool.inri.life/widget/pool-pulse.js";
    const REFRESH_INTERVAL = 10000;

    const FIXED_RPC_CHAIN_PEERS = 13;
    const FIXED_BOOT1_PEERS = 25;
    const FIXED_BOOT2_PEERS = 15;

    const elBlock = document.getElementById("bar-block");
    const elPeers = document.getElementById("bar-peers");
    const elDiff = document.getElementById("bar-diff");
    const elHash = document.getElementById("bar-hashrate");
    const elTime = document.getElementById("bar-time");

    const mElBlock = document.getElementById("m-bar-block");
    const mElPeers = document.getElementById("m-bar-peers");
    const mElHash = document.getElementById("m-bar-hashrate");
    const mElTime = document.getElementById("m-bar-time");

    function formatNumberShort(n) {
      const num = Number(n);
      if (!Number.isFinite(num)) return "-";
      if (num < 1000) return num.toString();

      const units = ["", "K", "M", "B", "T"];
      let v = num;
      let i = 0;

      while (v >= 1000 && i < units.length - 1) {
        v /= 1000;
        i++;
      }

      const decimals = v >= 10 ? 1 : 2;
      return v.toFixed(decimals) + units[i];
    }

    function formatBigHexShort(hex) {
      if (!hex) return "-";
      let clean = String(hex);
      if (clean.startsWith("0x")) clean = clean.slice(2);
      if (!clean) return "0";

      let value;
      try {
        value = BigInt("0x" + clean);
      } catch {
        return "-";
      }

      if (value === 0n) return "0";

      const thousand = 1000n;
      const units = ["", "K", "M", "G", "T", "P"];
      let i = 0;

      while (value >= thousand && i < units.length - 1) {
        value /= thousand;
        i++;
      }

      return value.toString() + units[i];
    }

    function formatHashrate(h) {
      const val = Number(h);
      if (!Number.isFinite(val) || val <= 0) return "-";
      const units = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s"];
      let v = val;
      let i = 0;

      while (v >= 1000 && i < units.length - 1) {
        v /= 1000;
        i++;
      }

      return v.toFixed(2) + " " + units[i];
    }

    function formatHashrateCompact(h) {
      const val = Number(h);
      if (!Number.isFinite(val) || val <= 0) return "-";
      const units = ["H", "kH", "MH", "GH", "TH", "PH"];
      let v = val;
      let i = 0;

      while (v >= 1000 && i < units.length - 1) {
        v /= 1000;
        i++;
      }

      return v.toFixed(1) + units[i];
    }

    function estimateHashrateFromDifficulty(difficultyHex, avgBlockTimeSeconds) {
      if (!difficultyHex) return null;

      let clean = String(difficultyHex);
      if (clean.startsWith("0x")) clean = clean.slice(2);
      if (!clean) return null;

      let diffBig;
      try {
        diffBig = BigInt("0x" + clean);
      } catch {
        return null;
      }

      const bt = Number(avgBlockTimeSeconds);
      if (!Number.isFinite(bt) || bt <= 0) return null;

      const btBig = BigInt(Math.max(1, Math.round(bt)));
      const hashBig = diffBig / btBig;
      const MAX = BigInt(Number.MAX_SAFE_INTEGER);
      const capped = hashBig > MAX ? MAX : hashBig;

      return Number(capped);
    }

    function getGreeting(date) {
      const hour = date.getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    }

    async function fetchRpc(method, params = []) {
      const payload = {
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params
      };

      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("RPC HTTP error: " + response.status);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(
          "RPC error for " + method + ": " + (data.error.message || "unknown")
        );
      }

      return data.result;
    }

    function loadPoolWidget() {
      return new Promise((resolve, reject) => {
        const old = document.getElementById("bar-pool-widget-loader");
        if (old) old.remove();

        const s = document.createElement("script");
        s.id = "bar-pool-widget-loader";
        s.src = WIDGET_URL + "?t=" + Date.now();
        s.async = true;

        s.onload = function () {
          const payload = window.INRI_POOL_PULSE || null;
          if (!payload || !payload.totals) {
            reject(new Error("Pool widget payload invalid"));
            return;
          }
          resolve(payload);
        };

        s.onerror = function () {
          reject(new Error("Pool widget failed"));
        };

        document.head.appendChild(s);
      });
    }

    async function updateBar() {
      try {
        const blockHex = await fetchRpc("eth_blockNumber");
        const blockNumber = parseInt(blockHex, 16);

        const windowSize = Math.max(1, Math.min(40, blockNumber));
        const oldBlockNumber = Math.max(0, blockNumber - windowSize);

        const [peersHex, latestBlock, oldBlock, poolData] = await Promise.all([
          fetchRpc("net_peerCount"),
          fetchRpc("eth_getBlockByNumber", ["latest", false]),
          fetchRpc("eth_getBlockByNumber", ["0x" + oldBlockNumber.toString(16), false]),
          loadPoolWidget()
        ]);

        const rpcPeerCount = parseInt(peersHex, 16);
        const poolConnected = Number(poolData?.totals?.connectedMiners || 0);

        const totalPeers =
          FIXED_RPC_CHAIN_PEERS +
          rpcPeerCount +
          FIXED_BOOT1_PEERS +
          FIXED_BOOT2_PEERS +
          poolConnected;

        let avgBlockTime = null;
        if (latestBlock && oldBlock && latestBlock.timestamp && oldBlock.timestamp) {
          const tLatest = parseInt(latestBlock.timestamp, 16);
          const tOld = parseInt(oldBlock.timestamp, 16);
          const diffSec = Math.max(1, tLatest - tOld);
          avgBlockTime = diffSec / windowSize;
        }

        let diffText = "-";
        let hashText = "-";
        let hashCompactText = "-";

        if (latestBlock && latestBlock.difficulty) {
          diffText = formatBigHexShort(latestBlock.difficulty);
          const estHash = avgBlockTime
            ? estimateHashrateFromDifficulty(latestBlock.difficulty, avgBlockTime)
            : null;

          hashText = estHash ? formatHashrate(estHash) : "-";
          hashCompactText = estHash ? formatHashrateCompact(estHash) : "-";
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const greeting = getGreeting(now);
        const fullTime = `${greeting} • ${timeStr}`;

        elBlock.textContent = formatNumberShort(blockNumber);
        elPeers.textContent = formatNumberShort(totalPeers);
        elDiff.textContent = diffText;
        elHash.textContent = hashText;
        elTime.textContent = fullTime;

        mElBlock.textContent = formatNumberShort(blockNumber);
        mElPeers.textContent = formatNumberShort(totalPeers);
        mElHash.textContent = hashCompactText;
        mElTime.textContent = timeStr;
      } catch (e) {
        console.error(e);

        elBlock.textContent = "-";
        elPeers.textContent = "-";
        elDiff.textContent = "-";
        elHash.textContent = "-";
        elTime.textContent = "Connection error";

        mElBlock.textContent = "-";
        mElPeers.textContent = "-";
        mElHash.textContent = "-";
        mElTime.textContent = "Offline";
      }
    }

    updateBar();
    setInterval(updateBar, REFRESH_INTERVAL);
  })();
</script>