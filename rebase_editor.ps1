param($file)
$content = Get-Content $file -Raw
$content = $content -replace "pick 2858a19", "edit 2858a19"
Set-Content -Path $file -Value $content -NoNewline
