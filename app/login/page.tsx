"use client";
import liff from "@line/liff";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [lineUserId, setLineUserId] = useState("");

  useEffect(() => {
    async function initLiff() {
      try {
        await liff.init({
          liffId: "2011794752-ucI4485q",
        });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();

          console.log("LINE USER ID:", profile.userId);

          setLineUserId(profile.userId);
        }

      } catch (error) {
        console.error("LIFF ERROR:", error);
      }
    }

    initLiff();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    if (!email.trim() || !password) {
      setIsError(true);
      setMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);

    // เข้าสู่ระบบด้วย Supabase
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setLoading(false);
      setIsError(true);

      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("invalid login credentials")
      ) {
        setMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (
        errorMessage.includes("email not confirmed")
      ) {
        setMessage("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
      } else {
        setMessage(
          "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง"
        );
      }

      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      setIsError(true);
      setMessage("ไม่พบข้อมูลผู้ใช้งาน");
      return;
    }

    // ตรวจสอบ Consent ของบัญชีนี้จาก Supabase
    const { data: consentData, error: consentError } =
      await supabase
        .from("consents")
        .select("id, consent_given")
        .eq("user_id", user.id)
        .eq("consent_given", true)
        .limit(1);

    if (consentError) {
      console.error(consentError);

      setLoading(false);
      setIsError(true);
      setMessage(
        "ไม่สามารถตรวจสอบข้อมูลความยินยอมได้ กรุณาลองใหม่"
      );
      return;
    }

    setLoading(false);

    // ยังไม่เคยให้ Consent
    if (!consentData || consentData.length === 0) {
      router.replace("/consent");
      return;
    }

    // เคยให้ Consent แล้ว
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-10">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🎀</div>

          <h1 className="text-3xl font-bold text-pink-600">
            Breast Care
          </h1>

          <p className="mt-2 text-gray-600">
            เข้าสู่ระบบเพื่อบันทึกและติดตามการสังเกตเต้านม
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">

          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
            เข้าสู่ระบบ
          </h2>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                อีเมล
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="example@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`rounded-xl p-3 text-sm ${
                  isError
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-500 px-4 py-3 font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "กำลังเข้าสู่ระบบ..."
                : "เข้าสู่ระบบ"}
            </button>{lineUserId && (
  <p className="mt-3 text-xs text-green-600">
    เชื่อมต่อ LINE สำเร็จ
  </p>
)}
          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ยังไม่มีบัญชี?{" "}

            <Link
              href="/register"
              className="font-semibold text-pink-600 hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          กรุณาเข้าสู่ระบบด้วยบัญชีของคุณเพื่อเข้าถึงข้อมูลที่บันทึกไว้
        </p>
      </div>
    </main>
  );
}
