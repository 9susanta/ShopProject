# Fast E2E Test Runner with Progress and Time Estimation
$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 FAST E2E TEST RUNNER" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Count test files
$testFiles = Get-ChildItem -Path "cypress\e2e" -Filter "*.cy.ts" -ErrorAction SilentlyContinue
$totalFiles = if ($testFiles) { $testFiles.Count } else { 0 }
Write-Host "📊 Found $totalFiles test files" -ForegroundColor Green

# Estimate time: ~30 seconds per test file (optimized)
$estimatedMinutes = [math]::Round($totalFiles * 0.5, 1)
Write-Host "⏱️  Estimated time: ~$estimatedMinutes minutes" -ForegroundColor Cyan
Write-Host "`nStarting tests...`n" -ForegroundColor Yellow

# Run Cypress with optimized settings
$cypressArgs = @(
    "run",
    "--browser", "electron",
    "--headless",
    "--reporter", "spec"
)

Write-Host "▶️  Running: npx cypress $($cypressArgs -join ' ')`n" -ForegroundColor Gray

# Start Cypress process
$process = Start-Process -FilePath "npx" -ArgumentList $cypressArgs -NoNewWindow -PassThru -WorkingDirectory $PWD

# Monitor progress with time updates
$lastUpdate = Get-Date
$testStarted = $false

while (-not $process.HasExited) {
    Start-Sleep -Milliseconds 1000
    
    $elapsed = (Get-Date) - $startTime
    $elapsedStr = "{0:D2}:{1:D2}" -f [int]$elapsed.TotalMinutes, $elapsed.Seconds
    
    # Show progress every 5 seconds
    if (((Get-Date) - $lastUpdate).TotalSeconds -ge 5) {
        $progress = if ($totalFiles -gt 0) { [math]::Round(($elapsed.TotalSeconds / ($estimatedMinutes * 60)) * 100, 1) } else { 0 }
        if ($progress -gt 100) { $progress = 100 }
        
        Write-Host "⏱️  Elapsed: $elapsedStr | Progress: $progress% | ETA: ~$([math]::Max(0, [math]::Round(($estimatedMinutes * 60) - $elapsed.TotalSeconds)))s" -ForegroundColor Gray
        $lastUpdate = Get-Date
    }
}

# Wait for completion
$process.WaitForExit()
$totalTime = (Get-Date) - $startTime

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 TEST EXECUTION COMPLETE" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
Write-Host "⏱️  Total Time: $([int]$totalTime.TotalMinutes)m $($totalTime.Seconds)s" -ForegroundColor $(if ($totalTime.TotalSeconds -lt ($estimatedMinutes * 60)) { "Green" } else { "Yellow" })
Write-Host "📈 Estimated: ~$estimatedMinutes minutes | Actual: $([math]::Round($totalTime.TotalMinutes, 1)) minutes`n" -ForegroundColor Cyan

exit $process.ExitCode
