# One-Time PIN (OTP) Service Documentation

## 🎉 OTP Service Deployed!

Your Zambian Election Results backend now includes a comprehensive **One-Time PIN (OTP) service** for secure authentication and verification.

---

## 📱 Supported Delivery Methods

### 1. SMS via Africa's Talking
- **Coverage**: All Zambian mobile networks (MTN, Airtel, Zamtel)
- **Format**: +260 9XX XXX XXX (Zambian numbers)
- **Delivery Time**: < 10 seconds
- **Perfect for**: Authentication, transaction verification

### 2. Email via SendGrid
- **Delivery**: HTML-formatted professional emails
- **Delivery Time**: < 30 seconds
- **Perfect for**: Password resets, verification codes
- **Fallback**: Works when SMS is unavailable

---

## ⚡ Quick Start

### Send OTP via SMS

```typescript
import api from './utils/api';

// Send SMS OTP
const result = await api.sendOTP(
  '+260977123456',  // Zambian phone number
  'sms',
  'login'
);

console.log(result.message); // "Verification code sent to your phone"
console.log('Expires at:', new Date(result.expiresAt!));
```

### Send OTP via Email

```typescript
// Send Email OTP
const result = await api.sendOTP(
  'user@example.com',
  'email',
  'registration'
);

console.log(result.message); // "Verification code sent to your email"
```

### Verify OTP Code

```typescript
// User enters the 6-digit code
const result = await api.verifyOTP(
  '+260977123456',
  '123456',  // Code from SMS/Email
  'login'
);

if (result.verified) {
  console.log('✅ Verification successful!');
  // Proceed with login or action
} else {
  console.log('❌', result.message);
}
```

---

## 🔧 Setup Instructions

### 1. Africa's Talking Setup (for SMS)

1. **Sign up** at https://africastalking.com
2. **Get your API key** from the dashboard
3. **Add API keys** to your Supabase environment variables:

Go to Supabase Dashboard → Project Settings → Edge Functions → Environment Variables:

```
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_USERNAME=your_username_here
AFRICAS_TALKING_SHORTCODE=ZAMBIA_VOTE
```

