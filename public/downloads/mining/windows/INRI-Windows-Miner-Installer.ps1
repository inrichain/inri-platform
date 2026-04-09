$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$InstallDir = "C:\INRI"
$DataDir = Join-Path $InstallDir "data"
$GethZipUrl = "https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip"
$ZipPath = Join-Path $InstallDir "inri-geth.zip"
$GenesisPath = Join-Path $InstallDir "genesis.json"
$BinaryPath = Join-Path $InstallDir "geth-inri-windows.exe"
$StartMinerBat = Join-Path $InstallDir "start-inri-miner.bat"
$ReinitBat = Join-Path $InstallDir "reinit-inri-chain.bat"
$OpenFolderBat = Join-Path $InstallDir "open-inri-folder.bat"
$WalletNote = Join-Path $InstallDir "wallet.txt"
$Desktop = [Environment]::GetFolderPath("Desktop")
$Bootnodes = "enode://453d847d192861e020ae9bd44734c6d985f07786af3f2543c1a4a4578405c5232215852d02cab335f86376bfed4fb4fe8065f122cf36f41e5c7c805a04d7dc2b@134.199.203.8:30303,enode://5480948164d342bd728bf8a26fae74e8282c5f3fb905b03e25ab708866ea38cb0ec7015211623f0bc6f83aa7afa2dd7ae6789fdda788c5234564a794a938e15f@170.64.222.34:30303"

function Write-Line {
  Write-Host "============================================================" -ForegroundColor DarkCyan
}

function Require-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
    throw "Run this installer as Administrator."
  }
}

function Ask-Wallet {
  while ($true) {
    $wallet = Read-Host "Enter your mining wallet address"
    if ($wallet -match '^0x[a-fA-F0-9]{40}$') {
      return $wallet
    }
    Write-Host "Invalid wallet. Please enter a valid EVM address." -ForegroundColor Yellow
  }
}

function Ask-Threads {
  $defaultThreads = [Environment]::ProcessorCount
  while ($true) {
    $inputValue = Read-Host "Mining threads [$defaultThreads]"
    if ([string]::IsNullOrWhiteSpace($inputValue)) {
      return $defaultThreads
    }
    $threads = 0
    if ([int]::TryParse($inputValue, [ref]$threads) -and $threads -ge 1) {
      return $threads
    }
    Write-Host "Threads must be a number greater than or equal to 1." -ForegroundColor Yellow
  }
}

function Download-OfficialPackage {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Write-Host "Downloading official INRI geth package..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri $GethZipUrl -OutFile $ZipPath
}

function Expand-Package {
  Write-Host "Extracting package..." -ForegroundColor Cyan
  if (Test-Path (Join-Path $InstallDir "INRI-FORK-6000000")) {
    Remove-Item -Recurse -Force (Join-Path $InstallDir "INRI-FORK-6000000")
  }
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $InstallDir -Force

  $candidate = Get-ChildItem -Path $InstallDir -Recurse -File |
    Where-Object { $_.Name -in @('geth-inri-windows-final.exe', 'geth-inri-windows.exe', 'geth.exe') } |
    Select-Object -First 1

  if (-not $candidate) {
    throw "Windows binary not found inside the ZIP package."
  }

  Copy-Item $candidate.FullName $BinaryPath -Force
  Copy-Item $candidate.FullName (Join-Path $InstallDir 'geth.exe') -Force
}

function Write-Genesis {
  $genesis = @'
{
  "config": {
    "chainId": 3777,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "arrowGlacierBlock": 0,
    "grayGlacierBlock": 0,
    "ethash": {}
  },
  "nonce": "0x0000000000000000",
  "timestamp": "0x0",
  "extraData": "0x00",
  "gasLimit": "0x1fffffffffffff",
  "difficulty": "0x1",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x0cec4852f2141aeea1111583e788009a3b18e705": { "balance": "20000000000000000000000000" }
  },
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
'@
  Set-Content -Path $GenesisPath -Value $genesis -Encoding UTF8
}

