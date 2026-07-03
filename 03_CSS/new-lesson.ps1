param(
    [Parameter(Mandatory=$true)]
    [int]$Number
)

$folderName = $Number.ToString("D2")
$lessonPath = Join-Path $PSScriptRoot $folderName
$stylesPath = Join-Path $lessonPath "styles"
$htmlPath   = Join-Path $lessonPath "index.html"
$cssPath    = Join-Path $stylesPath "main.css"

if (Test-Path $lessonPath) {
    Write-Host "이미 존재하는 폴더입니다: $folderName/" -ForegroundColor Yellow
    exit 1
}

New-Item -ItemType Directory -Path $stylesPath -Force | Out-Null

$html = @'
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/main.css">
    <title></title>
</head>
<body>

</body>
</html>
'@

[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)
New-Item -ItemType File -Path $cssPath | Out-Null

Write-Host "생성 완료: $folderName/" -ForegroundColor Green
Write-Host "  $folderName/index.html" -ForegroundColor Cyan
Write-Host "  $folderName/styles/main.css" -ForegroundColor Cyan
