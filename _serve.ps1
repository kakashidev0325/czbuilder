$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:8765/')
$listener.Start()
Write-Output 'listening on http://127.0.0.1:8765/'
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath
  if ($rel -eq '/') { $rel = '/index.html' }
  $file = Join-Path (Get-Location) ($rel.TrimStart('/') -replace '/', '\')
  if ((Test-Path -LiteralPath $file) -and -not (Get-Item -LiteralPath $file).PSIsContainer) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
    $type = switch ($ext) {
      '.html' { 'text/html; charset=utf-8' }
      '.css' { 'text/css; charset=utf-8' }
      '.js' { 'text/javascript; charset=utf-8' }
      '.png' { 'image/png' }
      default { 'application/octet-stream' }
    }
    $ctx.Response.ContentType = $type
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}
