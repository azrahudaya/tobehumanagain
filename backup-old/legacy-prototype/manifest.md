
# To Be Human Again - Asset Manifest

Version: 1.0
Date: 2026-02-11
Project: Web visual novel prototype (mobile-first, vanilla HTML/CSS/JS)

## 1) Purpose
This manifest is the production checklist for all visual/audio assets needed to replace current placeholders and reach a polished campaign-ready vertical slice.

## 2) Technical Specs
- Primary target viewport: 9:16 mobile portrait.
- Main background export: 1080x1920, format `.webp`, quality 70-85.
- Character bust export: 1024x1365 canvas (transparent), format `.webp` or `.png`.
- UI icon export: `.svg` (preferred), fallback `.png` at 128x128.
- Overlay FX export: 1080x1920 transparent `.png`.
- Audio export: `.ogg` + `.mp3` fallback, -16 LUFS target loudness.

## 3) Recommended Folder Structure
`assets/`
- `backgrounds/`
- `characters/`
- `avatars/`
- `ui/`
- `fx/`
- `audio/`
- `opening/`
- `props/`
- `fonts/` (optional)

## 4) Naming Rules
- Use lowercase + snake_case.
- Use stable IDs matching scene keys where possible.
- Pattern examples:
  - `bg_<group>_<scene>.webp`
  - `char_<name>_<expression>.webp`
  - `ui_icon_<name>.svg`
  - `sfx_<event>.ogg`
  - `amb_<location>_loop.ogg`

## 5) Mandatory Background List (Core)

### 5.1 Opening and Title
| Priority | File Path | Size | Format | Notes |
|---|---|---:|---|---|
| P0 | `assets/opening/opening_notification_base.webp` | 1080x1920 | webp | Dark base for notification chaos |
| P0 | `assets/opening/opening_city_crowd_back.webp` | 1080x1920 | webp | Distant urban crowd layer |
| P0 | `assets/opening/opening_city_lights_overlay.png` | 1080x1920 | png | Light bokeh/traffic overlay |
| P1 | `assets/opening/opening_grain_overlay.png` | 1080x1920 | png | Subtle film grain |
| P0 | `assets/backgrounds/bg_title_main.webp` | 1080x1920 | webp | Title key art |

### 5.2 Level Intro Backgrounds
| Priority | File Path | Size | Format | Notes |
|---|---|---:|---|---|
| P0 | `assets/backgrounds/bg_intro_home.webp` | 1080x1920 | webp | Warm-soft transition from opening |
| P0 | `assets/backgrounds/bg_intro_school.webp` | 1080x1920 | webp | Broader social environment tone |
| P0 | `assets/backgrounds/bg_intro_village.webp` | 1080x1920 | webp | Outdoor local-community tone |

### 5.3 Level 1 (Home)
| Priority | Backdrop Key | File Path | Size | Format |
|---|---|---|---:|---|
| P0 | `home-living` | `assets/backgrounds/bg_home_living.webp` | 1080x1920 | webp |
| P0 | `home-dining` | `assets/backgrounds/bg_home_dining.webp` | 1080x1920 | webp |
| P0 | `home-bedroom` | `assets/backgrounds/bg_home_bedroom.webp` | 1080x1920 | webp |
| P0 | `home-kitchen` | `assets/backgrounds/bg_home_kitchen.webp` | 1080x1920 | webp |
| P0 | `home-porch` | `assets/backgrounds/bg_home_porch.webp` | 1080x1920 | webp |

### 5.4 Level 2 (School)
| Priority | Backdrop Key | File Path | Size | Format |
|---|---|---|---:|---|
| P0 | `school-classroom` | `assets/backgrounds/bg_school_classroom.webp` | 1080x1920 | webp |
| P0 | `school-corridor` | `assets/backgrounds/bg_school_corridor.webp` | 1080x1920 | webp |
| P0 | `school-canteen` | `assets/backgrounds/bg_school_canteen.webp` | 1080x1920 | webp |
| P0 | `school-field` | `assets/backgrounds/bg_school_field.webp` | 1080x1920 | webp |
| P0 | `school-library` | `assets/backgrounds/bg_school_library.webp` | 1080x1920 | webp |

### 5.5 Level 3 (Village/Neighborhood)
| Priority | Backdrop Key | File Path | Size | Format |
|---|---|---|---:|---|
| P0 | `village-rice` | `assets/backgrounds/bg_village_rice.webp` | 1080x1920 | webp |
| P0 | `village-warung` | `assets/backgrounds/bg_village_warung.webp` | 1080x1920 | webp |
| P0 | `village-pos` | `assets/backgrounds/bg_village_pos.webp` | 1080x1920 | webp |
| P0 | `village-field` | `assets/backgrounds/bg_village_field.webp` | 1080x1920 | webp |
| P0 | `village-road` | `assets/backgrounds/bg_village_road.webp` | 1080x1920 | webp |

