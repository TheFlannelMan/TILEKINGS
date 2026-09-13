# ==========================================================================
# 👑 TILE KINGS LOCAL WEB SERVER & MULTIPLAYER SYNC ENGINE
# Zero external dependencies required - Uses built-in .NET HttpListener
# ==========================================================================

$Port = 8080
$Prefix = "http://*:$Port/"

# Obtain Local IP Address for LAN Sharing
$LocalIP = (Get-NetIPAddress -AddressFamily IPv4 -Type Unicast | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
if (-not $LocalIP) { $LocalIP = "127.0.0.1" }

Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "👑 TILE KINGS LOCAL GAME & DESIGNER SERVER IS RUNNING!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "▶ Local Access (This PC):    http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "▶ Card & Piece Designer:     http://localhost:$Port/designer.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Wi-Fi / Local Network Link for Friends:" -ForegroundColor Yellow
Write-Host "▶ http://${LocalIP}:${Port}/" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "Press Ctrl+C in this window to stop the server.`n" -ForegroundColor Gray

# In-Memory Multiplayer Game State Storage
$GlobalGameState = @{}

# Create .NET HttpListener
$Listener = New-Object System.Net.HttpListener
try {
    $Listener.Prefixes.Add($Prefix)
    $Listener.Start()
} catch {
    # Fallback to localhost prefix if wildcard requires elevation
    $Listener = New-Object System.Net.HttpListener
    $Prefix = "http://localhost:$Port/"
    $Listener.Prefixes.Add($Prefix)
    $Listener.Start()
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

# Open Chrome automatically for user
Start-Process "chrome" "http://localhost:$Port/"

# Server Request Loop
while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.AbsolutePath

        # CORS Headers for Multi-Device Connections
        $Response.Headers.Add("Access-Control-Allow-Origin", "*")
        $Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

        if ($Request.HttpMethod -eq "OPTIONS") {
            $Response.StatusCode = 200
            $Response.Close()
            continue
        }

        # Real-time Multiplayer HTTP Sync API: /api/sync
        if ($UrlPath -eq "/api/sync") {
            $Code = $Request.QueryString["code"]
            if (-not $Code) { $Code = "GLOBAL" }

            if ($Request.HttpMethod -eq "POST") {
                $Reader = New-Object System.IO.StreamReader($Request.InputStream, $Request.ContentEncoding)
                $Body = $Reader.ReadToEnd()
                $GlobalGameState[$Code] = $Body
                $Buffer = [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}')
                $Response.ContentType = "application/json; charset=utf-8"
                $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
            } else {
                $State = $GlobalGameState[$Code]
                if (-not $State) { $State = '{"status":"empty"}' }
                $Buffer = [System.Text.Encoding]::UTF8.GetBytes($State)
                $Response.ContentType = "application/json; charset=utf-8"
                $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
            }
            $Response.Close()
            continue
        }

        # Static File Serving
        if ($UrlPath -eq "/") { $UrlPath = "/index.html" }
        $FilePath = Join-Path (Get-Location) ($UrlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $FilePath -PathType Leaf) {
            $Extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $MimeTypes[$Extension]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }

            $Response.ContentType = $ContentType
            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
        }
        $Response.Close()
    } catch {
        # Continue on request error
    }
}
