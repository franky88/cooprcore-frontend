import type { Config } from "tailwindcss";

const config: Config = {
  // ... your existing config
  theme: {
    extend: {
      // ... your existing extensions
      animation: {
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
};

export default config;