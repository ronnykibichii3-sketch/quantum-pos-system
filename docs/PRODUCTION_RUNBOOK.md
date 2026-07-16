# Production Runbook - Payment System

## 1. Purpose
This runbook explains how to install, configure, validate, and operate the payment system in a supermarket environment.

## 2. Architecture Summary
- Backend: Node.js + Express API
- Database: PostgreSQL
- ORM: Prisma
- Frontend: Browser POS UI served by the backend
- Core modules: stores, products, terminals, carts, cart-items, payments, employees, receipts, inventory, forecasts

## 3. Pre-Installation Checklist
- One dedicated Windows PC or server for the first deployment
- Stable local network (LAN/Wi-Fi)
- PostgreSQL installed and reachable
- Node.js 20+ installed
- Port 3000 allowed on private network
- Admin/developer access credentials available

## 4. First-Time Installation
### 4.1 Install Dependencies
```powershell
npm install
```

### 4.2 Configure Environment
Create or update `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/payment_system"
AUTH_SECRET="replace-with-long-random-secret"
PORT=3000
```

### 4.3 Prepare Database
```powershell
npx prisma generate
npx prisma migrate dev --name init_prod
```

### 4.4 Start Application
```powershell
npm start
```

### 4.5 Verify Access
- Local machine: `http://localhost:3000`
- Same network devices: `http://<server-ip>:3000`

## 5. Go-Live Validation (Acceptance Test)
Run this in front of the manager:
1. Create one store.
2. Create one terminal.
3. Add 10 products with barcode, price, VAT, and stock.
4. Create one manager account and one cashier account.
5. Login as cashier.
6. Create cart, add items, and verify totals.
7. Process payment and generate receipt.
8. Verify stock decreases after receipt generation.
9. Verify receipt appears in reports section.
10. Generate forecast and verify warning panel output.

Pass criteria: all 10 steps complete without blocking errors.

## 6. Daily Operations SOP
### Opening
1. Verify server is online.
2. Open POS URL on cashier devices.
3. Manager verifies terminals and product availability.

### During Business Hours
1. Cashiers process sales and receipts.
2. Manager watches low stock and warnings.
3. Report and escalate errors immediately.

### Closing
1. Manager verifies daily totals.
2. Confirm receipt count and sales amount.
3. Run or verify backup completion.

## 7. Incident Response
### App does not open
- Check server process: `npm start`
- Check URL/port availability: `http://localhost:3000`
- Check Windows firewall private network rules

### Database error
- Validate `DATABASE_URL`
- Confirm PostgreSQL service is running
- Run `npx prisma migrate dev` if schema drift exists

### Cannot login
- Confirm employee exists and `isActive=true`
- Reset password using admin workflow

### Receipt generation fails
- Confirm cart has items
- Confirm payment created
- Confirm enough stock for all items

## 8. Security Minimums
- Change `AUTH_SECRET` before production
- Use strong passwords for employee accounts
- Limit server access to private LAN
- Avoid exposing port 3000 directly to public internet
- Use HTTPS reverse proxy for external access

## 9. Backup and Recovery
### Backup
- Daily PostgreSQL dump
- Keep at least 14 days of backups

### Restore Drill
- Weekly test restore on staging machine
- Confirm app can read restored data

## 10. Change Management
- Apply updates outside store peak hours
- Backup database before deploying updates
- Re-run acceptance test after update

## 11. Scaling to More Branches
- Use separate database per branch (recommended)
- Register each branch with its own store and terminals
- Repeat training and acceptance test per branch

## 12. Handover Checklist
- Manager has access credentials
- Team knows opening/closing SOP
- Backup verified
- Incident contacts documented
- Acceptance test report signed
