"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      return toast.error("Mật khẩu không khớp ❌");
    }

    if (password.length < 8) {
      return toast.error("Password phải >= 8 ký tự");
    }

    setLoading(true);

    try {
      const res = await registerApi({
        name,
        email,
        password,
      });

      // ⚡ nếu BE trả token luôn
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);

        toast.success("Đăng ký thành công 🔥");

        navigate("/");
        window.location.reload();
      } else {
        // 👉 nếu không có token → chuyển login
        toast.success("Tạo tài khoản thành công, hãy đăng nhập");
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Signup thất bại ❌");
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
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Confirm</FieldLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <a href="/login" className="underline">
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
