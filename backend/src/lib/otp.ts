import bcrypt from "bcryptjs";

export const generateOtpCode = () => {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
};

export const hashOtpCode = async (code: string) => {
  return bcrypt.hash(code, 10);
};

export const compareOtpCode = async (code: string, hash: string) => {
  return bcrypt.compare(code, hash);
};
