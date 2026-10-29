# WorkOfHuman VPS Media Upload & Streaming Server

This lightweight service runs directly on your VPS (`vps.amcmep.in`), saving high-resolution video, audio, and image assets straight to your persistent server SSD disk without going through serverless cloud limits.

---

## 🚀 Quick Setup on VPS (`vps.amcmep.in`)

### Step 1: Install Node.js (if not already installed) & Clone / Copy
On your VPS terminal:
```bash
mkdir -p /var/www/workofhuman/uploads
cd /var/www/workofhuman
# Copy the services/media-server folder here or git pull
cd services/media-server
npm install
```

### Step 2: Start with PM2 or Systemd

#### Option A: With PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.mjs --name woh-media
pm2 save
pm2 startup
```

#### Option B: With Systemd
```bash
sudo cp workofhuman-media.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now workofhuman-media
sudo systemctl status workofhuman-media
```

#### Option C: Direct Node.js / Screen
```bash
node server.mjs
```

---

## 🌐 Test the Health Check
Open in your browser or curl:
```bash
curl http://vps.amcmep.in:8080/health
```
You will get:
```json
{
  "status": "online",
  "service": "workofhuman-vps-media-service",
  "uploadDirectory": "/var/www/workofhuman/uploads",
  "maxUploadMB": 500,
  "publicBaseUrl": "http://vps.amcmep.in:8080"
}
```

---

## 🔒 Optional Nginx Reverse Proxy (for SSL / `media.amcmep.in` or custom domain)
If you want HTTPS on port 443 with Let's Encrypt:
```nginx
server {
    server_name media.amcmep.in;

    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
