"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    if (!name.trim()) {
      setIsError(true);
      setMessage("กรุณากรอกชื่อ");
      return;
    }

    if (!email.trim()) {
      setIsError(true);
      setMessage("กรุณากรอกอีเมล");
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    if (data.session) {
      setMessage("สมัครสมาชิกสำเร็จ");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      setMessage(
        "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลและกดยืนยันบัญชีก่อนเข้าสู่ระบบ"
      );
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🎀</div>

          <h1 className="text-3xl font-bold text-pink-600">
            Breast Care
          </h1>

          <p className="mt-2 text-gray-600">
            สร้างบัญชีเพื่อบันทึกการสังเกตเต้านมของคุณ
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
            สมัครสมาชิก
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อ
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อ"
                autoComplete="name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                อีเมล
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-500 px-4 py-3 font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-semibold text-pink-600 hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          ข้อมูลบัญชีใช้สำหรับเข้าสู่ระบบและเชื่อมโยงประวัติการบันทึกของคุณ
        </p>
      </div>
    </main>
  );
}