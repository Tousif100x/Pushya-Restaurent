import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "pushya-super-secret-key-for-jwt-2024";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function setSession(user: any) {
  const session = await encrypt({ id: user.id, phone: user.phone, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Temporary store for OTPs (In production, use Redis or DB)
const globalForOTP = globalThis as unknown as { otpStore: Map<string, { otp: string, expires: number }> };
const otpStore = globalForOTP.otpStore || new Map<string, { otp: string, expires: number }>();
if (process.env.NODE_ENV !== "production") globalForOTP.otpStore = otpStore;

export async function generateAndSendOTP(phone: string) {
  // Generate random 4 digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Store it with a 5 minute expiration
  otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });
  
  // MOCK SMS LOGIC
  console.log(`\n\n================================`);
  console.log(`📞 MOCK SMS SENT TO ${phone}`);
  console.log(`🔐 YOUR OTP IS: ${otp}`);
  console.log(`================================\n\n`);
  
  // TODO: Implement Real SMS Provider here (Twilio, AWS SNS, Msg91, etc.)
  // await sendRealSMS(phone, `Your Pushya Planet login code is ${otp}`);

  return true;
}

export async function verifyOTP(phone: string, otp: string) {
  const record = otpStore.get(phone);
  
  // For easy testing in development, always allow "1234"
  if (otp === "1234" && process.env.NODE_ENV === "development") {
    return true;
  }
  
  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(phone);
    return false;
  }
  
  if (record.otp === otp) {
    otpStore.delete(phone);
    return true;
  }

  return false;
}
