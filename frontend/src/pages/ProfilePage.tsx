import { ArrowLeft, LockKeyhole, LogOut, Save, Scissors, Upload, UserCircle2, UserRound } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";

type CropOffset = {
  x: number;
  y: number;
};

type AvatarSource = {
  src: string;
  width: number;
  height: number;
};

const CROP_FRAME_SIZE = 272;
const AVATAR_DATA_URL_LIMIT = 680_000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load."));
    image.src = src;
  });

const getCropScale = (source: AvatarSource, zoom: number) => {
  const coverScale = Math.max(CROP_FRAME_SIZE / source.width, CROP_FRAME_SIZE / source.height);
  return coverScale * zoom;
};

const getOffsetBounds = (source: AvatarSource, zoom: number) => {
  const scale = getCropScale(source, zoom);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;

  return {
    x: Math.max(0, (renderedWidth - CROP_FRAME_SIZE) / 2),
    y: Math.max(0, (renderedHeight - CROP_FRAME_SIZE) / 2),
  };
};

const clampCropOffset = (offset: CropOffset, source: AvatarSource, zoom: number): CropOffset => {
  const bounds = getOffsetBounds(source, zoom);
  return {
    x: clamp(offset.x, -bounds.x, bounds.x),
    y: clamp(offset.y, -bounds.y, bounds.y),
  };
};

