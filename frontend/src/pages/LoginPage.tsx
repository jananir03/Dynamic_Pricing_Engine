import { useState, type FormEvent } from "react";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login(
        email.trim(),
        password,
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      const message =
        getApiErrorMessage(err);

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your pricing workspace."
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 430,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: 4,
            background:
              "linear-gradient(90deg, #B89C8C 0%, #9A8FB8 100%)",
          }}
        />

        <CardContent
          sx={{
            p: {
              xs: 3,
              sm: 3.5,
            },
          }}
        >
          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2.5,
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
              fullWidth
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              fullWidth
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              endIcon={
                isSubmitting ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <ArrowForwardRoundedIcon />
                )
              }
              sx={{
                mt: 0.75,
                minHeight: 46,
                borderRadius: 2.75,
                background:
                  "linear-gradient(135deg, #8B6F61 0%, #9A8FB8 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #7C6255 0%, #887EA5 100%)",
                },
              }}
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in"}
            </Button>

            <Divider
              sx={{
                my: 0.5,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                NEW HERE?
              </Typography>
            </Divider>

            <Box
              sx={{
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Don't have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() =>
                    navigate("/register")
                  }
                  sx={{
                    color: "primary.main",
                    fontWeight: 750,
                  }}
                >
                  Create one
                </Link>
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

function getApiErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to sign in. Please check your credentials and try again.";
}

export default LoginPage;