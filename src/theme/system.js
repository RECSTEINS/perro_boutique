import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Aquí definimos los colores, fuentes y estilos de La Perroboutique.
// Si quieres cambiar un color de toda la página, lo cambias aquí.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          purple: { value: "#6B2EAB" },
          purpleDark: { value: "#4A2C7A" },
          purpleSoft: { value: "#7B5BA8" },
          purpleLight: { value: "#F3E8FF" },
          mint: { value: "#6BCFB8" },
          mintLight: { value: "#D6F5EC" },
          pink: { value: "#EC4899" },
          pinkDark: { value: "#BE185D" },
          pinkLight: { value: "#FCE7F3" },
          yellow: { value: "#FBBF24" },
          yellowLight: { value: "#FEF3C7" },
          cream: { value: "#FFF9F0" },
        },
      },
      fonts: {
        heading: { value: `'Fredoka', system-ui, sans-serif` },
        body: { value: `'Quicksand', system-ui, sans-serif` },
      },
      radii: {
        pill: { value: "999px" },
        card: { value: "20px" },
      },
    },
  },
  globalCss: {
    "html, body": {
      backgroundColor: "#FFF9F0",
      color: "#6B2EAB",
      fontFamily: "'Quicksand', system-ui, sans-serif",
      fontWeight: "500",
    },
  },
});

export const system = createSystem(defaultConfig, config);
