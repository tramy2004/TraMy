"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { loginApi } from "@/api/authApi";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await loginApi({ email, password });

      // ⚡ lưu token
      localStorage.setItem("token", res.data.token);

      toast.success("Login thành công 🔥");

      // 👉 redirect theo role
      if (res.data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      // reload để fetch user
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login thất bại ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login với tài khoản của bạn</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              {/* SOCIAL LOGIN (fake) */}
              <Field>
                <Button variant="outline" type="button">
                  Login with Apple
                </Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
              </Field>

              <FieldSeparator>Or continue with</FieldSeparator>

              {/* EMAIL */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              {/* PASSWORD */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel>Password</FieldLabel>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              {/* SUBMIT */}
              <Field>
                <Button disabled={loading} className="w-full">
                  {loading ? "Đang đăng nhập..." : "Login"}
                </Button>

                <FieldDescription className="text-center">
                  Chưa có tài khoản? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our Terms & Privacy.
      </FieldDescription>
    </div>
  );
}
