// =======================
  // CONFIG
  // =======================
  const CHAIN_ID   = 3777;
  const CHAIN_HEX  = "0x" + CHAIN_ID.toString(16);
  const CHAIN_NAME = "INRI CHAIN";

  // ✅ Put your RPC(s) here (Singapore / global). First working one will be used for READ.
  const RPC_URLS = [
    "https://rpc-chain.inri.life/",
    // "https://<your-singapore-rpc>/",
    // "https://<backup-rpc>/",
  ];

  // ✅ Your deployed contract address (INRIP2PEscrowSafe)
  const CONTRACT = "0xF6e3Daf7D6787dFd6dbb538b9ee35BF38Fb98f01";

  const DAPP_URL = "https://p2p.inri.life/";
  const DAPP_HOSTPATH = DAPP_URL.replace(/^https?:\/\//, "");

  const DEFAULT_SCAN_BLOCKS = 300000;
  const LS_KEY = "inri_p2p_saved_offer_ids_v10_safe";
  const PAGE_SIZE = 8;

  // =======================
  // Logos
  // =======================
  const LOGOS = {
    NET: {
      TRON:     "https://raw.githubusercontent.com/inrichain/logotron/main/TRON.png",
      BSC:      "https://raw.githubusercontent.com/inrichain/logobsc/main/BSC.png",
      Polygon:  "https://raw.githubusercontent.com/inrichain/logopolygon/main/Polygon.png",
      Arbitrum: "https://raw.githubusercontent.com/inrichain/logoarbitrum/main/Arbitrum.png",
      Optimism: "https://raw.githubusercontent.com/inrichain/logoop/main/op.png",
      Ethereum: "https://raw.githubusercontent.com/inrichain/logoeth/main/ETH.png",
      Base:     "https://raw.githubusercontent.com/inrichain/logobase/main/BASE.png",
      Solana:   "https://raw.githubusercontent.com/inrichain/logosolana/main/SOLANA.png",
    },
    TOKEN: {
      USDT: "https://raw.githubusercontent.com/inrichain/logousdt/main/USTD.png",
      USDC: "https://raw.githubusercontent.com/inrichain/logousdc/main/USDC.png",
      INRI: "https://raw.githubusercontent.com/inrichain/logo-/main/Logo.png"
    }
  };

  const PAY_NETWORKS = [
    { key:"TRON",     label:"TRON (TRC20)",  logo: LOGOS.NET.TRON },
    { key:"BSC",      label:"BSC (BEP20)",   logo: LOGOS.NET.BSC },
    { key:"Polygon",  label:"Polygon",       logo: LOGOS.NET.Polygon },
    { key:"Arbitrum", label:"Arbitrum",      logo: LOGOS.NET.Arbitrum },
    { key:"Optimism", label:"Optimism",      logo: LOGOS.NET.Optimism },
    { key:"Ethereum", label:"Ethereum",      logo: LOGOS.NET.Ethereum },
    { key:"Base",     label:"Base",          logo: LOGOS.NET.Base },
    { key:"Solana",   label:"Solana",        logo: LOGOS.NET.Solana },
  ];
  const TOKEN_LOGO = { USDT:LOGOS.TOKEN.USDT, USDC:LOGOS.TOKEN.USDC, INRI:LOGOS.TOKEN.INRI };

  // =======================
  // ABI (MATCHES YOUR CONTRACT)
  // =======================
  const ABI = [
    // config / fee
    "function owner() view returns (address)",
    "function feeBps() view returns (uint16)",
    "function feeRecipient() view returns (address)",
    "function minPayWindowSec() view returns (uint32)",
    "function maxPayWindowSec() view returns (uint32)",

    // withdraw
    "function withdraw()",
    "function pendingWithdrawals(address) view returns (uint256)",

    // moderation
    "function moderatorsEnabled() view returns (bool)",
    "function modThreshold() view returns (uint8)",
    "function isModerator(address) view returns (bool)",
    "function modVote(uint256,address) view returns (uint8)",
    "function votesToBuyer(uint256) view returns (uint8)",
    "function votesToSeller(uint256) view returns (uint8)",
    "function voteDispute(uint256 offerId,uint8 vote)",

    // offers
    "function nextOfferId() view returns (uint256)",
    "function offers(uint256) view returns (address seller,address buyer,uint256 amount,uint64 createdAt,uint64 expiresAt,uint32 payWindowSec,uint8 status,string payAsset,string payNetwork,string payTo,string txid)",

    // core
    "function createOffer(uint32 payWindowSec,string payAsset,string payNetwork,string payTo) payable returns (uint256)",
    "function cancelOffer(uint256 offerId)",
    "function acceptOffer(uint256 offerId)",
    "function markPaid(uint256 offerId,string txid)",
    "function reclaimIfUnpaid(uint256 offerId)",
    "function releaseToBuyer(uint256 offerId)",
    "function openDispute(uint256 offerId)",
    "function resolveDisputeOwner(uint256 offerId,bool releaseToBuyerFlag)",

    // events
    "event OfferCreated(uint256 indexed offerId,address indexed seller,uint256 amount,uint32 payWindowSec,string payAsset,string payNetwork,string payTo)",
    "event MarkedPaid(uint256 indexed offerId,address indexed buyer,string txid)",
    "event DisputeOpened(uint256 indexed offerId,address indexed buyer)",
    "event Released(uint256 indexed offerId,address indexed buyer,uint256 netToBuyer,uint256 feeAmount)",
    "event DisputeResolved(uint256 indexed offerId,bool releasedToBuyer)"
  ];

  const iface = new ethers.Interface(ABI);

  // =======================
  // DOM
  // =======================
  const $ = (id)=>document.getElementById(id);
  const el = {
    netPill:$("netPill"), contractPill:$("contractPill"),
    btnConnect:$("btnConnect"), btnOpenMM:$("btnOpenMM"), btnOpenTW:$("btnOpenTW"),
    alertBadge:$("alertBadge"), activityPill:$("activityPill"),
    tabCreate:$("tabCreate"), tabMarket:$("tabMarket"),
    createPanel:$("createPanel"), marketPanel:$("marketPanel"),
    btnRefreshTop:$("btnRefreshTop"),
    paidCount:$("paidCount"), disputeCount:$("disputeCount"), doneCount:$("doneCount"),

    inAmount:$("inAmount"), payAsset:$("payAsset"), payNetwork:$("payNetwork"),
    pricePer:$("pricePer"), totalPill:$("totalPill"),
    feePill:$("feePill"), netInriPill:$("netInriPill"),
    payTo:$("payTo"), payWindow:$("payWindow"), previewPill:$("previewPill"), btnCreate:$("btnCreate"),

    meAddr:$("meAddr"), withdrawPill:$("withdrawPill"), btnWithdraw:$("btnWithdraw"),
    rpcMode:$("rpcMode"), btnClearSaved:$("btnClearSaved"),
    filter:$("filter"), q:$("q"), btnRefresh:$("btnRefresh"),
    offers:$("offers"), count:$("count"), syncInfo:$("syncInfo"),
    prev:$("prev"), next:$("next"), pageInfo:$("pageInfo"),
    toast:$("toast"),

    backdrop:$("backdrop"), mClose:$("mClose"), mTitle:$("mTitle"), mSub:$("mSub"),
    mDetails:$("mDetails"), mPayHint:$("mPayHint"), mLogos:$("mLogos"),
    mTxid:$("mTxid"), mNote:$("mNote"),
    btnAccept:$("btnAccept"), btnPaid:$("btnPaid"), btnRelease:$("btnRelease"), btnDispute:$("btnDispute"),
    btnReclaim:$("btnReclaim"), btnCancel:$("btnCancel"),

    // dispute tools
    mRoleLine:$("mRoleLine"),
    mModsLine:$("mModsLine"),
    btnVoteBuyer:$("btnVoteBuyer"),
    btnVoteSeller:$("btnVoteSeller"),
    btnOwnerRelease:$("btnOwnerRelease"),
    btnOwnerRefund:$("btnOwnerRefund"),
  };

  for (const n of PAY_NETWORKS){
    const opt=document.createElement("option");
    opt.value=n.key; opt.textContent=n.label;
    el.payNetwork.appendChild(opt);
  }
  el.payNetwork.value="TRON";

  // =======================
  // Wallet Detection (ANY wallet)
  // - window.ethereum (legacy)
  // - EIP-6963 (best coverage)
  // =======================
  let discoveredProviders = []; // { info, provider }
  function discoverWallets(){
    discoveredProviders = [];

    window.addEventListener("eip6963:announceProvider", (event) => {
      try{
        const { info, provider } = event.detail || {};
        if(!provider) return;
        if(discoveredProviders.some(x => x.provider === provider)) return;
        discoveredProviders.push({ info, provider });
      }catch{}
    });

    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }

  function pickBestProvider(){
    const byName = (name) => discoveredProviders.find(p => (p.info?.name||"").toLowerCase().includes(name));
    const mm = byName("metamask");
    const tw = byName("trust");
    const rabby = byName("rabby");
    const cb = byName("coinbase");
    const okx = byName("okx");

    const best = mm || tw || rabby || cb || okx || discoveredProviders[0];
    if(best?.provider) return best.provider;
    if(window.ethereum) return window.ethereum;
    return null;
  }

  // =======================
  // Providers
  // =======================
  let rpcProvider = null;
  let activeRpcUrl = null;

  let browserProvider=null, signer=null, me=null;
  let readProvider=null;
  let contractRead=null;
  let contractWrite=null;

  let supportsWithdraw=false;

  // contract info
  let feeBps = 20;
  let feeRecipient = null;
  let ownerAddr = null;
  let modsEnabled = false;
  let modThreshold = 2;

  // market state
  let offerIds=[], offersCache=[];
  let page=1, totalPages=1, lastBlock=0;
  let modalId=null, modalOffer=null;
  let alertCount=0, lastSeenBlock=0, pollTimer=null;

  // =======================
  // Guard
  // =======================
  const guard = {
    locks: new Set(),
    async run(key, btnEl, fn){
      if(this.locks.has(key)) return;
      this.locks.add(key);
      const prevTxt = btnEl?.textContent;
      try{
        if(btnEl){ btnEl.disabled = true; btnEl.style.opacity="0.65"; }
        await fn();
      } finally {
        this.locks.delete(key);
        if(btnEl){ btnEl.disabled = false; btnEl.style.opacity=""; if(prevTxt) btnEl.textContent = prevTxt; }
      }
    }
  };

  // =======================
  // Utils
  // =======================
  const isMobile = ()=> /Android|iPhone|iPad|iPod/i.test(navigator.userAgent||"");
  const openMetaMaskDapp = ()=>{ window.location.href = "https://metamask.app.link/dapp/" + DAPP_HOSTPATH; };
  const openTrustDapp   = ()=>{ window.location.href = "https://link.trustwallet.com/open_url?url=" + encodeURIComponent(DAPP_URL); };

  function maybeShowMobileButtons(){
    if (isMobile() && !window.ethereum && discoveredProviders.length===0){
      el.btnOpenMM.style.display="inline-flex";
      el.btnOpenTW.style.display="inline-flex";
    } else {
      el.btnOpenMM.style.display="none";
      el.btnOpenTW.style.display="none";
    }
  }

  function toast(msg, ms=2300){
    el.toast.textContent=msg;
    el.toast.style.display="block";
    clearTimeout(toast._t);
    toast._t=setTimeout(()=>el.toast.style.display="none", ms);
  }
  function bumpAlert(msg){
    alertCount++;
    el.alertBadge.style.display="inline-flex";
    el.alertBadge.textContent=String(alertCount);
    toast(msg, 3200);
  }
  function prettyErr(e){
    return (e?.shortMessage || e?.reason || e?.message || String(e||"Error")).slice(0,240);
  }

  function loadSavedIds(){
    try{
      const raw=localStorage.getItem(LS_KEY);
      const arr=raw?JSON.parse(raw):[];
      return Array.isArray(arr)?arr.map(x=>String(x)):[];
    }catch{ return []; }
  }
  function saveId(idStr){
    const cur=new Set(loadSavedIds());
    cur.add(String(idStr));
    localStorage.setItem(LS_KEY, JSON.stringify([...cur]));
  }
  function clearSaved(){ localStorage.removeItem(LS_KEY); }

  const short=(a)=>a?a.slice(0,6)+"…"+a.slice(-4):"—";
  const fmtInri=(wei)=>{ try{return ethers.formatEther(wei);}catch{return String(wei);} };

  function statusLabel(s){ return ["OPEN","LOCKED","PAID","DISPUTED","RELEASED","CANCELLED"][Number(s)] || "UNKNOWN"; }
  function statusTag(s){
    const st=statusLabel(s);
    if(st==="OPEN") return `<span class="tag tag-open">✅ OPEN</span>`;
    if(st==="LOCKED") return `<span class="tag tag-locked">⏳ LOCKED</span>`;
    if(st==="PAID") return `<span class="tag tag-paid">💠 PAID</span>`;
    if(st==="DISPUTED") return `<span class="tag tag-disputed">⚠ DISPUTE</span>`;
    return `<span class="tag tag-done">• ${st}</span>`;
  }

  const nowSec=()=>Math.floor(Date.now()/1000);

  function formatLeftSeconds(left){
    if (left <= 0) return "Expired";
    const h = Math.floor(left / 3600);
    const m = Math.floor((left % 3600) / 60);
    const s = left % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
    return `${m}m ${String(s).padStart(2,"0")}s`;
  }
  function timeLeftForOffer(status, expiresAt){
    const st = statusLabel(status);
    if (st === "LOCKED"){
      const t = Number(expiresAt || 0);
      if(!t) return "—";
      return formatLeftSeconds(t - nowSec());
    }
    if (st === "OPEN") return "Not started";
    if (st === "PAID") return "Waiting release";
    if (st === "DISPUTED") return "In dispute";
    if (st === "RELEASED" || st === "CANCELLED") return "Finalized";
    return "—";
  }

  function imgOrFallback(url, alt){
    if(!url) return `<span class="ico"></span>`;
    return `<span class="ico"><img loading="lazy" src="${url}" alt="${alt}" onerror="this.style.display='none'"></span>`;
  }

  const packPayTo = (addr, priceStr, totalStr)=>
    `${(addr||"").trim()} || price=${(priceStr||"").trim()} || total=${(totalStr||"").trim()}`;

  function unpackPayTo(payToRaw){
    const raw=(payToRaw||"").trim();
    const parts=raw.split("||").map(x=>x.trim()).filter(Boolean);
    const out={ address:raw, price:"", total:"" };
    if(!parts.length) return out;
    out.address=parts[0]||raw;
    for(const part of parts.slice(1)){
      const low=part.toLowerCase();
      const val=part.split("=").slice(1).join("=").trim();
      if(low.startsWith("price=")) out.price=val;
      if(low.startsWith("total=")) out.total=val;
    }
    return out;
  }

  function calcTotalOffchain(){
    const amt=Number(el.inAmount.value||0);
    const price=Number(el.pricePer.value||0);
    if(!amt||!price||amt<=0||price<=0) return "";
    return (amt*price).toFixed(6);
  }
  function calcFeeInriFromInriAmount(inriAmountStr){
    const a=Number(inriAmountStr||0);
    if(!a||a<=0) return "";
    return (a*(feeBps/10000)).toFixed(6);
  }
  function calcNetInri(inriAmountStr, feeStr){
    const a=Number(inriAmountStr||0), f=Number(feeStr||0);
    if(!a||a<=0) return "";
    const net=a - f;
    return (net>0?net:0).toFixed(6);
  }

  function renderPreview(){
    const amtStr=(el.inAmount.value||"").trim();
    const mins=Number(el.payWindow.value||30);
    const price=(el.pricePer.value||"").trim();

    const totalOff=calcTotalOffchain();
    el.totalPill.textContent = totalOff ? `${totalOff} ${el.payAsset.value}` : "—";

    const feeInri = calcFeeInriFromInriAmount(amtStr);
    const netInri = calcNetInri(amtStr, feeInri);

    el.feePill.textContent     = feeInri ? `${feeInri} INRI` : "—";
    el.netInriPill.textContent = netInri ? `${netInri} INRI` : "—";

    if(!amtStr){ el.previewPill.textContent="—"; return; }
    el.previewPill.textContent =
      `${amtStr} INRI • price ${price||"—"} • off-chain pay ${totalOff||"—"} ${el.payAsset.value} (${el.payNetwork.value}) • buyer fee ${feeInri||"—"} INRI • buyer receives ~${netInri||"—"} INRI • ${mins} min`;
  }

  function normalize(s){ return String(s||"").toLowerCase().replace(/\u2026/g,'...').replace(/[^a-z0-9x.\-_\s]/g,' ').replace(/\s+/g,' ').trim(); }
  function addrVariants(a){
    const x=normalize(a); if(!x) return [];
    const no0x=x.startsWith("0x")?x.slice(2):x;
    const sh=(x.length>=12)?(x.slice(0,6)+"..."+x.slice(-4)):x;
    const sh2=(no0x.length>=10)?("0x"+no0x.slice(0,6)+"..."+no0x.slice(-4)):("0x"+no0x);
    return [x,no0x,sh,sh2];
  }
  function makeHaystack(o){
    const meta=unpackPayTo(o.payTo);
    const parts=[
      o.id?.toString?.()??"", o.payAsset, o.payNetwork, o.txid,
      o.payTo, meta.address, meta.price, meta.total,
      ...addrVariants(o.seller), ...addrVariants(o.buyer)
    ];
    return normalize(parts.join(" "));
  }
  function matchesQuery(o,q){
    const query=normalize(q); if(!query) return true;
    const tokens=query.split(" ").filter(Boolean);
    const hay=makeHaystack(o);
    return tokens.every(t=>hay.includes(t));
  }

  function showTab(which){
    const createOn=(which==="create");
    el.tabCreate.classList.toggle("active", createOn);
    el.tabMarket.classList.toggle("active", !createOn);
    if (window.innerWidth<=980){
      el.createPanel.style.display=createOn?"block":"none";
      el.marketPanel.style.display=createOn?"none":"block";
    } else {
      el.createPanel.style.display="block";
      el.marketPanel.style.display="block";
    }
  }

  // =======================
  // RPC builder with fallback
  // =======================
  async function buildRpcProvider(){
    for(const url of RPC_URLS){
      try{
        const p = new ethers.JsonRpcProvider(url, CHAIN_ID);
        await p.getBlockNumber();
        rpcProvider = p;
        activeRpcUrl = url;
        readProvider = rpcProvider;
        contractRead = new ethers.Contract(CONTRACT, ABI, readProvider);
        el.rpcMode.textContent = `Provider mode: Public RPC OK (${new URL(url).host})`;
        return;
      }catch(e){}
    }
    rpcProvider = null;
    activeRpcUrl = null;
    el.rpcMode.textContent = "Provider mode: RPC DOWN (connect wallet)";
  }

  // =======================
  // Wallet connect (ANY wallet)
  // =======================
  let walletListenersAttached = false;

  async function ensureNetwork(prov){
    const cur=await prov.request({method:"eth_chainId"});
    if(cur && cur.toLowerCase()===CHAIN_HEX.toLowerCase()){
      el.netPill.textContent=`Network: ${CHAIN_NAME}`;
      return;
    }
    try{
      await prov.request({method:"wallet_switchEthereumChain", params:[{chainId:CHAIN_HEX}]});
    }catch(e){
      if(e && e.code===4902){
        await prov.request({
          method:"wallet_addEthereumChain",
          params:[{
            chainId:CHAIN_HEX,
            chainName:CHAIN_NAME,
            rpcUrls:[activeRpcUrl || RPC_URLS[0]],
            nativeCurrency:{name:"INRI",symbol:"INRI",decimals:18},
            blockExplorerUrls:[]
          }]
        });
        await prov.request({method:"wallet_switchEthereumChain", params:[{chainId:CHAIN_HEX}]});
      } else throw e;
    }
    el.netPill.textContent=`Network: ${CHAIN_NAME}`;
  }

  function attachWalletListeners(prov){
    if(walletListenersAttached) return;
    walletListenersAttached = true;

    prov.on?.("accountsChanged", (accs)=> {
      try{
        if(!accs || !accs.length){
          me=null; signer=null; contractWrite=null;
          el.btnConnect.textContent="Connect Wallet";
          el.meAddr.textContent="—";
          el.btnWithdraw.style.display="none";
          toast("Wallet disconnected. RPC mode active.", 3000);
          renderMarket();
          return;
        }
        me = accs[0];
        el.btnConnect.textContent=short(me);
        el.meAddr.textContent=me;
        refreshWithdrawable().catch(()=>{});
        renderMarket();
      }catch{}
    });

    prov.on?.("chainChanged", (cid)=>{
      try{
        if(String(cid).toLowerCase() !== CHAIN_HEX.toLowerCase()){
          toast("Wrong network. Switch to INRI CHAIN.", 3500);
          el.netPill.textContent = "Network: switch to INRI CHAIN";
        } else {
          el.netPill.textContent = `Network: ${CHAIN_NAME}`;
        }
      }catch{}
    });

    prov.on?.("disconnect", ()=>{
      try{
        me=null; signer=null; contractWrite=null;
        el.btnConnect.textContent="Connect Wallet";
        el.meAddr.textContent="—";
        el.btnWithdraw.style.display="none";
        toast("Wallet disconnected. RPC mode active.", 3500);
        renderMarket();
      }catch{}
    });
  }

  async function loadContractInfo(){
    try{ feeBps = Number(await contractRead.feeBps()); }catch{ feeBps = 20; }
    try{ feeRecipient = await contractRead.feeRecipient(); }catch{ feeRecipient = null; }
    try{ ownerAddr = await contractRead.owner(); }catch{ ownerAddr = null; }
    try{ modsEnabled = await contractRead.moderatorsEnabled(); }catch{ modsEnabled = false; }
    try{ modThreshold = Number(await contractRead.modThreshold()); }catch{ modThreshold = 2; }
    renderPreview();
  }

  async function detectWithdrawSupport(){
    supportsWithdraw=false;
    el.btnWithdraw.style.display="none";
    el.withdrawPill.textContent="—";
    if(!me) { el.withdrawPill.textContent="—"; return; }
    try{
      await contractRead.pendingWithdrawals(me);
      supportsWithdraw=true;
      el.btnWithdraw.style.display="inline-flex";
      el.withdrawPill.textContent="0";
    }catch{
      supportsWithdraw=false;
      el.btnWithdraw.style.display="none";
      el.withdrawPill.textContent="N/A";
    }
  }

  async function refreshWithdrawable(){
    if(!supportsWithdraw || !me) return;
    try{
      const amt=await contractRead.pendingWithdrawals(me);
      el.withdrawPill.textContent=`${fmtInri(amt)} INRI`;
    }catch{ el.withdrawPill.textContent="—"; }
  }

  async function connectWallet(){
    const prov = pickBestProvider();
    if(!prov){
      if(isMobile()){ openMetaMaskDapp(); return; }
      alert("No wallet provider found. Install a wallet (MetaMask/Trust/Rabby/Coinbase/OKX) or open this site inside a wallet browser.");
      return;
    }

    if(!rpcProvider) await buildRpcProvider();

    await ensureNetwork(prov);

    browserProvider = new ethers.BrowserProvider(prov);
    await browserProvider.send("eth_requestAccounts", []);
    signer = await browserProvider.getSigner();
    me = await signer.getAddress();

    readProvider = rpcProvider || browserProvider; // if RPC dead, fallback to wallet
    contractRead  = new ethers.Contract(CONTRACT, ABI, readProvider);
    contractWrite = new ethers.Contract(CONTRACT, ABI, signer);

    el.btnConnect.textContent = short(me);
    el.meAddr.textContent = me;

    el.rpcMode.textContent = rpcProvider
      ? `Provider mode: RPC(read) + Wallet(write) (${new URL(activeRpcUrl).host})`
      : "Provider mode: Wallet Provider (RPC fallback failed)";

    attachWalletListeners(prov);

    await loadContractInfo();
    await detectWithdrawSupport();
    await refreshWithdrawable();

    toast("Wallet connected ✅");
    startLiveActivity();
    await refreshMarket();
  }

  // =======================
  // Market load/render
  // =======================
  function mergeIds(aStr,bStr){
    const set=new Set([...aStr.map(String),...bStr.map(String)]);
    return [...set].sort((x,y)=>{ try{ return BigInt(y)>BigInt(x)?1:-1; }catch{ return 0; }});
  }

  async function loadOfferIds(){
    const saved=loadSavedIds();
    let fromLogs=[];
    try{
      const provider = contractRead.runner.provider;
      const latest = await provider.getBlockNumber();
      lastBlock = latest;
      const from = Math.max(0, latest-DEFAULT_SCAN_BLOCKS);

      const topic0=iface.getEvent("OfferCreated").topicHash;
      const logs=await provider.getLogs({address:CONTRACT,fromBlock:from,toBlock:latest,topics:[topic0]});

      const seen=new Set();
      for(const lg of logs){
        const parsed=iface.parseLog(lg);
        const id=parsed.args.offerId.toString();
        if(!seen.has(id)){ seen.add(id); fromLogs.push(id); }
      }
    }catch(e){
      console.warn("getLogs failed. Showing saved only.", e);
    }

    offerIds = mergeIds(saved, fromLogs).map(x=>BigInt(x));
  }

  async function loadOffersDetails(){
    const out=[];
    for(const id of offerIds){
      try{
        const o=await contractRead.offers(id);
        out.push({
          id, seller:o.seller, buyer:o.buyer, amount:o.amount,
          createdAt:Number(o.createdAt), expiresAt:Number(o.expiresAt),
          payWindowSec:Number(o.payWindowSec), status:Number(o.status),
          payAsset:o.payAsset, payNetwork:o.payNetwork, payTo:o.payTo, txid:o.txid
        });
      }catch{}
    }
    offersCache=out;
  }

  function updateCounters(){
    el.paidCount.textContent=String(offersCache.filter(o=>o.status===2).length);
    el.disputeCount.textContent=String(offersCache.filter(o=>o.status===3).length);
    el.doneCount.textContent=String(offersCache.filter(o=>o.status===4 || o.status===5).length);
  }

  function applyFilters(list){
    const f=el.filter.value;
    const q=el.q.value||"";
    let x=list.slice();

    if(f==="open") x=x.filter(o=>o.status===0);
    if(f==="locked") x=x.filter(o=>o.status===1);
    if(f==="paid") x=x.filter(o=>o.status===2);
    if(f==="disputed") x=x.filter(o=>o.status===3);
    if(f==="finalized") x=x.filter(o=>o.status===4 || o.status===5);

    if(f==="mine"){
      if(!me) x=[];
      else{
        const m=me.toLowerCase();
        x=x.filter(o => (o.seller||"").toLowerCase()===m || (o.buyer||"").toLowerCase()===m);
      }
    }
    if(q) x=x.filter(o=>matchesQuery(o,q));
    return x;
  }

  function paginate(list){
    totalPages=Math.max(1, Math.ceil(list.length/PAGE_SIZE));
    page=Math.min(Math.max(1,page), totalPages);
    const start=(page-1)*PAGE_SIZE;
    return list.slice(start, start+PAGE_SIZE);
  }

  function renderMarket(){
    updateCounters();
    const filtered=applyFilters(offersCache);
    el.count.textContent=String(filtered.length);

    const items=paginate(filtered);
    el.pageInfo.textContent=`${page} / ${totalPages}`;
    el.prev.disabled=(page<=1);
    el.next.disabled=(page>=totalPages);

    el.offers.innerHTML="";
    if(!items.length){
      const div=document.createElement("div");
      div.className="muted";
      div.textContent=(el.filter.value==="mine" && !me) ? "Connect wallet to view your offers." : "No offers found. Click Refresh.";
      el.offers.appendChild(div);
      return;
    }

    for(const o of items){
      const li=document.createElement("li");
      li.className="offer";

      const net=PAY_NETWORKS.find(n=>n.key===o.payNetwork);
      const netLogo=net?.logo||"";
      const assetLogo=TOKEN_LOGO[o.payAsset]||"";

      const meta=unpackPayTo(o.payTo);
      const amtInriStr = (()=>{ try{return ethers.formatEther(o.amount);}catch{return "0";} })();
      const feeInri = calcFeeInriFromInriAmount(amtInriStr);
      const netInri = calcNetInri(amtInriStr, feeInri);

      const priceLine = meta.price ? `• price ${meta.price} ${o.payAsset}` : "";
      const totalLine = meta.total ? `• pay ${meta.total} ${o.payAsset}` : "";

      const expiresAttr = Number(o.expiresAt||0);

      li.innerHTML=`
        <div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px">
          <div style="min-width:200px">
            <div class="row" style="gap:8px">
              ${statusTag(o.status)}
              <span class="tag">${imgOrFallback(assetLogo,o.payAsset)} ${o.payAsset||"—"}</span>
              <span class="tag">${imgOrFallback(netLogo,o.payNetwork)} ${o.payNetwork||"—"}</span>
            </div>

            <div style="margin-top:8px;font-weight:900;font-size:15px">${fmtInri(o.amount)} INRI</div>
            <div class="muted2">Offer <span class="mono">#${o.id.toString()}</span></div>
            <div class="muted2" style="margin-top:5px">${priceLine} ${totalLine}</div>
            <div class="muted2" style="margin-top:3px">• buyer fee: ${feeInri||"—"} INRI • buyer receives: ~${netInri||"—"} INRI</div>
          </div>

          <div class="right" style="min-width:180px">
            <div class="muted2">Seller</div>
            <div class="mono">${short(o.seller)}</div>
            <div class="muted2" style="margin-top:6px">Buyer</div>
            <div class="mono">${o.buyer && o.buyer!==ethers.ZeroAddress ? short(o.buyer) : "—"}</div>
          </div>
        </div>

        <div class="kvs">
          <div class="kv"><div class="k">Window</div><div class="v">${Math.round(o.payWindowSec/60)} min</div></div>
          <div class="kv">
            <div class="k">Time Left</div>
            <div class="v mono timeLeftCell" data-status="${o.status}" data-expires="${expiresAttr}">
              ${timeLeftForOffer(o.status, o.expiresAt)}
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-ghost" data-act="view" data-id="${o.id.toString()}">View</button>
          <button class="btn btn-pri" data-act="quick" data-id="${o.id.toString()}">${(statusLabel(o.status)==="OPEN" ? "Accept" : "Open")}</button>
        </div>
      `;
      el.offers.appendChild(li);
    }
  }

  async function refreshMarket(){
    toast("Syncing…");
    if(!contractRead){
      await buildRpcProvider();
      if(!rpcProvider){
        toast("RPC is down. Connect wallet.", 3200);
        return;
      }
    }

    await loadContractInfo();
    await loadOfferIds();
    await loadOffersDetails();

    const providerName = rpcProvider ? `Public RPC (${new URL(activeRpcUrl).host})` : "Wallet Provider";
    const savedCount=loadSavedIds().length;

    el.syncInfo.textContent=`Synced • Provider: ${providerName} • Saved: ${savedCount} ${lastBlock?("• block "+lastBlock):""}`;
    if(!lastSeenBlock && lastBlock) lastSeenBlock=lastBlock;
    el.activityPill.textContent=lastSeenBlock?("block "+lastSeenBlock):(lastBlock?("block "+lastBlock):"—");

    renderMarket();
    await refreshWithdrawable();
    toast("Updated ✅", 1200);
  }

  // =======================
  // Live activity (RPC)
  // =======================
  async function pollActivity(){
    try{
      if(!contractRead) return;
      const provider=contractRead.runner.provider;
      const latest=await provider.getBlockNumber();
      if(!lastSeenBlock) lastSeenBlock=latest;
      if(latest<=lastSeenBlock) return;

      const from=lastSeenBlock+1, to=latest;
      const tPaid=iface.getEvent("MarkedPaid").topicHash;
      const tDisp=iface.getEvent("DisputeOpened").topicHash;

      const logs=await provider.getLogs({address:CONTRACT,fromBlock:from,toBlock:to,topics:[[tPaid,tDisp]]});

      let touched=false;
      for(const lg of logs){
        const parsed=iface.parseLog(lg);
        if(!parsed) continue;
        if(parsed.name==="MarkedPaid"){ touched=true; bumpAlert(`💠 Offer #${parsed.args.offerId.toString()} marked as PAID`); }
        if(parsed.name==="DisputeOpened"){ touched=true; bumpAlert(`⚠ Dispute opened on offer #${parsed.args.offerId.toString()}`); }
      }
      lastSeenBlock=latest;
      el.activityPill.textContent="block "+latest;
      if(touched) await refreshMarket();
    }catch(e){}
  }
  function startLiveActivity(){
    if(pollTimer) return;
    pollTimer=setInterval(pollActivity, 9000);
  }

  // =======================
  // Modal
  // =======================
  function openModal(){ el.backdrop.style.display="flex"; }
  function closeModal(){ el.backdrop.style.display="none"; modalId=null; modalOffer=null; el.mTxid.value=""; }
  el.mClose.addEventListener("click", closeModal);
  el.backdrop.addEventListener("click", (e)=>{ if(e.target===el.backdrop) closeModal(); });

  async function updateDisputeToolingUI(){
    // defaults hidden
    el.btnOwnerRelease.style.display="none";
    el.btnOwnerRefund.style.display="none";
    el.btnVoteBuyer.style.display="none";
    el.btnVoteSeller.style.display="none";

    let role = "GUEST";
    let youVoted = "—";
    let votesB = "—", votesS = "—";
    let mods = "—", thr = "—";

    const st = modalOffer ? statusLabel(modalOffer.status) : "—";
    if(!modalOffer || !contractRead){
      el.mRoleLine.textContent = "Role: —";
      el.mModsLine.textContent = "Mods: — • Threshold: — • Votes: buyer — / seller — • You voted: —";
      return;
    }

    // load on demand
    if(!ownerAddr || ownerAddr===ethers.ZeroAddress){
      try{ ownerAddr = await contractRead.owner(); }catch{}
    }
    try{ modsEnabled = await contractRead.moderatorsEnabled(); }catch{}
    try{ modThreshold = Number(await contractRead.modThreshold()); }catch{}

    const isOwner = me && ownerAddr && me.toLowerCase()===ownerAddr.toLowerCase();
    let isMod = false;
    if(me){
      try{ isMod = await contractRead.isModerator(me); }catch{ isMod=false; }
    }

    if(isOwner) role = "OWNER";
    else if(isMod) role = "MODERATOR";
    else if(me) role = "USER";

    // votes (only meaningful in DISPUTED)
    if(st==="DISPUTED"){
      try{ votesB = String(await contractRead.votesToBuyer(modalId)); }catch{}
      try{ votesS = String(await contractRead.votesToSeller(modalId)); }catch{}
      try{
        const v = me ? Number(await contractRead.modVote(modalId, me)) : 0;
        youVoted = v===0 ? "no" : (v===1 ? "release" : "refund");
      }catch{ youVoted="—"; }
    }

    mods = modsEnabled ? "ENABLED" : "DISABLED";
    thr = String(modThreshold);

    el.mRoleLine.textContent = `Role: ${role} • Owner: ${ownerAddr ? short(ownerAddr) : "—"}`;
    el.mModsLine.textContent = `Mods: ${mods} • Threshold: ${thr} • Votes: buyer ${votesB} / seller ${votesS} • You voted: ${youVoted}`;

    // show/hide buttons
    if(st==="DISPUTED"){
      if(isOwner){
        el.btnOwnerRelease.style.display="inline-flex";
        el.btnOwnerRefund.style.display="inline-flex";
      }
      if(modsEnabled && isMod){
        el.btnVoteBuyer.style.display="inline-flex";
        el.btnVoteSeller.style.display="inline-flex";
      }
    }
  }

  function setModalButtonsState(){
    if(!modalOffer){
      el.btnAccept.disabled=el.btnPaid.disabled=el.btnRelease.disabled=el.btnDispute.disabled=el.btnCancel.disabled=el.btnReclaim.disabled=true;
      el.btnOwnerRelease.disabled=el.btnOwnerRefund.disabled=el.btnVoteBuyer.disabled=el.btnVoteSeller.disabled=true;
      return;
    }
    const st=statusLabel(modalOffer.status);
    const isSeller=me && modalOffer.seller && modalOffer.seller.toLowerCase()===me.toLowerCase();
    const isBuyer=me && modalOffer.buyer && modalOffer.buyer.toLowerCase()===me.toLowerCase();

    el.btnAccept.disabled = !(st==="OPEN" && me && !isSeller);
    el.btnPaid.disabled = !(st==="LOCKED" && me && isBuyer);
    el.btnRelease.disabled = !((st==="PAID" || st==="DISPUTED") && me && isSeller);
    el.btnDispute.disabled = !(st==="PAID" && me && isBuyer);
    el.btnCancel.disabled = !(st==="OPEN" && me && isSeller);
    el.btnReclaim.disabled = !(st==="LOCKED" && me && isSeller && Number(modalOffer.expiresAt)>0 && nowSec()>Number(modalOffer.expiresAt));

    // dispute buttons enablement is checked again on click (but keep sensible)
    el.btnOwnerRelease.disabled = !(st==="DISPUTED" && me);
    el.btnOwnerRefund.disabled  = !(st==="DISPUTED" && me);
    el.btnVoteBuyer.disabled    = !(st==="DISPUTED" && me);
    el.btnVoteSeller.disabled   = !(st==="DISPUTED" && me);

    const note=[];
    note.push(`Status: ${st}`);
    if(isSeller) note.push("You are the seller.");
    if(isBuyer) note.push("You are the buyer.");
    if(!me) note.push("Connect wallet to interact.");
    note.push(`Time left: ${timeLeftForOffer(modalOffer.status, modalOffer.expiresAt)}`);
    if(st==="PAID") note.push("Seller must confirm payment and release.");
    if(st==="DISPUTED") note.push("Dispute opened. Owner/mods decide.");
    el.mNote.textContent=note.join(" ");
  }

  async function showOffer(idStr){
    const id=BigInt(idStr);
    const o=await contractRead.offers(id);

    modalId=id;
    modalOffer={
      id, seller:o.seller, buyer:o.buyer, amount:o.amount,
      createdAt:Number(o.createdAt), expiresAt:Number(o.expiresAt),
      payWindowSec:Number(o.payWindowSec), status:Number(o.status),
      payAsset:o.payAsset, payNetwork:o.payNetwork, payTo:o.payTo, txid:o.txid
    };

    const st=statusLabel(modalOffer.status);
    el.mTitle.textContent=`Offer #${idStr} — ${st}`;
    el.mSub.textContent=`Seller ${short(modalOffer.seller)} • Amount ${fmtInri(modalOffer.amount)} INRI`;

    const payNet=PAY_NETWORKS.find(n=>n.key===modalOffer.payNetwork);
    const assetLogo=TOKEN_LOGO[modalOffer.payAsset]||"";
    const netLogo=payNet?.logo||"";
    const meta=unpackPayTo(modalOffer.payTo);

    const amtInriStr = (()=>{ try{return ethers.formatEther(modalOffer.amount);}catch{return "0";} })();
    const feeInri = calcFeeInriFromInriAmount(amtInriStr);
    const netInri = calcNetInri(amtInriStr, feeInri);

    const feeRecipientLine = feeRecipient ? `Fee recipient: <span class="mono">${feeRecipient}</span><br>` : "";

    el.mDetails.innerHTML=`
      <div class="row" style="justify-content:space-between;gap:10px;flex-wrap:wrap">
        <span class="pill">${statusTag(modalOffer.status)}</span>
        <span class="pill mono">#${idStr}</span>
      </div>
      <div class="hr"></div>
      <div><b>Amount</b>: ${fmtInri(modalOffer.amount)} INRI</div>
      <div><b>Buyer fee</b>: <span class="mono">${feeInri||"—"}</span> INRI (${(feeBps/100).toFixed(2)}%)</div>
      <div><b>Buyer receives (net)</b>: <span class="mono">${netInri||"—"}</span> INRI</div>
      <div class="muted2" style="margin-top:6px">${feeRecipientLine}Deducted when seller releases; buyer withdraws net.</div>
      <div class="hr"></div>
      <div><b>Off-chain price</b>: <span class="mono">${meta.price||"—"}</span> ${modalOffer.payAsset}</div>
      <div><b>Off-chain total</b>: <span class="mono">${meta.total||"—"}</span> ${modalOffer.payAsset}</div>
      <div class="hr"></div>
      <div><b>Seller</b>: <span class="mono">${modalOffer.seller}</span></div>
      <div><b>Buyer</b>: <span class="mono">${modalOffer.buyer && modalOffer.buyer!==ethers.ZeroAddress ? modalOffer.buyer : "—"}</span></div>
      <div><b>Window</b>: ${Math.round(modalOffer.payWindowSec/60)} min</div>
      <div><b>Time left</b>: <span class="mono">${timeLeftForOffer(modalOffer.status, modalOffer.expiresAt)}</span></div>
      <div><b>TxID</b>: <span class="mono">${modalOffer.txid ? modalOffer.txid : "—"}</span></div>
    `;

    el.mPayHint.innerHTML=`
      <b>Payment instructions</b><br>
      Pay exactly <b>${meta.total||"—"} ${modalOffer.payAsset||"—"}</b> on <b>${modalOffer.payNetwork||"—"}</b> to:<br>
      <span class="mono">${meta.address||"—"}</span><br><br>
      Then paste the <b>TxID</b> and click <b>I Paid</b>.<br>
      <b>INRI fee:</b> Buyer pays <b>${feeBps} bps</b> (${(feeBps/100).toFixed(2)}%) in INRI — deducted on release.
    `;

    el.mLogos.innerHTML=`
      <span class="chip">${imgOrFallback(TOKEN_LOGO.INRI,"INRI")} INRI</span>
      <span class="chip">${imgOrFallback(assetLogo,modalOffer.payAsset)} ${modalOffer.payAsset||"—"}</span>
      <span class="chip">${imgOrFallback(netLogo,modalOffer.payNetwork)} ${payNet?.label||modalOffer.payNetwork||"—"}</span>
    `;

    setModalButtonsState();
    openModal();
    await updateDisputeToolingUI();
  }

  async function requireConnected(){
    if(!me || !contractWrite){
      await connectWallet();
    }
    if(!contractWrite) throw new Error("Not connected.");
  }

  // =======================
  // Transactions
  // =======================
  async function txCreate(){
    await requireConnected();

    const amt=(el.inAmount.value||"").trim();
    const payTo=(el.payTo.value||"").trim();
    const mins=Number(el.payWindow.value||30);
    const price=(el.pricePer.value||"").trim();
    const total=calcTotalOffchain();

    if(!amt || Number(amt)<=0) throw new Error("Invalid INRI amount");
    if(!price || Number(price)<=0) throw new Error("Price per INRI required");
    if(!total) throw new Error("Could not calculate off-chain total");
    if(!payTo) throw new Error("Seller receive address required");

    const payWindowSec=Math.max(60, Math.floor(mins*60));
    const valueWei=ethers.parseEther(amt);
    const payToPacked=packPayTo(payTo, price, total);

    toast("Creating offer…");
    const tx=await contractWrite.createOffer(payWindowSec, el.payAsset.value, el.payNetwork.value, payToPacked, {value:valueWei});
    const receipt=await tx.wait();

    try{
      for(const lg of receipt.logs){
        if((lg.address||"").toLowerCase()!==CONTRACT.toLowerCase()) continue;
        const parsed=iface.parseLog(lg);
        if(parsed && parsed.name==="OfferCreated"){ saveId(parsed.args.offerId.toString()); break; }
      }
    }catch{}

    el.inAmount.value=""; el.pricePer.value=""; el.payTo.value="";
    renderPreview();
    await refreshMarket();
    toast("Offer created ✅");
    if(window.innerWidth<=980) showTab("market");
  }

  async function txWithdraw(){
    await requireConnected();
    toast("Withdrawing…");
    const tx=await contractWrite.withdraw();
    await tx.wait();
    await refreshWithdrawable();
    toast("Withdraw complete ✅");
  }

  async function txAccept(){
    await requireConnected();
    toast("Accepting…");
    const tx=await contractWrite.acceptOffer(modalId);
    await tx.wait();
    await refreshMarket();
    await showOffer(modalId.toString());
    toast("Accepted ✅");
  }

  async function txPaid(){
    await requireConnected();
    const txid=(el.mTxid.value||"").trim();
    if(txid.length<6) throw new Error("TxID too short");

    toast("Marking PAID…");
    const tx=await contractWrite.markPaid(modalId, txid);
    await tx.wait();

    bumpAlert(`💠 Offer #${modalId.toString()} marked as PAID`);
    await refreshMarket();
    el.filter.value="paid"; page=1; renderMarket();
    await showOffer(modalId.toString());
    toast("Marked PAID ✅");
  }

  async function txRelease(){
    await requireConnected();
    toast("Releasing…");
    const tx=await contractWrite.releaseToBuyer(modalId);
    await tx.wait();
    await refreshMarket();
    await showOffer(modalId.toString());
    toast("Released ✅");
  }

  async function txDispute(){
    await requireConnected();
    toast("Opening dispute…");
    const tx=await contractWrite.openDispute(modalId);
    await tx.wait();
    bumpAlert(`⚠ Dispute opened on offer #${modalId.toString()}`);
    await refreshMarket();
    el.filter.value="disputed"; page=1; renderMarket();
    await showOffer(modalId.toString());
    toast("Dispute opened ✅");
  }

  async function txReclaim(){
    await requireConnected();
    toast("Reclaiming…");
    const tx=await contractWrite.reclaimIfUnpaid(modalId);
    await tx.wait();
    await refreshMarket();
    closeModal();
    toast("Reclaimed ✅");
  }

  async function txCancel(){
    await requireConnected();
    if(!confirm("Cancel this offer? (Only while OPEN)")) return;
    toast("Cancelling…");
    const tx=await contractWrite.cancelOffer(modalId);
    await tx.wait();
    await refreshMarket();
    closeModal();
    toast("Cancelled ✅");
  }

  // ✅ owner resolve dispute
  async function txOwnerResolve(releaseToBuyerFlag){
    await requireConnected();
    toast(releaseToBuyerFlag ? "OWNER: releasing…" : "OWNER: refunding…");
    const tx = await contractWrite.resolveDisputeOwner(modalId, !!releaseToBuyerFlag);
    await tx.wait();
    await refreshMarket();
    await showOffer(modalId.toString());
    toast("Dispute resolved ✅");
  }

  // ✅ moderator vote
  async function txVote(vote){ // 1=buyer,2=seller
    await requireConnected();
    toast(vote===1 ? "Voting release to buyer…" : "Voting refund to seller…");
    const tx = await contractWrite.voteDispute(modalId, vote);
    await tx.wait();
    await refreshMarket();
    await showOffer(modalId.toString());
    toast("Vote submitted ✅");
  }

  // =======================
  // Events
  // =======================
  el.btnOpenMM.addEventListener("click", openMetaMaskDapp);
  el.btnOpenTW.addEventListener("click", openTrustDapp);

  el.btnConnect.addEventListener("click", ()=>guard.run("connect", el.btnConnect, async ()=>{ await connectWallet(); }));

  el.btnRefresh.addEventListener("click", ()=>guard.run("refresh", el.btnRefresh, async ()=>{ await refreshMarket(); }));
  el.btnRefreshTop.addEventListener("click", ()=>guard.run("refreshTop", el.btnRefreshTop, async ()=>{ await refreshMarket(); }));

  el.btnClearSaved.addEventListener("click", ()=>{
    if(!confirm("Clear saved offers from this device?")) return;
    clearSaved(); toast("Saved cleared ✅"); refreshMarket().catch(()=>{});
  });

  el.prev.addEventListener("click", ()=>{ page=Math.max(1,page-1); renderMarket(); });
  el.next.addEventListener("click", ()=>{ page=Math.min(totalPages,page+1); renderMarket(); });
  el.filter.addEventListener("change", ()=>{ page=1; renderMarket(); });
  el.q.addEventListener("input", ()=>{ page=1; renderMarket(); });

  el.inAmount.addEventListener("input", renderPreview);
  el.payAsset.addEventListener("change", renderPreview);
  el.payNetwork.addEventListener("change", renderPreview);
  el.payWindow.addEventListener("input", renderPreview);
  el.pricePer.addEventListener("input", renderPreview);

  el.tabCreate.addEventListener("click", ()=>showTab("create"));
  el.tabMarket.addEventListener("click", ()=>showTab("market"));

  document.addEventListener("click", async (ev)=>{
    const btn=ev.target.closest("button[data-act]");
    if(!btn) return;
    const id=btn.getAttribute("data-id");
    try{ await showOffer(id); }
    catch(e){ console.error(e); alert("Open offer error: "+prettyErr(e)); }
  });

  // guarded buttons
  el.btnCreate.addEventListener("click", ()=>guard.run("create", el.btnCreate, async ()=>{
    try{ await txCreate(); }catch(e){ console.error(e); alert("Create error: "+prettyErr(e)); }
  }));

  el.btnWithdraw.addEventListener("click", ()=>guard.run("withdraw", el.btnWithdraw, async ()=>{
    try{ await txWithdraw(); }catch(e){ console.error(e); alert("Withdraw error: "+prettyErr(e)); }
  }));

  el.btnAccept.addEventListener("click", ()=>guard.run("accept:"+String(modalId||""), el.btnAccept, async ()=>{
    try{ await txAccept(); }catch(e){ console.error(e); alert("Accept error: "+prettyErr(e)); }
  }));

  el.btnPaid.addEventListener("click", ()=>guard.run("paid:"+String(modalId||""), el.btnPaid, async ()=>{
    try{ await txPaid(); }catch(e){ console.error(e); alert("Mark Paid error: "+prettyErr(e)); }
  }));

  el.btnRelease.addEventListener("click", ()=>guard.run("release:"+String(modalId||""), el.btnRelease, async ()=>{
    try{ await txRelease(); }catch(e){ console.error(e); alert("Release error: "+prettyErr(e)); }
  }));

  el.btnDispute.addEventListener("click", ()=>guard.run("dispute:"+String(modalId||""), el.btnDispute, async ()=>{
    try{ await txDispute(); }catch(e){ console.error(e); alert("Dispute error: "+prettyErr(e)); }
  }));

  el.btnReclaim.addEventListener("click", ()=>guard.run("reclaim:"+String(modalId||""), el.btnReclaim, async ()=>{
    try{ await txReclaim(); }catch(e){ console.error(e); alert("Reclaim error: "+prettyErr(e)); }
  }));

  el.btnCancel.addEventListener("click", ()=>guard.run("cancel:"+String(modalId||""), el.btnCancel, async ()=>{
    try{ await txCancel(); }catch(e){ console.error(e); alert("Cancel error: "+prettyErr(e)); }
  }));

  // ✅ dispute tools
  el.btnOwnerRelease.addEventListener("click", ()=>guard.run("ownerRel:"+String(modalId||""), el.btnOwnerRelease, async ()=>{
    try{
      if(!confirm("OWNER: Release to buyer?")) return;
      await txOwnerResolve(true);
    }catch(e){ console.error(e); alert("Owner resolve error: "+prettyErr(e)); }
  }));
  el.btnOwnerRefund.addEventListener("click", ()=>guard.run("ownerRef:"+String(modalId||""), el.btnOwnerRefund, async ()=>{
    try{
      if(!confirm("OWNER: Refund to seller?")) return;
      await txOwnerResolve(false);
    }catch(e){ console.error(e); alert("Owner resolve error: "+prettyErr(e)); }
  }));
  el.btnVoteBuyer.addEventListener("click", ()=>guard.run("voteB:"+String(modalId||""), el.btnVoteBuyer, async ()=>{
    try{ await txVote(1); }catch(e){ console.error(e); alert("Vote error: "+prettyErr(e)); }
  }));
  el.btnVoteSeller.addEventListener("click", ()=>guard.run("voteS:"+String(modalId||""), el.btnVoteSeller, async ()=>{
    try{ await txVote(2); }catch(e){ console.error(e); alert("Vote error: "+prettyErr(e)); }
  }));

  // =======================
  // Live Time Left (lightweight)
  // =======================
  setInterval(() => {
    document.querySelectorAll(".timeLeftCell").forEach(node=>{
      const st = Number(node.getAttribute("data-status")||0);
      const ex = Number(node.getAttribute("data-expires")||0);
      node.textContent = timeLeftForOffer(st, ex);
    });
    if(modalOffer) setModalButtonsState();
  }, 1000);

  // =======================
  // Init
  // =======================
  (async function init(){
    discoverWallets();
    setTimeout(maybeShowMobileButtons, 400);

    el.contractPill.textContent="Contract: "+CONTRACT.slice(0,6)+"…"+CONTRACT.slice(-4);
    renderPreview();
    showTab("create");

    try{
      const prov = pickBestProvider();
      if(prov){
        const cid=await prov.request({method:"eth_chainId"});
        el.netPill.textContent=(cid && cid.toLowerCase()===CHAIN_HEX.toLowerCase())
          ? `Network: ${CHAIN_NAME}` : `Network: switch to ${CHAIN_NAME}`;
      } else {
        el.netPill.textContent="Network: (no wallet)";
      }
    }catch{ el.netPill.textContent="Network: —"; }

    await buildRpcProvider();

    if(contractRead){
      await loadContractInfo();
      try{ await refreshMarket(); }
      catch(e){
        console.error(e);
        el.syncInfo.textContent="Could not load offers. Connect wallet and click Refresh.";
        toast("Provider error: cannot load offers");
      }
    } else {
      el.syncInfo.textContent="RPC is down. Please connect a wallet and click Refresh.";
      toast("RPC down — connect wallet", 3500);
    }
  })();