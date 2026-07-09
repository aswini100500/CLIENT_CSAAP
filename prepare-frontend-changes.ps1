param (
    [Parameter(Mandatory=$false)]
    [string]$CommitId
)

# Configuration
$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Enter the root directory to run git commands
Push-Location $rootDir

# Validate Git repository
if (-not (Test-Path (Join-Path $rootDir ".git"))) {
    Write-Error "Error: Current directory is not a Git repository root."
    Pop-Location
    return
}

# Resolve CommitId: if not provided, default to the last commit (HEAD~1)
if (-not $CommitId) {
    $hasParent = (git rev-parse --verify HEAD~1 2>$null)
    if ($hasParent) {
        $CommitId = "HEAD~1"
    } else {
        # Fallback if there is only 1 commit in the repo
        $CommitId = "4b825dc642cb6eb9a0ffaa2e478b2d96c7b2143a"
    }
}

# Validate the resolved Commit ID
$resolvedCommit = (git rev-parse --verify $CommitId 2>$null)
if (-not $resolvedCommit) {
    Write-Error "Error: Invalid commit ID, reference, or commit hash: '$CommitId'"
    Pop-Location
    return
}

$shortCommitId = (git rev-parse --short $resolvedCommit)

# Create changes folder at root of the repository if it doesn't exist
$changesRoot = Join-Path $rootDir "changes"
if (-not (Test-Path $changesRoot)) {
    New-Item -ItemType Directory -Path $changesRoot -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$folderName = "changes_${timestamp}"
$targetDir = Join-Path $changesRoot $folderName

# If the directory already exists, append a unique counter suffix to maintain uniqueness
$counter = 1
while (Test-Path $targetDir) {
    $folderName = "changes_${timestamp}_$counter"
    $targetDir = Join-Path $changesRoot $folderName
    $counter++
}

Write-Host "Searching for changed/added files since commit: $CommitId ($shortCommitId)..." -ForegroundColor Cyan

# Get changed/added files, excluding deleted ones
$files = git diff --diff-filter=d --name-only $resolvedCommit HEAD

if (-not $files) {
    Write-Host "No changed or added files found since commit $CommitId." -ForegroundColor Yellow
    Pop-Location
    return
}

# Count file lines correctly
$fileList = @($files)
$fileCount = $fileList.Count

# Filter list to ignore the script itself or changes folder if they are tracked by git
$filteredList = @()
foreach ($f in $fileList) {
    if ([string]::IsNullOrWhiteSpace($f)) { continue }
    # Normalize paths for comparison
    $normalizedF = $f.Replace("\", "/")
    if ($normalizedF -eq "prepare-frontend-changes.ps1" -or $normalizedF -eq "prepare-changes.ps1" -or $normalizedF.StartsWith("changes/")) {
        continue
    }
    $filteredList += $f
}

$fileCount = $filteredList.Count
if ($fileCount -eq 0) {
    Write-Host "No changed files to copy after filtering out script files or changes directory." -ForegroundColor Yellow
    Pop-Location
    return
}

Write-Host "Found $fileCount files. Creating destination folder: $targetDir" -ForegroundColor Cyan

# Create the uniquely named target folder
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

# Copy the files maintaining folder structure
foreach ($f in $filteredList) {
    $src = Join-Path $rootDir $f
    $dest = Join-Path $targetDir $f
    $destParent = Split-Path $dest
    
    # Create sub-folders in target if they don't exist
    if (-not (Test-Path $destParent)) {
        New-Item -ItemType Directory -Path $destParent -Force | Out-Null
    }
    
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Force
        Write-Host "  [OK] $f" -ForegroundColor Green
    } else {
        Write-Warning "  [SKIP] $f (File not found on disk)"
    }
}

Pop-Location
Write-Host "`nFinished! All changes are dumped to: $targetDir" -ForegroundColor Cyan
