"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import liff from "@line/liff";
import { createClient } from "@/utils/supabase/client";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndConsent = async () => {
      const supabase = createClient();

      // 1. ตรวจสอบว่าล็อกอินหรือยัง
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      // 2. ตรวจสอบ Consent จาก Supabase
      const {
        data: consentData,
        error: consentError,
      } = await supabase
        .from("consents")
        .select("id")
        .eq("user_id", user.id)
        .eq("consent_given", true)
        .limit(1);

      if (consentError) {
        console.error(
          "Consent check error:",
          consentError
        );

        setLoading(false);
        return;
      }

      // 3. ถ้ายังไม่เคย Consent
      if (!consentData || consentData.length === 0) {
        router.replace("/consent");
        return;
      }

      // 4. ผ่านทั้ง Login และ Consent
      const name =
        typeof user.user_metadata?.name === "string" &&
        user.user_metadata.name.trim()
          ? user.user_metadata.name.trim()
          : user.email?.split("@")[0] || "ผู้ใช้งาน";

      setUser({
        id: user.id,
        name,
        email: user.email || "",
      });

      setLoading(false);
    };

    checkUserAndConsent();
  }, [router]);
const connectLine = async () => {
  try {
    await liff.init({
      liffId: "2011794752-ucI4485q",
    });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile = await liff.getProfile();

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    const { error } = await supabase
      .from("line_connections")
      .upsert({
        user_id: user.id,
        line_user_id: profile.userId,
      });

    if (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อม LINE ได้");
      return;
    }

    alert("เชื่อม LINE สำเร็จแล้ว 🎉");

  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการเชื่อม LINE");
  }
};
  const logout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="text-5xl">🎀</div>

          <p className="mt-4 font-semibold text-pink-500">
            Breast Care
          </p>

          <p className="mt-2 text-sm text-gray-400">
            กำลังตรวจสอบข้อมูล...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-pink-50">
      <div className="mx-auto max-w-md px-6 py-8">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-pink-500">
              🎀 Breast Care
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              สวัสดี คุณ{user.name} 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              วันนี้อย่าลืมดูแลสุขภาพของตัวเองนะ
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xl font-bold text-pink-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="p-7">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-3xl">
              🎀
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              การตรวจเต้านมด้วยตนเอง
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              เรียนรู้และสังเกตความเปลี่ยนแปลงของเต้านม
              ด้วยขั้นตอนที่เข้าใจง่าย พร้อมบันทึกผล
              เพื่อดูประวัติย้อนหลังได้
            </p>

            <Link
              href="/self-exam"
              className="mt-6 block w-full rounded-2xl bg-pink-500 py-4 text-center font-semibold text-white shadow-md transition hover:bg-pink-600"
            >
              เริ่มตรวจเต้านม →
            </Link>
          </div>
        </div>

        {/* MENU */}
        <h2 className="mt-8 font-bold text-gray-900">
          เมนูของคุณ
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">

          {/* KNOWLEDGE */}
          <Link
            href="/knowledge"
            className="rounded-3xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
              📖
            </div>

            <p className="mt-4 font-bold text-gray-800">
              ความรู้
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              เรียนรู้เกี่ยวกับสุขภาพเต้านม
            </p>

            <p className="mt-4 text-xs font-semibold text-pink-500">
              อ่านความรู้ →
            </p>
          </Link>

          {/* HISTORY */}
          <Link
            href="/history"
            className="rounded-3xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
              📅
            </div>

            <p className="mt-4 font-bold text-gray-800">
              ประวัติการตรวจ
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              ดูปฏิทินและผลย้อนหลัง
            </p>

            <p className="mt-4 text-xs font-semibold text-pink-500">
              ดูประวัติ →
            </p>
          </Link>
        </div>

        {/* ACCOUNT */}
        <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold text-gray-400">
            บัญชีของฉัน
          </p>

          <div className="mt-3 flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-600">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-gray-800">
                {user.name}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
<button
  onClick={connectLine}
  className="mt-5 w-full rounded-2xl bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
>
  🔔 เชื่อม LINE เพื่อรับการแจ้งเตือน
</button>

<button
  onClick={logout}
  className="mt-3 w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
>
  ออกจากระบบ
</button>
          <button
            onClick={logout}
            className="mt-5 w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
          >
            ออกจากระบบ
          </button>
        </div>

        {/* DISCLAIMER */}
        <div className="mt-8 rounded-2xl bg-pink-100/60 p-4">
          <p className="text-center text-xs leading-5 text-gray-500">
            Breast Care เป็นเครื่องมือช่วยให้ความรู้
            บันทึก และสังเกตความเปลี่ยนแปลงของเต้านม
            ไม่ใช่เครื่องมือสำหรับวินิจฉัยโรค
          </p>
        </div>

      </div>
    </main>
  );
}