## 6) Character Asset Packs (Consistent Cast)

Expressions required per character (minimum):
- `neutral`
- `warm`
- `tense`

Optional high-value extra expressions:
- `sad`
- `relieved`

Characters:
- `ibu_rina`
- `ayah_damar`
- `lala`
- `gilang`
- `rani`
- `bu_sari`
- `mbah_wiryo`
- `pak_ari`
- `naya`
- `dio`

Required file matrix (minimum 30 files):
- `assets/characters/ibu_rina/char_ibu_rina_neutral.webp`
- `assets/characters/ibu_rina/char_ibu_rina_warm.webp`
- `assets/characters/ibu_rina/char_ibu_rina_tense.webp`
- `assets/characters/ayah_damar/char_ayah_damar_neutral.webp`
- `assets/characters/ayah_damar/char_ayah_damar_warm.webp`
- `assets/characters/ayah_damar/char_ayah_damar_tense.webp`
- `assets/characters/lala/char_lala_neutral.webp`
- `assets/characters/lala/char_lala_warm.webp`
- `assets/characters/lala/char_lala_tense.webp`
- `assets/characters/gilang/char_gilang_neutral.webp`
- `assets/characters/gilang/char_gilang_warm.webp`
- `assets/characters/gilang/char_gilang_tense.webp`
- `assets/characters/rani/char_rani_neutral.webp`
- `assets/characters/rani/char_rani_warm.webp`
- `assets/characters/rani/char_rani_tense.webp`
- `assets/characters/bu_sari/char_bu_sari_neutral.webp`
- `assets/characters/bu_sari/char_bu_sari_warm.webp`
- `assets/characters/bu_sari/char_bu_sari_tense.webp`
- `assets/characters/mbah_wiryo/char_mbah_wiryo_neutral.webp`
- `assets/characters/mbah_wiryo/char_mbah_wiryo_warm.webp`
- `assets/characters/mbah_wiryo/char_mbah_wiryo_tense.webp`
- `assets/characters/pak_ari/char_pak_ari_neutral.webp`
- `assets/characters/pak_ari/char_pak_ari_warm.webp`
- `assets/characters/pak_ari/char_pak_ari_tense.webp`
- `assets/characters/naya/char_naya_neutral.webp`
- `assets/characters/naya/char_naya_warm.webp`
- `assets/characters/naya/char_naya_tense.webp`
- `assets/characters/dio/char_dio_neutral.webp`
- `assets/characters/dio/char_dio_warm.webp`
- `assets/characters/dio/char_dio_tense.webp`

## 7) Player Avatars
| Priority | File Path | Size | Format | Notes |
|---|---|---:|---|---|
| P0 | `assets/avatars/avatar_a.webp` | 512x512 | webp | Replace current placeholder A |
| P0 | `assets/avatars/avatar_b.webp` | 512x512 | webp | Replace current placeholder B |
| P0 | `assets/avatars/avatar_c.webp` | 512x512 | webp | Replace current placeholder C |
| P0 | `assets/avatars/avatar_d.webp` | 512x512 | webp | Replace current placeholder D |

## 8) UI Assets
| Priority | File Path | Type | Notes |
|---|---|---|---|
| P0 | `assets/ui/ui_icon_back.svg` | icon | top bar back |
| P0 | `assets/ui/ui_icon_menu.svg` | icon | top bar menu |
| P1 | `assets/ui/ui_icon_save.svg` | icon | drawer save |
| P1 | `assets/ui/ui_icon_replay.svg` | icon | replay buttons |
| P1 | `assets/ui/ui_icon_next.svg` | icon | next level button |
| P1 | `assets/ui/ui_icon_locked.svg` | icon | locked level marker |
| P1 | `assets/ui/ui_panel_dialogue.png` | panel | optional textured dialogue box |
| P1 | `assets/ui/ui_panel_overlay.png` | panel | optional textured overlay card |
| P2 | `assets/ui/ui_choice_default.png` | button skin | optional |
| P2 | `assets/ui/ui_choice_selected.png` | button skin | optional |
| P2 | `assets/ui/ui_choice_disabled.png` | button skin | optional |

## 9) FX and Tone Overlays
| Priority | File Path | Size | Format | Use |
|---|---|---:|---|---|
| P1 | `assets/fx/fx_tone_warm.png` | 1080x1920 | png | positive consequence tint |
| P1 | `assets/fx/fx_tone_cold.png` | 1080x1920 | png | colder consequence tint |
| P1 | `assets/fx/fx_tone_tense.png` | 1080x1920 | png | tense consequence tint |
| P2 | `assets/fx/fx_blur_vignette.png` | 1080x1920 | png | subtle emotional focus |
| P2 | `assets/fx/fx_noise_soft.png` | 1080x1920 | png | texture pass |

## 10) Prop Packs (Optional but High Impact)

Home props:
- `assets/props/home/prop_home_tv.webp`
- `assets/props/home/prop_home_plates.webp`
- `assets/props/home/prop_home_kitchen_tools.webp`
- `assets/props/home/prop_home_terrace_plant.webp`

School props:
- `assets/props/school/prop_school_stationery.webp`
- `assets/props/school/prop_school_exam_sheet.webp`
- `assets/props/school/prop_school_tray.webp`
- `assets/props/school/prop_school_library_books.webp`

Village props:
- `assets/props/village/prop_village_sack.webp`
- `assets/props/village/prop_village_warung_counter.webp`
- `assets/props/village/prop_village_umbrella.webp`
- `assets/props/village/prop_village_motorbike.webp`

## 11) Audio Asset List (If replacing generated WebAudio tones)

### 11.1 Opening / Transition SFX
- `assets/audio/sfx_notification_ping.ogg`
- `assets/audio/sfx_notification_ping.mp3`
- `assets/audio/sfx_school_bell.ogg`
- `assets/audio/sfx_school_bell.mp3`
- `assets/audio/sfx_choice_warm.ogg`
- `assets/audio/sfx_choice_cold.ogg`
- `assets/audio/sfx_choice_tense.ogg`

### 11.2 Ambience Loops
- `assets/audio/amb_city_crowd_loop.ogg`
- `assets/audio/amb_home_soft_loop.ogg`
- `assets/audio/amb_school_soft_loop.ogg`
- `assets/audio/amb_village_soft_loop.ogg`

### 11.3 Foley Detail Layers (Optional)
- `assets/audio/foley_home_chop_soft.ogg`
- `assets/audio/foley_home_fry_soft.ogg`
- `assets/audio/foley_school_chatter_soft.ogg`
- `assets/audio/foley_village_birds_soft.ogg`

## 12) Backdrop-Key Mapping (Code Integration)
Use this exact mapping if you switch from CSS gradients to image backgrounds.

| Backdrop Key in Code | Recommended Image |
|---|---|
| `default` | `assets/backgrounds/bg_default.webp` |
| `home-living` | `assets/backgrounds/bg_home_living.webp` |
| `home-dining` | `assets/backgrounds/bg_home_dining.webp` |
| `home-bedroom` | `assets/backgrounds/bg_home_bedroom.webp` |
| `home-kitchen` | `assets/backgrounds/bg_home_kitchen.webp` |
| `home-porch` | `assets/backgrounds/bg_home_porch.webp` |
| `school-classroom` | `assets/backgrounds/bg_school_classroom.webp` |
| `school-corridor` | `assets/backgrounds/bg_school_corridor.webp` |
| `school-canteen` | `assets/backgrounds/bg_school_canteen.webp` |
| `school-field` | `assets/backgrounds/bg_school_field.webp` |
| `school-library` | `assets/backgrounds/bg_school_library.webp` |
| `village-rice` | `assets/backgrounds/bg_village_rice.webp` |
| `village-warung` | `assets/backgrounds/bg_village_warung.webp` |
| `village-pos` | `assets/backgrounds/bg_village_pos.webp` |
| `village-field` | `assets/backgrounds/bg_village_field.webp` |
| `village-road` | `assets/backgrounds/bg_village_road.webp` |

## 13) Locked Level Preview Art (Level 4 and 5)
| Priority | File Path | Size | Format | Notes |
|---|---|---:|---|---|
| P1 | `assets/backgrounds/bg_city_preview.webp` | 1080x1920 | webp | for Level 4 card/teaser |
| P1 | `assets/backgrounds/bg_online_preview.webp` | 1080x1920 | webp | for Level 5 card/teaser |

## 14) Production Milestones
- Milestone A (P0 only): 1 title + 3 intros + 15 scene backgrounds + 4 avatars + 30 core character expressions.
- Milestone B (P1): opening overlays + key UI icons + ambience audio loops + locked level preview art.
- Milestone C (P2): UI skin textures, extra expressions, prop packs, fine-grain FX layers.

## 15) QA Checklist Before Import
- Verify dimensions exactly match target.
- Verify all files use lowercase snake_case names.
- Verify transparent PNGs are premultiplied correctly (no dark halo).
- Verify file sizes are mobile-safe (background ideally <= 450 KB each).
- Verify no copyrighted third-party elements in key art.
- Verify Indonesian context details are culturally consistent.

## 16) Current Placeholder Replacement Status
- Status: pending (all placeholder gradients and generated tones still active).
- First recommended import order:
  1. Level 1 backgrounds.
  2. Main cast portraits (Ibu Rina, Ayah Damar, Lala, Gilang, Rani).
  3. Title key art and opening overlays.
  4. Ambience loops.

## 17) Notes for Artist and Implementer
- Maintain reflective and calm tone; avoid flashy arcade effects.
- Keep expressions subtle and realistic, not exaggerated cartoon drama.
- Keep readable contrast behind dialogue area.
- Export with safe margins for UI overlap at top and bottom.
