"use client";
import { CustomButton, SectionTitle } from "@/components";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/");
    }
  }, [sessionStatus, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const form = new FormData(e.currentTarget);
  const ho = String(form.get("name") || "").trim();        // input "Họ"
  const ten = String(form.get("lastname") || "").trim();    // input "Tên"
  const email = String(form.get("email") || "").trim();
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmpassword") || "");
  const accepted = (e.currentTarget as any)["remember-me"]?.checked === true;

  // --- FE ---
  if (!isValidEmail(email)) return toast.error("Email is invalid");
  if (!password || password.length < 8) return toast.error("Password is invalid");
  if (confirmPassword !== password) return toast.error("Passwords are not equal");
  if (!accepted) return toast.error("Bạn phải chấp nhận điều khoản");
  if (!username) return toast.error("Username là bắt buộc");
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
  return toast.error("Username chỉ gồm chữ/số/_ và 3-20 ký tự");

  // --- Laravel ---
  const payload = {
    name: `${ho} ${ten}`.trim(),
    email,
    username,
    password,
    password_confirmation: confirmPassword, 
    terms: accepted,                        
  };

    try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setError("");
      toast.success("Registration successful");
      router.push("/login");
      return;
    }

    if (data?.errors && typeof data.errors === "object") {
      const msg = Object.entries(data.errors)
        .map(([k, v]: any) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
        .join("\n");
      setError(msg);
      toast.error("Registration failed");
    } else if (data?.details && Array.isArray(data.details)) {
      const msg = data.details.map((d: any) => d.message).join(", ");
      setError(msg);
      toast.error(msg);
    } else {
      setError(data?.error || "Registration failed");
      toast.error(data?.error || "Registration failed");
    }
  } catch (err) {
    setError("Error, try again");
    toast.error("Error, try again");
    console.error(err);
  }
};

  if (sessionStatus === "loading") {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="bg-white">
      <SectionTitle title="Đăng Ký" path="Trang chủ | Đăng ký" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="flex justify-center flex-col items-center">
          <h2 className="mt-6 text-center text-2xl leading-9 tracking-tight text-gray-900">
            Đăng ký tài khoản mới
          </h2>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Họ
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Tên
                </label>
                <div className="mt-2">
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
              <label
    htmlFor="username"
    className="block text-sm font-medium leading-6 text-gray-900"
  >
    Username
  </label>
  <div className="mt-2">
    <input
      id="username"
      name="username"
      type="text"
      required
      autoComplete="username"
      placeholder="vd: hoang_123"
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    />
  </div>
  <p className="mt-1 text-xs text-gray-500">
    3–20 ký tự, chỉ chữ/số và dấu gạch dưới (_)
  </p>
</div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Mật khẩu
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmpassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="mt-2">
                  <input
                    id="confirmpassword"
                    name="confirmpassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-900"
                  >
                    Chấp nhận các điều khoản và chính sách bảo mật của chúng tôi
                  </label>
                </div>
              </div>

              <div>
                <CustomButton
                  buttonType="submit"
                  text="Đăng Ký"
                  paddingX={3}
                  paddingY={1.5}
                  customWidth="full"
                  textSize="sm"
                />

                <p className="text-red-600 text-center text-[16px] my-4">
                  {error && error}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
