"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ConsentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkUserAndConsent() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ยังไม่ได้เข้าสู่ระบบ
      if (!user) {
        router.replace("/login");
        return;
      }

      // ตรวจว่าผู้ใช้นี้เคยให้ความยินยอมแล้วหรือยัง
      const { data, error } = await supabase
        .from("consents")
        .select("id")
        .eq("user_id", user.id)
        .eq("consent_given", true)
        .limit(1);

      if (error) {
        console.error(error);
        setErrorMessage("ไม่สามารถตรวจสอบข้อมูลความยินยอมได้");
        setLoading(false);
        return;
      }

      // ถ้าเคยยินยอมแล้ว ไม่ต้องให้ตอบซ้ำ
      if (data && data.length > 0) {
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    checkUserAndConsent();
  }, [router]);

  async function handleConsent() {
    if (!checked || saving) return;

    setSaving(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("consents").insert({
      user_id: user.id,
      consent_given: true,
      consent_version: "1.0",
    });

    if (error) {
      console.error(error);
      setErrorMessage("ไม่สามารถบันทึกความยินยอมได้ กรุณาลองใหม่");
      setSaving(false);
      return;
    }

    // บันทึกสำเร็จแล้วกลับหน้าแรก
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <p className="text-gray-600">กำลังตรวจสอบข้อมูล...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-3 text-4xl">🎀</div>

            <h1 className="text-2xl font-bold text-gray-900">
              การยินยอมใช้ระบบ Breast Care
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              กรุณาอ่านข้อมูลก่อนเริ่มใช้งาน
            </p>
          </div>

          <div className="space-y-5 text-sm leading-7 text-gray-700">
            <section>
              <h2 className="font-semibold text-gray-900">
                วัตถุประสงค์ของระบบ
              </h2>
              <p>
                ระบบนี้จัดทำขึ้นเพื่อส่งเสริมความรู้และช่วยบันทึกการสังเกต
                ความเปลี่ยนแปลงของเต้านมด้วยตนเอง
                รวมถึงใช้ดูประวัติการบันทึกย้อนหลัง
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900">
                ข้อมูลที่ระบบจัดเก็บ
              </h2>
              <p>
                ระบบอาจจัดเก็บข้อมูลบัญชีผู้ใช้งาน
                ผลการบันทึกการสังเกตเต้านม วันที่และเวลาที่ทำรายการ
                รวมถึงข้อมูลการให้ความยินยอม
                เพื่อให้ผู้ใช้สามารถดูข้อมูลของตนเองย้อนหลังได้
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900">
                การรักษาความเป็นส่วนตัว
              </h2>
              <p>
                ข้อมูลของผู้ใช้จะถูกจัดเก็บในฐานข้อมูลของระบบ
                และกำหนดสิทธิ์ให้ผู้ใช้ที่เข้าสู่ระบบเข้าถึงข้อมูลของตนเอง
                ตามสิทธิ์ที่ระบบกำหนด
              </p>
            </section>

            <section className="rounded-2xl bg-pink-50 p-4">
              <h2 className="font-semibold text-pink-700">
                ข้อควรทราบ
              </h2>
              <p className="mt-1">
                ระบบนี้เป็นเครื่องมือเพื่อการให้ความรู้และบันทึกการสังเกตตนเอง
                ไม่สามารถใช้วินิจฉัยหรือยืนยันว่าเป็นหรือไม่เป็นมะเร็งเต้านมได้
                หากพบความผิดปกติหรือมีข้อกังวล ควรปรึกษาแพทย์
                พยาบาล หรือบุคลากรสาธารณสุขเพื่อรับการประเมินที่เหมาะสม
              </p>
            </section>
          </div>

          <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-pink-100 p-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-5 w-5 accent-pink-500"
            />

            <span className="text-sm leading-6 text-gray-700">
              ข้าพเจ้าได้อ่านและเข้าใจข้อมูลข้างต้น
              และยินยอมให้ระบบจัดเก็บและใช้ข้อมูลตามวัตถุประสงค์ที่ระบุไว้
            </span>
          </label>

          {errorMessage && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleConsent}
            disabled={!checked || saving}
            className="mt-6 w-full rounded-2xl bg-pink-500 px-5 py-4 font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? "กำลังบันทึก..." : "ยินยอมและเริ่มใช้งาน"}
          </button>
        </div>
      </div>
    </main>
  );
}