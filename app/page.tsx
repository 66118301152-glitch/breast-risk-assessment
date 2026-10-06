"use client";

import { useState } from "react";

const riskFactors = [
  {
    id: 1,
    title: "คนในครอบครัวเคยเป็นมะเร็งเต้านมหรือไม่",
    detail:
      "เช่น แม่ พี่สาว น้องสาว หรือลูกสาว เคยเป็นมะเร็งเต้านม",
  },
  {
    id: 2,
    title: "เคยเป็นโรคหรือเคยมีก้อนที่เต้านมหรือไม่",
    detail:
      "เช่น เคยมีก้อน เจ็บเต้านมผิดปกติ หรือเคยรักษาโรคเกี่ยวกับเต้านม",
  },
  {
    id: 3,
    title: "มีคนในตระกูลเป็นมะเร็งเต้านมหลายคนหรือไม่",
    detail:
      "เช่น ญาติพี่น้องหลายคนเคยเป็นมะเร็งเต้านมหรือมะเร็งรังไข่",
  },
  {
    id: 4,
    title: "ชอบกินอาหารมัน ๆ เป็นประจำหรือไม่",
    detail:
      "เช่น ของทอด หมูสามชั้น หนังไก่ หรืออาหารกะทิบ่อย ๆ",
  },
  {
    id: 5,
    title: "ไม่มีลูก หรือมีลูกคนแรกตอนอายุมากกว่า 30 ปีหรือไม่",
    detail: "",
  },
  {
    id: 6,
    title: "มีประจำเดือนครั้งแรกตอนอายุน้อยกว่า 12 ปีหรือไม่",
    detail: "",
  },
  {
    id: 7,
    title: "ประจำเดือนหมดตอนอายุมากกว่า 50 ปีหรือไม่",
    detail: "",
  },
  {
    id: 8,
    title: "กินยาคุมกำเนิดติดต่อกันเกิน 5 ปีหรือไม่",
    detail: "",
  },
];

type RiskLevel = "low" | "medium" | "high";