function Reset-ChainData {
  Write-Host "Cleaning old chaindata..." -ForegroundColor Cyan
  if (Test-Path $DataDir) {
    Remove-Item -Recurse -Force $DataDir
  }
  New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

function Init-Chain {
  Write-Host "Initializing INRI chain..." -ForegroundColor Cyan
  & $BinaryPath --datadir $DataDir init $GenesisPath
}

function Write-HelperFiles($wallet, $threads) {
  $miner = @"
@echo off
set DATADIR=C:\INRI\data
set COINBASE=$wallet
set THREADS=$threads

"$BinaryPath" ^
  --datadir %DATADIR% ^
  --networkid 3777 ^
  --port 30303 ^
  --bootnodes $Bootnodes ^
  --syncmode full ^
  --snapshot=false ^
  --maxpeers 100 ^
  --cache 1024 ^
  --mine ^
  --miner.threads %THREADS% ^
  --miner.etherbase %COINBASE% ^
  --http ^
  --http.addr 0.0.0.0 ^
  --http.port 8545 ^
  --http.api eth,net,web3,txpool,miner ^
  --allow-insecure-unlock ^
  --verbosity 3

pause
"@

  $reinit = @"
@echo off
"$BinaryPath" --datadir "$DataDir" init "$GenesisPath"
pause
"@

  $openFolder = @"
@echo off
start "" "$InstallDir"
"@

  Set-Content -Path $StartMinerBat -Value $miner -Encoding ASCII
  Set-Content -Path $ReinitBat -Value $reinit -Encoding ASCII
  Set-Content -Path $OpenFolderBat -Value $openFolder -Encoding ASCII
  Set-Content -Path $WalletNote -Value "Wallet: $wallet`r`nThreads: $threads`r`nBinary: $BinaryPath" -Encoding UTF8
}

function Try-CreateShortcut($targetPath, $shortcutName) {
  try {
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut((Join-Path $Desktop $shortcutName))
    $shortcut.TargetPath = $targetPath
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.Save()
  }
  catch {
    Write-Host "Could not create desktop shortcut: $shortcutName" -ForegroundColor Yellow
  }
}

function Try-OpenFirewall {
  try {
    netsh advfirewall firewall add rule name="INRI CHAIN P2P TCP" dir=in action=allow protocol=TCP localport=30303 | Out-Null
    netsh advfirewall firewall add rule name="INRI CHAIN P2P UDP" dir=in action=allow protocol=UDP localport=30303 | Out-Null
  }
  catch {
    Write-Host "Firewall rules were not added automatically." -ForegroundColor Yellow
  }
}

Require-Admin
Write-Host ""
Write-Line
Write-Host "           INRI CHAIN WINDOWS MINER INSTALLER" -ForegroundColor Cyan
Write-Line
Write-Host ""
Write-Host "This installer will download the official geth package, write genesis, initialize the chain and create ready-to-use launchers in C:\INRI." -ForegroundColor Gray
Write-Host ""

$wallet = Ask-Wallet
$threads = Ask-Threads

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Download-OfficialPackage
Expand-Package
Write-Genesis
Reset-ChainData
Init-Chain
Write-HelperFiles -wallet $wallet -threads $threads
Try-OpenFirewall
Try-CreateShortcut -targetPath $StartMinerBat -shortcutName "Start INRI Miner.lnk"
Try-CreateShortcut -targetPath $InstallDir -shortcutName "INRI Miner Folder.lnk"

Write-Host ""
Write-Line
Write-Host "INRI miner installed successfully" -ForegroundColor Green
Write-Line
Write-Host "Wallet  : $wallet"
Write-Host "Threads : $threads"
Write-Host "Folder  : $InstallDir"
Write-Host ""
Write-Host "Start mining with: $StartMinerBat" -ForegroundColor Cyan
Write-Host "If you want to reinitialize the chain later, use: $ReinitBat" -ForegroundColor Cyan
Write-Host ""
$launch = Read-Host "Launch the miner now? [Y/n]"
if ([string]::IsNullOrWhiteSpace($launch) -or $launch -match '^(y|yes)$') {
  Start-Process -FilePath $StartMinerBat -WorkingDirectory $InstallDir
}
