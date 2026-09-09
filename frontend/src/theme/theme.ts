import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#8B6F61",
      light: "#B89C8C",
      dark: "#665047",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#9A8FB8",
      light: "#C8BFDA",
      dark: "#6F668A",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#F8F4F0",
      paper: "#FFFDFC",
    },

    text: {
      primary: "#302B29",
      secondary: "#756D69",
    },

    success: {
      main: "#739B82",
      light: "#DDEBE2",
      dark: "#52745F",
      contrastText: "#FFFFFF",
    },

    warning: {
      main: "#C4955A",
      light: "#F4E8D5",
      dark: "#956B37",
      contrastText: "#FFFFFF",
    },

    error: {
      main: "#B96F70",
      light: "#F3DDDD",
      dark: "#8E4F50",
      contrastText: "#FFFFFF",
    },

    divider: "#E8DED7",
  },

  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',

    h1: {
      fontWeight: 750,
      letterSpacing: "-0.04em",
      lineHeight: 1.08,
    },

    h2: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },

    h3: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },

    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 650,
    },

    button: {
      textTransform: "none",
      fontWeight: 650,
    },
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },

    MuiTextField: {
    defaultProps: {
        size: "small",
    },

    styleOverrides: {
        root: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#FFFDFC",

            "& fieldset": {
            borderColor: "#E4D8D0",
            },

            "&:hover fieldset": {
            borderColor: "#C7B1A4",
            },

            "&.Mui-focused fieldset": {
            borderWidth: 1.5,
            borderColor: "#8B6F61",
            },
        },

        "& .MuiInputLabel-root.Mui-focused": {
            color: "#8B6F61",
        },
        },
    },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid #E8DED7",
          boxShadow: "0 10px 35px rgba(72, 56, 47, 0.07)",
          backgroundImage: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;