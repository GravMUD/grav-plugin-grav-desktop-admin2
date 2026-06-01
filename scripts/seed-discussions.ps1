# Seed GitHub Discussions for grav-plugin-mambo-desktop-admin2
$ErrorActionPreference = "Stop"
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
$root = Split-Path -Parent $PSScriptRoot
$discDir = Join-Path $PSScriptRoot "discussions"
$manifest = Get-Content (Join-Path $discDir "manifest.json") -Raw | ConvertFrom-Json

$existing = @()
try {
    $existing = & $gh api "repos/GravMUD/grav-plugin-mambo-desktop-admin2/discussions?per_page=20" --jq '.[].title' 2>$null
} catch {}

$repoId = & $gh api repos/GravMUD/grav-plugin-mambo-desktop-admin2 --jq .node_id
$catQueryFile = Join-Path $discDir "categories.graphql"
$catsJson = & $gh api graphql -F query=@$catQueryFile
$catMap = @{}
($catsJson | ConvertFrom-Json).data.repository.discussionCategories.nodes | ForEach-Object {
    $catMap[$_.name] = $_.id
}

$mutationFile = Join-Path $discDir "create.graphql"

foreach ($item in $manifest) {
    if ($existing -contains $item.title) {
        Write-Host "SKIP (exists): $($item.title)"
        continue
    }
    $cid = $catMap[$item.category]
    if (-not $cid) { throw "Category not found: $($item.category)" }
    $bodyPath = Join-Path $discDir $item.bodyFile
    $body = Get-Content -Raw -LiteralPath $bodyPath -Encoding UTF8
    $title = [string]$item.title
    $result = & $gh api graphql -F query=@$mutationFile -f repositoryId=$repoId -f categoryId=$cid -f "title=$title" -f body=$body
    $d = ($result | ConvertFrom-Json).data.createDiscussion.discussion
    Write-Host "OK #$($d.number): $($item.title)"
    Write-Host "   $($d.url)"
    Start-Sleep -Seconds 2
}

Write-Host "Done."
