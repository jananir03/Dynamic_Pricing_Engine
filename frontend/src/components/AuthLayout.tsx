import type { ReactNode } from "react";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 8% 12%, rgba(234, 223, 216, 0.75), transparent 28%), radial-gradient(circle at 92% 88%, rgba(229, 224, 237, 0.75), transparent 28%), #F8F4F0",
        py: {
          xs: 4,
          sm: 5,
        },
      }}
    >
      {/* Decorative circle */}
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: "#EADFD8",
          opacity: 0.22,
          top: -170,
          right: -100,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          backgroundColor: "#E5E0ED",
          opacity: 0.24,
          bottom: -130,
          left: -90,
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xs"
        sx={{
          position: "relative",
        }}
      >
        <Stack
          spacing={2.75}
          alignItems="center"
        >
          {/* Brand */}
          <Stack
            spacing={1.25}
            alignItems="center"
            sx={{
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "15px",
                display: "grid",
                placeItems: "center",
                color: "#FFFFFF",
                background:
                  "linear-gradient(135deg, #B89C8C 0%, #9A8FB8 100%)",
                boxShadow:
                  "0 10px 24px rgba(105, 82, 72, 0.15)",
              }}
            >
              <AutoAwesomeRoundedIcon />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                letterSpacing: "-0.01em",
              }}
            >
              PriceFlow
            </Typography>
          </Stack>

          {/* Heading */}
          <Box
            sx={{
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: {
                  xs: "1.9rem",
                  sm: "2.15rem",
                },
                lineHeight: 1.12,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.9,
                lineHeight: 1.6,
                maxWidth: 390,
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {children}
        </Stack>
      </Container>
    </Box>
  );
}

export default AuthLayout;