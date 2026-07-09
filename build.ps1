# build.ps1
# Script to automate building and archiving builder-erp-frontend with high-fidelity terminal UI.

$ErrorActionPreference = "Stop"

# Setup UTF-8 console output encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ANSI escape styling
$esc = [char]27
$Reset = "$esc[0m"
$Bold = "$esc[1m"
$Dim = "$esc[2m"
$Italic = "$esc[3m"
$Underline = "$esc[4m"

# ANSI Colors
$Cyan = "$esc[36m"
$Green = "$esc[32m"
$Red = "$esc[31m"
$Yellow = "$esc[33m"
$Magenta = "$esc[35m"
$Gray = "$esc[90m"

$IconRocket  = [char]0x26A1   # ⚡
$IconGear    = [char]0x2699   # ⚙
$IconClean   = [char]0x25C6   # ◆
$IconBuild   = [char]0x25A0   # ■
$IconZip     = [char]0x26A1   # ⚡
$IconFolder  = [char]0x25C6   # ◆
$IconTruck   = [char]0x25B6   # ▶
$IconParty   = [char]0x2605   # ★
$IconSuccess = [char]0x2714   # ✔
$IconError   = [char]0x2718   # ✖


$envPath = "$PSScriptRoot\.env"
$distPath = "$PSScriptRoot\dist"
$buildDir = "$PSScriptRoot\build"

function Start-Step {
    param (
        [string]$Icon,
        [string]$Message
    )
    Write-Host -NoNewline "`r  $Icon  $Message... $esc[K"
}

function Complete-Step {
    param (
        [string]$Icon,
        [string]$Message,
        [string]$Extra = ""
    )
    $extraStr = ""
    if ($Extra) {
        $extraStr = " $Green$Extra$Reset"
    } else {
        $extraStr = " $Dim(done)$Reset"
    }
    Write-Host "`r  $Green$IconSuccess$Reset  $Message...$extraStr$esc[K"
}

function Fail-Step {
    param (
        [string]$Icon,
        [string]$Message
    )
    Write-Host "`r  $Red$IconError$Reset  $Message... $Red(failed)$Reset$esc[K"
}

function Invoke-ProcessWithSpinner {
    param (
        [string]$Command,
        [string]$Arguments,
        [string]$WorkingDirectory,
        [string]$Message
    )

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $Command
    $psi.Arguments = $Arguments
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.RedirectStandardOutput = $false
    $psi.RedirectStandardError = $false
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi

    $process.Start() | Out-Null

    $spinnerFrames = @(
        [char]::ConvertFromUtf32(0x280B), # ⠋
        [char]::ConvertFromUtf32(0x2819), # ⠙
        [char]::ConvertFromUtf32(0x2839), # ⠹
        [char]::ConvertFromUtf32(0x2838), # ⠸
        [char]::ConvertFromUtf32(0x287C), # ⠼
        [char]::ConvertFromUtf32(0x28B4), # ⠴
        [char]::ConvertFromUtf32(0x2826), # ⠦
        [char]::ConvertFromUtf32(0x2827), # ⠧
        [char]::ConvertFromUtf32(0x2807), # ⠇
        [char]::ConvertFromUtf32(0x280F)  # ⠏
    )
    $i = 0

    while (-not $process.HasExited) {
        $frame = $spinnerFrames[$i % $spinnerFrames.Length]
        Write-Host -NoNewline "`r  $Yellow$frame$Reset  $Message... $esc[K"
        Start-Sleep -Milliseconds 100
        $i++
    }

    $exitCode = $process.ExitCode
    $process.Dispose()

    return $exitCode
}

# Revert function helper to ensure environment is restored on any failure
function Restore-Env {
    if (Test-Path $envPath) {
        $content = Get-Content $envPath -Raw
        if ($content -match '(?m)^VITE_LOCAL_AUTH=.*$') {
            $content = $content -replace '(?m)^VITE_LOCAL_AUTH=.*$', 'VITE_LOCAL_AUTH=true'
            [System.IO.File]::WriteAllText($envPath, $content, [System.Text.Encoding]::UTF8)
        }
    }
}

$separator = "-" * 56

Write-Host ""
Write-Host " $Bold$Magenta$IconRocket  Builder ERP Frontend Archiver$Reset"
Write-Host " $Gray$separator$Reset"

