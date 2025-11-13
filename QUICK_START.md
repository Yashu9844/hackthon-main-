# 🚀 Quick Start Guide - Web3 Degree Verification Portal

## What is this project?

A blockchain-based system for universities to issue digital degree certificates that anyone can verify. Think of it as a **tamper-proof digital diploma** that lives on the blockchain.

---

## ⚡ Super Quick Setup (5 minutes)

### Step 1: Start Backend
```bash
cd C:\Users\yashwanth\desktop\web3\apps\backend
bun run dev
```
✅ Wait for: `Better Auth app listening on port 8000`

### Step 2: Start Frontend (new terminal)
```bash
cd C:\Users\yashwanth\desktop\web3\apps\web
bun run dev
```
✅ Wait for: `Local: http://localhost:3000`

### Step 3: Open Admin Dashboard
Open browser: `http://localhost:3000/admin`

---

## 🎯 What Can You Do?

### 1️⃣ Issue a Degree Certificate

**Where:** `http://localhost:3000/admin` → "Issue Credential" tab

**Fill in:**
- Student Name: `John Smith`
- Degree: `Bachelor of Science in Computer Science`
- University: `Massachusetts Institute of Technology`
- Graduation Date: `2024-05-15`
- Student ID: `MIT-CS-2024-001` (optional)

**Click:** "Issue Credential"

**Result:** ✅ Green success message + credential appears in list

---

### 2️⃣ View All Credentials

**Where:** `http://localhost:3000/admin` → "Manage Credentials" tab

**You'll see:**
- 📊 Statistics at the top (total, active, revoked)
- 📋 List of all issued credentials
- 🔍 Search bar to filter
- 🎚️ Dropdown filters (status, sorting)

---

### 3️⃣ Search for a Credential

**In the search box, type:**
- Student name: `John`
- University: `MIT`
- Attestation UID: `0x19a7d004...`

**Result:** List updates in real-time

---

### 4️⃣ Revoke a Credential

**Find the credential** in the list

**Click:** Red "Revoke" button

**Fill in reason:** `Student request` or `Document error`

**Click:** "Revoke" in modal

**Result:** Credential shows "Revoked" badge + reason displayed

---

## 📊 Understanding the Dashboard

### Statistics Cards

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Total   │  │  Active  │  │ Revoked  │  │   Rate   │
│    50    │  │    42    │  │     8    │  │  16.0%   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- **Total**: All credentials ever issued
- **Active**: Currently valid credentials
- **Revoked**: Cancelled/invalid credentials
- **Rate**: Percentage of revoked credentials

---

## 🧪 Run Tests (Optional)

### Test Backend API
```bash
cd C:\Users\yashwanth\desktop\web3
bun run run-tests-5-6.mjs   # 20 tests
bun run run-tests-7-8.mjs   # 20 tests
```

### Test Admin UI
```bash
bun run run-tests-9-10.mjs  # 25 tests
```

**Expected:** 98.5% pass rate (64/65 tests)

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Admin Dashboard** | http://localhost:3000/admin | Issue & manage credentials |
| **Backend API** | http://localhost:8000 | REST API server |
| **Home Page** | http://localhost:3000 | Landing page |

---

## 📝 Sample Test Data

Use these to test the system:

### Student 1
```
Name: Alice Johnson
Degree: Master of Business Administration
University: Harvard Business School
Date: 2024-06-15
ID: HBS-MBA-2024-042
```

### Student 2
```
Name: Robert Chen
Degree: Doctor of Philosophy in Physics
University: Stanford University
Date: 2024-08-20
ID: STAN-PHD-2024-099
```

### Student 3
```
Name: Maria Garcia
Degree: Bachelor of Arts in Psychology
University: University of California Berkeley
Date: 2024-05-18
ID: UCB-BA-2024-156
```

---

## 🎨 What You'll See

### Issue Credential Form
<img src="screenshots/admin-issue.png" alt="Issue Form" width="600"/>

### Credentials List
<img src="screenshots/admin-list.png" alt="Credentials List" width="600"/>

### Statistics Dashboard
<img src="screenshots/admin-stats.png" alt="Statistics" width="600"/>

*(Note: Screenshots can be added later)*

---

## 🔧 Troubleshooting

### ❌ "Port 8000 already in use"
**Solution:**
```bash
# Kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### ❌ "Database connection failed"
**Solution:**
```bash
cd apps/backend
bunx prisma generate
bunx prisma db push
```

### ❌ Frontend not loading
**Solution:**
```bash
cd apps/web
rm -rf .next
bun run dev
```

---

## 💡 Pro Tips

1. **Search is instant** - Type and results appear immediately
2. **Pagination** - Use Previous/Next to navigate large lists
3. **Sort options** - Sort by date or name, ascending/descending
4. **Status filter** - View only active or only revoked credentials
5. **Revoke requires reason** - Always provide a clear reason when revoking

---

## 🎓 For Complete Beginners

### What is Blockchain?
Think of it as a **digital ledger that nobody can tamper with**. Once a credential is issued, it's permanently recorded.

### What is IPFS?
Like **Dropbox but decentralized**. Files are stored across many computers, not just one company's servers.

### What is a Verifiable Credential?
A **digital certificate with a cryptographic signature** that proves it's authentic and hasn't been modified.

### What is EAS (Ethereum Attestation Service)?
A **blockchain service for making verifiable claims**. We use it to record that a degree was issued.

---

## 📚 Learn More

**Full Documentation:** See `PROJECT_DOCUMENTATION.md`

**Key Topics:**
- System Architecture
- API Endpoints
- Blockchain Integration
- Testing Guide
- Security Features

---

## 🏁 Next Steps

After you're comfortable with the Admin Dashboard:

1. ✅ Issue multiple credentials
2. ✅ Try searching and filtering
3. ✅ Test the revocation flow
4. ✅ Run the test suites
5. ⏳ Wait for Steps 11-12 (Verifier Dashboard)

---

## 📊 Project Status

**Current:** Steps 1-10 Complete (83%)  
**Next:** Steps 11-12 (Verifier UI)  
**Tests:** 64/65 passing (98.5%)

---

## 🤝 Getting Help

If something doesn't work:
1. Check the error message
2. Look in `PROJECT_DOCUMENTATION.md` → Troubleshooting section
3. Make sure both backend and frontend are running
4. Check that port 8000 and 3000 are free

---

## ✨ What You've Built

You now have a working:
- ✅ Blockchain-based credential system
- ✅ Admin dashboard for universities
- ✅ Real-time statistics
- ✅ Search and filter capabilities
- ✅ Revocation system
- ✅ 65 automated tests

**Congratulations! 🎉**

---

**Ready to issue your first credential?**  
👉 Open `http://localhost:3000/admin` and get started!
