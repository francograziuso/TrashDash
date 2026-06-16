$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$launcher = Join-Path $repoRoot "scripts\start-trashdash.js"

node $launcher --frontend-only @args
