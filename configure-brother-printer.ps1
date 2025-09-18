# PowerShell script to configure Brother QL-820NWB for 62mm continuous tape
# Run as Administrator

Write-Host "Brother QL-820NWB Configuration Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Get the Brother printer
$printer = Get-Printer | Where-Object {$_.Name -like "*Brother*QL-820*"}

if ($null -eq $printer) {
    Write-Host "Brother QL-820NWB printer not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found printer: $($printer.Name)" -ForegroundColor Yellow

# Try to set printer defaults using Windows print management
$printerName = $printer.Name

# Create a custom form for 62mm x 100mm
Write-Host "`nCreating custom paper size (62mm x 100mm)..." -ForegroundColor Yellow

$formName = "62mm x 100mm Hall Pass"

# Use WMI to add custom form (requires admin rights)
try {
    # Delete existing form if it exists
    $existingForm = Get-PrinterForm -Name $formName -ErrorAction SilentlyContinue
    if ($existingForm) {
        Remove-PrinterForm -Name $formName
    }

    # Create new form (dimensions in thousandths of an inch)
    # 62mm = 2.44094 inches = 2441 thousandths
    # 100mm = 3.93701 inches = 3937 thousandths
    Add-PrinterForm -Name $formName -Width 2441 -Height 3937

    Write-Host "Custom form created successfully!" -ForegroundColor Green

    # Set as default for the printer
    Set-PrintConfiguration -PrinterName $printerName -PaperSize $formName -ErrorAction SilentlyContinue

    Write-Host "`nConfiguration complete!" -ForegroundColor Green
    Write-Host "The custom paper size '$formName' is now available in print dialogs." -ForegroundColor Cyan

} catch {
    Write-Host "Error creating custom form: $_" -ForegroundColor Red
    Write-Host "`nPlease run this script as Administrator!" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")