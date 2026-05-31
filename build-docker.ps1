# Docker Build Helper Script for MuleSoft Application
# Windows PowerShell version
# Usage: .\build-docker.ps1 [ImageName] [ImageTag]
# Example: .\build-docker.ps1 mulesoft-app 1.0

param(
    [string]$ImageName = "mulesoft-app",
    [string]$ImageTag = "1.0"
)

$ErrorActionPreference = "Stop"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "MuleSoft Docker Build Helper" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if target JAR exists
$jarFiles = Get-ChildItem -Path "target" -Filter "*.jar" -ErrorAction SilentlyContinue
if ($null -eq $jarFiles -or $jarFiles.Count -eq 0) {
    Write-Host ""
    Write-Host "⚠️  WARNING: No compiled JAR found in target/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please compile the Mule application first:" -ForegroundColor Yellow
    Write-Host "  mvn clean package" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Continue without JAR? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        exit 1
    }
}

# Set image name and tag
$FULL_IMAGE_NAME = "$ImageName`:$ImageTag"

Write-Host ""
Write-Host "Building Docker image: $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host ""

# Build the Docker image
docker build -t $FULL_IMAGE_NAME .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Docker image built successfully: $FULL_IMAGE_NAME" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Cyan
    Write-Host "  docker run -p 8081:8081 $FULL_IMAGE_NAME" -ForegroundColor White
    Write-Host ""
    Write-Host "To push to a registry:" -ForegroundColor Cyan
    Write-Host "  docker tag $FULL_IMAGE_NAME <registry>/<image>:latest" -ForegroundColor White
    Write-Host "  docker push <registry>/<image>:latest" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
