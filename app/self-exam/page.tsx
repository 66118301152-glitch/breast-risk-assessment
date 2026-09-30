"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Answer = "normal" | "abnormal" | null;

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

const steps = [
  {
    title: "สังเกตหน้ากระจก",
    description:
      "ยืนหน้ากระจก ปล่อยแขนตามสบาย แล้วสังเกตเต้านมทั้งสองข้าง ดูรูปร่าง ขนาด ผิวหนัง และหัวนม",
    observe:
      "สังเกตก้อน บวม ผิวหนังบุ๋มหรือย่น รอยแดง หัวนมเปลี่ยนแปลง หรือมีสิ่งคัดหลั่งผิดปกติ",
  },
  {
    title: "ยกแขนขึ้นเหนือศีรษะ",
    description:
      "ยกแขนทั้งสองข้างขึ้นเหนือศีรษะ แล้วสังเกตเต้านมทั้งสองข้างอีกครั้ง เปรียบเทียบกับตอนปล่อยแขนตามสบาย",
    observe:
      "สังเกตการดึงรั้งของผิวหนัง รอยบุ๋ม รูปร่างที่เปลี่ยนไป หรือความผิดปกติของหัวนม",
  },
  {
    title: "คลำเต้านม",
    description:
      "ใช้ส่วนฝ่ามือของนิ้วชี้ นิ้วกลาง และนิ้วนาง คลำเต้านมอย่างเป็นระบบให้ทั่วบริเวณ โดยใช้น้ำหนักกดจากเบา ปานกลาง และลึก",
    observe:
      "สังเกตว่ามีก้อนแข็ง บริเวณหนาตัว หรือจุดที่รู้สึกแตกต่างจากเนื้อเต้านมบริเวณอื่นหรือไม่",
  },
  {
    title: "คลำบริเวณรักแร้",
    description:
      "คลำบริเวณรักแร้ทั้งสองข้างอย่างนุ่มนวล เพื่อสังเกตว่ามีก้อนหรือบริเวณที่ผิดปกติหรือไม่",
    observe:
      "สังเกตก้อน บวม กดเจ็บ หรือความเปลี่ยนแปลงที่ไม่เคยพบมาก่อน",
  },
  {
    title: "สังเกตหัวนม",
    description:
      "สังเกตหัวนมทั้งสองข้างว่ามีความเปลี่ยนแปลงจากลักษณะปกติของตนเองหรือไม่",
    observe:
      "สังเกตหัวนมบุ๋มเข้าใหม่ แผล ผื่น หรือมีเลือดหรือสิ่งคัดหลั่งออกจากหัวนมโดยไม่ได้บีบ",
  },
];

