$ErrorActionPreference = "Stop"

$launcher = Join-Path $PSScriptRoot "start-trashdash.js"

node $launcher --frontend-only @args
