/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./context/**/*.{js,jsx,ts,tsx,mdx}",
    "./data/**/*.{js,jsx,ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        app: {
          sky: "#EAF6FF",
          skyDeep: "#CDEAFF",
          blue: "#87C1E8",
          sand: "#E9C98A",
          sandSoft: "#F6E7C5",
          slate: "#1F2937",
          muted: "#5F6B7A",
          border: "#CFE0ED",
          panel: "#FFFFFF"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"]
      },
      boxShadow: {
        card: "0 12px 30px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};