const buildCroppedAvatarDataUrl = async ({
  source,
  offset,
  zoom,
}: {
  source: AvatarSource;
  offset: CropOffset;
  zoom: number;
}) => {
  const image = await loadImageElement(source.src);
  const scale = getCropScale(source, zoom);
  const sourceCropSize = CROP_FRAME_SIZE / scale;

  let sourceX = source.width / 2 - offset.x / scale - sourceCropSize / 2;
  let sourceY = source.height / 2 - offset.y / scale - sourceCropSize / 2;

  sourceX = clamp(sourceX, 0, source.width - sourceCropSize);
  sourceY = clamp(sourceY, 0, source.height - sourceCropSize);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported on this browser.");
  }

  const targetSizes = [512, 448, 384];
  const encoders = [
    { type: "image/webp", qualities: [0.92, 0.84, 0.76] },
    { type: "image/jpeg", qualities: [0.9, 0.82, 0.74] },
  ] as const;

  for (const size of targetSizes) {
    canvas.width = size;
    canvas.height = size;
    context.clearRect(0, 0, size, size);
    context.drawImage(image, sourceX, sourceY, sourceCropSize, sourceCropSize, 0, 0, size, size);

    for (const encoder of encoders) {
      for (const quality of encoder.qualities) {
        const dataUrl = canvas.toDataURL(encoder.type, quality);
        if (dataUrl.length <= AVATAR_DATA_URL_LIMIT) {
          return dataUrl;
        }
      }
    }
  }

  return canvas.toDataURL("image/jpeg", 0.64);
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [savingAvatar, setSavingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [avatarSource, setAvatarSource] = useState<AvatarSource | null>(null);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [dragging, setDragging] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    baseOffset: CropOffset;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setDisplayName(user.displayName ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  const avatarRenderState = useMemo(() => {
    if (!avatarSource) {
      return null;
    }

    const scale = getCropScale(avatarSource, cropZoom);
    return {
      width: avatarSource.width * scale,
      height: avatarSource.height * scale,
    };
  }, [avatarSource, cropZoom]);

  useEffect(() => {
    if (!avatarSource) {
      return;
    }

    setCropOffset((prev) => clampCropOffset(prev, avatarSource, cropZoom));
  }, [avatarSource, cropZoom]);

  const closeCropModal = () => {
    setCropModalOpen(false);
    setAvatarSource(null);
    setDragging(null);
    setCropOffset({ x: 0, y: 0 });
    setCropZoom(1);
  };

  const handleCloseCropModal = () => {
    if (savingAvatar) {
      return;
    }

    closeCropModal();
  };

  const handlePickAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar. Maksimal 10MB.");
      return;
    }

    try {
      const src = await readFileAsDataUrl(file);
      const image = await loadImageElement(src);

      setAvatarSource({
        src,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setCropOffset({ x: 0, y: 0 });
      setCropZoom(1);
      setCropModalOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!avatarSource) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    setDragging({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseOffset: cropOffset,
    });
  };

  const handleCropPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !avatarSource || dragging.pointerId !== event.pointerId) {
      return;
    }

    const nextOffset = {
      x: dragging.baseOffset.x + (event.clientX - dragging.startX),
      y: dragging.baseOffset.y + (event.clientY - dragging.startY),
    };

    setCropOffset(clampCropOffset(nextOffset, avatarSource, cropZoom));
  };

  const handleCropPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || dragging.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(null);
  };

  const handleSaveAvatarCrop = async () => {
    if (!avatarSource) {
      return;
    }

    setSavingAvatar(true);
    try {
      const clampedOffset = clampCropOffset(cropOffset, avatarSource, cropZoom);
      const avatarDataUrl = await buildCroppedAvatarDataUrl({
        source: avatarSource,
        offset: clampedOffset,
        zoom: cropZoom,
      });

      await updateProfile({ avatarDataUrl });
      toast.success("Foto profil berhasil diperbarui.");
      closeCropModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatarUrl) {
      return;
    }

    setSavingAvatar(true);
    try {
      await updateProfile({ avatarDataUrl: null });
      toast.success("Foto profil dihapus.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      toast.error("Display name dan email wajib diisi.");
      return;
    }

    const emailChanged = trimmedEmail.toLowerCase() !== (user?.email ?? "").toLowerCase();

    if (emailChanged && !profileCurrentPassword) {
      toast.error("Isi current password untuk mengubah email.");
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        displayName: trimmedName,
        email: trimmedEmail,
        currentPassword: emailChanged ? profileCurrentPassword : undefined,
      });
      setProfileCurrentPassword("");
      toast.success("Profile berhasil diperbarui.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Lengkapi semua field password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password belum sama.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password berhasil diganti.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/auth", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-4 p-4 pb-28 md:p-6 md:pb-6">
      <div>
        <Button variant="secondary" className="h-10 rounded-xl px-4 text-lg" onClick={() => navigate("/home")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="font-caveat text-5xl text-ink">Edit Profile</h1>
        <p className="text-sm text-[#5d4c51]">Kelola identitas akun, password, dan sesi login.</p>
      </div>

      <Card className="space-y-4 border-[#d4cfc8] bg-white/82">
        <h2 className="inline-flex items-center gap-2 font-caveat text-4xl text-[#4d3a3f]">
          <Scissors className="h-6 w-6" />
          Profile Photo
        </h2>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.displayName} avatar`}
              className="h-28 w-28 rounded-3xl border border-[#c9c0b8] object-cover shadow-[0_10px_18px_rgba(74,61,63,0.18)]"
            />
          ) : (
            <div className="grid h-28 w-28 place-items-center rounded-3xl border border-[#c9c0b8] bg-[#d4d4d4] text-[#646464] shadow-[0_10px_18px_rgba(74,61,63,0.16)]">
              <UserCircle2 className="h-11 w-11" />
            </div>
          )}

          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm text-[#5f4d53]">
              Upload foto, lalu atur area crop sebelum disimpan.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button
                variant="secondary"
                className="h-11 rounded-xl text-lg"
                onClick={handlePickAvatarClick}
                disabled={savingAvatar}
              >
                <Upload className="h-4 w-4" />
                Edit Photo
              </Button>
              <Button
                variant="ghost"
                className="h-11 rounded-xl text-lg"
                onClick={() => void handleRemoveAvatar()}
                disabled={savingAvatar || !user?.avatarUrl}
              >
                {savingAvatar ? "Processing..." : "Remove Photo"}
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleAvatarFileChange}
          className="hidden"
        />
      </Card>

      <Card className="space-y-4 border-[#d4cfc8] bg-white/82">
        <h2 className="inline-flex items-center gap-2 font-caveat text-4xl text-[#4d3a3f]">
          <UserRound className="h-6 w-6" />
          Profile Information
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">Username</label>
            <TextInput value={user?.username ?? ""} readOnly className="bg-[#f3f1ee] text-[#75656a]" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">Display Name</label>
            <TextInput value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">Email</label>
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">
              Current Password (required if email changes)
            </label>
            <TextInput
              type="password"
              value={profileCurrentPassword}
              onChange={(event) => setProfileCurrentPassword(event.target.value)}
              placeholder="Current password"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          className="h-11 rounded-xl text-lg"
          onClick={() => void handleSaveProfile()}
          disabled={savingProfile}
        >
          <Save className="h-4 w-4" />
          {savingProfile ? "Saving..." : "Save Profile"}
        </Button>
      </Card>

      <Modal open={cropModalOpen} title="Crop Profile Photo" onClose={handleCloseCropModal}>
        {avatarSource && avatarRenderState && (
          <div className="space-y-3">
            <div className="mx-auto w-fit rounded-2xl border border-[#d4ccc4] bg-[#f0ece8] p-2">
              <div
                className="relative overflow-hidden rounded-xl border border-[#c2b8ae] bg-[#ddd7d1] touch-none"
                style={{ width: CROP_FRAME_SIZE, height: CROP_FRAME_SIZE }}
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerEnd}
                onPointerCancel={handleCropPointerEnd}
              >
                <img
                  src={avatarSource.src}
                  alt="Avatar crop source"
                  draggable={false}
                  className="pointer-events-none absolute select-none"
                  style={{
                    width: avatarRenderState.width,
                    height: avatarRenderState.height,
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                  }}
                />

                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-1/3 border-t border-white/60" />
                  <div className="absolute inset-x-0 top-2/3 border-t border-white/60" />
                  <div className="absolute inset-y-0 left-1/3 border-l border-white/60" />
                  <div className="absolute inset-y-0 left-2/3 border-l border-white/60" />
                  <div className="absolute inset-0 ring-2 ring-white/80" />
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-[#6f5d64]">
              Drag foto untuk atur area yang ingin ditampilkan.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">
                Zoom ({Math.round(cropZoom * 100)}%)
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={cropZoom}
                onChange={(event) => setCropZoom(Number(event.target.value))}
                className="h-2 w-full accent-[#7f8fbe]"
                aria-label="Zoom avatar crop"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="ghost" className="h-11 rounded-xl text-lg" onClick={handleCloseCropModal} disabled={savingAvatar}>
                Cancel
              </Button>
              <Button className="h-11 rounded-xl text-lg" onClick={() => void handleSaveAvatarCrop()} disabled={savingAvatar}>
                {savingAvatar ? "Saving..." : "Apply & Save"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Card className="space-y-4 border-[#d4cfc8] bg-white/82">
        <h2 className="inline-flex items-center gap-2 font-caveat text-4xl text-[#4d3a3f]">
          <LockKeyhole className="h-6 w-6" />
          Change Password
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">Current Password</label>
            <TextInput
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">New Password</label>
            <TextInput
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#705f66]">Confirm New Password</label>
            <TextInput
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        <Button
          variant="secondary"
          className="h-11 rounded-xl text-lg"
          onClick={() => void handleChangePassword()}
          disabled={savingPassword}
        >
          <LockKeyhole className="h-4 w-4" />
          {savingPassword ? "Updating..." : "Update Password"}
        </Button>
      </Card>

      <Card className="space-y-3 border-[#dec9c9] bg-[#fff7f7]">
        <h2 className="font-caveat text-4xl text-[#8b3d3d]">Session</h2>
        <p className="text-sm text-[#7e4b4b]">Keluar dari akun ini di perangkat sekarang.</p>
        <Button
          variant="danger"
          className="h-11 rounded-xl text-lg"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Logging out..." : "Log Out"}
        </Button>
      </Card>
    </div>
  );
};
