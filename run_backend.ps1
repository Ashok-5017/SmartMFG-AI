# Helper Script to Launch the Spring Boot Backend with custom database credentials
$password = Read-Host -Prompt "Enter your MySQL root password"
$username = Read-Host -Prompt "Enter your MySQL username (default is root)"
if ([string]::IsNullOrWhitespace($username)) { $username = "root" }

$env:DB_USERNAME = $username
$env:DB_PASSWORD = $password

Write-Host "Starting Spring Boot Application..." -ForegroundColor Green
java -jar backend/target/monitor-1.0.0.jar
