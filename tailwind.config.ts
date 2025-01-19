import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
	  backgroundImage: {
		'glasses': "url('/glasses.jpg')",
		'register': "url('/register.jpg')",
		'galaxy':"url('/galaxy.jpg')",
      }
    },
  },
  plugins: [],
} satisfies Config;
