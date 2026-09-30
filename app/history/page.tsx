"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Answer = "normal" | "abnormal";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type ExamResult = {
  id: number;
  userId: string;
  date: string;
  answers: Answer[];
  abnormalCount: number;
};

const stepNames = [
  "สังเกตหน้ากระจก",
  "ยกแขนขึ้นเหนือศีรษะ",
  "คลำเต้านม",
  "คลำบริเวณรักแร้",
  "สังเกตหัวนม",
];

const weekDays = [
  "อา.",
  "จ.",
  "อ.",
  "พ.",
  "พฤ.",
  "ศ.",
  "ส.",
];

export default function HistoryPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [results, setResults] =
    useState<ExamResult[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [currentMonth, setCurrentMonth] =
    useState(new Date());

  const [pageError, setPageError] =
    useState("");

  // ========================================
  // โหลด User + ประวัติจาก Supabase
  // ========================================

  useEffect(() => {
    const loadHistory = async () => {
      const supabase = createClient();

      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        setLoading(false);
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
  .eq("user_id", authUser.id)
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

if (!consentData || consentData.length === 0) {
  router.replace("/consent");
  return;
}
      const name =
        typeof authUser.user_metadata?.name === "string" &&
        authUser.user_metadata.name.trim()
          ? authUser.user_metadata.name.trim()
          : authUser.email?.split("@")[0] ||
            "ผู้ใช้งาน";

      setUser({
        id: authUser.id,
        name,
        email: authUser.email || "",
      });

      const { data, error } = await supabase
        .from("exam_results")
        .select(
          "id, created_at, user_id, answers, abnormal_count"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Load exam history error:",
          error
        );

        setPageError(
          "ไม่สามารถโหลดประวัติการตรวจได้ กรุณาลองใหม่อีกครั้ง"
        );

        setLoading(false);
        return;
      }

      const formattedResults: ExamResult[] =
        (data || []).map((item) => ({
          id: item.id,
          userId: item.user_id,
          date: item.created_at,
          answers: item.answers as Answer[],
          abnormalCount:
            item.abnormal_count ?? 0,
        }));

      setResults(formattedResults);
      setLoading(false);
    };

    loadHistory();
  }, [router]);

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const monthName =
    currentMonth.toLocaleDateString(
      "th-TH",
      {
        month: "long",
        year: "numeric",
      }
    );

  // ========================================
  // เปลี่ยนเดือน
  // ========================================

  const previousMonth = () => {
    setCurrentMonth(
      new Date(
        year,
        month - 1,
        1
      )
    );

    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        year,
        month + 1,
        1
      )
    );

    setSelectedDate(null);
  };

  const goToday = () => {
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // ========================================
  // ประวัติของแต่ละวัน
  // ========================================

  const getResultsForDay = (
    day: number
  ) => {
    return results.filter(
      (result) => {
        const date =
          new Date(result.date);

        return (
          date.getDate() === day &&
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      }
    );
  };

  // ========================================
  // ผลของวันที่เลือก
  // ========================================

  const selectedResults =
    selectedDate
      ? results.filter(
          (result) => {
            const date =
              new Date(result.date);

            return (
              date.getDate() ===
                selectedDate.getDate() &&
              date.getMonth() ===
                selectedDate.getMonth() &&
              date.getFullYear() ===
                selectedDate.getFullYear()
            );
          }
        )
      : [];

  // ========================================
  // ลบผลตรวจจาก Supabase
  // ========================================

  const deleteResult = async (
    id: number
  ) => {
    if (!user) {
      return;
    }

    const confirmDelete =
      window.confirm(
        "ต้องการลบประวัติการตรวจครั้งนี้หรือไม่?"
      );

    if (!confirmDelete) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("exam_results")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Delete exam result error:",
        error
      );

      window.alert(
        "ไม่สามารถลบประวัติได้ กรุณาลองใหม่อีกครั้ง"
      );

      return;
    }

    setResults((currentResults) =>
      currentResults.filter(
        (result) => result.id !== id
      )
    );
  };

  // ========================================
  // วันนี้
  // ========================================

  const isToday = (
    day: number
  ) => {
    const today = new Date();

    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pink-50">

        <div className="text-center">

          <div className="text-5xl">
            📅
          </div>

          <p className="mt-4 font-semibold text-pink-500">
            กำลังโหลดประวัติ...
          </p>

        </div>

      </main>
    );
  }

  if (!user) {
    return null;
  }

  // ========================================
  // Page
  // ========================================

  return (
    <main className="min-h-screen bg-pink-50">

      <div className="mx-auto max-w-md px-5 py-8">

        {/* Back */}

        <Link
          href="/"
          className="inline-block text-sm font-semibold text-pink-600"
        >
          ← กลับหน้าหลัก
        </Link>

        {/* Header */}

        <div className="mt-6">

          <p className="text-sm font-semibold text-pink-500">
            🎀 Breast Care
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            ประวัติการตรวจ
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            ประวัติของคุณ{user.name}
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-400">
            วันที่ที่มีจุดสีชมพูคือวันที่มีการบันทึกผล
          </p>

        </div>

        {/* Error */}

        {pageError && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4">

            <p className="text-center text-sm font-semibold text-red-600">
              {pageError}
            </p>

          </div>
        )}

        {/* ================= CALENDAR ================= */}

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-md">

          {/* Month */}

          <div className="flex items-center justify-between">

            <button
              onClick={previousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-2xl text-pink-600"
            >
              ‹
            </button>

            <div className="text-center">

              <h2 className="font-bold text-gray-800">
                {monthName}
              </h2>

              <button
                onClick={goToday}
                className="mt-1 text-xs font-semibold text-pink-500"
              >
                วันนี้
              </button>

            </div>

            <button
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-2xl text-pink-600"
            >
              ›
            </button>

          </div>

          {/* Week */}

          <div className="mt-6 grid grid-cols-7">

            {weekDays.map(
              (day) => (

                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-gray-400"
                >
                  {day}
                </div>

              )
            )}

          </div>

          {/* Days */}

          <div className="grid grid-cols-7 gap-1">

            {Array.from({
              length: firstDay,
            }).map((_, index) => (

              <div
                key={`empty-${index}`}
                className="aspect-square"
              />

            ))}

            {Array.from({
              length: daysInMonth,
            }).map((_, index) => {
              const day =
                index + 1;

              const dayResults =
                getResultsForDay(day);

              const hasResult =
                dayResults.length > 0;

              const selected =
                selectedDate &&
                selectedDate.getDate() ===
                  day &&
                selectedDate.getMonth() ===
                  month &&
                selectedDate.getFullYear() ===
                  year;

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        year,
                        month,
                        day
                      )
                    )
                  }
                  className={`relative aspect-square rounded-xl text-sm transition ${
                    selected
                      ? "bg-pink-500 font-bold text-white"
                      : hasResult
                      ? "bg-pink-50 font-semibold text-pink-700"
                      : isToday(day)
                      ? "border border-pink-300 font-semibold text-pink-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >

                  {day}

                  {hasResult &&
                    !selected && (

                      <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-pink-500" />

                    )}

                  {hasResult &&
                    selected && (

                      <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />

                    )}

                </button>
              );
            })}

          </div>

          {/* Legend */}

          <div className="mt-5 border-t border-gray-100 pt-4">

            <div className="flex items-center gap-2 text-xs text-gray-500">

              <span className="h-2 w-2 rounded-full bg-pink-500" />

              มีประวัติการตรวจของฉัน

            </div>

          </div>

        </div>

        {/* ================= SELECTED DATE ================= */}

        {selectedDate && (

          <div className="mt-5">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-pink-500">
                  วันที่เลือก
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-900">

                  {selectedDate.toLocaleDateString(
                    "th-TH",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}

                </h2>

              </div>

              {selectedResults.length >
                0 && (

                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                  {
                    selectedResults.length
                  }{" "}
                  ครั้ง
                </span>

              )}

            </div>

            {/* ไม่มีผล */}

            {selectedResults.length ===
              0 && (

              <div className="rounded-3xl bg-white p-7 text-center shadow-sm">

                <div className="text-4xl">
                  📅
                </div>

                <p className="mt-3 font-semibold text-gray-700">
                  ไม่มีประวัติการตรวจในวันนี้
                </p>

                <Link
                  href="/self-exam"
                  className="mt-5 inline-block rounded-2xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white"
                >
                  เริ่มตรวจเต้านม
                </Link>

              </div>

            )}

            {/* Results */}

            {selectedResults.map(
              (
                result,
                resultIndex
              ) => (

                <div
                  key={result.id}
                  className="mb-5 rounded-3xl bg-white p-6 shadow-md"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs text-gray-400">
                        การตรวจครั้งที่{" "}
                        {resultIndex + 1}
                      </p>

                      <p className="mt-1 font-bold text-gray-900">

                        เวลา{" "}

                        {new Date(
                          result.date
                        ).toLocaleTimeString(
                          "th-TH",
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}

                      </p>

                    </div>

                    {result.abnormalCount ===
                    0 ? (

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        ไม่ได้รายงานความผิดปกติ
                      </span>

                    ) : (

                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        ควรประเมินเพิ่มเติม
                      </span>

                    )}

                  </div>

                  {/* Summary */}

                  {result.abnormalCount ===
                  0 ? (

                    <div className="mt-5 rounded-2xl bg-green-50 p-4">

                      <p className="font-semibold text-green-700">
                        ✓ ไม่มีข้อที่เลือกว่า
                        “พบความผิดปกติ”
                      </p>

                    </div>

                  ) : (

                    <div className="mt-5 rounded-2xl bg-red-50 p-4">

                      <p className="font-semibold text-red-700">
                        พบรายการที่ควรได้รับการประเมินเพิ่มเติม{" "}
                        {
                          result.abnormalCount
                        }{" "}
                        รายการ
                      </p>

                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        ผลนี้ไม่ได้หมายความว่าเป็นมะเร็งเต้านม
                        หากพบความเปลี่ยนแปลงที่ผิดไปจากเดิม
                        ควรปรึกษาบุคลากรทางการแพทย์
                      </p>

                    </div>

                  )}

                  {/* Steps */}

                  <div className="mt-5 space-y-2">

                    {stepNames.map(
                      (
                        name,
                        index
                      ) => (

                        <div
                          key={name}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-3"
                        >

                          <div>

                            <p className="text-xs text-gray-400">
                              ขั้นตอนที่{" "}
                              {index + 1}
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-gray-700">
                              {name}
                            </p>

                          </div>

                          {result
                            .answers[
                              index
                            ] ===
                          "normal" ? (

                            <span className="whitespace-nowrap text-xs font-bold text-green-600">
                              ✓ ไม่พบผิดปกติ
                            </span>

                          ) : (

                            <span className="whitespace-nowrap text-xs font-bold text-red-600">
                              ! พบความผิดปกติ
                            </span>

                          )}

                        </div>

                      )
                    )}

                  </div>

                  {/* Delete */}

                  <button
                    onClick={() =>
                      deleteResult(
                        result.id
                      )
                    }
                    className="mt-5 w-full rounded-2xl border border-red-100 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    ลบประวัติการตรวจนี้
                  </button>

                </div>

              )
            )}

          </div>

        )}

        {/* ================= EMPTY ================= */}

        {results.length === 0 &&
          !selectedDate && (

            <div className="mt-5 rounded-3xl bg-white p-8 text-center shadow-sm">

              <div className="text-5xl">
                📅
              </div>

              <h2 className="mt-4 font-bold text-gray-800">
                ยังไม่มีประวัติการตรวจ
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                คุณ{user.name}
                ยังไม่ได้บันทึกผลการตรวจ
                เมื่อบันทึกแล้ววันที่ตรวจจะปรากฏบนปฏิทินนี้
              </p>

              <Link
                href="/self-exam"
                className="mt-6 inline-block rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white"
              >
                เริ่มตรวจครั้งแรก
              </Link>

            </div>

          )}

        {/* New Exam */}

        {results.length > 0 && (

          <Link
            href="/self-exam"
            className="mt-6 block w-full rounded-2xl bg-pink-500 py-4 text-center font-semibold text-white shadow-md"
          >
            + บันทึกการตรวจครั้งใหม่
          </Link>

        )}

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          ประวัตินี้เป็นข้อมูลที่ผู้ใช้บันทึกจากการสังเกตด้วยตนเอง
          ไม่ใช่ผลการวินิจฉัยทางการแพทย์
        </p>

      </div>

    </main>
  );
}