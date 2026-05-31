param(
    [string]$ApplicationName = "ai-support-api",
    [string]$Environment = "Production",
    [string]$Region = "us-east-1",
    [string]$Workers = "1",
    [string]$WorkerType = "SMALL"
)

$ErrorActionPreference = "Stop"

if (-not $env:JAVA_HOME) {
    $javaHomeCandidates = @(
        "C:\Program Files\Java\jdk-17.0.13.11-hotspot",
        "C:\Program Files\Java\jdk-17",
        "C:\Program Files\Eclipse Adoptium"
    )

    $javaHome = $javaHomeCandidates |
        Where-Object { Test-Path $_ } |
        Select-Object -First 1

    if ($javaHome -eq "C:\Program Files\Eclipse Adoptium") {
        $javaHome = Get-ChildItem $javaHome -Directory -Filter "jdk-*" |
            Select-Object -ExpandProperty FullName -First 1
    }

    if ($javaHome) {
        $env:JAVA_HOME = $javaHome
    }
}

$mavenCommand = "mvn"
if (-not (Get-Command $mavenCommand -ErrorAction SilentlyContinue)) {
    $localMaven = Join-Path $PSScriptRoot "..\..\apache-maven-3.9.16\bin\mvn.cmd"
    if (Test-Path $localMaven) {
        $mavenCommand = (Resolve-Path $localMaven).Path
    } else {
        throw "Maven was not found on PATH. Install Maven 3.6+ before deploying to CloudHub."
    }
}

if (-not $env:JAVA_HOME) {
    throw "JAVA_HOME is not set. Set it to your JDK path before deploying to CloudHub."
}

if (-not $env:CLOUDHUB_USERNAME) {
    throw "CLOUDHUB_USERNAME is not set."
}

if (-not $env:CLOUDHUB_PASSWORD) {
    throw "CLOUDHUB_PASSWORD is not set."
}

& $mavenCommand clean package mule:deploy `
    -DskipTests `
    "-Dcloudhub.username=$env:CLOUDHUB_USERNAME" `
    "-Dcloudhub.password=$env:CLOUDHUB_PASSWORD" `
    "-Dcloudhub.applicationName=$ApplicationName" `
    "-Dcloudhub.environment=$Environment" `
    "-Dcloudhub.region=$Region" `
    "-Dcloudhub.workers=$Workers" `
    "-Dcloudhub.workerType=$WorkerType"

Write-Host ""
Write-Host "Deployment submitted. Check Runtime Manager for status:"
Write-Host "https://anypoint.mulesoft.com"
Write-Host ""
Write-Host "Expected CloudHub URL after startup:"
Write-Host "https://$ApplicationName.$Region.cloudhub.io/api/v1/support/health"
