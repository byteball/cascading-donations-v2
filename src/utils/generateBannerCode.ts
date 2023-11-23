import appConfig from "@/appConfig";

export const generateBannerCode = (fullName: string) => {
  return `[![Kivach](${appConfig.BACKEND_API_URL}/banner?repo=${fullName})](https://kivach.org/repo/${fullName})`;
}