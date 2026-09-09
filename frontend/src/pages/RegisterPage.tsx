import {
  useState,
  type FormEvent,
} from "react";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

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
import { registerUser } from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (username.trim().length < 3) {
      setError(
        "Username must contain at least 3 characters.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
        },
      });
    } catch (err) {
      setError(
        getApiErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your pricing workspace in a few simple steps."
    >
      <Card>
        <CardContent
          sx={{
            p: {
              xs: 3,
              sm: 4,
            },
          }}
        >
          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2.25}
          >
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Choose a username"
              required
              fullWidth
              autoComplete="username"
              helperText="At least 3 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
              }}
            />

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
              placeholder="Create a password"
              required
              fullWidth
              autoComplete="new-password"
              helperText="At least 8 characters"
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

            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Re-enter your password"
              required
              fullWidth
              autoComplete="new-password"
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
                mt: 1,
              }}
            >
              {isSubmitting
                ? "Creating account..."
                : "Create account"}
            </Button>

            <Divider sx={{ my: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                ALREADY REGISTERED?
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
                Already have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() =>
                    navigate("/login")
                  }
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                  }}
                >
                  Sign in
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

  return "Unable to create your account. Please try again.";
}

export default RegisterPage;