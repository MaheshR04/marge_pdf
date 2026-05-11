param (
    [string]$inputPath,
    [string]$outputPath
)

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($inputPath)
    
    # wdFormatPDF = 17
    $doc.SaveAs($outputPath, 17)
    $doc.Close()
    $word.Quit()
    Write-Host "SUCCESS"
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
    exit 1
}
