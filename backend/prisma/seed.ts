import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, "..");
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith("file:./")) {
  process.env.DATABASE_URL = `file:${path.resolve(backendRoot, databaseUrl.replace("file:./", ""))}`;
}

const prisma = new PrismaClient();

const chapterSeed = {
  slug: "chapter-1-digital-heart",
  title: "Chapter 1 - Digital Heart",
  description: "Belajar merespons konflik digital dengan empati yang tetap tegas.",
  orderIndex: 1,
  isPublished: true,
};

const scenesSeed = [
  {
    key: "s01-feed-storm",
    title: "Feed yang Memanas",
    body: "Timeline kelasmu meledak. Meme tentang Nara diposting ulang, komentar makin kasar, dan teman-teman mulai ikut menertawakan.",
    speaker: "Narator",
    orderIndex: 1,
    isStart: true,
    isEnd: false,
    background: "bg-feed",
  },
  {
    key: "s02-private-chat",
    title: "Pesan Pribadi",
    body: "Kamu memilih chat Nara. Ia menjawab singkat: 'Aku capek. Semua orang nonton, tapi gak ada yang nolong.'",
    speaker: "Nara",
    orderIndex: 2,
    isStart: false,
    isEnd: false,
    background: "bg-chat",
  },
  {
    key: "s03-flaming-thread",
    title: "Thread Flaming",
    body: "Di thread publik, dua kubu saling ejek. Ada yang bilang ini hanya bercanda, ada yang ingin semua akun yang ikut menghina diblokir.",
    speaker: "Narator",
    orderIndex: 3,
    isStart: false,
    isEnd: false,
    background: "bg-thread",
  },
  {
    key: "s04-support-victim",
    title: "Ruang Aman",
    body: "Kamu ajak beberapa teman yang masih tenang untuk bikin ruang aman. Tujuannya: dengarkan Nara dulu sebelum menentukan langkah.",
    speaker: "Kamu",
    orderIndex: 4,
    isStart: false,
    isEnd: false,
    background: "bg-safe-room",
  },
  {
    key: "s05-cancel-callout",
    title: "Tekanan Cancel",
    body: "Sekelompok teman mendorongmu ikut post callout keras ke pelaku utama. Mereka bilang ini satu-satunya cara memberi efek jera.",
    speaker: "Teman Kelas",
    orderIndex: 5,
    isStart: false,
    isEnd: false,
    background: "bg-cancel",
  },
  {
    key: "s06-report-tools",
    title: "Gunakan Fitur Platform",
    body: "Kamu kumpulkan bukti: screenshot, timestamp, dan link. Guru BK minta semua laporan dibuat rapi agar bisa ditindak.",
    speaker: "Guru BK",
    orderIndex: 6,
    isStart: false,
    isEnd: false,
    background: "bg-report",
  },
  {
    key: "s07-group-reflection",
    title: "Refleksi Kelompok",
    body: "Diskusi kelas dimulai. Sebagian mengaku ikut komentar toxic karena takut dijauhi teman. Kamu diminta menyampaikan responmu.",
    speaker: "Wali Kelas",
    orderIndex: 7,
    isStart: false,
    isEnd: false,
    background: "bg-reflect",
  },
  {
    key: "s08-closing",
    title: "Babak Pertama Selesai",
    body: "Kamu belum menyelesaikan semuanya, tapi kamu berhasil menunjukkan bahwa tegas dan empatik bisa berjalan bareng.",
    speaker: "Narator",
    orderIndex: 8,
    isStart: false,
    isEnd: true,
    background: "bg-closing",
  },
] as const;