**Zambian Network Pricing** (Africa's Talking):
- MTN Zambia: ~$0.01 per SMS
- Airtel Zambia: ~$0.01 per SMS
- Zamtel: ~$0.01 per SMS

### 2. SendGrid Setup (for Email)

1. **Sign up** at https://sendgrid.com
2. **Create an API key** with Mail Send permissions
3. **Add to Supabase environment variables**:

```
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@buildonezambia.org
```

**Pricing**:
- Free tier: 100 emails/day
- Paid: $0.0001 per email

### 3. Development Mode (No Setup Required)

If API keys are not configured, the system runs in **development mode**:
- ✅ OTP codes are still generated
- ✅ Verification works normally
- 📝 SMS/Email content is logged to console
- ⚠️ No actual SMS/Email is sent

Perfect for testing without spending money!

---

## 📚 Complete API Reference

### POST `/otp/send`

Send an OTP code via SMS or Email.

**Request Body**:
```json
{
  "recipient": "+260977123456" or "user@email.com",
  "type": "sms" | "email",
  "purpose": "login" | "registration" | "verification" | "password-reset" | "transaction",
  "metadata": { "optional": "data" }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification code sent to your phone",
  "otpId": "otp-1234567890-abc123",
  "expiresAt": 1717747200000
}
```

**Features**:
- ✅ 6-digit random code
- ✅ 10-minute expiration
- ✅ 60-second cooldown between requests
- ✅ Phone number validation (Zambian format)
- ✅ Email validation

---

### POST `/otp/verify`

Verify an OTP code.

**Request Body**:
```json
{
  "recipient": "+260977123456",
  "code": "123456",
  "purpose": "login"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Verification successful",
  "verified": true
}
```

**Response (Failed)**:
```json
{
  "success": false,
  "message": "Invalid verification code. 2 attempts remaining."
}
```

**Features**:
- ✅ Maximum 3 attempts
- ✅ Automatic expiration after 10 minutes
- ✅ One-time use (cannot reuse verified codes)
- ✅ Detailed error messages

---

### POST `/otp/resend`

Resend the same OTP code with a new expiration time.

**Request Body**:
```json
{
  "recipient": "+260977123456",
  "purpose": "login"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification code resent successfully",
  "expiresAt": 1717747800000
}
```

**Features**:
- ✅ Same code, new expiry
- ✅ Resets attempt counter
- ✅ Subject to cooldown period

---

### POST `/otp/cancel`

Cancel/invalidate an active OTP.

**Request Body**:
```json
{
  "recipient": "+260977123456",
  "purpose": "login"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP cancelled successfully"
}
```

---

### GET `/otp/status/:otpId` (Admin Only)

Get detailed OTP status for debugging.

**Response**:
```json
{
  "otp": {
    "id": "otp-1234567890-abc123",
    "recipient": "+260977123456",
    "type": "sms",
    "code": "123456",
    "purpose": "login",
    "expiresAt": 1717747200000,
    "attempts": 1,
    "maxAttempts": 3,
    "verified": false,
    "createdAt": "2026-06-07T...",
    "metadata": {}
  }
}
```

---

### POST `/otp/cleanup` (Admin Only)

Clean up expired OTP records.

**Response**:
```json
{
  "success": true,
  "message": "Cleaned up 42 expired OTPs",
  "cleaned": 42
}
```

---

## 🎯 Use Cases

### 1. Two-Factor Authentication (2FA)

```typescript
// Step 1: User logs in with password
const { user } = await api.login('username', 'password');

// Step 2: Send OTP for 2FA
await api.sendOTP(user.email, 'email', 'login');

// Step 3: User enters OTP code
const otpCode = prompt('Enter verification code from email:');
const verified = await api.verifyOTP(user.email, otpCode, 'login');

if (verified.verified) {
  // Grant access
  console.log('✅ 2FA successful!');
}
```

### 2. Phone Number Verification

```typescript
// Verify user's phone number
await api.sendOTP('+260977123456', 'sms', 'verification');

// User enters code
const code = getUserInput();
const result = await api.verifyOTP('+260977123456', code, 'verification');

if (result.verified) {
  // Mark phone as verified in database
  await markPhoneAsVerified('+260977123456');
}
```

### 3. Password Reset

```typescript
// User requests password reset
await api.sendOTP('user@email.com', 'email', 'password-reset');

// User enters OTP and new password
const otpCode = getUserInput();
const newPassword = getNewPassword();

const verified = await api.verifyOTP('user@email.com', otpCode, 'password-reset');

if (verified.verified) {
  // Allow password reset
  await updatePassword('user@email.com', newPassword);
}
```

### 4. Transaction Verification

```typescript
// User submits high-value transaction
const transaction = {
  amount: 50000,
  recipient: 'chamber-123',
};

// Send OTP for verification
await api.sendOTP('+260977123456', 'sms', 'transaction', {
  transactionId: 'tx-12345',
  amount: transaction.amount,
});

// Verify before processing
const otpCode = getUserInput();
const verified = await api.verifyOTP('+260977123456', otpCode, 'transaction');

if (verified.verified) {
  // Process transaction
  await processTransaction(transaction);
}
```

### 5. Registration Verification

```typescript
// New user registers
const userData = {
  name: 'John Banda',
  email: 'john@email.com',
  phone: '+260977123456',
};

// Send verification code
await api.sendOTP(userData.phone, 'sms', 'registration');

// User verifies
const code = getUserInput();
const verified = await api.verifyOTP(userData.phone, code, 'registration');

if (verified.verified) {
  // Complete registration
  await api.registerUser({
    ...userData,
    verified: true,
  });
}
```

---

## 🔒 Security Features

### 1. Rate Limiting
- **Cooldown Period**: 60 seconds between OTP requests
- **Prevents**: SMS/Email spam and abuse
- **User Experience**: Clear error message with remaining time

### 2. Attempt Limiting
- **Max Attempts**: 3 per OTP code
- **Behavior**: After 3 failed attempts, OTP is invalidated
- **User Experience**: Shows remaining attempts

### 3. Expiration
- **Duration**: 10 minutes
- **Auto-Cleanup**: Expired OTPs are automatically deleted
- **Security**: Prevents old codes from being used

### 4. One-Time Use
- **Behavior**: Once verified, code cannot be reused
- **Prevents**: Replay attacks
- **Implementation**: Verified flag + lookup cleanup

### 5. Phone Number Validation
- **Zambian Format**: +260 followed by 9 digits
- **Network Codes**: Validates MTN (96/97), Airtel (95/76/77), Zamtel (95/21/11)
- **Auto-Formatting**: Converts 0977123456 → +260977123456

### 6. Secure Code Generation
- **Method**: Crypto-safe random generation
- **Length**: 6 digits
- **Entropy**: ~20 bits (1 million combinations)
- **Implementation**: `crypto.getRandomValues()`

---

## 📱 SMS Message Format

```
Your Zambia Election Results verification code is: 123456. Valid for 10 minutes. Do not share this code with anyone.
```

**Characteristics**:
- ✅ Clear purpose
- ✅ Code prominently displayed
- ✅ Expiry time mentioned
- ✅ Security warning
- ✅ Under 160 characters (single SMS)

---

## ✉️ Email Format

Professional HTML email with:
- 🇿🇲 Zambian Election Results branding
- 🎨 Green gradient header (#16a34a → #059669)
- 🔢 Large, centered verification code
- ⏰ Clear expiration time
- ⚠️ Security warning
- 📱 Mobile-responsive design

**Subject Lines**:
- Login: "Your Verification Code - Zambia Election Results"
- Registration: "Welcome! Verify Your Account"
- Password Reset: "Password Reset Code"
- Resend: "Your Verification Code (Resent)"

---

## 🧪 Testing

### Development Mode Testing (No API Keys)

```typescript
// Send OTP (will log to console instead of sending)
const result = await api.sendOTP('+260977123456', 'sms', 'login');
// Check server logs for OTP code

// Verify with the code from logs
const verified = await api.verifyOTP('+260977123456', '123456', 'login');
console.log('Verified:', verified.verified);
```

### Production Testing

1. **Test SMS** to your own Zambian number:
```typescript
await api.sendOTP('+260YOUR_NUMBER', 'sms', 'verification');
```

2. **Test Email** to your email:
```typescript
await api.sendOTP('your.email@example.com', 'email', 'verification');
```

3. **Test Verification**:
```typescript
// Wrong code
await api.verifyOTP('+260977123456', '000000', 'login');
// Should fail

// Correct code
await api.verifyOTP('+260977123456', '123456', 'login');
// Should succeed
```

4. **Test Cooldown**:
```typescript
await api.sendOTP('+260977123456', 'sms', 'login');
await api.sendOTP('+260977123456', 'sms', 'login'); // Should fail
// Error: "Please wait 60 seconds before requesting another OTP"
```

5. **Test Expiration**:
```typescript
await api.sendOTP('+260977123456', 'sms', 'login');
// Wait 11 minutes
await api.verifyOTP('+260977123456', '123456', 'login');
// Error: "Verification code has expired"
```

---

## 💰 Cost Estimate

### SMS (Africa's Talking)
- **Per SMS**: ~K0.25 (ZMW) or $0.01 (USD)
- **100 OTPs/day**: K25/day = K750/month
- **1,000 OTPs/day**: K250/day = K7,500/month

### Email (SendGrid)
- **Free Tier**: 100 emails/day (K0)
- **Per Email**: ~$0.0001 (essentially free)
- **100,000 emails/month**: ~$10/month

### Recommendations
- Use **Email OTP** for non-urgent verifications (free)
- Use **SMS OTP** for critical actions (login, transactions)
- Implement **Email fallback** when SMS fails

---

## 🚀 Integration Examples

### React Component

```typescript
import { useState } from 'react';
import api from './utils/api';

export function OTPVerification({ phone, onVerified }: { 
  phone: string; 
  onVerified: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOTP = async () => {
    setLoading(true);
    try {
      await api.sendOTP(phone, 'sms', 'verification');
      alert('Verification code sent!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.verifyOTP(phone, code, 'verification');
      if (result.verified) {
        onVerified();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={sendOTP} disabled={loading}>
        Send Code
      </button>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter 6-digit code"
        maxLength={6}
      />
      <button onClick={verifyOTP} disabled={loading || code.length !== 6}>
        Verify
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 🔧 Configuration

All configuration is in `/supabase/functions/server/otp.ts`:

```typescript
const DEFAULT_CONFIG: OTPConfig = {
  codeLength: 6,          // Number of digits in OTP
  expiryMinutes: 10,      // How long OTP is valid
  maxAttempts: 3,         // Maximum verification attempts
  cooldownSeconds: 60,    // Seconds between OTP requests
};
```

Customize these values as needed!

---

## 📊 Monitoring

### Admin Dashboard Stats

```typescript
// Get OTP usage stats (admin only)
const stats = await api.getSystemStats();
console.log('OTPs sent today:', stats.otp.sentToday);

// Cleanup expired OTPs
const cleaned = await api.cleanupExpiredOTPs();
console.log('Cleaned up:', cleaned.cleaned, 'expired OTPs');
```

### Server Logs

All OTP operations are logged:
```
OTP sent to +260977123456 (sms) for login: 123456
OTP verified successfully for +260977123456 (login)
Cleaned up 42 expired OTPs
```

---

## ✅ Best Practices

1. **Use SMS for critical actions** (login, transactions)
2. **Use Email for non-urgent** (registration, password reset)
3. **Implement retry limits** on the frontend
4. **Clear error messages** for users
5. **Log all OTP operations** for audit trails
6. **Regular cleanup** of expired OTPs (run daily)
7. **Monitor costs** (SMS can add up quickly)
8. **Test in development mode** before production

---

## 🎉 Summary

You now have a **production-ready OTP service** with:

✅ SMS delivery via Africa's Talking (Zambian networks)  
✅ Email delivery via SendGrid  
✅ 6-digit codes with 10-minute expiration  
✅ Rate limiting and security features  
✅ Development mode for testing  
✅ Complete API integration  
✅ Professional email templates  
✅ Comprehensive documentation  

**Ready to use immediately!** Just add your API keys for production. 🚀🇿🇲
