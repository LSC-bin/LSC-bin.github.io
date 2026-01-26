# Security Guide for Next.js on Linux Server

리눅스 서버로 웹페이지를 이전할 때 고려해야 할 주요 보안 조치사항입니다.

## 1. 서버 기본 보안 (Server Basics)
가장 기초적이지만 중요한 단계입니다.

*   **SSH 키 사용**: 비밀번호 로그인을 비활성화하고 SSH 키 쌍을 사용하여 접속하세요.
*   **방화벽 설정 (UFW)**: 필요한 포트만 열어두세요.
    *   22 (SSH), 80 (HTTP), 443 (HTTPS)
    *   `sudo ufw allow ssh`
    *   `sudo ufw allow http`
    *   `sudo ufw allow https`
    *   `sudo ufw enable`
*   **Fail2Ban 설치**: 무차별 대입 공격(Brute Force)을 막기 위해 설치하세요. 일정 횟수 이상 로그인 실패 시 해당 IP를 차단합니다.
*   **정기적인 업데이트**: `sudo apt update && sudo apt upgrade`를 주기적으로 실행하여 보안 패치를 적용하세요.

## 2. 애플리케이션 보안 (Next.js Application)
Next.js 앱 자체를 보호합니다.

*   **환경 변수 관리 (.env)**: API 키나 비밀번호 같은 민감한 정보는 코드에 하드코딩하지 말고 `.env` 파일로 관리하세요. `.gitignore`에 등록되어 있는지 꼭 확인하세요.
*   **HTTP 헤더 보안**: `next.config.ts`에서 보안 헤더를 추가하여 XSS, Clickjacking 등을 방지할 수 있습니다.
    ```typescript
    // next.config.ts 예시
    const nextConfig = {
      async headers() {
        return [
          {
            source: '/:path*',
            headers: [
              { key: 'X-Frame-Options', value: 'DENY' },
              { key: 'X-Content-Type-Options', value: 'nosniff' },
              // ... 기타 보안 헤더
            ],
          },
        ]
      },
    }
    ```

## 3. 배포 및 네트워크 보안 (Deployment & Network)
*   **HTTPS (SSL/TLS)**: **필수**입니다. Let's Encrypt(Certbot)를 사용하면 무료로 인증서를 발급받을 수 있습니다. Nginx와 함께 설정하는 것이 일반적입니다.
*   **Nginx (Reverse Proxy)**: Node.js(Next.js)를 직접 80번 포트에 노출하지 말고, Nginx를 앞단에 두어 리버스 프록시로 사용하세요. 보안 및 성능 면에서 유리합니다.
*   **PM2 사용**: 앱이 비정상 종료되어도 자동으로 재시작되도록 PM2 프로세스 매니저를 사용하세요.
*   **Rate Limiting**: 특정 IP에서 너무 많은 요청을 보내지 못하도록 Nginx나 미들웨어에서 제한을 거세요. DDoS 공격 완화에 도움이 됩니다.

## 4. 추가 팁 (Cloudflare)
서버 앞단에 **Cloudflare** 같은 CDN을 사용하면 DNS 레벨에서 디도스 방어, 캐싱, SSL 처리를 쉽게 할 수 있어 강력히 추천합니다.

## 5. 코드 변조 방지 (Code Integrity)
가장 걱정하시는 부분인 "외부인이 코드를 수정할 수 있는지"에 대한 답변입니다.

1.  **웹 접속 만으로는 불가능**: 일반적인 사용자가 브라우저로 접속(HTTP/HTTPS)하는 것만으로는 서버의 소스 코드를 수정할 수 **없습니다**. 웹 서버는 요청에 대한 응답(HTML, CSS, JS 등)만 줄 뿐, 서버 내부 파일을 쓰거나 지울 권한을 주지 않기 때문입니다.
2.  **SSH 접근 통제**: 코드를 수정하려면 서버에 '로그인'을 해야 합니다. 앞서 설명한 **SSH 키** 방식만 허용하고 비밀번호 로그인을 막아두면, 그 키를 가진(본인) 사람 외에는 서버에 들어올 수조차 없습니다.
3.  **파일 권한 (Permissions)**: 리눅스 파일 시스템 권한을 통해 안전장치를 더할 수 있습니다.
    *   웹 서버(Nginx 등)가 실행되는 계정(`www-data` 등)에게는 **읽기(Read)** 권한만 주고, **쓰기(Write)** 권한은 주지 마세요. 이렇게 하면 해커가 웹 취약점을 통해 들어오더라도 파일을 변조하기 매우 어려워집니다.
    *   예: `chmod 755`(소유자만 쓰기 가능) 또는 `chmod 555`(모두 읽기만 가능) 설정.
