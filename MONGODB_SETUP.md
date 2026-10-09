# MongoDB Setup Guide

Your seed script failed because MongoDB is not running. Here's how to fix it:

## Option 1: MongoDB Atlas (Cloud) - Recommended ⭐

### Steps:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account and cluster
3. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/annasagartravels_db
   ```
4. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/annasagartravels_db
   ```
5. Run seed script:
   ```bash
   cd server
   node src/scripts/seed.js
   ```

**Advantages:**
- No local installation needed
- Free tier: 512 MB storage
- Cloud-hosted, accessible from anywhere

---

## Option 2: MongoDB Community (Local)

### Windows Installation:

**Using Chocolatey:**
```bash
choco install mongodb-community
```

**Or Manual Download:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer and follow setup wizard
3. MongoDB will install to `C:\Program Files\MongoDB\Server\7.0\`

### Start MongoDB:

**Method 1: Windows Service (Default)**
```bash
# Already runs as a Windows service after installation
# Verify it's running in Services app
```

**Method 2: Manual**
```bash
mongod --dbpath "C:\data\db"
```

**Method 3: Using Brew (if installed)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/annasagartravels_db
```

### Run seed script:
```bash
cd server
node src/scripts/seed.js
```

---

## Verify MongoDB Connection

```bash
# Check if MongoDB is running (opens MongoDB shell)
mongosh

# In MongoDB shell:
show dbs
use annasagartravels_db
show collections
db.users.find()
exit
```

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
→ **MongoDB is not running**
- Start MongoDB service or use Atlas

### Error: "Authentication failed"
→ **Wrong credentials in MONGODB_URI**
- Check username and password in Atlas

### Error: "Cannot find database"
→ **Database name incorrect**
- Verify database name in connection string

---

## Quick Start Checklist

- [ ] Choose MongoDB option (Atlas or Local)
- [ ] Get/configure connection string
- [ ] Update `server/.env` with MONGODB_URI
- [ ] Verify MongoDB is running
- [ ] Run: `cd server && node src/scripts/seed.js`
- [ ] Verify in MongoDB shell: `db.users.find()`

---

## Next Steps After Seeding

Once seed completes successfully, start all services:

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client  
cd client && npm run dev

# Terminal 3 - Admin
cd admin && npm run dev
```

Login credentials (created by seed):
- **Superadmin**: superadmin@annasagartravels.com / Admin@12345
- **Staff**: staff@annasagartravels.com / Staff@12345
- **Customer**: customer@annasagartravels.com / Customer@12345