try {
    # 1. Check .env and set VITE_LOCAL_AUTH=false
    Start-Step -Icon $IconGear -Message "Setting local auth workaround"
    if (Test-Path $envPath) {
        $content = Get-Content $envPath -Raw
        if ($content -match '(?m)^VITE_LOCAL_AUTH=.*$') {
            $content = $content -replace '(?m)^VITE_LOCAL_AUTH=.*$', 'VITE_LOCAL_AUTH=false'
        } else {
            $content = $content + "`nVITE_LOCAL_AUTH=false"
        }
        [System.IO.File]::WriteAllText($envPath, $content, [System.Text.Encoding]::UTF8)
        Complete-Step -Icon $IconGear -Message "Setting local auth workaround"
    } else {
        Fail-Step -Icon $IconGear -Message "Setting local auth workaround"
        Write-Error ".env file not found at $envPath"
        exit 1
    }

    # 2. Check if dist exists and delete it
    Start-Step -Icon $IconClean -Message "Cleaning output directory"
    if (Test-Path $distPath) {
        Remove-Item -Recurse -Force $distPath
    }
    Complete-Step -Icon $IconClean -Message "Cleaning output directory"

    # 3. Run npm run build (with spinner and error capturing via temp build log file)
    $buildMessage = "Compiling client assets (vite build)"
    Start-Step -Icon $IconBuild -Message $buildMessage
    $startTime = Get-Date
    
    $logFile = Join-Path $env:TEMP "builder-erp-build-$((Get-Date).Ticks).log"
    if (Test-Path $logFile) { Remove-Item -Force $logFile }

    # We redirect standard output and standard error to a temp file using cmd shell redirection to avoid deadlocking
    $exitCode = Invoke-ProcessWithSpinner -Command "cmd.exe" -Arguments "/c npm run build > `"$logFile`" 2>&1" -WorkingDirectory $PSScriptRoot -Message $buildMessage
    $elapsed = (Get-Date) - $startTime
    $elapsedStr = [string]::Format("({0:N1}s)", $elapsed.TotalSeconds)

    if ($exitCode -eq 0) {
        Complete-Step -Icon $IconBuild -Message $buildMessage -Extra $elapsedStr
        if (Test-Path $logFile) { Remove-Item -Force $logFile }
    } else {
        Fail-Step -Icon $IconBuild -Message $buildMessage
        
        Write-Host "`n$Bold$Red  === BUILD ERROR LOGS ===$Reset"
        if (Test-Path $logFile) {
            $logContent = Get-Content $logFile -Raw
            Write-Host $logContent -ForegroundColor Yellow
            Remove-Item -Force $logFile
        } else {
            Write-Host "  No build logs found." -ForegroundColor Yellow
        }
        Write-Host "$Bold$Red  =========================$Reset"
        
        throw "Build execution failed with exit code $exitCode."
    }

    # 4. Zip the dist folder and name with today's date and time
    $dateStr = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $zipName = "dist-$dateStr.zip"
    $zipPath = "$PSScriptRoot\$zipName"

    Start-Step -Icon $IconZip -Message "Archiving output bundle"
    if (Test-Path $distPath) {
        Compress-Archive -Path $distPath -DestinationPath $zipPath -Force
        Complete-Step -Icon $IconZip -Message "Archiving output bundle"
    } else {
        Fail-Step -Icon $IconZip -Message "Archiving output bundle"
        throw "dist folder was not created by the build process!"
    }

    # 5. Create build folder if doesn't exist
    Start-Step -Icon $IconFolder -Message "Checking build directory"
    if (-not (Test-Path $buildDir)) {
        New-Item -ItemType Directory -Path $buildDir | Out-Null
    }
    Complete-Step -Icon $IconFolder -Message "Checking build directory"

    # 6. Move to build folder
    Start-Step -Icon $IconTruck -Message "Deploying archive to build"
    $destZipPath = "$buildDir\$zipName"
    Move-Item -Path $zipPath -Destination $destZipPath -Force
    Complete-Step -Icon $IconTruck -Message "Deploying archive to build"

    # 7. Remove the dist folder
    Start-Step -Icon $IconClean -Message "Purging temporary build directory"
    if (Test-Path $distPath) {
        Remove-Item -Recurse -Force $distPath
    }
    Complete-Step -Icon $IconClean -Message "Purging temporary build directory"

    # 8. Set VITE_LOCAL_AUTH=true in .env
    Start-Step -Icon $IconGear -Message "Restoring local auth workaround"
    Restore-Env
    Complete-Step -Icon $IconGear -Message "Restoring local auth workaround"

    # Calculate archive details
    $zipSize = (Get-Item $destZipPath).Length
    $zipSizeStr = ""
    if ($zipSize -ge 1MB) {
        $zipSizeStr = [string]::Format("{0:N2} MB", ($zipSize / 1MB))
    } else {
        $zipSizeStr = [string]::Format("{0:N2} KB", ($zipSize / 1KB))
    }

    $separator = "-" * 56

    Write-Host ""
    Write-Host " $Bold$Green$IconParty  Success! Build process completed successfully.$Reset"
    Write-Host " $Gray$separator$Reset"
    Write-Host "  $IconFolder  Location: $Yellow$destZipPath$Reset"
    Write-Host "  $IconBuild  Size:     $Yellow$zipSizeStr$Reset"
    Write-Host " $Gray$separator$Reset"
    Write-Host ""

} catch {
    Write-Host "`n$Bold$Red*** Error encountered: $_$Reset"
    Write-Host "Restoring environment configuration..." -ForegroundColor Yellow
    Restore-Env
    exit 1
}
