# EcoCircle Mobile App - Setup Instructions

## Fixed Issues
The following issues have been resolved to make the app work with Expo Go QR code scanning:

1. **API URL Configuration**: Changed from `localhost` to network IP address
2. **React Version Compatibility**: Downgraded from React 19.1.0 to 18.3.1 for better Expo compatibility

## Required Setup Steps

### 1. Find Your Computer's IP Address
You need to replace the placeholder IP address with your actual computer's local IP address.

**Windows:**
- Open Command Prompt
- Run: `ipconfig`
- Look for "IPv4 Address" (usually starts with 192.168.x.x)

**Mac/Linux:**
- Open Terminal
- Run: `ifconfig` or `ip a`
- Look for the IPv4 address under your network interface

### 2. Update API URL in app.json
Open `app.json` and update line 25:
```json
"extra": {
  "apiUrl": "http://YOUR_COMPUTER_IP:5000/api"
}
```
Replace `YOUR_COMPUTER_IP` with your actual IP address (e.g., `http://192.168.1.5:5000/api`)

### 3. (Optional) Use Environment Variable
Create a `.env` file in the project root:
```
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
```

### 4. Start the Backend Server
Make sure your backend server is running on port 5000:
```bash
cd server
npm start
```

### 5. Start the Expo Development Server
```bash
cd ecocircle-mobile
npm start
```

### 6. Scan QR Code with Expo Go App
- Download Expo Go from App Store (iOS) or Google Play (Android)
- Open Expo Go app
- Scan the QR code displayed in your terminal
- The app should now load without errors

## Troubleshooting

**App won't connect to API:**
- Verify your computer and phone are on the same Wi-Fi network
- Check that the backend server is running on port 5000
- Confirm the IP address in app.json is correct
- Try accessing `http://YOUR_IP:5000/api` in your phone's browser

**Metro bundler errors:**
- Clear cache: `npm start -- --clear`
- Reset cache: `expo start -c`

**Build errors:**
- Ensure all dependencies are installed: `npm install`
- Check that Node.js version is compatible (recommend Node 18 LTS)

## Network Requirements
- Both your computer and mobile device must be on the same local network
- Firewall should allow connections on port 5000 (backend) and port 19000-19002 (Expo)
- If using a VPN, disable it temporarily