export default function SelfExamPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);

  const [answers, setAnswers] = useState<Answer[]>(
    Array(steps.length).fill(null)
  );

  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ==========================================
  // ตรวจสอบ Login + Consent จาก Supabase
  // ==========================================

  useEffect(() => {
    const checkUserAndConsent = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // ยังไม่ Login
      if (userError || !user) {
        router.replace("/login");
        return;
      }

      // ตรวจสอบ Consent
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

      // Login แล้ว แต่ยังไม่ Consent
      if (!consentData || consentData.length === 0) {
        router.replace("/consent");
        return;
      }

      // Login + Consent ผ่านแล้ว
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

  const step = steps[currentStep];

  const progress =
    ((currentStep + 1) / steps.length) * 100;

  const abnormalCount = answers.filter(
    (answer) => answer === "abnormal"
  ).length;

  // ==========================================
  // เลือกผล
  // ==========================================

  const selectAnswer = (
    answer: "normal" | "abnormal"
  ) => {
    const newAnswers = [...answers];

    newAnswers[currentStep] = answer;

    setAnswers(newAnswers);
  };

  // ==========================================
  // ขั้นตอนถัดไป
  // ==========================================

  const nextStep = () => {
    if (answers[currentStep] === null) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      setFinished(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ==========================================
  // ย้อนกลับ
  // ==========================================

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ==========================================
  // บันทึกผลลง Supabase
  // ==========================================

  const saveResult = async () => {
    if (!user || saved || saving) {
      return;
    }

    setSaving(true);
    setSaveError("");

    const supabase = createClient();

    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !authUser) {
      setSaving(false);
      setSaveError(
        "ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่"
      );
      return;
    }

    // เช็ก Consent ซ้ำก่อนบันทึกข้อมูลสุขภาพ
    const {
      data: consentData,
      error: consentError,
    } = await supabase
      .from("consents")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("consent_given", true)
      .limit(1);

    if (consentError) {
      console.error(
        "Consent check before save error:",
        consentError
      );

      setSaving(false);
      setSaveError(
        "ไม่สามารถตรวจสอบข้อมูลความยินยอมได้ กรุณาลองใหม่"
      );
      return;
    }

    if (!consentData || consentData.length === 0) {
      setSaving(false);
      router.replace("/consent");
      return;
    }

    const { error } = await supabase
      .from("exam_results")
      .insert({
        user_id: authUser.id,
        answers: answers,
        abnormal_count: abnormalCount,
      });

    if (error) {
      console.error("Save exam result error:", error);

      setSaving(false);
      setSaveError(
        "ไม่สามารถบันทึกผลได้ กรุณาลองใหม่อีกครั้ง"
      );
      return;
    }

    setSaving(false);
    setSaved(true);
  };

  // ==========================================
  // ตรวจใหม่
  // ==========================================

  const startAgain = () => {
    setCurrentStep(0);

    setAnswers(
      Array(steps.length).fill(null)
    );

    setFinished(false);
    setSaved(false);
    setSaving(false);
    setSaveError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="text-5xl">
            🎀
          </div>

          <p className="mt-3 font-semibold text-pink-500">
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

  // ==========================================
  // หน้าสรุปผล
  // ==========================================

  if (finished) {
    return (
      <main className="min-h-screen bg-pink-50">
        <div className="mx-auto max-w-md px-6 py-10">

          <div className="rounded-3xl bg-white p-7 shadow-md">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-3xl">
              ✓
            </div>

            <div className="text-center">

              <p className="mt-4 text-sm font-semibold text-pink-500">
                Breast Care
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                ตรวจครบแล้ว
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                สรุปผลการตรวจของคุณ{user.name}
              </p>

            </div>

            {/* Date */}

            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-center">

              <p className="text-xs text-gray-400">
                วันที่ตรวจ
              </p>

              <p className="mt-1 font-semibold text-gray-700">
                {new Date().toLocaleDateString(
                  "th-TH",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>

            </div>

            {/* Summary */}

            {abnormalCount === 0 ? (

              <div className="mt-5 rounded-2xl bg-green-50 p-5">

                <p className="font-bold text-green-700">
                  ✓ ไม่ได้รายงานว่าพบความผิดปกติ
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  จากรายการที่บันทึกในครั้งนี้
                  ไม่มีข้อใดที่เลือกว่า
                  “พบความผิดปกติ”
                </p>

              </div>

            ) : (

              <div className="mt-5 rounded-2xl bg-red-50 p-5">

                <p className="font-bold text-red-700">
                  พบรายการที่ควรได้รับการประเมินเพิ่มเติม{" "}
                  {abnormalCount} รายการ
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  ผลนี้ไม่ได้หมายความว่าเป็นมะเร็งเต้านม
                  หากพบความเปลี่ยนแปลงที่ผิดไปจากเดิม
                  ควรปรึกษาบุคลากรทางการแพทย์
                </p>

              </div>

            )}

            {/* Details */}

            <div className="mt-6">

              <h2 className="font-bold text-gray-900">
                รายละเอียดการตรวจ
              </h2>

              <div className="mt-3 space-y-3">

                {steps.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4"
                  >

                    <div>

                      <p className="text-xs text-gray-400">
                        ขั้นตอนที่ {index + 1}
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {item.title}
                      </p>

                    </div>

                    {answers[index] === "normal" ? (

                      <span className="whitespace-nowrap text-xs font-bold text-green-600">
                        ✓ ไม่พบผิดปกติ
                      </span>

                    ) : (

                      <span className="whitespace-nowrap text-xs font-bold text-red-600">
                        ! พบความผิดปกติ
                      </span>

                    )}

                  </div>

                ))}

              </div>

            </div>

            {/* Error */}

            {saveError && (

              <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center">

                <p className="text-sm font-semibold text-red-600">
                  {saveError}
                </p>

              </div>

            )}

            {/* Saved */}

            {saved && (

              <div className="mt-6 rounded-2xl bg-pink-50 p-4 text-center">

                <p className="font-semibold text-pink-700">
                  ✓ บันทึกผลเรียบร้อยแล้ว
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  ผลนี้ถูกบันทึกในประวัติของคุณ{user.name}
                </p>

              </div>

            )}

            {/* Save */}

            {!saved && (

              <button
                onClick={saveResult}
                disabled={saving}
                className={`mt-7 w-full rounded-2xl py-4 font-semibold text-white shadow-md ${
                  saving
                    ? "cursor-not-allowed bg-pink-300"
                    : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                {saving
                  ? "กำลังบันทึก..."
                  : "บันทึกผลการตรวจ"}
              </button>

            )}

            {/* History */}

            {saved && (

              <button
                onClick={() =>
                  router.push("/history")
                }
                className="mt-7 w-full rounded-2xl bg-pink-500 py-4 font-semibold text-white shadow-md hover:bg-pink-600"
              >
                📅 ดูประวัติของฉัน
              </button>

            )}

            {/* Edit */}

            {!saved && (

              <button
                onClick={() =>
                  setFinished(false)
                }
                className="mt-3 w-full rounded-2xl border border-pink-300 py-4 font-semibold text-pink-600"
              >
                ← กลับไปแก้ไขผล
              </button>

            )}

            {/* Again */}

            {saved && (

              <button
                onClick={startAgain}
                className="mt-3 w-full rounded-2xl border border-pink-300 py-4 font-semibold text-pink-600"
              >
                ตรวจใหม่
              </button>

            )}

            <Link
              href="/"
              className="mt-3 block py-3 text-center text-sm font-semibold text-gray-500"
            >
              กลับหน้าหลัก
            </Link>

          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            การตรวจเต้านมด้วยตนเองไม่ใช่การวินิจฉัยโรค
            และไม่สามารถทดแทนการตรวจโดยบุคลากรทางการแพทย์ได้
          </p>

        </div>
      </main>
    );
  }

  // ==========================================
  // หน้า Step 1-5
  // ==========================================

  return (
    <main className="min-h-screen bg-pink-50">

      <div className="mx-auto max-w-md px-6 py-8">

        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-pink-600"
        >
          ← กลับหน้าหลัก
        </Link>

        <div>

          <p className="text-sm font-semibold text-pink-500">
            🎀 Breast Care
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            ตรวจเต้านมด้วยตนเอง
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            ผู้ใช้งาน: คุณ{user.name}
          </p>

          <p className="mt-3 leading-7 text-gray-600">
            ทำตามขั้นตอนทีละข้อ
            และเลือกผลที่ตรงกับสิ่งที่คุณสังเกตได้
          </p>

        </div>

        {/* Progress */}

        <div className="my-6">

          <div className="mb-2 flex justify-between text-sm">

            <span className="font-medium text-pink-600">
              ขั้นตอน {currentStep + 1} จาก{" "}
              {steps.length}
            </span>

            <span className="text-gray-400">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-pink-100">

            <div
              className="h-full rounded-full bg-pink-500 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* Step card */}

        <div className="rounded-3xl bg-white p-6 shadow-md">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-500 font-bold text-white">
              {currentStep + 1}
            </div>

            <div>

              <p className="text-sm text-gray-500">
                ขั้นตอนที่ {currentStep + 1}
              </p>

              <h2 className="font-bold text-gray-900">
                {step.title}
              </h2>

            </div>

          </div>

          <p className="leading-7 text-gray-600">
            {step.description}
          </p>

          <div className="mt-6 rounded-2xl bg-pink-50 p-4">

            <p className="font-semibold text-pink-700">
              สิ่งที่ควรสังเกต
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {step.observe}
            </p>

          </div>

          <p className="mt-7 font-semibold text-gray-800">
            จากการตรวจครั้งนี้
          </p>

          <p className="mt-1 text-sm text-gray-500">
            เลือกผลที่ตรงกับสิ่งที่คุณสังเกตได้
          </p>

          {/* Answers */}

          <div className="mt-4 grid grid-cols-2 gap-3">

            <button
              onClick={() =>
                selectAnswer("normal")
              }
              className={`rounded-2xl border p-4 text-sm font-semibold transition ${
                answers[currentStep] ===
                "normal"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              ✓
              <br />
              ไม่พบความผิดปกติ
            </button>

            <button
              onClick={() =>
                selectAnswer("abnormal")
              }
              className={`rounded-2xl border p-4 text-sm font-semibold transition ${
                answers[currentStep] ===
                "abnormal"
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              !
              <br />
              พบความผิดปกติ
            </button>

          </div>

          {/* Navigation */}

          <div className="mt-7 flex gap-3">

            {currentStep > 0 && (

              <button
                onClick={previousStep}
                className="w-1/3 rounded-2xl border border-pink-300 py-4 text-sm font-semibold text-pink-600"
              >
                ← ย้อนกลับ
              </button>

            )}

            <button
              onClick={nextStep}
              disabled={
                answers[currentStep] === null
              }
              className={`flex-1 rounded-2xl py-4 font-semibold text-white ${
                answers[currentStep] === null
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-pink-500 shadow-md hover:bg-pink-600"
              }`}
            >
              {currentStep ===
              steps.length - 1
                ? "ดูสรุปผล ✓"
                : "ขั้นตอนถัดไป →"}
            </button>

          </div>

          {answers[currentStep] === null && (

            <p className="mt-3 text-center text-xs text-gray-400">
              กรุณาเลือกผลก่อนดำเนินการต่อ
            </p>

          )}

        </div>

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          การตรวจเต้านมด้วยตนเองไม่ใช่การวินิจฉัยโรค
          หากพบความผิดปกติควรปรึกษาบุคลากรทางการแพทย์
        </p>

      </div>

    </main>
  );
}