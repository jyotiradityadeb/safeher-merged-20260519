export type AppTheme = {
  background: string;
  surface: string;
  card: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  subtext: string;
  primary: string;
  danger: string;
  success: string;
  warning: string;
  border: string;
  inputBackground: string;
  buttonText: string;
  shadow: string;
  modalOverlay: string;
  emergencySurface: string;
  emergencyText: string;
  emergencyMuted: string;
  healthGreenBackground: string;
  healthGreenBorder: string;
  healthYellowBackground: string;
  healthYellowBorder: string;
  healthRedBackground: string;
  healthRedBorder: string;
};

export const lightTheme: AppTheme = {
  background: "#fff7f8",
  surface: "#ffffff",
  card: "#ffffff",
  cardAlt: "#fff1f2",
  text: "#111827",
  textMuted: "#64748b",
  subtext: "#64748b",
  primary: "#e11d48",
  danger: "#dc2626",
  success: "#059669",
  warning: "#b45309",
  border: "#fecdd3",
  inputBackground: "#ffffff",
  buttonText: "#ffffff",
  shadow: "rgba(15, 23, 42, 0.14)",
  modalOverlay: "rgba(69, 10, 10, 0.36)",
  emergencySurface: "#fff1f2",
  emergencyText: "#7f1d1d",
  emergencyMuted: "#991b1b",
  healthGreenBackground: "#dcfce7",
  healthGreenBorder: "#22c55e",
  healthYellowBackground: "#fef3c7",
  healthYellowBorder: "#f59e0b",
  healthRedBackground: "#fee2e2",
  healthRedBorder: "#ef4444",
};

export const darkTheme: AppTheme = {
  background: "#0f172a",
  surface: "#111827",
  card: "#111827",
  cardAlt: "#1f2937",
  text: "#f9fafb",
  textMuted: "#cbd5e1",
  subtext: "#cbd5e1",
  primary: "#fb7185",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#fbbf24",
  border: "#334155",
  inputBackground: "#111827",
  buttonText: "#ffffff",
  shadow: "rgba(0, 0, 0, 0.36)",
  modalOverlay: "rgba(0, 0, 0, 0.58)",
  emergencySurface: "#3f1d1d",
  emergencyText: "#fee2e2",
  emergencyMuted: "#fecaca",
  healthGreenBackground: "#14532d",
  healthGreenBorder: "#22c55e",
  healthYellowBackground: "#78350f",
  healthYellowBorder: "#f59e0b",
  healthRedBackground: "#7f1d1d",
  healthRedBorder: "#ef4444",
};

export const colors = darkTheme;
