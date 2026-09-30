"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";import { createClient } from "@/utils/supabase/client";


type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

type Topic = {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  content: string[];
};

const topics: Topic[] = [
  {
    id: 1,
    icon: "🎀",
    title: "รู้จักมะเร็งเต้านม",
    subtitle: "มะเร็งเต้านมคืออะไร และทำไมควรใส่ใจ",
    content: [
      "มะเร็งเต้านมเกิดจากเซลล์บริเวณเต้านมมีการเจริญเติบโตผิดปกติและเพิ่มจำนวนอย่างควบคุมไม่ได้",
      "การพบความผิดปกติตั้งแต่ระยะเริ่มต้นช่วยให้ได้รับการประเมิน วินิจฉัย และรักษาอย่างเหมาะสมได้เร็วขึ้น",
      "การสังเกตเต้านมของตนเองเป็นการทำความคุ้นเคยกับรูปร่างและลักษณะปกติของเต้านม เพื่อให้สังเกตความเปลี่ยนแปลงที่เกิดขึ้นได้",
    ],
  },

  {
    id: 2,
    icon: "⚠️",
    title: "สัญญาณที่ควรสังเกต",
    subtitle: "พบความเปลี่ยนแปลงแบบไหนควรไปพบแพทย์",
    content: [
      "คลำพบก้อนหรือบริเวณที่แข็งผิดปกติบริเวณเต้านมหรือรักแร้",
      "รูปร่างหรือขนาดของเต้านมเปลี่ยนแปลงไปจากเดิมอย่างชัดเจน",
      "ผิวหนังบริเวณเต้านมบุ๋ม ย่น บวม แดง หรือมีลักษณะผิดปกติ",
      "หัวนมบุ๋มเข้าใหม่ หรือรูปร่างของหัวนมเปลี่ยนไปจากเดิม",
      "มีเลือดหรือสิ่งคัดหลั่งผิดปกติออกจากหัวนมโดยไม่ได้บีบ",
      "มีอาการเจ็บเต้านมผิดปกติที่เป็นต่อเนื่องหรือไม่หาย",
      "หากพบความเปลี่ยนแปลงเหล่านี้ ไม่ได้หมายความว่าเป็นมะเร็งเสมอไป แต่ควรพบแพทย์เพื่อรับการประเมิน",
    ],
  },

  {
    id: 3,
    icon: "🖐️",
    title: "การสังเกตเต้านมด้วยตนเอง",
    subtitle: "รู้จักลักษณะปกติของเต้านมของตนเอง",
    content: [
      "เริ่มจากการมองเต้านมทั้งสองข้างหน้ากระจก สังเกตรูปร่าง ขนาด ผิวหนัง และหัวนม",
      "ยกแขนขึ้นเหนือศีรษะและสังเกตว่ามีรอยบุ๋ม การดึงรั้ง หรือความเปลี่ยนแปลงของผิวหนังหรือไม่",
      "ใช้ส่วนฝ่ามือของนิ้วชี้ นิ้วกลาง และนิ้วนางคลำให้ทั่วบริเวณเต้านมอย่างเป็นระบบ",
      "ใช้ระดับแรงกดที่แตกต่างกัน เพื่อสังเกตเนื้อเยื่อบริเวณตื้น ปานกลาง และลึก",
      "อย่าลืมสังเกตและคลำบริเวณรักแร้",
      "เป้าหมายสำคัญคือการรู้ว่าเต้านมของตนเองมีลักษณะปกติอย่างไร เพื่อให้สังเกตความเปลี่ยนแปลงที่เกิดขึ้นใหม่ได้",
    ],
  },

  {
    id: 4,
    icon: "📅",
    title: "ควรสังเกตเมื่อไร",
    subtitle: "สร้างความสม่ำเสมอในการดูแลตนเอง",
    content: [
      "ควรสังเกตและทำความคุ้นเคยกับลักษณะเต้านมของตนเองอย่างสม่ำเสมอ",
      "สำหรับผู้ที่มีประจำเดือน ลักษณะของเต้านมอาจเปลี่ยนตามฮอร์โมนในแต่ละช่วงของรอบเดือน การสังเกตในช่วงเวลาใกล้เคียงกันของแต่ละเดือนจะช่วยให้เปรียบเทียบได้ง่ายขึ้น",
      "หากหมดประจำเดือนแล้ว สามารถกำหนดวันที่จำง่ายในแต่ละเดือนเพื่อช่วยเตือนตนเอง",
      "หากพบความเปลี่ยนแปลงที่ผิดไปจากลักษณะปกติของตนเอง ไม่จำเป็นต้องรอถึงรอบตรวจครั้งต่อไป ควรปรึกษาบุคลากรทางการแพทย์",
    ],
  },

  {
    id: 5,
    icon: "🏥",
    title: "การคัดกรองมะเร็งเต้านม",
    subtitle: "BSE ไม่สามารถทดแทนการตรวจทางการแพทย์",
    content: [
      "การสังเกตหรือการตรวจเต้านมด้วยตนเองช่วยให้รู้จักเต้านมของตนเอง แต่ไม่สามารถใช้ยืนยันว่าเป็นหรือไม่เป็นมะเร็งเต้านมได้",
      "การตรวจเต้านมโดยแพทย์หรือบุคลากรทางการแพทย์เป็นอีกส่วนหนึ่งของการประเมินสุขภาพเต้านม",
      "แมมโมแกรมเป็นการตรวจทางรังสีที่ใช้ในการคัดกรองมะเร็งเต้านมในกลุ่มที่เหมาะสม",
      "ช่วงอายุ ความถี่ และวิธีการคัดกรองที่เหมาะสมอาจแตกต่างกันตามอายุ ประวัติครอบครัว และระดับความเสี่ยงของแต่ละบุคคล",
      "ผู้ที่มีความเสี่ยงสูงควรปรึกษาแพทย์เพื่อวางแผนการคัดกรองที่เหมาะสมกับตนเอง",
    ],
  },

  {
    id: 6,
    icon: "🧬",
    title: "ปัจจัยที่เกี่ยวข้องกับความเสี่ยง",
    subtitle: "ความเสี่ยงของแต่ละคนไม่เท่ากัน",
    content: [
      "อายุที่เพิ่มขึ้น",
      "มีญาติสายตรง เช่น แม่ พี่สาว น้องสาว หรือลูกสาว มีประวัติมะเร็งเต้านม",
      "มีการกลายพันธุ์ของยีนบางชนิด เช่น BRCA1 หรือ BRCA2",
      "ปัจจัยเกี่ยวกับฮอร์โมนและประวัติการเจริญพันธุ์บางประการ",
      "ภาวะน้ำหนักเกินหรือโรคอ้วน โดยเฉพาะในบางช่วงวัย",
      "การดื่มเครื่องดื่มแอลกอฮอล์",
      "การมีปัจจัยเสี่ยงไม่ได้หมายความว่าจะต้องเป็นมะเร็ง และผู้ที่ไม่มีปัจจัยเสี่ยงชัดเจนก็ยังสามารถเป็นมะเร็งเต้านมได้",
    ],
  },
];