const choiceSeed: Record<string, Array<{
  text: string;
  empathyDelta: number;
  relationshipDelta: number;
  feedbackText: string;
  nextSceneKey: string | null;
}>> = {
  "s01-feed-storm": [
    {
      text: "DM Nara dan tanya apa yang paling ia butuhkan saat ini.",
      empathyDelta: 3,
      relationshipDelta: 2,
      feedbackText: "Empatik karena kamu memprioritaskan kebutuhan korban dulu, bukan performa di publik.",
      nextSceneKey: "s02-private-chat",
    },
    {
      text: "Balas thread dengan kalimat netral supaya suasana cepat turun.",
      empathyDelta: 1,
      relationshipDelta: 0,
      feedbackText: "Lumayan empatik, tapi belum menyentuh dukungan langsung ke pihak yang terdampak.",
      nextSceneKey: "s03-flaming-thread",
    },
    {
      text: "Ikut bercanda biar tidak dianggap kaku oleh teman-teman.",
      empathyDelta: -2,
      relationshipDelta: -2,
      feedbackText: "Kurang empatik karena kamu ikut memperkuat tekanan sosial yang menyakiti korban.",
      nextSceneKey: "s05-cancel-callout",
    },
  ],
  "s02-private-chat": [
    {
      text: "Ajak Nara memilih dua orang tepercaya untuk jadi support system.",
      empathyDelta: 3,
      relationshipDelta: 2,
      feedbackText: "Empatik karena kamu memberi kontrol kembali pada korban dan membangun rasa aman.",
      nextSceneKey: "s04-support-victim",
    },
    {
      text: "Langsung minta Nara posting klarifikasi panjang sekarang juga.",
      empathyDelta: -1,
      relationshipDelta: -1,
      feedbackText: "Kurang empatik karena solusi dipaksakan sebelum kondisi emosionalnya siap.",
      nextSceneKey: "s06-report-tools",
    },
  ],
  "s03-flaming-thread": [
    {
      text: "Ingatkan bahwa kritik bisa tegas tanpa merendahkan personal.",
      empathyDelta: 2,
      relationshipDelta: 1,
      feedbackText: "Empatik karena kamu menurunkan eskalasi sambil tetap menjaga akuntabilitas.",
      nextSceneKey: "s04-support-victim",
    },
    {
      text: "Sebar ulang komentar paling kasar agar orang lihat seberapa parahnya.",
      empathyDelta: -2,
      relationshipDelta: -1,
      feedbackText: "Kurang empatik karena repost konten kasar bisa memperluas luka dan jejak digitalnya.",
      nextSceneKey: "s05-cancel-callout",
    },
    {
      text: "Kunci akunmu dan menghilang sampai masalah reda.",
      empathyDelta: -1,
      relationshipDelta: 0,
      feedbackText: "Menghindar bisa melindungi diri, tapi dalam konteks ini membuat peluang dukungan aktif hilang.",
      nextSceneKey: "s06-report-tools",
    },
  ],
  "s04-support-victim": [
    {
      text: "Susun rencana: dukungan emosional dulu, tindakan formal sesudahnya.",
      empathyDelta: 3,
      relationshipDelta: 2,
      feedbackText: "Sangat empatik karena kamu menyeimbangkan pemulihan emosi dan langkah struktural.",
      nextSceneKey: "s07-group-reflection",
    },
    {
      text: "Fokus ke laporan teknis tanpa cek kondisi emosional Nara.",
      empathyDelta: 0,
      relationshipDelta: -1,
      feedbackText: "Secara prosedur benar, tapi empati berkurang karena kebutuhan psikologis terlewat.",
      nextSceneKey: "s06-report-tools",
    },
  ],
  "s05-cancel-callout": [
    {
      text: "Arahkan grup untuk berhenti doxxing dan kembali ke fakta kasus.",
      empathyDelta: 2,
      relationshipDelta: 1,
      feedbackText: "Empatik karena kamu menolak kekerasan digital meski berada di tekanan kelompok.",
      nextSceneKey: "s06-report-tools",
    },
    {
      text: "Buat thread berisi hinaan balik agar pelaku 'merasakan'.",
      empathyDelta: -2,
      relationshipDelta: -2,
      feedbackText: "Tidak empatik karena pembalasan personal memperpanjang siklus kekerasan.",
      nextSceneKey: "s07-group-reflection",
    },
  ],
  "s06-report-tools": [
    {
      text: "Kirim laporan lengkap plus konteks dampak ke guru BK dan platform.",
      empathyDelta: 2,
      relationshipDelta: 1,
      feedbackText: "Empatik karena laporanmu tidak hanya teknis, tapi juga menyorot dampak pada manusia.",
      nextSceneKey: "s07-group-reflection",
    },
    {
      text: "Cukup blokir semua akun terkait tanpa tindak lanjut.",
      empathyDelta: -1,
      relationshipDelta: 0,
      feedbackText: "Ini melindungi sementara, tapi tidak menyelesaikan pola perilaku dan dukungan korban.",
      nextSceneKey: "s08-closing",
    },
  ],
  "s07-group-reflection": [
    {
      text: "Akui bahwa semua orang bisa salah, lalu ajak kelas buat aturan interaksi sehat.",
      empathyDelta: 3,
      relationshipDelta: 2,
      feedbackText: "Empatik dan konstruktif karena kamu menumbuhkan akuntabilitas tanpa mempermalukan individu.",
      nextSceneKey: "s08-closing",
    },
    {
      text: "Tunjuk siapa yang paling salah lalu minta mereka minta maaf di depan kelas.",
      empathyDelta: -1,
      relationshipDelta: -1,
      feedbackText: "Kurang empatik karena pendekatan mempermalukan publik cenderung memicu defensif, bukan perubahan.",
      nextSceneKey: "s08-closing",
    },
  ],
};