export default function Home() {
  const [checked, setChecked] = useState<number[]>([]);
  const [result, setResult] = useState<RiskLevel | null>(null);

  const score = checked.length;

  const toggleRisk = (id: number) => {
    setChecked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const calculateRisk = () => {
    if (score >= 5) {
      setResult("high");
    } else if (score >= 3) {
      setResult("medium");
    } else {
      setResult("low");
    };
  };

  const resetAssessment = () => {
    setChecked([]);
    setResult(null);
  };

  const getResultData = () => {
    if (result === "low") {
      return {
        title: "ความเสี่ยงระดับต่ำ",
        scoreText: `พบปัจจัยเสี่ยง ${score} ข้อ`,
        advice:
          "ควรตรวจเต้านมด้วยตนเองเป็นประจำทุกเดือน และเข้ารับการตรวจโดยแพทย์หรือบุคลากรทางการแพทย์อย่างน้อยปีละ 1 ครั้ง",
        bg: "bg-yellow-100",
        border: "border-yellow-400",
        titleColor: "text-yellow-700",
        icon: "🌼",
      };
    }

    if (result === "medium") {
      return {
        title: "ความเสี่ยงระดับปานกลาง",
        scoreText: `พบปัจจัยเสี่ยง ${score} ข้อ`,
        advice:
          "ควรปรึกษาแพทย์เพื่อวางแผนการตรวจคัดกรองเพิ่มเติม เช่น การทำแมมโมแกรม (Mammogram) ร่วมกับอัลตราซาวนด์ตามช่วงอายุที่เหมาะสม",
        bg: "bg-orange-100",
        border: "border-orange-400",
        titleColor: "text-orange-700",
        icon: "⚠️",
      };
    }

    return {
      title: "ความเสี่ยงระดับสูง",
      scoreText: `พบปัจจัยเสี่ยง ${score} ข้อ`,
      advice:
        "แนะนำให้พบแพทย์ผู้เชี่ยวชาญเฉพาะทางเพื่อวางแผนการเฝ้าระวัง การตรวจคัดกรองอย่างใกล้ชิด และรับคำแนะนำในการปรับเปลี่ยนพฤติกรรมลดความเสี่ยง",
      bg: "bg-red-100",
      border: "border-red-400",
      titleColor: "text-red-700",
      icon: "❤️‍🩹",
    };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl">🎀</div>

          <h1 className="text-3xl font-bold text-pink-700 sm:text-4xl">
            แบบประเมินความเสี่ยง
          </h1>

          <h2 className="mt-2 text-2xl font-bold text-pink-600">
            มะเร็งเต้านม
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            โปรดอ่านคำถามแต่ละข้อ และทำเครื่องหมาย ✓
            หากมีปัจจัยเสี่ยงตามที่ระบุ
          </p>
        </div>

        {/* Score indicator */}
        <div className="sticky top-3 z-10 mb-5 rounded-2xl border border-pink-200 bg-white/95 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                ปัจจัยเสี่ยงที่เลือก
              </p>

              <p className="text-2xl font-bold text-pink-600">
                {score} <span className="text-base font-normal">/ 8 ข้อ</span>
              </p>
            </div>

            <div className="h-3 w-36 overflow-hidden rounded-full bg-pink-100 sm:w-52">
              <div
                className="h-full rounded-full bg-pink-500 transition-all duration-300"
                style={{
                  width: `${(score / 8) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Risk factors */}
        <div className="space-y-4">
          {riskFactors.map((factor) => {
            const isChecked = checked.includes(factor.id);

            return (
              <label
                key={factor.id}
                className={`block cursor-pointer rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-200 ${
                  isChecked
                    ? "border-pink-500 bg-pink-50 shadow-md"
                    : "border-pink-100 hover:border-pink-300 hover:shadow-md"
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRisk(factor.id)}
                      className="h-6 w-6 cursor-pointer accent-pink-600"
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-base font-bold leading-7 text-gray-800 sm:text-lg">
                      {factor.id}. {factor.title}
                    </p>

                    {factor.detail && (
                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {factor.detail}
                      </p>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={calculateRisk}
            className="flex-1 rounded-2xl bg-pink-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-pink-700 active:scale-[0.98]"
          >
            🎀 ประเมินความเสี่ยง
          </button>

          <button
            onClick={resetAssessment}
            className="rounded-2xl border-2 border-pink-200 bg-white px-6 py-4 font-semibold text-pink-600 transition hover:bg-pink-50"
          >
            เริ่มใหม่
          </button>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl bg-pink-50 p-5 text-sm leading-7 text-gray-600">
          <p className="font-bold text-pink-700">
            เกณฑ์การสรุประดับความเสี่ยง
          </p>

          <ul className="mt-2 space-y-1">
            <li>🟡 1–2 ข้อ = ความเสี่ยงระดับต่ำ</li>
            <li>🟠 3–4 ข้อ = ความเสี่ยงระดับปานกลาง</li>
            <li>🔴 5 ข้อขึ้นไป = ความเสี่ยงระดับสูง</li>
          </ul>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-gray-400">
          แบบประเมินนี้จัดทำเพื่อใช้ในการประเมินปัจจัยเสี่ยงเบื้องต้น
          ไม่ใช้แทนการวินิจฉัยจากแพทย์
        </p>
      </div>

      {/* RESULT MODAL */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="bg-pink-600 px-6 py-5 text-center text-white">
              <div className="text-4xl">
                {getResultData().icon}
              </div>

              <h2 className="mt-2 text-2xl font-bold">
                ผลการประเมิน
              </h2>
            </div>

            {/* Result */}
            <div className="p-6">

              <div
                className={`rounded-2xl border-2 p-5 text-center ${getResultData().bg} ${getResultData().border}`}
              >
                <p
                  className={`text-2xl font-bold ${getResultData().titleColor}`}
                >
                  {getResultData().title}
                </p>

                <p className="mt-2 text-xl font-bold text-gray-800">
                  คะแนน {score} / 8
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {getResultData().scoreText}
                </p>
              </div>

              {/* Advice */}
              <div className="mt-5">
                <h3 className="font-bold text-gray-800">
                  คำแนะนำ
                </h3>

                <p className="mt-2 text-sm leading-7 text-gray-600">
                  {getResultData().advice}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setResult(null)}
                className="mt-6 w-full rounded-2xl bg-pink-600 py-3.5 font-bold text-white transition hover:bg-pink-700"
              >
                ปิด
              </button>

              <button
                onClick={resetAssessment}
                className="mt-2 w-full rounded-2xl border border-pink-200 py-3 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
              >
                ทำแบบประเมินใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}