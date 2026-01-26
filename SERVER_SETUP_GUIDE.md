# Mini PC Linux Server Setup Guide (Next.js)

미니 PC를 활용하여 리눅스(Ubuntu Server) 기반의 홈 서버를 구축하고, Next.js 웹사이트를 배포하는 전체 과정을 안내합니다.

## 1. 준비물
*   **미니 PC**: 인터넷 연결이 가능한 PC
*   **USB 메모리**: 8GB 이상 (부팅 디스크용)
*   **키보드/모니터**: 초기 설치 시 미니 PC에 연결 필요
*   **인터넷 공유기**: 포트포워딩 설정이 가능한 공유기

## 2. 리눅스 설치 (Ubuntu Server)
GUI(그래픽 화면)가 없는 서버 버전을 추천합니다. 가볍고 안정적이며 리소스 소모가 적습니다.

1.  **부팅 USB 만들기**:
    *   다른 PC에서 [Ubuntu Server LTS 다운로드](https://ubuntu.com/download/server).
    *   [Rufus](https://rufus.ie/) 프로그램을 이용해 다운로드한 ISO 파일을 USB에 굽습니다.
2.  **설치**:
    *   미니 PC에 USB를 꽂고 부팅합니다 (BIOS에서 부팅 순서를 USB 우선으로 변경).
    *   화면 안내에 따라 설치를 진행합니다.
    *   **중요**: 설치 중 **"Install OpenSSH server"** 옵션을 반드시 체크하세요. (나중에 원격 접속을 위해 필수)
    *   사용자 이름/비밀번호를 잘 기억해두세요.

## 3. 초기 설정 (PC 또는 SSH 접속)
설치가 끝나면 USB를 빼고 재부팅합니다. 이제부터는 같은 공유기에 연결된 다른 컴퓨터에서 터미널(CMD, PowerShell)을 통해 원격으로 제어할 수 있습니다.

```bash
# 다른 PC에서 접속 (username은 설치 때 정한 ID, ip-address는 미니 PC의 IP)
ssh username@192.168.0.x
```

### 필수 패키지 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 기본 도구 설치 (git, curl 등)
sudo apt install -y git curl build-essential
```

## 4. Node.js 설치
Next.js 실행을 위해 Node.js를 설치합니다.

```bash
# NodeSource를 통해 Node.js 설치 (LTS 버전)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 설치 확인
node -v
npm -v
```

## 5. 프로젝트 배포 (방법 A: Git & PM2 사용)
가장 일반적인 방법입니다.

### 코드 가져오기 (Git 사용)
```bash
# 깃허브 등에서 프로젝트 클론 (자신의 레포지토리 주소)
git clone https://github.com/username/repository.git
cd repository
```

### 코드 가져오기 (방법 B: 파일 직접 전송)
Git을 쓰지 않고 내 컴퓨터의 파일을 서버로 직접 보내고 싶다면 `scp` 명령어를 씁니다. (윈도우 CMD/PowerShell에서 실행)

```bash
# 사용법: scp -r [내 컴퓨터 폴더 경로] [사용자ID]@[서버IP]:[서버 저장 경로]
scp -r C:\Users\82102\Desktop\cursor-workspace\codeviewer_webpage username@192.168.0.x:~/codeviewer
```

---

## 6. 도커(Docker)로 배포하기 (추천)
환경 설정을 더 깔끔하게 관리하고 싶다면 도커를 사용하세요.

### 1) 도커 설치
```bash
# 도커 설치 스크립트 실행
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 도커 그룹에 추가 (sudo 없이 docker 명령어 사용)
sudo usermod -aG docker $USER
# (설정 적용을 위해 로그아웃 후 다시 로그인 필요)
exit
ssh username@192.168.0.x
```

### 2) Dockerfile 작성
현재 프로젝트가 **정적 내보내기(`output: 'export'`)** 설정이 되어 있다면, Nginx를 포함한 가벼운 이미지를 추천합니다.

#### 옵션 A: 정적 사이트용 (현재 설정 권장)
`next.config.ts`에 `output: 'export'`가 있는 경우 사용하세요.

```dockerfile
# Dockerfile (Static)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx로 정적 파일 서빙
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
# 3000번 대신 80번 포트 사용
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 옵션 B: Node.js 서버용 (동적 기능 필요 시)
SSR(서버 사이드 렌더링)이나 API 라우트가 필요하다면 `next.config.ts`에서 `output: 'standalone'`으로 변경 후 사용하세요.

```dockerfile
# Dockerfile (Standalone)
FROM node:18-alpine AS base
# ... (기본 Node.js 이미지 설정)
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 실행 단계
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
# (standalone 폴더 복사 필요)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### 3) 도커 이미지 빌드 및 실행
**옵션 A(정적)**를 선택한 경우 포트 설정이 다릅니다.

```bash
# 이미지 빌드
docker build -t my-web-app .

# 컨테이너 실행 (호스트 80번 <-> 컨테이너 80번)
docker run -d --name my-web-container -p 80:80 --restart always my-web-app
```
(옵션 B라면 `-p 3000:3000` 사용)

이제 `PM2` 없이 도커가 알아서 앱을 실행하고 유지합니다.

---

## 7. Nginx (웹 서버) 설정
사용자가 도메인이나 IP로 접속했을 때 3000번 포트로 연결해주기 위해 Nginx를 설치합니다. (도커를 써도 Nginx를 앞단에 두는 것이 좋습니다)

```bash
# Nginx 설치
sudo apt install -y nginx

# 방화벽 설정
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 설정 파일 수정
```bash
sudo nano /etc/nginx/sites-available/default
```

파일 내용을 지우고 아래 내용으로 채워넣습니다 (기본적인 리버스 프록시 설정):

```nginx
server {
    listen 80;
    server_name _;  # 도메인이 있다면 도메인 입력

    location / {
        proxy_pass http://localhost:3000;
        # (도커 옵션 A를 썼다면 도커가 이미 80포트를 쓰므로 Nginx 설정 불필요하거나 프록시 포트 조정 필요)
        # Nginx를 호스트에 직접 설치했다면, 도커 컨테이너 포트를 3000으로 매핑하고 여기서 받으면 됨.
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
저장(`Ctrl+O`, `Enter`) 후 종료(`Ctrl+X`).

```bash
# Nginx 재시작
sudo systemctl restart nginx
```

## 8. 외부 접속 설정 (집 밖에서 접속하기)
1.  **고정 IP 할당 (공유기 설정)**: 공유기 관리자 페이지에서 미니 PC의 내부 IP(192.168.0.x)를 고정합니다.
2.  **포트포워딩**: 공유기 설정에서 외부의 **80번(HTTP)** 포트와 **443번(HTTPS)** 포트로 들어오는 요청을 미니 PC의 IP로 전달하도록 설정합니다.
    *   외부 포트 80 -> 내부 IP: 80
    *   외부 포트 443 -> 내부 IP: 443
    *   (선택) 외부 포트 2222 -> 내부 IP: 22 (보안을 위해 22번 대신 다른 포트 사용 권장)
3.  **DDNS 설정**: 가정용 인터넷은 IP가 바뀔 수 있으므로, 공유기나 무료 DDNS 서비스를 이용해 도메인(예: `myhouse.iptime.org`)을 연결합니다.

## 9. HTTPS 보안 적용 (마무리)
도메인이 연결되었다면 **Certbot**으로 무료 SSL 인증서를 발급받습니다.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx
```
안내에 따라 이메일 입력 등을 완료하면 자동으로 HTTPS가 적용됩니다.
