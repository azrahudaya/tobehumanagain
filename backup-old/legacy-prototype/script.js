
(() => {
  "use strict";

  const STORAGE_KEY = "tobehumanagain.save.v2";
  const LEGACY_STORAGE_KEY = "tobehumanagain.save.v1";
  const SCREENS = ["tapGate", "openingScreen", "titleScreen", "setupScreen", "hubScreen", "gameScreen"];

  const STORY = {
    avatars: [
      { id: "avatar-a", name: "Aster", fig: "avatar-a" },
      { id: "avatar-b", name: "Bima", fig: "avatar-b" },
      { id: "avatar-c", name: "Cala", fig: "avatar-c" },
      { id: "avatar-d", name: "Danu", fig: "avatar-d" }
    ],
    cast: {
      ibu_rina: { name: "Ibu Rina", role: "Ibu" },
      ayah_damar: { name: "Ayah Damar", role: "Ayah" },
      lala: { name: "Lala", role: "Adik" },
      gilang: { name: "Gilang", role: "Teman sekelas" },
      rani: { name: "Rani", role: "Murid baru" },
      bu_sari: { name: "Bu Sari", role: "Wali kelas" },
      mbah_wiryo: { name: "Mbah Wiryo", role: "Petani" },
      pak_ari: { name: "Pak Ari", role: "Pemilik warung" },
      naya: { name: "Kak Naya", role: "Relawan kampung" },
      dio: { name: "Dio", role: "Anak kampung" }
    },
    levels: [
      {
        id: 1,
        name: "Home",
        subtitle: "Tempat rasa ini pertama kali dibentuk",
        introBackdrop: "home-living",
        intro: [
          "Sebelum mengenal dunia luar, setiap manusia belajar dari rumah.",
          "Di sinilah emosi pertama kali dirasakan. Dan empati mulai dikenalkan."
        ],
        startScene: "living_room",
        orderedSections: ["living_room", "dining_room", "bedroom", "kitchen", "porch"],
        scenes: {
          living_room: {
            title: "Ruang Keluarga",
            backdrop: "home-living",
            cast: ["ibu_rina", "ayah_damar", "lala"],
            text: [
              "Sekarang kamu berada di ruang keluarga.",
              "Ibu Rina dan Ayah Damar sedang beradu nada soal urusan rumah.",
              "Lala duduk di sudut, memegang ponsel tapi sesekali menatapmu seperti meminta sinyal: ikut campur atau tidak."
            ],
            choices: [
              {
                text: "Mendekat, menenangkan nada bicara, dan minta semua bicara satu per satu.",
                res: "Ruang masih tegang, tapi volume suara turun. Lala ikut menghela napas.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "listen", "defuse"],
                  rel: { ibu_rina: 1, ayah_damar: 1, lala: 1 },
                  set: { home_bridge: true },
                  routeTail: ["dining_room", "bedroom", "kitchen", "porch"],
                  pathNote: "Di rumah, kamu memilih mendekat saat konflik mulai naik."
                }
              },
              {
                text: "Diam mengamati bahasa tubuh mereka dulu sebelum merespons.",
                res: "Kamu menangkap pola: Ayah defensif, Ibu kelelahan, Lala makin menutup diri.",
                tone: "neutral",
                effects: {
                  em: 0,
                  tags: ["observe", "avoid"],
                  rel: { lala: 1 },
                  set: { home_observe: true },
                  routeTail: ["bedroom", "dining_room", "kitchen", "porch"],
                  pathNote: "Di rumah, kamu menahan diri untuk membaca situasi lebih dulu."
                }
              },
              {
                text: "Meninggalkan ruangan agar tidak ikut terseret emosi.",
                res: "Pertengkaran mereda sendiri, tapi tidak ada yang benar-benar merasa didengar.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid"],
                  rel: { ibu_rina: -1, ayah_damar: -1, lala: -1 },
                  set: { home_distance: true },
                  routeTail: ["bedroom", "kitchen", "dining_room", "porch"],
                  pathNote: "Di rumah, kamu memilih menjauh saat suasana memanas."
                }
              }
            ]
          },
          dining_room: {
            title: "Ruang Makan",
            backdrop: "home-dining",
            cast: ["ibu_rina", "ayah_damar", "lala"],
            text: [
              "Satu meja, satu waktu makan, tiga ekspresi yang berbeda.",
              "Lala membuka topik kecil tentang harinya di sekolah, lalu kalimatnya terhenti di tengah.",
              "Kamu menangkap ini sebagai momen yang rapuh."
            ],
            choices: [
              {
                text: "Matikan layar ponsel, tatap Lala, dan dengarkan sampai selesai.",
                res: "Lala lanjut bercerita. Ibu Rina ikut menimpali dengan nada lebih lembut.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["listen", "respect", "help"],
                  rel: { lala: 2, ibu_rina: 1 },
                  set: { dinner_listened: true },
                  pathNote: "Kamu memberi ruang bercerita di meja makan."
                }
              },
              {
                text: "Alihkan topik ke hal netral agar meja tidak kembali panas.",
                res: "Makan malam menjadi aman, tapi juga terasa setengah jadi.",
                tone: "neutral",
                effects: {
                  em: 0,
                  tags: ["defuse", "avoid"],
                  rel: { ayah_damar: 1, lala: -1 },
                  set: { dinner_defused: true },
                  pathNote: "Kamu menjaga ketenangan, meski sebagian isi hati tetap tertahan."
                }
              },
              {
                text: "Tetap fokus ke urusanmu tanpa menanggapi percakapan.",
                res: "Meja terasa makin sunyi. Lala memilih diam sampai makan selesai.",
                tone: "cold",
                effects: {
                  em: -2,
                  tags: ["avoid", "dismiss"],
                  rel: { lala: -2, ibu_rina: -1 },
                  set: { dinner_ignored: true },
                  pathNote: "Kamu melewatkan percakapan penting di meja makan."
                }
              }
            ]
          },
          bedroom: {
            title: "Kamar Tidur",
            backdrop: "home-bedroom",
            cast: ["lala"],
            text: [
              "Kamar terasa tenang, tapi isi pikiranmu belum ikut tenang.",
              "Notifikasi terus masuk, dan kepalamu ingin lari dari rasa tidak nyaman.",
              "Dari balik pintu, terdengar langkah Lala berhenti sebentar lalu pergi lagi."
            ],
            choices: [
              {
                text: "Menulis jurnal singkat: apa yang kamu rasakan, apa yang belum sempat kamu katakan.",
                res: "Kepalamu sedikit lebih rapi. Kamu tahu kalimat apa yang ingin dibawa keluar kamar.",
                tone: "warm",
                effects: {
                  em: 1,
                  tags: ["reflect"],
                  rel: { lala: 1 },
                  set: { self_reflect: true }
                }
              },
              {
                text: "Lari ke scrolling panjang supaya tidak perlu memikirkan semuanya.",
                res: "Tubuhmu istirahat, tapi hati tetap bising.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid"],
                  set: { self_escape: true },
                  pathNote: "Saat lelah, kamu cenderung menghindar daripada memproses rasa."
                }
              },
              {
                text: "Kirim pesan ke Lala: 'kalau kamu mau cerita, aku dengerin'.",
                res: "Balasan datang singkat: 'nanti ya, makasih'. Itu cukup untuk membuka pintu.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["reach_out", "listen"],
                  rel: { lala: 2 },
                  set: { self_reach_out: true }
                }
              }
            ]
          },
          kitchen: {
            title: "Dapur",
            backdrop: "home-kitchen",
            cast: ["ibu_rina", "lala"],
            text: [
              "Di dapur, Ibu Rina menata piring sambil menahan lelah.",
              "Lala membantu sebentar lalu kembali diam.",
              "Ritme dapur sering menyembunyikan emosi yang tidak terucap."
            ],
            choices: [
              {
                text: "Ambil bagian: cuci piring, rapikan meja, dan mulai obrolan ringan.",
                res: "Tugas selesai lebih cepat. Ibu Rina tersenyum kecil, Lala mulai ikut bicara.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "respect"],
                  rel: { ibu_rina: 2, lala: 1 },
                  set: { kitchen_helped: true },
                  pathNote: "Kamu menunjukkan peduli lewat tindakan kecil yang konkret."
                }
              },
              {
                text: "Ucapkan terima kasih, lalu tanya kabar Ibu Rina sebelum pergi.",
                res: "Percakapan singkat itu tidak menyelesaikan semua, tapi membuat jarak berkurang.",
                tone: "neutral",
                effects: {
                  em: 1,
                  tags: ["listen", "respect"],
                  rel: { ibu_rina: 1 },
                  set: { kitchen_acknowledged: true }
                }
              },
              {
                text: "Ambil makananmu dan pergi tanpa kontak mata.",
                res: "Dapur tetap berjalan, tapi rasa dihargai tidak ikut bergerak.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["ignore", "avoid"],
                  rel: { ibu_rina: -1, lala: -1 },
                  set: { kitchen_ignored: true }
                }
              }
            ]
          },
          porch: {
            title: "Teras Rumah",
            backdrop: "home-porch",
            cast: ["ibu_rina", "ayah_damar", "lala"],
            text: [
              "Malam di teras memberi jarak aman untuk melihat ulang semua kejadian hari ini.",
              "Tidak ada keputusan besar yang dramatis, hanya keputusan kecil yang berulang.",
              "Kamu memilih bagaimana membawa pola rumah ini ke dunia luar."
            ],
            choices: [
              {
                text: "Besok aku mulai dari satu percakapan jujur, tanpa nada menghakimi.",
                res: "Kamu memilih arah yang tidak instan, tapi manusiawi.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["reflect", "listen", "help"],
                  set: { home_commit_soft_start: true },
                  pathNote: "Kamu menutup hari dengan niat memulai percakapan yang lebih sehat."
                }
              },
              {
                text: "Aku cukup mengurus diriku sendiri, urusan orang lain biar selesai sendiri.",
                res: "Bebanmu terasa lebih ringan sesaat, tapi koneksi dengan sekitar menipis.",
                tone: "cold",
                effects: {
                  em: -2,
                  tags: ["avoid"],
                  set: { home_commit_distance: true },
                  pathNote: "Kamu menutup hari dengan menjaga jarak dari konflik sekitar."
                }
              },
              {
                text: "Aku belum siap banyak bicara, tapi akan lebih peka saat ada sinyal butuh bantuan.",
                res: "Kamu memilih langkah kecil yang realistis untuk tetap hadir.",
                tone: "neutral",
                effects: {
                  em: 1,
                  tags: ["observe", "reflect"],
                  set: { home_commit_observe: true }
                }
              }
            ]
          }
        },
        checkpoint: {
          threshold: 6,
          warm: "Kamu sempat berhenti, mendengar, lalu merespons dengan lebih manusiawi. Rumah terasa sedikit lebih hangat.",
          cold: "Kamu lebih sering menjaga jarak. Tidak semua masalah selesai, dan suasana terasa lebih dingin dari sebelumnya."
        },
        closing: [
          "Selamat kamu sudah berhasil melewati misi di level 1. Sekarang kamu akan melanjutkan perjalananmu",
          "Jika empati bisa tumbuh di rumah, ia bisa dibawa ke mana pun."
        ]
      },
      {
        id: 2,
        name: "School",
        subtitle: "Ruang belajar, tekanan, dan relasi sebaya",
        introBackdrop: "school-classroom",
        intro: [
          "sekarang kamu keluar dari rumah. lingkungan mulai terasa lebih luas.",
          "Tempat kamu menghabiskan banyak waktu setiap hari.",
          "Di sini, kamu bertemu banyak orang dengan beban masing-masing."
        ],
        startScene: "classroom",
        orderedSections: ["classroom", "corridor", "canteen", "field", "library"],
        scenes: {
          classroom: {
            title: "Classroom",
            backdrop: "school-classroom",
            cast: ["gilang", "bu_sari"],
            text: [
              "Sebelum pelajaran dimulai, Gilang panik karena alat tulisnya tertinggal.",
              "Bu Sari terkenal tegas soal kesiapan kelas.",
              "Gilang berbisik: 'tolong dong, cuma hari ini'."
            ],
            choices: [
              {
                text: "Pinjamkan alat tulis cadangan dan bilang nanti belajar bareng supaya tidak panik lagi.",
                res: "Gilang lega dan janji menyiapkan diri lebih baik besok.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "boundary"],
                  rel: { gilang: 2 },
                  set: { school_gilang_supported: true },
                  pathNote: "Di sekolah, kamu membantu tanpa menghapus tanggung jawab orang lain."
                }
              },
              {
                text: "Pinjamkan, tapi sambil menyindir bahwa dia selalu ceroboh.",
                res: "Masalah teknis selesai, tapi wajah Gilang berubah kaku.",
                tone: "tense",
                effects: {
                  em: -1,
                  tags: ["help", "harm"],
                  rel: { gilang: -1 }
                }
              },
              {
                text: "Tolak dan suruh dia hadapi sendiri konsekuensinya.",
                res: "Ia diam. Bu Sari mencatat namanya karena tidak siap.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["dismiss", "avoid"],
                  rel: { gilang: -2 },
                  set: { school_gilang_distance: true },
                  pathNote: "Di sekolah, kamu memilih batas yang keras tanpa ruang dukungan."
                }
              }
            ]
          },
          corridor: {
            title: "Corridor",
            backdrop: "school-corridor",
            cast: ["gilang", "bu_sari"],
            text: [
              "Di koridor, Gilang kembali mendekat. Kali ini ia minta bantuan contekan untuk kuis.",
              "Ia bilang pikirannya sedang kacau karena masalah keluarga.",
              "Bel tanda kuis tinggal sebentar lagi."
            ],
            choices: [
              {
                text: "Tolak contekan, tapi ajak dia latihan cepat 10 menit sebelum masuk kelas.",
                res: "Dia mengangguk. Tidak sempurna, tapi lebih jujur dan sehat.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["boundary", "help", "listen"],
                  rel: { gilang: 2 },
                  set: { school_path_supportive: true },
                  routeTail: ["canteen", "field", "library"],
                  pathNote: "Kamu menjaga integritas sambil tetap memberi dukungan."
                }
              },
              {
                text: "Tolak dengan nada keras: 'urusanmu bukan urusanku'.",
                res: "Gilang langsung mundur. Koridor terasa lebih dingin dari biasanya.",
                tone: "tense",
                effects: {
                  em: -1,
                  tags: ["harm", "dismiss"],
                  rel: { gilang: -2 },
                  set: { school_path_harsh: true },
                  routeTail: ["library", "canteen", "field"],
                  pathNote: "Kamu menegakkan batas dengan cara yang melukai relasi."
                }
              },
              {
                text: "Setuju bantu contekan supaya cepat selesai dan tidak drama.",
                res: "Ia lega sesaat, tapi kamu ikut menormalisasi jalan pintas.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid", "harm"],
                  rel: { gilang: 1, bu_sari: -1 },
                  set: { school_path_shortcut: true },
                  routeTail: ["field", "canteen", "library"],
                  pathNote: "Kamu memilih jalan pintas demi meredam ketegangan jangka pendek."
                }
              }
            ]
          },
          canteen: {
            title: "Canteen",
            backdrop: "school-canteen",
            cast: ["rani", "gilang"],
            text: [
              "Di kantin, Rani duduk sendiri sambil menatap nampan yang hampir tidak disentuh.",
              "Dua meja lain sedang membahasnya tanpa benar-benar mengenalnya.",
              "Gilang melihatmu, menunggu apakah kamu akan mendekat ke Rani atau ikut arus."
            ],
            choices: [
              {
                text: "Duduk bersama Rani, kenalkan diri, lalu ajak Gilang ikut bicara santai.",
                res: "Rani tersenyum kecil. Obrolan sederhana mengubah atmosfer meja.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "listen", "respect"],
                  rel: { rani: 2, gilang: 1 },
                  set: { school_rani_connected: true },
                  pathNote: "Kamu membuka ruang aman bagi orang yang terisolasi."
                }
              },
              {
                text: "Sapa dari jauh lalu kembali ke kelompokmu.",
                res: "Rani merasa diakui, tapi jarak sosial masih tebal.",
                tone: "neutral",
                effects: {
                  em: 1,
                  tags: ["respect"],
                  rel: { rani: 1 }
                }
              },
              {
                text: "Diam agar tidak ikut jadi pusat perhatian kelompok lain.",
                res: "Tidak ada konflik baru, tapi kesepian Rani tetap utuh.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid"],
                  rel: { rani: -1 }
                }
              }
            ]
          },
          field: {
            title: "Field",
            backdrop: "school-field",
            cast: ["gilang", "rani"],
            text: [
              "Latihan tim berakhir dengan saling menyalahkan.",
              "Nama Gilang disebut paling keras, sementara Rani memilih diam di pinggir lapangan.",
              "Situasi ini bisa jadi ruang belajar, atau ruang luka baru."
            ],
            choices: [
              {
                text: "Ajak tim evaluasi peran tanpa menunjuk kambing hitam.",
                res: "Nada menyerang turun. Orang mulai menyebut solusi, bukan nama yang disalahkan.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["defuse", "help", "boundary"],
                  rel: { gilang: 1, rani: 1 },
                  set: { school_field_repair: true }
                }
              },
              {
                text: "Ikut memarahi agar orang belajar dari tekanan.",
                res: "Tim tampak kompak sesaat, tapi kepercayaan antaranggota menurun.",
                tone: "tense",
                effects: {
                  em: -2,
                  tags: ["harm"],
                  rel: { gilang: -2, rani: -1 },
                  set: { school_field_pressure: true }
                }
              },
              {
                text: "Tidak ikut campur karena merasa ini bukan peranmu.",
                res: "Keributan mereda sendiri, namun rasa aman tim tidak membaik.",
                tone: "neutral",
                effects: {
                  em: 0,
                  tags: ["avoid"],
                  rel: { gilang: -1 }
                }
              }
            ]
          },
          library: {
            title: "Library",
            backdrop: "school-library",
            cast: ["rani", "bu_sari", "gilang"],
            text: [
              "Sore di perpustakaan lebih hening dari biasanya.",
              "Rani terlihat menatap lembar tugas tanpa bergerak, sementara Gilang duduk dua rak di belakang.",
              "Bu Sari lewat dan berbisik: 'kadang temanmu tidak butuh solusi dulu, butuh didengar dulu'."
            ],
            choices: [
              {
                text: "Duduk di dekat Rani dan buka percakapan pelan: 'kamu lagi berat ya?'.",
                res: "Rani mengangguk. Untuk pertama kalinya hari itu, ia bicara tanpa takut dipotong.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["listen", "reach_out"],
                  rel: { rani: 2, bu_sari: 1 },
                  set: { school_library_support: true }
                }
              },
              {
                text: "Mendorong mereka untuk cepat selesai tugas tanpa membahas perasaan.",
                res: "Target akademik bergerak, tapi ketegangan emosional tetap menggantung.",
                tone: "neutral",
                effects: {
                  em: 0,
                  tags: ["boundary"],
                  rel: { bu_sari: 1, rani: -1 }
                }
              },
              {
                text: "Mengambil foto diam-diam untuk candaan grup kelas.",
                res: "Tawa muncul di chat, tapi rasa aman Rani dan Gilang runtuh.",
                tone: "tense",
                effects: {
                  em: -2,
                  tags: ["harm", "dismiss"],
                  rel: { rani: -2, gilang: -1, bu_sari: -2 },
                  set: { school_library_hurt: true },
                  pathNote: "Kamu sempat memilih validasi sosial dibanding keamanan emosional orang lain."
                }
              }
            ]
          }
        },
        completion: {
          title: "Level 2 selesai",
          text: "Sekolah memperlihatkan bahwa empati bukan hanya soal niat baik, tapi juga cara menjaga batas tanpa mematikan martabat orang lain."
        }
      },
      {
        id: 3,
        name: "Village / Neighborhood",
        subtitle: "Lingkungan sekitar yang menuntut kepekaan lintas usia",
        introBackdrop: "village-rice",
        intro: [
          "kamu tidak hanya melihat keluarga, dan teman sekolahmu tapi juga orang-orang di sekitar.",
          "Empati di lingkungan berarti hadir untuk orang yang bahkan tidak kamu kenal dekat."
        ],
        startScene: "rice_field",
        orderedSections: ["rice_field", "warung", "pos_ronda", "lapangan", "jalan_desa"],
        scenes: {
          rice_field: {
            title: "Rice field",
            backdrop: "village-rice",
            cast: ["mbah_wiryo", "naya"],
            text: [
              "Di sawah, Mbah Wiryo membawa karung kecil dengan langkah pelan.",
              "Kak Naya melambaikan tangan dari kejauhan sambil menata bibit.",
              "Kamu tahu kamu tidak wajib berhenti, tapi keputusan ini akan membentuk sisa harimu di kampung."
            ],
            choices: [
              {
                text: "Berhenti dan bantu Mbah Wiryo sampai ke tepi jalan.",
                res: "Mbah Wiryo bercerita tentang masa muda kampung. Kak Naya melihatmu dengan hormat.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "listen"],
                  rel: { mbah_wiryo: 2, naya: 1 },
                  set: { village_help_started: true },
                  routeTail: ["warung", "pos_ronda", "lapangan", "jalan_desa"],
                  pathNote: "Di lingkungan, kamu memilih turun tangan saat melihat beban nyata."
                }
              },
              {
                text: "Menawarkan bantuan orang lain karena kamu sedang terburu-buru.",
                res: "Mbah Wiryo mengangguk. Tidak ideal, tapi ia merasa tidak diabaikan.",
                tone: "neutral",
                effects: {
                  em: 1,
                  tags: ["respect"],
                  rel: { mbah_wiryo: 1 },
                  routeTail: ["pos_ronda", "warung", "lapangan", "jalan_desa"],
                  pathNote: "Di lingkungan, kamu tetap merespons meski waktumu terbatas."
                }
              },
              {
                text: "Melintas cepat agar urusanmu tidak terganggu.",
                res: "Tidak ada drama, hanya pemandangan yang kamu biarkan lewat begitu saja.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid"],
                  rel: { mbah_wiryo: -1, naya: -1 },
                  routeTail: ["jalan_desa", "warung", "pos_ronda", "lapangan"],
                  pathNote: "Di lingkungan, kamu memilih efisiensi diri daripada keterlibatan sosial."
                }
              }
            ]
          },
          warung: {
            title: "Small shop (warung)",
            backdrop: "village-warung",
            cast: ["pak_ari", "naya"],
            text: [
              "Warung Pak Ari ramai menjelang sore.",
              "Antrean mulai saling menyela karena pesanan tertukar.",
              "Kak Naya mencoba menenangkan, tapi suaranya tenggelam oleh keluhan."
            ],
            choices: [
              {
                text: "Bantu menata antrean dan minta orang bicara bergantian.",
                res: "Suasana pelan-pelan turun. Pak Ari bisa melayani ulang dengan lebih tenang.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["defuse", "help", "boundary"],
                  rel: { pak_ari: 2, naya: 1 },
                  set: { village_warung_repair: true }
                }
              },
              {
                text: "Mengalah dan menunggu diam tanpa ikut mengatur situasi.",
                res: "Tidak menambah gaduh, tapi tidak banyak membantu orang yang kewalahan.",
                tone: "neutral",
                effects: {
                  em: 0,
                  tags: ["avoid", "respect"],
                  rel: { pak_ari: 0 }
                }
              },
              {
                text: "Ikut menekan Pak Ari agar pesananmu didahulukan.",
                res: "Pesananmu datang lebih cepat, tapi suasana warung jadi makin panas.",
                tone: "tense",
                effects: {
                  em: -2,
                  tags: ["harm", "dismiss"],
                  rel: { pak_ari: -2, naya: -1 }
                }
              }
            ]
          },
          pos_ronda: {
            title: "Neighborhood post (pos ronda)",
            backdrop: "village-pos",
            cast: ["naya", "pak_ari"],
            text: [
              "Obrolan di pos ronda bergeser dari kabar kampung ke gosip personal.",
              "Nama seseorang disebut dengan nada merendahkan, padahal orangnya tidak ada di tempat.",
              "Kak Naya menoleh ke kamu, seperti memberi isyarat: ini momen menentukan budaya obrolan."
            ],
            choices: [
              {
                text: "Arahkan obrolan ke fakta dan ajak berhenti menilai orang dari rumor.",
                res: "Sebagian orang tidak setuju, tapi nada merendahkan berhenti dulu malam itu.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["boundary", "listen", "help"],
                  rel: { naya: 2, pak_ari: 1 },
                  set: { village_gossip_blocked: true },
                  pathNote: "Kamu menahan laju gosip saat ruang publik mulai tidak sehat."
                }
              },
              {
                text: "Diam karena takut dianggap sok benar.",
                res: "Obrolan tetap lanjut. Kamu merasa tidak nyaman sampai pulang.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid"],
                  rel: { naya: -1 }
                }
              },
              {
                text: "Ikut menimpali agar diterima di kelompok obrolan.",
                res: "Kamu merasa masuk lingkaran, tapi ada orang yang diam-diam terluka.",
                tone: "tense",
                effects: {
                  em: -2,
                  tags: ["harm"],
                  rel: { naya: -2, pak_ari: -1 }
                }
              }
            ]
          },
          lapangan: {
            title: "Field",
            backdrop: "village-field",
            cast: ["dio", "naya"],
            text: [
              "Di lapangan desa, Dio menangis setelah dipermalukan saat bermain.",
              "Anak lain terlihat bingung antara menertawakan atau meminta maaf.",
              "Kak Naya menunggu apakah kamu mau membantu merapikan situasi."
            ],
            choices: [
              {
                text: "Pisahkan dulu konflik, tenangkan Dio, lalu bantu anak-anak membuat aturan ulang.",
                res: "Tangisan mereda dan permainan kembali dengan aturan yang lebih adil.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "defuse", "listen"],
                  rel: { dio: 2, naya: 1 },
                  set: { village_children_repair: true }
                }
              },
              {
                text: "Suruh Dio kuat tanpa membahas yang terjadi.",
                res: "Ia berhenti menangis, tapi terlihat menahan marah dan malu.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["dismiss"],
                  rel: { dio: -2 }
                }
              },
              {
                text: "Mengamati dari jauh karena merasa ini urusan anak-anak.",
                res: "Permainan lanjut, tetapi ketegangan kecil tetap terbawa.",
                tone: "neutral",
                effects: {
                  em: 0,
                  tags: ["avoid"],
                  rel: { dio: -1 }
                }
              }
            ]
          },
          jalan_desa: {
            title: "Village road",
            backdrop: "village-road",
            cast: ["pak_ari", "mbah_wiryo"],
            text: [
              "Hujan turun. Di tikungan jalan desa, motor seorang warga mogok.",
              "Pak Ari baru menutup warung, Mbah Wiryo berteduh sambil melihat keadaan.",
              "Ini momen kecil, tapi sering menentukan apakah kampung terasa saling jaga atau saling lewat."
            ],
            choices: [
              {
                text: "Bantu dorong motor ke tempat teduh dan carikan kontak bengkel.",
                res: "Masalah belum selesai total, tetapi ia tidak menghadapinya sendirian.",
                tone: "warm",
                effects: {
                  em: 2,
                  tags: ["help", "reach_out", "respect"],
                  rel: { pak_ari: 1, mbah_wiryo: 1 },
                  set: { village_road_helped: true }
                }
              },
              {
                text: "Beri informasi bengkel terdekat lalu lanjut berteduh.",
                res: "Bantuanmu singkat namun tetap mengurangi kebingungan.",
                tone: "neutral",
                effects: {
                  em: 1,
                  tags: ["respect"],
                  rel: { pak_ari: 1 }
                }
              },
              {
                text: "Lanjut jalan agar tidak ikut repot di tengah hujan.",
                res: "Kamu terhindar dari repot, tapi rasa kebersamaan tidak tumbuh malam ini.",
                tone: "cold",
                effects: {
                  em: -1,
                  tags: ["avoid"],
                  rel: { pak_ari: -1, mbah_wiryo: -1 }
                }
              }
            ]
          }
        },
        completion: {
          title: "Level 3 selesai",
          text: "Vertical slice berakhir di sini. Jejak pilihanmu sekarang lebih terlihat: siapa yang kamu dekati, siapa yang kamu abaikan, dan bagaimana cara kamu hadir."
        }
      }
    ],
    locked: [
      {
        id: 4,
        name: "City",
        desc: "Keramaian kota: keputusan cepat di ruang publik anonim.",
        sections: ["Mall", "Station", "Bus stop", "City park", "Main road"]
      },
      {
        id: 5,
        name: "Online World",
        desc: "Ruang digital: belajar merespons konflik daring secara aman.",
        sections: ["Cyberbullying", "Flaming / Doxing / Trolling", "Cancel culture", "Unsafe online relationship (educational)"]
      }
    ]
  };

  const NOTIFS = [
    "New message: ...",
    "Breaking: XXXXX",
    "@someone mentioned you",
    "1 missed call",
    "...",
    "Update now",
    "Unknown sender: hey?",
    "Reminder: now",
    "You have 17 updates"
  ];

  const st = defaults();
  const el = {};
  let openRun = 0;
  let typeRun = 0;
  let nextAct = null;
  let toastTimer = null;
  let menuTween = null;
  let overlayTween = null;
  let toastTween = null;
  const ambientTweens = { parallax: [], silhouettes: [] };

  class AudioCtrl {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.noise = null;
      this.notifLoop = null;
      this.ambLoops = [];
      this.ambNodes = [];
      this.city = null;
      this.mode = "none";
    }

    async unlock() {
      if (!window.AudioContext && !window.webkitAudioContext) return false;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.23;
        this.master.connect(this.ctx.destination);
        this.noise = this.makeNoise(2.5);
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return true;
    }

    makeNoise(sec) {
      const frames = Math.floor(this.ctx.sampleRate * sec);
      const b = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < frames; i += 1) d[i] = Math.random() * 2 - 1;
      return b;
    }

    beep(freq = 600, dur = 0.1, type = "sine", gain = 0.04, glide = null) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(glide, 40), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + dur + 0.03);
    }

    burst(dur = 0.07, gain = 0.008, type = "highpass", freq = 1500) {
      if (!this.ctx || !this.noise) return;
      const t = this.ctx.currentTime;
      const s = this.ctx.createBufferSource();
      const f = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      s.buffer = this.noise;
      f.type = type;
      f.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f);
      f.connect(g);
      g.connect(this.master);
      const off = Math.random() * Math.max(0.05, this.noise.duration - dur - 0.01);
      s.start(t, off, dur);
      s.stop(t + dur + 0.02);
    }

    noiseLoop(gain = 0.02, type = "bandpass", freq = 850, q = 1) {
      if (!this.ctx || !this.noise) return null;
      const s = this.ctx.createBufferSource();
      const f = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      s.buffer = this.noise;
      s.loop = true;
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      g.gain.value = gain;
      s.connect(f);
      f.connect(g);
      g.connect(this.master);
      return { s, g };
    }

    notif() {
      this.beep(980, 0.08, "triangle", 0.035, 760);
    }

    startNotif() {
      this.stopNotif();
      this.notif();
      this.notifLoop = setInterval(() => this.notif(), 360);
    }

    stopNotif() {
      if (this.notifLoop) {
        clearInterval(this.notifLoop);
        this.notifLoop = null;
      }
    }

    startCity() {
      this.stopCity();
      const n = this.noiseLoop(0.03, "bandpass", 740, 0.5);
      if (!n) return;
      const r = this.ctx.createOscillator();
      const rg = this.ctx.createGain();
      r.type = "sawtooth";
      r.frequency.value = 52;
      rg.gain.value = 0.006;
      r.connect(rg);
      rg.connect(this.master);
      n.s.start();
      r.start();
      this.city = { n, r, rg };
    }

    stopCity() {
      if (!this.city || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.city.n.g.gain.setValueAtTime(0, t);
      this.city.rg.gain.setValueAtTime(0, t);
      try {
        this.city.n.s.stop(t + 0.01);
      } catch {}
      try {
        this.city.r.stop(t + 0.01);
      } catch {}
      this.city = null;
    }

    bell() {
      this.beep(880, 0.22, "triangle", 0.03);
      setTimeout(() => this.beep(660, 0.24, "triangle", 0.03), 120);
    }

    choice(toneType) {
      if (toneType === "warm") this.beep(540, 0.1, "sine", 0.028, 680);
      else if (toneType === "cold") this.beep(360, 0.12, "triangle", 0.026, 250);
      else if (toneType === "tense") this.beep(290, 0.1, "sawtooth", 0.026);
      else this.beep(470, 0.08, "sine", 0.022);
    }

    stopAmb() {
      this.ambLoops.forEach(clearInterval);
      this.ambLoops = [];
      this.ambNodes.forEach((n) => {
        try {
          n.stop();
        } catch {}
      });
      this.ambNodes = [];
      this.mode = "none";
    }

    amb(mode) {
      if (!this.ctx || mode === this.mode) return;
      this.stopAmb();
      this.mode = mode;
      if (mode === "home") {
        const h = this.ctx.createOscillator();
        const hg = this.ctx.createGain();
        h.type = "sine";
        h.frequency.value = 96;
        hg.gain.value = 0.007;
        h.connect(hg);
        hg.connect(this.master);
        h.start();
        this.ambNodes.push(h);
        this.ambLoops.push(setInterval(() => this.beep(170 + Math.random() * 70, 0.06, "triangle", 0.012), 1700));
        this.ambLoops.push(setInterval(() => this.beep(1240 + Math.random() * 180, 0.04, "square", 0.01), 1300));
        this.ambLoops.push(setInterval(() => this.burst(0.06, 0.006, "highpass", 1700), 760));
      } else if (mode === "school") {
        const n = this.noiseLoop(0.009, "bandpass", 1200, 0.9);
        if (n) {
          n.s.start();
          this.ambNodes.push(n.s);
        }
        this.ambLoops.push(setInterval(() => this.beep(310 + Math.random() * 150, 0.05, "triangle", 0.009), 980));
      } else if (mode === "village") {
        const n = this.noiseLoop(0.007, "lowpass", 600, 0.6);
        if (n) {
          n.s.start();
          this.ambNodes.push(n.s);
        }
        this.ambLoops.push(setInterval(() => {
          const b = 920 + Math.random() * 300;
          this.beep(b, 0.07, "sine", 0.012, b + 180);
        }, 1400));
      }
    }

    stopAll() {
      this.stopNotif();
      this.stopCity();
      this.stopAmb();
    }
  }

  const audio = new AudioCtrl();
  document.addEventListener("DOMContentLoaded", init);

  function hasGsap() {
    return typeof window !== "undefined" && !!window.gsap;
  }

  function canAnimate() {
    return hasGsap() && !st.settings.reducedMotion;
  }

  function killTween(tween) {
    if (tween && typeof tween.kill === "function") tween.kill();
  }

  function killTweenList(list) {
    if (!Array.isArray(list)) return;
    list.forEach((tween) => killTween(tween));
    list.length = 0;
  }

  function setupAmbientMotion() {
    killTweenList(ambientTweens.parallax);
    killTweenList(ambientTweens.silhouettes);

    const layers = el.sceneBackdrop ? Array.from(el.sceneBackdrop.querySelectorAll(".parallax")) : [];
    const silhouettes = el.crowdLayer ? Array.from(el.crowdLayer.querySelectorAll(".silhouette")) : [];

    if (hasGsap()) {
      window.gsap.set(layers, { xPercent: 0, yPercent: 0, scale: 1, clearProps: "rotation" });
      window.gsap.set(silhouettes, { x: 0, y: 0, scale: 1 });
    }

    if (!canAnimate()) return;

    const [back, mid, front] = layers;
    if (back) {
      ambientTweens.parallax.push(window.gsap.to(back, {
        xPercent: -2.2,
        yPercent: 1.8,
        scale: 1.05,
        duration: 16,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      }));
    }
    if (mid) {
      ambientTweens.parallax.push(window.gsap.to(mid, {
        xPercent: 2.2,
        yPercent: -1.7,
        scale: 1.04,
        duration: 13.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      }));
    }
    if (front) {
      ambientTweens.parallax.push(window.gsap.to(front, {
        xPercent: -1.5,
        yPercent: -2.4,
        scale: 1.03,
        duration: 11,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      }));
    }

    silhouettes.forEach((node, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      ambientTweens.silhouettes.push(window.gsap.to(node, {
        x: direction * (6 + index),
        y: direction * -1.2,
        duration: 3.6 + index * 0.45,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      }));
    });
  }

  function defaults() {
    return {
      profile: { username: "", avatarId: "avatar-a", mode: "solo" },
      progress: {
        unlockedLevel: 1,
        currentLevelId: null,
        currentSceneId: null,
        route: [],
        visited: [],
        completed: []
      },
      hidden: {
        empathy: 0,
        tags: [],
        tagCount: {},
        pathNotes: []
      },
      social: createInitialSocialState(),
      settings: {
        typewriter: true,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      },
      flags: { openingSeen: false, story: {} },
      runtime: { levelId: null, locked: false, activeSceneId: null, activeScene: null, pendingChoiceIndex: null }
    };
  }

  function createInitialSocialState() {
    return Object.keys(STORY.cast).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
  }

  function init() {
    cache();
    load();
    bind();
    renderAvatars();
    applySettings();
    toggleContinue();
    show("tapGate");
  }

  function cache() {
    [
      "app","tapGate","openingScreen","titleScreen","setupScreen","hubScreen","gameScreen","overlayScreen",
      "startGateBtn","skipOpeningBtn","notificationLayer","crowdLayer","openingNarration","continueBtn","toSetupBtn",
      "soloBtn","groupBtn","usernameInput","avatarGrid","startJourneyBtn","levelList","sceneBackdrop","backBtn","menuBtn",
      "progressLabel","sceneTitle","sceneMeta","sceneText","consequenceText","choicesWrap","continueSceneBtn",
      "overlayTitle","overlayText","overlayButtons","menuDrawer","menuScrim","typewriterToggle","motionToggle",
      "recapBtn","saveNowBtn","toHubBtn","resetBtn","toast"
    ].forEach((id) => {
      el[id] = document.getElementById(id);
    });
    el.overlayPanel = document.querySelector(".overlay-panel");
  }

  function bind() {
    el.startGateBtn.addEventListener("click", async () => {
      await audio.unlock();
      if (st.flags.openingSeen) showTitle();
      else runOpening();
    });

    el.skipOpeningBtn.addEventListener("click", skipOpening);
    el.toSetupBtn.addEventListener("click", () => {
      resetJourney();
      showSetup();
    });

    el.continueBtn.addEventListener("click", () => {
      if (st.profile.username) showHub();
      else showSetup();
    });

    el.soloBtn.addEventListener("click", () => {
      st.profile.mode = "solo";
      renderMode();
      save();
    });

    el.groupBtn.addEventListener("click", () => {
      toast("Create Group masih placeholder.");
    });

    el.startJourneyBtn.addEventListener("click", async () => {
      await audio.unlock();
      const name = el.usernameInput.value.trim();
      if (!name) {
        toast("Username belum diisi.");
        el.usernameInput.focus();
        return;
      }
      st.profile.username = name;
      save();
      showHub();
    });

    el.backBtn.addEventListener("click", showHub);
    el.menuBtn.addEventListener("click", () => menu(!el.menuDrawer.classList.contains("open")));
    el.menuScrim.addEventListener("click", () => menu(false));

    el.typewriterToggle.addEventListener("change", (e) => {
      st.settings.typewriter = !!e.target.checked;
      save();
      toast(`Typewriter ${st.settings.typewriter ? "on" : "off"}`);
    });

    el.motionToggle.addEventListener("change", (e) => {
      st.settings.reducedMotion = !!e.target.checked;
      applySettings();
      save();
      toast(`Reduced motion ${st.settings.reducedMotion ? "on" : "off"}`);
    });

    el.recapBtn.addEventListener("click", () => {
      showRecapOverlay();
    });

    el.saveNowBtn.addEventListener("click", () => {
      save();
      toast("Progress tersimpan.");
    });

    el.toHubBtn.addEventListener("click", showHub);

    el.resetBtn.addEventListener("click", () => {
      if (!window.confirm("Reset semua progress prototype?")) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      const fresh = defaults();
      st.profile = fresh.profile;
      st.progress = fresh.progress;
      st.hidden = fresh.hidden;
      st.social = fresh.social;
      st.settings = fresh.settings;
      st.flags = fresh.flags;
      st.flags.openingSeen = true;
      st.runtime = fresh.runtime;
      applySettings();
      renderAvatars();
      toggleContinue();
      showTitle();
      toast("Progress direset.");
    });

    el.continueSceneBtn.addEventListener("click", () => {
      if (typeof nextAct === "function") nextAct();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") menu(false);
      if (e.key.toLowerCase() === "m" && el.gameScreen.classList.contains("active")) {
        menu(!el.menuDrawer.classList.contains("open"));
      }
      if (!el.gameScreen.classList.contains("active")) return;
      if (!el.continueSceneBtn.classList.contains("hidden") && e.key === "Enter") {
        e.preventDefault();
        if (nextAct) nextAct();
        return;
      }
      if (st.runtime.locked) return;
      if (["1", "2", "3"].includes(e.key)) {
        const b = el.choicesWrap.querySelector(`[data-choice-index="${Number(e.key) - 1}"]`);
        if (b) {
          e.preventDefault();
          b.click();
        }
      }
    });
  }

  function show(id) {
    let activeNode = null;
    SCREENS.forEach((screenId) => {
      const node = document.getElementById(screenId);
      const isActive = screenId === id;
      node.classList.toggle("active", isActive);
      if (isActive) activeNode = node;
      else if (hasGsap()) window.gsap.set(node, { clearProps: "opacity,filter,transform,visibility" });
    });
    overlay(false);
    menu(false);

    if (activeNode && canAnimate()) {
      window.gsap.killTweensOf(activeNode);
      window.gsap.fromTo(activeNode, {
        autoAlpha: 0,
        filter: "blur(8px)",
        scale: 1.014
      }, {
        autoAlpha: 1,
        filter: "blur(0px)",
        scale: 1,
        duration: 0.36,
        ease: "power2.out",
        clearProps: "opacity,filter,transform,visibility"
      });
    }
  }

  function showTitle() {
    audio.stopAll();
    show("titleScreen");
    toggleContinue();
  }

  function showSetup() {
    show("setupScreen");
    el.usernameInput.value = st.profile.username;
    renderAvatars();
    renderMode();
    setTimeout(() => el.usernameInput.focus(), 120);
  }

  function showHub() {
    audio.stopCity();
    audio.stopNotif();
    audio.amb("none");
    show("hubScreen");
    renderHub();
    save();
  }

  function toggleContinue() {
    const hasProgress = !!st.profile.username || !!st.progress.currentLevelId || st.progress.completed.length > 0;
    el.continueBtn.classList.toggle("hidden", !hasProgress);
  }

  function renderMode() {
    const solo = st.profile.mode === "solo";
    el.soloBtn.classList.toggle("selected", solo);
    el.groupBtn.classList.toggle("selected", !solo);
  }

  function renderAvatars() {
    el.avatarGrid.innerHTML = "";
    STORY.avatars.forEach((avatar) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `avatar-option${st.profile.avatarId === avatar.id ? " selected" : ""}`;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", st.profile.avatarId === avatar.id ? "true" : "false");
      b.innerHTML = `<div class="avatar-figure ${avatar.fig}"></div><strong>${avatar.name}</strong><span>Tap untuk pilih</span>`;
      b.addEventListener("click", () => {
        st.profile.avatarId = avatar.id;
        renderAvatars();
        save();
      });
      el.avatarGrid.appendChild(b);
    });
  }

  function renderHub() {
    const box = el.levelList;
    box.innerHTML = "";

    const profile = document.createElement("article");
    profile.className = "level-card";
    const avatarName = (STORY.avatars.find((a) => a.id === st.profile.avatarId) || { name: "Avatar" }).name;
    profile.innerHTML = `<h3>${st.profile.username || "Pemain"} - ${avatarName}</h3><p>Progress tersimpan otomatis. Alur scene kini bisa berbeda tergantung pilihanmu.</p>`;
    box.appendChild(profile);

    STORY.levels.forEach((lv) => {
      const unlocked = lv.id <= st.progress.unlockedLevel;
      const done = st.progress.completed.includes(lv.id);
      const inProgress = st.progress.currentLevelId === lv.id && !done;
      const card = document.createElement("article");
      card.className = `level-card${unlocked ? "" : " locked"}`;
      const section = lv.orderedSections.map((sceneId) => lv.scenes[sceneId].title).join(" | ");
      card.innerHTML = `<h3>Level ${lv.id}: ${lv.name}</h3><p>${lv.subtitle}</p><p class="section-list">${section}</p>`;
      card.prepend(createLevelThumb(lv.id, lv.name));

      if (done) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Completed";
        card.appendChild(tag);
      }

      if (unlocked) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "primary-btn";
        b.textContent = inProgress ? "Continue" : (done ? "Replay" : "Start");
        b.addEventListener("click", async () => {
          await audio.unlock();
          startLevel(lv.id, inProgress);
        });
        card.appendChild(b);
      } else {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Locked";
        card.appendChild(tag);
      }

      box.appendChild(card);
    });

    STORY.locked.forEach((lv) => {
      const card = document.createElement("article");
      card.className = "level-card locked";
      card.innerHTML = `<h3>Level ${lv.id}: ${lv.name}</h3><p>${lv.desc}</p><p class="section-list">${lv.sections.join(" | ")}</p><span class="tag">Coming soon</span>`;
      card.prepend(createLevelThumb(lv.id, lv.name));
      const b = document.createElement("button");
      b.type = "button";
      b.className = "secondary-btn";
      b.disabled = true;
      b.textContent = "Locked";
      card.appendChild(b);
      box.appendChild(card);
    });
  }

  function createLevelThumb(levelId, levelName) {
    const thumb = document.createElement("div");
    thumb.className = "level-thumb";
    thumb.dataset.theme = getLevelThumbTheme(levelId);

    const chip = document.createElement("span");
    chip.className = "level-thumb-chip";
    chip.textContent = "16:9 preview";

    const title = document.createElement("span");
    title.className = "level-thumb-title";
    title.textContent = levelName;

    thumb.appendChild(chip);
    thumb.appendChild(title);
    return thumb;
  }

  function getLevelThumbTheme(levelId) {
    if (levelId === 1) return "home";
    if (levelId === 2) return "school";
    if (levelId === 3) return "village";
    if (levelId === 4) return "city";
    if (levelId === 5) return "online";
    return "default";
  }

  function startLevel(levelId, resume = false) {
    const lv = getLv(levelId);
    if (!lv) return;

    show("gameScreen");
    st.runtime.levelId = levelId;
    st.runtime.locked = false;
    st.runtime.pendingChoiceIndex = null;

    if (!resume || st.progress.currentLevelId !== levelId) {
      st.progress.currentSceneId = lv.startScene;
      st.progress.route = [...lv.orderedSections];
      st.progress.visited = [];
    } else {
      st.progress.currentSceneId = sanitizeSceneId(lv, st.progress.currentSceneId);
      st.progress.route = sanitizeRoute(lv, st.progress.route, st.progress.currentSceneId, st.progress.visited);
      st.progress.visited = sanitizeVisited(lv, st.progress.visited);
    }

    st.progress.currentLevelId = levelId;
    transitionLv(lv);
    introLv(lv);
    save();
  }

  function sanitizeSceneId(lv, sceneId) {
    if (sceneId && lv.scenes[sceneId]) return sceneId;
    return lv.startScene;
  }

  function sanitizeVisited(lv, visited) {
    if (!Array.isArray(visited)) return [];
    const valid = visited.filter((sceneId) => lv.scenes[sceneId]);
    return Array.from(new Set(valid));
  }

  function sanitizeRoute(lv, route, currentSceneId, visited) {
    const visitedSet = new Set(sanitizeVisited(lv, visited));
    const cleanRoute = Array.isArray(route) ? route.filter((sceneId) => lv.scenes[sceneId]) : [];
    const dedup = Array.from(new Set(cleanRoute));
    const keep = dedup.filter((sceneId) => !visitedSet.has(sceneId));
    const withCurrent = [currentSceneId, ...keep.filter((sceneId) => sceneId !== currentSceneId)];
    const fallback = lv.orderedSections.filter((sceneId) => !visitedSet.has(sceneId) && !withCurrent.includes(sceneId));
    return [...withCurrent, ...fallback];
  }

  function transitionLv(lv) {
    tone("neutral");
    el.sceneBackdrop.dataset.backdrop = lv.introBackdrop || "default";
    if (hasGsap()) window.gsap.killTweensOf(el.sceneBackdrop);

    if (lv.id === 1) {
      if (canAnimate()) {
        window.gsap.set(el.sceneBackdrop, { filter: "brightness(0.56) saturate(0.86)" });
        window.gsap.to(el.sceneBackdrop, {
          filter: "brightness(1) saturate(1)",
          duration: 1.35,
          ease: "sine.out",
          clearProps: "filter"
        });
      } else {
        el.sceneBackdrop.style.filter = "";
      }
      audio.amb("home");
    } else if (lv.id === 2) {
      audio.bell();
      setTimeout(() => audio.amb("school"), 240);
    } else if (lv.id === 3) {
      audio.amb("village");
    }

    if (canAnimate()) {
      window.gsap.fromTo(el.sceneBackdrop, { autoAlpha: 0.88 }, {
        autoAlpha: 1,
        duration: 0.42,
        ease: "power1.out",
        clearProps: "opacity,visibility"
      });
    }
  }

  function introLv(lv) {
    progress(`Level ${lv.id} • Intro`);
    el.sceneTitle.textContent = `Level ${lv.id}: ${lv.name}`;
    hideMeta();
    hideRes();
    el.choicesWrap.innerHTML = "";
    narr(lv.intro.join("\n"));
    nextBtn("Masuk ke Scene 1", () => {
      const firstSceneId = st.progress.route[0] || lv.startScene;
      scene(firstSceneId);
    });
  }

  function scene(sceneId) {
    const lv = activeLv();
    if (!lv) {
      showHub();
      return;
    }

    const safeSceneId = sanitizeSceneId(lv, sceneId);
    const baseScene = cloneScene(lv.scenes[safeSceneId]);
    const sc = applySceneVariants(lv, safeSceneId, baseScene);

    st.progress.currentSceneId = safeSceneId;
    st.runtime.activeSceneId = safeSceneId;
    st.runtime.activeScene = sc;
    st.runtime.locked = false;
    st.runtime.pendingChoiceIndex = null;

    if (!Array.isArray(st.progress.route) || st.progress.route.length === 0) {
      st.progress.route = [safeSceneId, ...lv.orderedSections.filter((id) => id !== safeSceneId)];
    } else if (st.progress.route[0] !== safeSceneId) {
      st.progress.route = [safeSceneId, ...st.progress.route.filter((id) => id !== safeSceneId)];
    }

    el.sceneBackdrop.dataset.backdrop = sc.backdrop || lv.introBackdrop || "default";
    progress(`Level ${lv.id} • Scene ${st.progress.visited.length + 1}/${lv.orderedSections.length}`);
    el.sceneTitle.textContent = sc.title;

    renderSceneMeta(sc.cast || []);
    tone("neutral");
    hideRes();
    nextBtn(null, null);
    drawChoices(sc);
    narr(sc.text.join("\n"));
    save();
  }

  function cloneScene(sceneObj) {
    return JSON.parse(JSON.stringify(sceneObj));
  }

  function applySceneVariants(lv, sceneId, sceneObj) {
    const key = `${lv.id}:${sceneId}`;

    if (key === "1:dining_room") {
      if (st.flags.story.home_distance) {
        sceneObj.text.unshift("Sisa tensi dari ruang keluarga masih menempel di meja makan.");
      } else if (st.flags.story.home_bridge) {
        sceneObj.text.unshift("Efek meredakan konflik tadi masih terasa: semua lebih mungkin mendengar.");
      }
    }

    if (key === "1:kitchen") {
      if ((st.social.ibu_rina || 0) >= 2) {
        sceneObj.text.push("Ibu Rina memanggilmu duluan, tanda ia mulai percaya kamu mau terlibat.");
      } else if ((st.social.ibu_rina || 0) <= -2) {
        sceneObj.text.push("Ibu Rina lebih banyak diam, seolah menahan kalimat yang tidak ingin memicu konflik.");
      }
    }

    if (key === "2:canteen") {
      if ((st.social.gilang || 0) <= -2) {
        sceneObj.text.unshift("Gilang menjaga jarak darimu setelah momen koridor tadi.");
      } else if ((st.social.gilang || 0) >= 2) {
        sceneObj.text.unshift("Gilang cenderung mengikuti caramu merespons orang yang terisolasi.");
      }
    }

    if (key === "2:library") {
      if ((st.social.rani || 0) >= 2) {
        sceneObj.text.unshift("Rani tampak sedikit lebih terbuka karena beberapa interaksi sebelumnya terasa aman.");
      } else if ((st.social.rani || 0) <= -2) {
        sceneObj.text.unshift("Rani terlihat semakin defensif, seolah belajar bahwa ruang sosial di sekolah tidak aman.");
      }
    }

    if (key === "3:warung") {
      if ((st.social.pak_ari || 0) >= 2) {
        sceneObj.text.unshift("Pak Ari menyapa kamu duluan, mempercayai kamu bisa bantu meredakan situasi.");
      } else if ((st.social.pak_ari || 0) <= -2) {
        sceneObj.text.unshift("Pak Ari terlihat kaku saat melihatmu, dampak dari interaksi yang belum pulih.");
      }
    }

    if (key === "3:pos_ronda") {
      if ((st.social.naya || 0) >= 2) {
        sceneObj.text.push("Kak Naya memberi ruang bicara padamu karena ia melihatmu cukup konsisten menjaga suasana.");
      } else if ((st.social.naya || 0) <= -2) {
        sceneObj.text.push("Kak Naya lebih berhati-hati, tidak yakin kamu akan menjaga ruang obrolan tetap sehat.");
      }
    }

    return sceneObj;
  }

  function drawChoices(sc) {
    el.choicesWrap.innerHTML = "";
    sc.choices.forEach((choice, index) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice-btn";
      b.dataset.choiceIndex = String(index);
      b.textContent = `${index + 1}. ${choice.text}`;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => choose(index, b));
      el.choicesWrap.appendChild(b);
    });

    if (canAnimate()) {
      window.gsap.fromTo(el.choicesWrap.children, {
        autoAlpha: 0,
        y: 9
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        ease: "power2.out",
        stagger: 0.045
      });
    }
  }

  function choose(index, selectedButton) {
    if (st.runtime.locked) return;

    const lv = activeLv();
    if (!lv) return;

    const sc = st.runtime.activeScene;
    if (!sc || !Array.isArray(sc.choices) || !sc.choices[index]) return;

    const choice = sc.choices[index];
    st.runtime.pendingChoiceIndex = index;

    const buttons = Array.from(el.choicesWrap.querySelectorAll("button"));
    buttons.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    if (selectedButton) {
      selectedButton.classList.add("is-selected");
      selectedButton.setAttribute("aria-pressed", "true");
      if (canAnimate()) {
        window.gsap.fromTo(selectedButton, { scale: 0.985 }, {
          scale: 1,
          duration: 0.18,
          ease: "power2.out",
          clearProps: "transform"
        });
      }
    }

    const outcomeLines = [choice.res || "Pilihanmu meninggalkan jejak kecil.", "Kamu masih bisa ganti pilihan sebelum menekan lanjut."];
    tone(choice.tone || inferTone((choice.effects && choice.effects.em) || 0));
    audio.choice(choice.tone || inferTone((choice.effects && choice.effects.em) || 0));
    showRes(outcomeLines.join("\n"));

    nextBtn("Lanjut dengan pilihan ini", () => confirmChoice());
    save();
  }

  function confirmChoice() {
    if (st.runtime.locked) return;

    const lv = activeLv();
    if (!lv) return;

    const sc = st.runtime.activeScene;
    const selectedIndex = st.runtime.pendingChoiceIndex;
    if (!sc || !Array.isArray(sc.choices) || selectedIndex === null || !sc.choices[selectedIndex]) {
      toast("Pilih jawaban dulu sebelum lanjut.");
      return;
    }

    const choice = sc.choices[selectedIndex];
    st.runtime.locked = true;

    const buttons = Array.from(el.choicesWrap.querySelectorAll("button"));
    buttons.forEach((button) => {
      button.disabled = true;
    });

    const outcomeLines = [choice.res || "Pilihanmu meninggalkan jejak kecil."];
    const ripple = applyChoiceEffects(choice.effects || {}, lv);
    if (ripple.length > 0) outcomeLines.push(...ripple);

    addTags((choice.effects && choice.effects.tags) || []);

    showRes(outcomeLines.join("\n"));
    st.runtime.pendingChoiceIndex = null;

    const isLastByRoute = st.progress.route.length <= 1;
    nextBtn(isLastByRoute ? "Selesaikan level" : "Lanjut", () => nextScene());
    save();
  }

  function applyChoiceEffects(effects, lv) {
    const notes = [];

    if (typeof effects.em === "number") {
      st.hidden.empathy += effects.em;
    }

    if (effects.rel && typeof effects.rel === "object") {
      Object.entries(effects.rel).forEach(([charId, delta]) => {
        if (typeof st.social[charId] !== "number") st.social[charId] = 0;
        const before = st.social[charId];
        const after = before + Number(delta || 0);
        st.social[charId] = after;

        if (before < 2 && after >= 2) {
          notes.push(`${getCastName(charId)} mulai lebih terbuka padamu.`);
        }
        if (before > -2 && after <= -2) {
          notes.push(`${getCastName(charId)} mulai menjaga jarak.`);
        }
      });
    }

    if (effects.set && typeof effects.set === "object") {
      Object.entries(effects.set).forEach(([flag, value]) => {
        st.flags.story[flag] = value;
      });
    }

    if (effects.pathNote) {
      pushPathNote(effects.pathNote);
    }

    if (Array.isArray(effects.routeTail) && effects.routeTail.length > 0) {
      applyRouteTail(lv, effects.routeTail);
    }

    return notes;
  }

  function applyRouteTail(lv, routeTail) {
    const current = st.progress.currentSceneId;
    const visitedSet = new Set(st.progress.visited || []);

    const cleanTail = routeTail.filter((sceneId) => lv.scenes[sceneId] && sceneId !== current && !visitedSet.has(sceneId));
    const existingTail = (st.progress.route || []).filter((sceneId) => sceneId !== current && !visitedSet.has(sceneId));
    const mergedTail = [...cleanTail, ...existingTail.filter((sceneId) => !cleanTail.includes(sceneId))];

    st.progress.route = [current, ...mergedTail];
  }

  function nextScene() {
    const lv = activeLv();
    if (!lv) return;

    const current = st.progress.currentSceneId;
    if (current && !st.progress.visited.includes(current)) {
      st.progress.visited.push(current);
    }

    const nextRoute = (st.progress.route || []).filter((sceneId) => sceneId !== current);
    st.progress.route = nextRoute;

    if (nextRoute.length > 0) {
      scene(nextRoute[0]);
      return;
    }

    finishLv(lv);
  }

  function finishLv(lv) {
    if (!st.progress.completed.includes(lv.id)) st.progress.completed.push(lv.id);
    if (lv.id < 3) st.progress.unlockedLevel = Math.max(st.progress.unlockedLevel, lv.id + 1);

    st.progress.currentLevelId = null;
    st.progress.currentSceneId = null;
    st.progress.route = [];
    st.progress.visited = [];
    st.runtime.levelId = null;
    st.runtime.activeSceneId = null;
    st.runtime.activeScene = null;
    st.runtime.pendingChoiceIndex = null;

    save();

    const recapShort = buildRecapText({ short: true });

    if (lv.id === 1) {
      const warm = st.hidden.empathy >= lv.checkpoint.threshold;
      const body = `${warm ? lv.checkpoint.warm : lv.checkpoint.cold}\n\n${lv.closing[0]}\n${lv.closing[1]}\n\n${recapShort}`;
      showOverlay("Checkpoint Level 1", body, [
        { label: "Lihat Recap", cls: "secondary-btn", fn: () => showRecapOverlay() },
        { label: "Next Level", cls: "primary-btn", fn: async () => { await audio.unlock(); startLevel(2); } },
        { label: "Replay Level 1", cls: "secondary-btn", fn: async () => { await audio.unlock(); startLevel(1); } },
        { label: "Level Menu", cls: "ghost-btn", fn: showHub }
      ]);
      return;
    }

    if (lv.id === 2) {
      showOverlay(lv.completion.title, `${lv.completion.text}\n\n${recapShort}`, [
        { label: "Lihat Recap", cls: "secondary-btn", fn: () => showRecapOverlay() },
        { label: "Next Level", cls: "primary-btn", fn: async () => { await audio.unlock(); startLevel(3); } },
        { label: "Level Menu", cls: "secondary-btn", fn: showHub }
      ]);
      return;
    }

    showOverlay(lv.completion.title, `${lv.completion.text}\n\n${buildRecapText({ short: false })}`, [
      { label: "Replay Level 3", cls: "secondary-btn", fn: async () => { await audio.unlock(); startLevel(3); } },
      { label: "Lihat Recap", cls: "secondary-btn", fn: () => showRecapOverlay() },
      { label: "Level Menu", cls: "primary-btn", fn: showHub }
    ]);
  }

  function showOverlay(title, text, buttons) {
    el.overlayTitle.textContent = title;
    el.overlayText.textContent = text;
    el.overlayButtons.innerHTML = "";

    buttons.forEach((cfg) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cfg.cls || "primary-btn";
      b.textContent = cfg.label;
      b.addEventListener("click", () => {
        overlay(false);
        cfg.fn();
      });
      el.overlayButtons.appendChild(b);
    });

    overlay(true);
  }

  function showRecapOverlay() {
    showOverlay("Journey Recap", buildRecapText({ short: false }), [
      { label: "Tutup", cls: "primary-btn", fn: () => {} }
    ]);
  }

  function buildRecapText({ short = false } = {}) {
    const empathyBand = st.hidden.empathy >= 8
      ? "Rasa pedulimu cenderung aktif dan konsisten."
      : st.hidden.empathy >= 3
        ? "Kamu beberapa kali hadir untuk orang lain, meski belum stabil."
        : st.hidden.empathy >= 0
          ? "Kamu berada di area netral: kadang hadir, kadang memilih menjauh."
          : "Kamu cenderung menjaga jarak saat situasi emosional meningkat.";

    const topTags = Object.entries(st.hidden.tagCount || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, short ? 2 : 4)
      .map(([tag]) => mapTagLabel(tag));

    const relationEntries = Object.entries(st.social || {})
      .map(([id, score]) => ({ id, score }))
      .filter((item) => item.score !== 0)
      .sort((a, b) => b.score - a.score);

    const warmRelations = relationEntries.slice(0, short ? 1 : 2)
      .filter((item) => item.score > 0)
      .map((item) => `${getCastName(item.id)} (${relationWord(item.score)})`);

    const coldRelations = relationEntries.slice().reverse().slice(0, short ? 1 : 2)
      .filter((item) => item.score < 0)
      .map((item) => `${getCastName(item.id)} (${relationWord(item.score)})`);

    const lines = [
      empathyBand,
      `Kecenderungan perilaku: ${topTags.length > 0 ? topTags.join(", ") : "belum cukup data."}`,
      `Relasi yang menghangat: ${warmRelations.length > 0 ? warmRelations.join(" • ") : "belum terlihat kuat."}`,
      `Relasi yang menjauh: ${coldRelations.length > 0 ? coldRelations.join(" • ") : "belum ada yang menonjol."}`
    ];

    if (!short) {
      const notes = (st.hidden.pathNotes || []).slice(-4);
      lines.push(`Jejak keputusan penting: ${notes.length > 0 ? notes.join(" | ") : "Belum ada catatan jalur."}`);
    }

    return lines.join("\n\n");
  }

  function mapTagLabel(tag) {
    const labels = {
      help: "membantu",
      listen: "mendengarkan",
      avoid: "menghindar",
      harm: "melukai",
      reflect: "refleksi",
      respect: "menghargai",
      defuse: "meredakan",
      dismiss: "mengabaikan emosi",
      boundary: "menjaga batas sehat",
      reach_out: "inisiatif menghubungi",
      observe: "mengamati",
      ignore: "cuek"
    };
    return labels[tag] || tag;
  }

  function relationWord(score) {
    if (score >= 3) return "dekat";
    if (score >= 1) return "mulai hangat";
    if (score <= -3) return "jauh";
    if (score <= -1) return "menjauh";
    return "netral";
  }

  function renderSceneMeta(castIds) {
    if (!Array.isArray(castIds) || castIds.length === 0) {
      hideMeta();
      return;
    }

    const castNames = castIds.map((id) => getCastName(id)).join(", ");
    const relationSummary = castIds.map((id) => `${getCastName(id)}: ${relationWord(st.social[id] || 0)}`).join(" | ");
    el.sceneMeta.textContent = `Tokoh: ${castNames}\nRelasi saat ini: ${relationSummary}`;
    el.sceneMeta.classList.remove("hidden");
  }

  function hideMeta() {
    el.sceneMeta.textContent = "";
    el.sceneMeta.classList.add("hidden");
  }

  function getCastName(id) {
    return (STORY.cast[id] && STORY.cast[id].name) || id;
  }

  function addTags(tags) {
    const set = new Set(st.hidden.tags);
    tags.forEach((tag) => {
      set.add(tag);
      st.hidden.tagCount[tag] = (st.hidden.tagCount[tag] || 0) + 1;
    });
    st.hidden.tags = Array.from(set);
  }

  function pushPathNote(note) {
    if (!note) return;
    if (!Array.isArray(st.hidden.pathNotes)) st.hidden.pathNotes = [];
    const last = st.hidden.pathNotes[st.hidden.pathNotes.length - 1];
    if (last !== note) st.hidden.pathNotes.push(note);
    if (st.hidden.pathNotes.length > 20) st.hidden.pathNotes = st.hidden.pathNotes.slice(-20);
  }

  function overlay(on) {
    const isOpen = !!on;
    const wasOpen = el.overlayScreen.classList.contains("active") || el.app.classList.contains("overlay-open");
    killTween(overlayTween);
    el.app.classList.toggle("overlay-open", isOpen);

    if (!isOpen && !wasOpen) {
      el.overlayScreen.classList.remove("active");
      el.overlayScreen.style.pointerEvents = "none";
      return;
    }

    if (!hasGsap() || st.settings.reducedMotion) {
      el.overlayScreen.classList.toggle("active", isOpen);
      el.overlayScreen.style.opacity = isOpen ? "1" : "0";
      el.overlayScreen.style.pointerEvents = isOpen ? "auto" : "none";
      if (el.overlayPanel) el.overlayPanel.style.transform = isOpen ? "translateY(0)" : "translateY(10px)";
      if (isOpen) menu(false);
      return;
    }

    if (isOpen) {
      menu(false);
      el.overlayScreen.classList.add("active");
      window.gsap.set(el.overlayScreen, { autoAlpha: 0, pointerEvents: "none" });
      if (el.overlayPanel) window.gsap.set(el.overlayPanel, { y: 18, autoAlpha: 0 });

      overlayTween = window.gsap.timeline();
      overlayTween.to(el.overlayScreen, {
        autoAlpha: 1,
        duration: 0.24,
        ease: "power2.out",
        onStart: () => {
          el.overlayScreen.style.pointerEvents = "auto";
        }
      });
      if (el.overlayPanel) {
        overlayTween.to(el.overlayPanel, {
          y: 0,
          autoAlpha: 1,
          duration: 0.28,
          ease: "power3.out"
        }, 0.05);
      }
      return;
    }

    el.overlayScreen.style.pointerEvents = "none";
    overlayTween = window.gsap.timeline({
      onComplete: () => {
        el.overlayScreen.classList.remove("active");
        if (el.overlayPanel) window.gsap.set(el.overlayPanel, { clearProps: "transform,opacity,visibility" });
      }
    });
    if (el.overlayPanel) {
      overlayTween.to(el.overlayPanel, {
        y: 12,
        autoAlpha: 0,
        duration: 0.16,
        ease: "power1.in"
      });
    }
    overlayTween.to(el.overlayScreen, {
      autoAlpha: 0,
      duration: 0.2,
      ease: "power1.out"
    }, 0);
  }

  function nextBtn(label, fn) {
    nextAct = fn || null;
    if (!label) {
      el.continueSceneBtn.classList.add("hidden");
      return;
    }
    el.continueSceneBtn.textContent = label;
    el.continueSceneBtn.classList.remove("hidden");
  }

  function showRes(text) {
    el.consequenceText.textContent = text;
    el.consequenceText.classList.remove("hidden");
    if (canAnimate()) {
      window.gsap.killTweensOf(el.consequenceText);
      window.gsap.fromTo(el.consequenceText, {
        autoAlpha: 0,
        y: 8
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.22,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility"
      });
    }
  }

  function hideRes() {
    if (hasGsap()) window.gsap.killTweensOf(el.consequenceText);
    el.consequenceText.textContent = "";
    el.consequenceText.classList.add("hidden");
    if (hasGsap()) window.gsap.set(el.consequenceText, { clearProps: "transform,opacity,visibility" });
  }

  async function narr(text) {
    if (st.settings.typewriter && !st.settings.reducedMotion) {
      await type(el.sceneText, text, 18);
    } else {
      typeRun += 1;
      el.sceneText.textContent = text;
    }
  }

  async function type(node, text, speed = 20) {
    const id = ++typeRun;
    node.textContent = "";
    for (let i = 0; i < text.length; i += 1) {
      if (id !== typeRun) return;
      const ch = text[i];
      node.textContent += ch;
      let delay = speed;
      if (ch === ",") delay += 25;
      if (ch === "." || ch === "!" || ch === "?") delay += 65;
      await sleep(delay);
    }
  }

  function inferTone(delta) {
    if (delta > 0) return "warm";
    if (delta < 0) return "cold";
    return "neutral";
  }

  function tone(t) {
    el.app.dataset.tone = ["warm", "cold", "tense", "neutral"].includes(t) ? t : "neutral";
  }

  function progress(text) {
    el.progressLabel.textContent = text;
  }

  function getLv(levelId) {
    return STORY.levels.find((lv) => lv.id === levelId) || null;
  }

  function activeLv() {
    if (st.runtime.levelId) return getLv(st.runtime.levelId);
    if (st.progress.currentLevelId) return getLv(st.progress.currentLevelId);
    return null;
  }

  function menu(open) {
    const isOpen = !!open;
    const wasOpen = el.menuDrawer.classList.contains("open");
    killTween(menuTween);
    el.menuDrawer.classList.toggle("open", isOpen);
    el.menuScrim.classList.toggle("show", isOpen);
    el.menuDrawer.setAttribute("aria-hidden", isOpen ? "false" : "true");

    if (!isOpen && !wasOpen) {
      el.menuDrawer.style.transform = "translateX(100%)";
      el.menuScrim.style.opacity = "0";
      el.menuScrim.style.pointerEvents = "none";
      return;
    }

    if (!hasGsap() || st.settings.reducedMotion) {
      el.menuDrawer.style.transform = isOpen ? "translateX(0)" : "translateX(100%)";
      el.menuScrim.style.opacity = isOpen ? "1" : "0";
      el.menuScrim.style.pointerEvents = isOpen ? "auto" : "none";
      return;
    }

    if (isOpen) {
      window.gsap.set(el.menuScrim, { autoAlpha: 0, pointerEvents: "none" });
      window.gsap.set(el.menuDrawer, { xPercent: 100 });
      menuTween = window.gsap.timeline();
      menuTween.to(el.menuScrim, {
        autoAlpha: 1,
        duration: 0.2,
        ease: "power1.out",
        onStart: () => {
          el.menuScrim.style.pointerEvents = "auto";
        }
      });
      menuTween.to(el.menuDrawer, {
        xPercent: 0,
        duration: 0.28,
        ease: "power3.out"
      }, 0);
      return;
    }

    el.menuScrim.style.pointerEvents = "none";
    menuTween = window.gsap.timeline();
    menuTween.to(el.menuDrawer, {
      xPercent: 100,
      duration: 0.2,
      ease: "power2.in"
    });
    menuTween.to(el.menuScrim, {
      autoAlpha: 0,
      duration: 0.18,
      ease: "power1.out"
    }, 0.02);
  }

  function applySettings() {
    el.typewriterToggle.checked = st.settings.typewriter;
    el.motionToggle.checked = st.settings.reducedMotion;
    document.body.classList.toggle("reduced-motion", st.settings.reducedMotion);
    if (st.settings.reducedMotion) {
      killTween(menuTween);
      killTween(overlayTween);
      killTween(toastTween);
    }
    setupAmbientMotion();
    menu(el.menuDrawer.classList.contains("open"));
    overlay(el.overlayScreen.classList.contains("active"));
  }

  function toast(msg) {
    el.toast.textContent = msg;
    if (toastTimer) clearTimeout(toastTimer);
    killTween(toastTween);

    if (!hasGsap() || st.settings.reducedMotion) {
      el.toast.style.opacity = "1";
      el.toast.style.transform = "translate(-50%, 0)";
      toastTimer = setTimeout(() => {
        el.toast.style.opacity = "0";
        el.toast.style.transform = "translate(-50%, 8px)";
      }, 1700);
      return;
    }

    window.gsap.set(el.toast, { autoAlpha: 0, y: 8 });
    toastTween = window.gsap.to(el.toast, {
      autoAlpha: 1,
      y: 0,
      duration: 0.2,
      ease: "power2.out"
    });

    toastTimer = setTimeout(() => {
      killTween(toastTween);
      toastTween = window.gsap.to(el.toast, {
        autoAlpha: 0,
        y: 8,
        duration: 0.2,
        ease: "power1.in"
      });
    }, 1700);
  }

  function resetJourney() {
    st.progress = {
      unlockedLevel: 1,
      currentLevelId: null,
      currentSceneId: null,
      route: [],
      visited: [],
      completed: []
    };
    st.hidden = { empathy: 0, tags: [], tagCount: {}, pathNotes: [] };
    st.social = createInitialSocialState();
    st.flags.story = {};
    st.runtime.levelId = null;
    st.runtime.locked = false;
    st.runtime.activeSceneId = null;
    st.runtime.activeScene = null;
    st.runtime.pendingChoiceIndex = null;
    save();
  }

  async function runOpening() {
    const id = ++openRun;
    typeRun += 1;

    show("openingScreen");
    tone("neutral");
    el.notificationLayer.innerHTML = "";
    el.openingNarration.textContent = "";
    if (hasGsap()) {
      window.gsap.killTweensOf(el.notificationLayer);
      window.gsap.killTweensOf(el.crowdLayer);
      window.gsap.set(el.notificationLayer, { autoAlpha: 1 });
      window.gsap.set(el.crowdLayer, { autoAlpha: 0 });
      window.gsap.set(el.openingNarration, { autoAlpha: 1 });
    } else {
      el.notificationLayer.style.opacity = "1";
      el.crowdLayer.style.opacity = "0";
    }

    st.flags.openingSeen = true;
    save();

    audio.stopAll();
    audio.startNotif();

    for (let i = 0; i < 26; i += 1) {
      if (id !== openRun) return;
      spawnNotif();
      if (i % 2 === 0) audio.notif();
      await sleep(90 + Math.random() * 80);
    }

    audio.stopNotif();
    if (id !== openRun) return;

    if (canAnimate()) {
      window.gsap.to(el.notificationLayer, { autoAlpha: 0, duration: 0.9, ease: "power1.out" });
      await sleep(900);
    } else {
      el.notificationLayer.style.opacity = "0";
      await sleep(850);
    }

    const linesA = [
      "Generasi ini tumbuh di dunia yang cepat,",
      "Informasi terus berdatangan tanpa henti,",
      "Interaksi bisa terjadi tanpa benar-benar bertemu"
    ];

    for (const line of linesA) {
      if (!(await openLine(line, id, 1500))) return;
    }

    if (canAnimate()) {
      window.gsap.to(el.crowdLayer, { autoAlpha: 1, duration: 0.45, ease: "sine.out" });
    } else {
      el.crowdLayer.style.opacity = "1";
    }
    audio.startCity();
    await sleep(420);

    const linesB = [
      "kini yang jauh terasa dekat, dan yang dekat terasa jauh",
      "semua saling melihat, namun jarang saling memahami",
      "rasa tak acuh perlahan menyebar, lalu sebagian yang peduli mulai takut bergerak bahkan sekedar untuk memulai....",
      "karena perasaan 'itu' sudah terasa ASING"
    ];

    for (let i = 0; i < linesB.length; i += 1) {
      if (!(await openLine(linesB[i], id, 1680))) return;
      if (i === linesB.length - 1) {
        audio.stopCity();
        await sleep(700);
      }
    }

    const linesC = [
      "Jika terus dibiarkan, dunia ini akan terus berjalan tanpa kepedulian",
      "empati bukan tentang mengubah dunia. Tapi tentang mengubah cara pandang kita melihat manusia"
    ];

    for (const line of linesC) {
      if (!(await openLine(line, id, 1680))) return;
    }

    el.openingNarration.textContent = "";
    if (canAnimate()) {
      window.gsap.to(el.crowdLayer, { autoAlpha: 0, duration: 0.2, ease: "power1.out" });
    } else {
      el.crowdLayer.style.opacity = "0";
    }
    el.notificationLayer.innerHTML = "";
    await sleep(420);

    if (id !== openRun) return;
    showTitle();
  }

  async function openLine(text, id, hold) {
    if (id !== openRun) return false;
    if (st.settings.typewriter && !st.settings.reducedMotion) await type(el.openingNarration, text, 16);
    else el.openingNarration.textContent = text;
    if (id !== openRun) return false;
    await sleep(hold);
    return id === openRun;
  }

  function skipOpening() {
    openRun += 1;
    typeRun += 1;
    audio.stopNotif();
    audio.stopCity();
    if (hasGsap()) {
      window.gsap.killTweensOf(el.notificationLayer);
      window.gsap.killTweensOf(el.crowdLayer);
      el.notificationLayer.querySelectorAll(".notification").forEach((node) => window.gsap.killTweensOf(node));
    }
    el.notificationLayer.innerHTML = "";
    el.notificationLayer.style.opacity = "0";
    el.crowdLayer.style.opacity = "0";
    el.openingNarration.textContent = "";
    st.flags.openingSeen = true;
    save();
    showTitle();
  }

  function spawnNotif() {
    const n = document.createElement("div");
    n.className = "notification";
    n.textContent = notifText();
    n.style.top = `${8 + Math.random() * 72}%`;
    n.style.left = `${4 + Math.random() * 60}%`;
    el.notificationLayer.appendChild(n);

    if (canAnimate()) {
      const drift = -14 + Math.random() * 28;
      const hold = 0.95 + Math.random() * 0.7;
      window.gsap.set(n, { autoAlpha: 0, y: 14, scale: 0.93, filter: "blur(0.7px)" });
      window.gsap.timeline({ onComplete: () => n.remove() })
        .to(n, {
          autoAlpha: 0.95,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.16,
          ease: "power2.out"
        })
        .to(n, {
          autoAlpha: 0,
          x: drift,
          y: -20,
          scale: 1.03,
          duration: hold,
          ease: "sine.in"
        }, 0.12);
      return;
    }

    setTimeout(() => n.remove(), 1000);
  }

  function notifText() {
    const base = NOTIFS[Math.floor(Math.random() * NOTIFS.length)];
    if (Math.random() < 0.45) {
      const cut = Math.max(3, Math.floor(Math.random() * base.length));
      return `${base.slice(0, cut)}...`;
    }
    if (Math.random() < 0.2) return "...";
    return base;
  }

  function save() {
    const data = {
      version: 2,
      profile: st.profile,
      progress: st.progress,
      hidden: st.hidden,
      social: st.social,
      settings: st.settings,
      flags: st.flags,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toggleContinue();
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;

    try {
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return;

      if (p.profile && typeof p.profile === "object") {
        st.profile.username = String(p.profile.username || "");
        st.profile.avatarId = STORY.avatars.some((a) => a.id === p.profile.avatarId) ? p.profile.avatarId : st.profile.avatarId;
        st.profile.mode = p.profile.mode === "group" ? "group" : "solo";
      }

      if (p.progress && typeof p.progress === "object") {
        const unlocked = Number(p.progress.unlockedLevel);
        st.progress.unlockedLevel = Number.isFinite(unlocked) ? Math.min(Math.max(unlocked, 1), 3) : 1;

        const currentLevelId = Number(p.progress.currentLevelId);
        st.progress.currentLevelId = [1, 2, 3].includes(currentLevelId) ? currentLevelId : null;

        st.progress.currentSceneId = typeof p.progress.currentSceneId === "string" ? p.progress.currentSceneId : null;

        st.progress.route = Array.isArray(p.progress.route) ? p.progress.route.map(String) : [];
        st.progress.visited = Array.isArray(p.progress.visited) ? p.progress.visited.map(String) : [];
        st.progress.completed = Array.isArray(p.progress.completed)
          ? p.progress.completed.map(Number).filter((n) => [1, 2, 3].includes(n))
          : [];

        if (!st.progress.currentSceneId && typeof p.progress.currentSceneIndex === "number" && st.progress.currentLevelId) {
          const lv = getLv(st.progress.currentLevelId);
          if (lv) {
            st.progress.currentSceneId = lv.orderedSections[Math.max(0, Math.min(lv.orderedSections.length - 1, Math.floor(p.progress.currentSceneIndex)))];
          }
        }
      }

      if (p.hidden && typeof p.hidden === "object") {
        const em = Number(p.hidden.empathy);
        st.hidden.empathy = Number.isFinite(em) ? Math.floor(em) : 0;
        st.hidden.tags = Array.isArray(p.hidden.tags) ? p.hidden.tags.slice(0, 80).map(String) : [];
        st.hidden.tagCount = p.hidden.tagCount && typeof p.hidden.tagCount === "object" ? p.hidden.tagCount : {};
        st.hidden.pathNotes = Array.isArray(p.hidden.pathNotes) ? p.hidden.pathNotes.slice(0, 40).map(String) : [];
      }

      if (p.social && typeof p.social === "object") {
        Object.keys(st.social).forEach((key) => {
          const num = Number(p.social[key]);
          st.social[key] = Number.isFinite(num) ? num : st.social[key];
        });
      }

      if (p.settings && typeof p.settings === "object") {
        st.settings.typewriter = p.settings.typewriter !== false;
        st.settings.reducedMotion = !!p.settings.reducedMotion;
      }

      if (p.flags && typeof p.flags === "object") {
        st.flags.openingSeen = !!p.flags.openingSeen;
        st.flags.story = p.flags.story && typeof p.flags.story === "object" ? p.flags.story : {};
      }
    } catch {}
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
