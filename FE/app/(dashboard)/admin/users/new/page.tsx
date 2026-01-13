"use client";
import { DashboardSidebar } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { apiClient } from "@/lib/api";

const DashboardCreateNewUser = () => {
  // 1. Cập nhật State: Thêm 'name' và sửa default role thành 'customer'
  const [userInput, setUserInput] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  }>({
    name: "",
    email: "",
    password: "",
    role: "customer", // Backend chỉ nhận 'admin' hoặc 'customer'
  });

  const addNewUser = async () => {
    // Validate cơ bản
    if (userInput.name === "" || userInput.email === "" || userInput.password === "") {
      toast.error("Vui lòng điền đầy đủ thông tin (Tên, Email, Mật khẩu)");
      return;
    }

    if (!isValidEmailAddressFormat(userInput.email)) {
      toast.error("Định dạng Email không hợp lệ");
      return;
    }

    if (userInput.password.length <= 6) { // Backend yêu cầu min:6
      toast.error("Mật khẩu phải dài hơn 6 ký tự");
      return;
    }

    // Sanitize dữ liệu
    const sanitizedUserInput = sanitizeFormData(userInput);

    try {
      // 2. Gọi API: Gửi đúng cấu trúc JSON object mà Axios/ApiClient mong đợi
      // Backend mong đợi: { name, email, password, role }
      const response = await apiClient.post("/api/admin/users", {
        name: sanitizedUserInput.name,
        email: sanitizedUserInput.email,
        password: sanitizedUserInput.password,
        role: sanitizedUserInput.role,
      });

      // Nếu apiClient cấu hình trả về data trực tiếp thì bỏ qua bước check status, 
      // nhưng nếu trả về full response object thì check status như sau:
      if (response.status === 201 || response.data?.success) {
        toast.success("Tạo tài khoản thành công!");
        // Reset form
        setUserInput({
          name: "",
          email: "",
          password: "",
          role: "customer",
        });
      }
    } catch (error: any) {
      // Xử lý lỗi từ Backend trả về (ví dụ: Email trùng)
      const message = error?.response?.data?.message || "Lỗi khi tạo tài khoản";
      toast.error(message);
      console.error(error);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:pl-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Add new user</h1>
        
        {/* 3. Thêm Input Field cho Name */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Full Name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={userInput.name}
              placeholder=""
              onChange={(e) =>
                setUserInput({ ...userInput, name: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Email:</span>
            </div>
            <input
              type="email"
              className="input input-bordered w-full max-w-xs"
              value={userInput.email}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Password:</span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full max-w-xs"
              value={userInput.password}
              onChange={(e) =>
                setUserInput({ ...userInput, password: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">User role: </span>
            </div>
            <select
              className="select select-bordered"
              value={userInput.role} // Dùng value để control component
              onChange={(e) =>
                setUserInput({ ...userInput, role: e.target.value })
              }
            >
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>

        <div className="flex gap-x-2">
          <button
            type="button"
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
            onClick={addNewUser}
          >
            Create user
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewUser;