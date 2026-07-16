# Install On Another PC Or Phone

This guide helps you run Quantum POS on another PC and access it on phones.

## Option A: Fastest (Docker)

### 1) On the target PC, install prerequisites
- Git
- Docker Desktop

### 2) Clone your repository
```bash
git clone https://github.com/ronnykibichii3-sketch/quantum-pos-system.git
cd quantum-pos-system
```

### 3) Start database + app
```bash
docker compose up -d --build
```

### 4) Open app on the target PC
- http://localhost:3000

### 5) Access from phone on same Wi-Fi
- Find target PC IP
  - Windows PowerShell:
  ```powershell
  Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '169.254*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -ExpandProperty IPAddress
  ```
- Open on phone:
  - http://<TARGET_PC_IP>:3000

### 6) If phone cannot connect
- Ensure both devices are on same Wi-Fi
- Allow Docker/Node through Windows Firewall (Private)
- Check app is up:
  ```bash
  docker compose ps
  ```

## Option B: Node.js Local Runtime

### 1) Install prerequisites
- Node.js 20+
- PostgreSQL 14+

### 2) Clone and install
```bash
git clone https://github.com/ronnykibichii3-sketch/quantum-pos-system.git
cd quantum-pos-system
npm install
```

### 3) Configure env
```bash
copy .env.example .env
```
Update `.env`:
- `DATABASE_URL` to your Postgres credentials and host
- `AUTH_SECRET` to a strong random secret

### 4) Run migrations and start
```bash
npx prisma migrate deploy
npm start
```

### 5) Open locally and from phone
- PC: http://localhost:3000
- Phone: http://<TARGET_PC_IP>:3000

## Multi-store Language Defaults (Shared)
- Login as manager/admin
- Open `Manager Dashboard`
- In `Branch language defaults`:
  - Pick branch
  - Pick language and click `Save branch language`
  - Or click `Use auto detection`
- This is now saved in database and shared across devices

## Verify Installation
- You can sign in
- Cashier dashboard loads
- Start sale -> add item -> pay works
- Manager dashboard shows branch language overview table

## Update Existing Install
```bash
git pull
npm install
npx prisma migrate deploy
npm start
```

For Docker:
```bash
docker compose pull
docker compose up -d --build
```