export default function KnowledgePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [openTopic, setOpenTopic] =
    useState<number | null>(null);

  // ตรวจ Login
 useEffect(() => {
  const checkUser = async () => {
    const supabase = createClient();

 const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user;


if (!user) {
  console.log("No user found");
  setLoading(false);
  return;
}

    const name =
      typeof user.user_metadata?.name === "string" &&
      user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : user.email?.split("@")[0] || "ผู้ใช้งาน";

    setUser({
      id: 0,
      name,
      email: user.email || "",
    });

    setLoading(false);
  };

  checkUser();
}, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pink-50">

        <div className="text-center">

          <div className="text-5xl">
            📖
          </div>

          <p className="mt-4 font-semibold text-pink-500">
            กำลังโหลด...
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
            ความรู้เรื่องเต้านม
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            เรียนรู้การสังเกตความเปลี่ยนแปลง
            ปัจจัยเสี่ยง และการคัดกรองมะเร็งเต้านม
          </p>

        </div>

        {/* Highlight */}

        <div className="mt-6 rounded-3xl bg-pink-500 p-6 text-white shadow-md">

          <div className="text-3xl">
            💗
          </div>

          <h2 className="mt-3 text-xl font-bold">
            รู้จักเต้านมของตัวเอง
          </h2>

          <p className="mt-2 text-sm leading-6 text-pink-50">
            การสังเกตอย่างสม่ำเสมอช่วยให้คุณรู้ว่า
            ลักษณะปกติของเต้านมตนเองเป็นอย่างไร
            และสังเกตความเปลี่ยนแปลงที่เกิดขึ้นใหม่ได้
          </p>

          <Link
            href="/self-exam"
            className="mt-5 block rounded-2xl bg-white py-3 text-center text-sm font-bold text-pink-600"
          >
            เริ่มตรวจเต้านม →
          </Link>

        </div>

        {/* Topics */}

        <div className="mt-7">

          <h2 className="font-bold text-gray-900">
            เลือกหัวข้อที่ต้องการเรียนรู้
          </h2>

          <div className="mt-4 space-y-3">

            {topics.map((topic) => {

              const isOpen =
                openTopic === topic.id;

              return (
                <div
                  key={topic.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >

                  {/* Topic Button */}

                  <button
                    onClick={() =>
                      setOpenTopic(
                        isOpen
                          ? null
                          : topic.id
                      )
                    }
                    className="flex w-full items-center gap-4 p-5 text-left"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
                      {topic.icon}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="font-bold text-gray-800">
                        {topic.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {topic.subtitle}
                      </p>

                    </div>

                    <span
                      className={`text-xl text-pink-400 transition ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      ⌄
                    </span>

                  </button>

                  {/* Expanded Content */}

                  {isOpen && (

                    <div className="border-t border-pink-50 px-5 pb-5 pt-4">

                      <div className="space-y-3">

                        {topic.content.map(
                          (text, index) => (

                            <div
                              key={index}
                              className="flex gap-3"
                            >

                              <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-pink-400" />

                              <p className="text-sm leading-6 text-gray-600">
                                {text}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        </div>

        {/* Important */}

        <div className="mt-7 rounded-3xl border border-red-100 bg-red-50 p-5">

          <div className="flex gap-3">

            <div className="text-2xl">
              ⚠️
            </div>

            <div>

              <p className="font-bold text-red-700">
                เมื่อพบความผิดปกติ
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                หากพบก้อนใหม่ ผิวหนังบุ๋ม
                หัวนมเปลี่ยนแปลง
                หรือมีเลือดหรือสิ่งคัดหลั่งผิดปกติจากหัวนม
                ควรปรึกษาบุคลากรทางการแพทย์
                เพื่อรับการประเมิน
              </p>

            </div>

          </div>

        </div>

        {/* Source */}

        <div className="mt-7 rounded-3xl bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold text-gray-400">
            แหล่งข้อมูล
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            กรมการแพทย์ กระทรวงสาธารณสุข
            และสถาบันมะเร็งแห่งชาติ
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-400">
            เนื้อหานี้จัดทำเพื่อให้ความรู้และส่งเสริม
            การสังเกตสุขภาพเต้านม ไม่ใช้สำหรับการวินิจฉัยโรค
          </p>

        </div>

        {/* Footer */}

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          หากมีข้อสงสัยเกี่ยวกับสุขภาพเต้านม
          ควรปรึกษาบุคลากรทางการแพทย์
        </p>

      </div>

    </main>
  );
}