param (
    [string]$inputPath,
    [string]$outputPath
)

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0 # wdAlertsNone
    $doc = $word.Documents.Open($inputPath, $false, $true) # Open ReadOnly
    
    # wdFormatPDF = 17
    $doc.SaveAs($outputPath, 17)
    $doc.Close(0) # wdDoNotSaveChanges
    $word.Quit()
    $null = [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word)
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    Write-Host "SUCCESS"
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
    exit 1
}
