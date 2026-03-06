/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--background))",

        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--foreground))",

        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",

        // Electric blue accent (replaces amber)
        accent: "hsl(var(--accent))",
        "accent-light": "hsl(var(--accent-light))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        "accent-muted": "hsl(var(--accent-muted))",

        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--foreground))",

        // Keep amber aliases mapped to blue for backwards compat
        amber: "hsl(var(--accent))",
        "amber-light": "hsl(var(--accent-light))",
        "amber-foreground": "hsl(var(--accent-foreground))",
        "amber-muted": "hsl(var(--accent-muted))",

        card: "hsl(var(--card))",
        "card-border": "hsl(var(--card-border))",
      },
    },
  },
  plugins: [],
};