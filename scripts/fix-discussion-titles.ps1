# Fix discussion titles broken by PowerShell -f title=$item.title parsing
$ErrorActionPreference = "Stop"
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
$discDir = Join-Path $PSScriptRoot "discussions"
$manifest = Get-Content (Join-Path $discDir "manifest.json") -Raw | ConvertFrom-Json
$updateFile = Join-Path $discDir "update-title.graphql"

# manifest order matches discussion numbers 1..6 from seed run
for ($i = 0; $i -lt $manifest.Count; $i++) {
    $num = $i + 1
    $want = $manifest[$i].title
    $nodeId = & $gh api "repos/GravMUD/grav-plugin-mambo-desktop-admin2/discussions/$num" --jq .node_id
    $have = & $gh api "repos/GravMUD/grav-plugin-mambo-desktop-admin2/discussions/$num" --jq .title
    if ($have -eq $want) {
        Write-Host "OK #$num already: $want"
        continue
    }
    $result = & $gh api graphql -F query=@$updateFile -f discussionId=$nodeId -f "title=$want"
    $fixed = ($result | ConvertFrom-Json).data.updateDiscussion.discussion.title
    Write-Host "Fixed #$num : $fixed"
    Start-Sleep -Seconds 1
}

Write-Host "Done."
