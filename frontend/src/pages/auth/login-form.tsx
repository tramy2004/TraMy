"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Đã chuẩn Sonner

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

    // Bắt lỗi rỗng cơ bản trước khi gọi API
    if (!email || !password) {
      toast.warning("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    setLoading(true);

    // 🔥 NÂNG CẤP: Hiển thị toast xoay loading chờ API
    const toastId = toast.loading("⏳ Đang xác thực thông tin đăng nhập...");

    try {
      const res = await loginApi({ email, password });

      // ⚡ lưu token
      localStorage.setItem("token", res.data.token);

      // Cập nhật toast trạng thái thành công
      toast.success("Login thành công! Đang chuyển hướng... 🔥", {
        id: toastId,
      });

      // 👉 xác định route theo role
      const targetUrl = res.data.user?.role === "admin" ? "/admin" : "/";

      // 🔥 FIX LỖI: Đợi 1 giây để user kịp đọc thông báo toast, sau đó mới điều hướng và reload
      setTimeout(() => {
        navigate(targetUrl);
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      // Cập nhật toast trạng thái lỗi
      toast.error(
        err?.response?.data?.message || "Login thất bại. Vui lòng thử lại ❌",
        { id: toastId },
      );
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
                  disabled={loading} // Khoá input khi đang load
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
                  disabled={loading} // Khoá input khi đang load
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
