import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.stepstrong.app",
  appName: "StepStrong",
  webDir: "dist",
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f1117",
    },
  },
};

export default config;
