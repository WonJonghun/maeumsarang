@echo off
setlocal
chcp 65001 >nul

echo 마음사랑병원 인트라넷 인증서를 현재 Windows 계정에 등록합니다.
echo 인증서 보안 경고가 표시되면 아래 지문을 확인한 뒤 설치해 주세요.
echo SHA-1: 49 A2 ED 94 EF D6 04 7D A4 55 19 05 67 BF BB 41 C3 08 D2 B1
echo.

powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; $bytes=[Convert]::FromBase64String('MIIDjjCCAnagAwIBAgIICor9DFhWXtIwDQYJKoZIhvcNAQEMBQAwZjELMAkGA1UEBhMCS1IxDjAMBgNVBAgTBVNlb3VsMQ4wDAYDVQQHEwVTZW91bDERMA8GA1UEChMISW50cmFuZXQxDDAKBgNVBAsTA0RldjEWMBQGA1UEAxMNMTkyLjE2OC45MC4yMDAeFw0yNTEyMDUwMzAyNTNaFw0zNTEyMDMwMzAyNTNaMGYxCzAJBgNVBAYTAktSMQ4wDAYDVQQIEwVTZW91bDEOMAwGA1UEBxMFU2VvdWwxETAPBgNVBAoTCEludHJhbmV0MQwwCgYDVQQLEwNEZXYxFjAUBgNVBAMTDTE5Mi4xNjguOTAuMjAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDRU46WBqKZHk/SF5y/qMg9xFFHTP8ust7l+H9Io3DxPCTzgyExnBwbVlZvoeKZ4cU9v8k/P5XoqZQLAP30Pi+jd4ar453yM8G3C6V4K1lgvNMFsLvgYkrSiIH8jpEr3djVEeVezVq2IlQlDnMSbUyFFeqS+UrMubtiMqchwm8dqYaSZE+9NfxYkCcUyt6Wt5iBXga5vrJtoY9vKeciz4/zToIDKWi+0kuHqyBf+GCCF1CsVOPzDC1PGFTzhOT0E3FYeqrIvBmPnl36PPrsjDwP9f+/I0s+wu1hYUSEfXXuXOko9MYFQWZiUf9oFF9f5mEbcu9tgEPaUEg0Qm8wUEkZAgMBAAGjQDA+MB0GA1UdDgQWBBQxrWmSPXqO2i8HbT6sz5awQl8IlDAPBgNVHREECDAGhwTAqFoUMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEMBQADggEBAGEtJ1I4w1lH+8zFPIIhKGuKHyChALncUoYCFZVfCOdboBmBOxjFZImJQv1THE56z1rMXz+Sac6DAKNwxz9wfL3TExshJLmdv5VkSbTTGlqSPa3w1MqysjIT+dBOQ7m0uFM1OCnAcX7CE5wQzKqQ2E7q0EyuhH8SMfmPhgRS/NmesbpTlBJAOOFqfEvsjZ+IF8Ol+FDK8iBmMn8Ysq5VgL3+8qvbWdAONn0o0kgP7VwavFlyse5DzqPzdwbvjxNBUsLD9ocufMRcCfqgxXGutI95ewNsPkjDIaWo6Ex6Y9IiaPX84cZreoE4TA7LOJ6T0U3VH2QbhUl//XG1LFunCtI='); $cert=[System.Security.Cryptography.X509Certificates.X509Certificate2]::new($bytes); if ($cert.Thumbprint -ne '49A2ED94EFD6047DA455190567BFBB41C308D2B1') { throw 'Certificate fingerprint mismatch.' }; if ((Get-Date) -lt $cert.NotBefore -or (Get-Date) -gt $cert.NotAfter) { throw 'Certificate is outside its validity period.' }; $store=[System.Security.Cryptography.X509Certificates.X509Store]::new('Root','CurrentUser'); try { $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite); if ($store.Certificates.Find([System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,$cert.Thumbprint,$false).Count -eq 0) { $store.Add($cert) } } finally { $store.Close(); $cert.Dispose() }"
if errorlevel 1 (
    echo.
    echo 인증서 등록에 실패했습니다. 표시된 오류를 전산 담당자에게 알려주세요.
    pause
    exit /b 1
)

echo.
echo 인증서 등록이 완료되었습니다.
echo Edge 또는 Chrome 창을 모두 닫은 뒤 아래 주소로 다시 접속해 주세요.
echo https://192.168.90.20:8081
pause
exit /b 0