async function resetDatabase() {
  await prisma.choiceLog.deleteMany();
  await prisma.scoreLog.deleteMany();
  await prisma.userMission.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.scene.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const chapter = await prisma.chapter.create({ data: chapterSeed });

  const sceneMap = new Map<string, string>();

  for (const scene of scenesSeed) {
    const created = await prisma.scene.create({
      data: {
        chapterId: chapter.id,
        sceneKey: scene.key,
        title: scene.title,
        body: scene.body,
        speaker: scene.speaker,
        orderIndex: scene.orderIndex,
        isStart: scene.isStart,
        isEnd: scene.isEnd,
        isPublished: true,
        background: scene.background,
      },
    });
    sceneMap.set(scene.key, created.id);
  }

  for (const [sceneKey, choices] of Object.entries(choiceSeed)) {
    const sceneId = sceneMap.get(sceneKey);
    if (!sceneId) continue;

    for (const choice of choices) {
      await prisma.choice.create({
        data: {
          sceneId,
          text: choice.text,
          empathyDelta: choice.empathyDelta,
          relationshipDelta: choice.relationshipDelta,
          feedbackText: choice.feedbackText,
          nextSceneId: choice.nextSceneKey ? sceneMap.get(choice.nextSceneKey) ?? null : null,
          isPublished: true,
        },
      });
    }
  }

  const missionOne = await prisma.mission.create({
    data: {
      slug: "m01-signal-care",
      title: "Signal of Care",
      description: "Belajar membaca sinyal korban cyberbullying sebelum bereaksi di publik.",
      objective: "Selesaikan 3 scene pertama dengan total skor minimal +2.",
      rewardScore: 5,
      rewardBadge: "First Listener",
      orderIndex: 1,
      chapterId: chapter.id,
      isPublished: true,
    },
  });

  await prisma.mission.create({
    data: {
      slug: "m02-bridge-builder",
      title: "Bridge Builder",
      description: "Latihan meredakan konflik online tanpa menghilangkan akuntabilitas.",
      objective: "Selesaikan chapter dan pilih minimal satu respon de-eskalatif.",
      rewardScore: 8,
      rewardBadge: "Bridge Builder",
      orderIndex: 2,
      chapterId: chapter.id,
      requiredMissionId: missionOne.id,
      isPublished: true,
    },
  });

  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
  const playerPasswordHash = await bcrypt.hash("Player123!", 12);

  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@tobehumanagain.dev",
      displayName: "Dev Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      username: "player",
      email: "player@tobehumanagain.dev",
      displayName: "Demo Player",
      passwordHash: playerPasswordHash,
      role: Role.USER,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Seed completed: chapter, scenes, choices, missions, and default users created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
