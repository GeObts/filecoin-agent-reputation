import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "FARS - Filecoin Agent Reputation",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c4f8e14c7a8e0c7c9e8f3c7a3e5f3c7a", // Fallback project ID
  chains: [baseSepolia],
  ssr: true,
});
