"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Đã chuẩn Sonner

import { registerApi } from "@/api/authApi";

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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 validate
    if (password !== confirmPassword) {
      return toast.warning("Mật khẩu không khớp ❌");
    }

    if (password.length < 8) {
      return toast.warning("Password phải từ 8 ký tự trở lên!");
    }

    setLoading(true);

    // 🔥 TẠO TOAST LOADING
    const toastId = toast.loading("⏳ Đang tạo tài khoản cho bạn...");

    try {
      const res = await registerApi({
        name,
        email,
        password,
      });

      // ⚡ nếu BE trả token luôn
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);

        // Cập nhật toast thành công
        toast.success("Đăng ký thành công! Đang tự động đăng nhập... 🔥", {
          id: toastId,
        });

        // Dùng setTimeout để user kịp đọc thông báo trước khi reload/chuyển trang
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      } else {
        // 👉 nếu không có token → chuyển trang login
        toast.success("Tạo tài khoản thành công! Hãy đăng nhập nhé", {
          id: toastId,
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (err: any) {
      // Cập nhật toast báo lỗi
      toast.error(err?.response?.data?.message || "Đăng ký thất bại ❌", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-xl hover:shadow-2xl transition">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your info to create account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup}>
            <FieldGroup>
              {/* NAME */}
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading} // Khóa khi loading
                  required
                />
              </Field>

              {/* EMAIL */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  disabled={loading} // Khóa khi loading
                  required
                />
              </Field>

              {/* PASSWORD */}
              <Field className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} // Khóa khi loading
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Confirm</FieldLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading} // Khóa khi loading
                    required
                  />
                </div>
              </Field>

              <FieldDescription>Must be at least 8 characters</FieldDescription>

              {/* SUBMIT */}
              <Field>
                <Button
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  {loading ? "Đang tạo..." : "Create Account"}
                </Button>

                <FieldDescription className="text-center">
                  Đã có tài khoản?{" "}
                  <a
                    href="/login"
                    className="underline hover:text-yellow-600 transition-colors"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to Terms & Privacy.
      </FieldDescription>
    </div>
  );
}
