import localFont from "next/font/local";

export const antonio = localFont({
  variable: "--font-anton",
  src: [
    { path: "../Antonio/Antonio-Thin.ttf", weight: "100", style: "normal" },
    { path: "../Antonio/Antonio-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../Antonio/Antonio-Light.ttf", weight: "300", style: "normal" },
    { path: "../Antonio/Antonio-Regular.ttf", weight: "400", style: "normal" },
    { path: "../Antonio/Antonio-Medium.ttf", weight: "500", style: "normal" },
    { path: "../Antonio/Antonio-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../Antonio/Antonio-Bold.ttf", weight: "700", style: "normal" }
  ]
});