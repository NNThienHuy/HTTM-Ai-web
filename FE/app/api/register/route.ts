// import { NextResponse } from "next/server";
// import {
//   registrationSchema,
//   sanitizeInput
// } from "@/utils/validation";
// import { handleApiError } from "@/utils/errorHandler";

// const LARAVEL_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`;

// export const POST = async (request: Request) => {
//   try {
//     // 1. Lấy dữ liệu thô từ request
//     const body = await sanitizeInput.validateJsonInput(request);

//     // 2. Validate bằng Zod (Đảm bảo file validation.ts đã có username và full_name)
//     const validationResult = registrationSchema.safeParse(body);
    
//     if (!validationResult.success) {
//       // Nếu lỗi validate, trả về lỗi 400 kèm chi tiết từ Zod thay vì throw error 500
//       return NextResponse.json(validationResult.error.format(), { status: 400 });
//     }

//     // 3. Lấy dữ liệu đã sạch từ Zod
//     const { email, password, username, full_name, password_confirmation } = validationResult.data;

//     // 4. Gửi sang Laravel Backend
//     const laravelResponse = await fetch(LARAVEL_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json", // Bắt buộc để nhận lỗi Validation dạng JSON từ Laravel
//       },
//       body: JSON.stringify({
//         username,                     // Khớp AuthController.php
//         full_name,                    // Khớp AuthController.php
//         email,                        // Khớp AuthController.php
//         password,                     // Khớp AuthController.php
//         password_confirmation,        // Khớp rule 'confirmed'
//         phone: body.phone || null     // Khớp AuthController.php
//       }),
//     });

//     const data = await laravelResponse.json();

//     // 5. Xử lý phản hồi từ Laravel
//     if (!laravelResponse.ok) {
//       // Nếu Laravel báo lỗi (ví dụ: 422 trùng email), trả thẳng lỗi đó về FE
//       // KHÔNG sử dụng 'throw' ở đây để tránh bị nhảy vào catch lỗi 500
//       return NextResponse.json(data, { status: laravelResponse.status });
//     }

//     // 6. Thành công
//     return NextResponse.json({ 
//       message: "Đăng ký thành công!",
//       data: data,
//     }, { status: 200 });

//   } catch (error) {
//     // Chỉ nhảy vào đây nếu lỗi kết nối mạng hoặc crash server
//     return handleApiError(error);
//   }
// };
import { NextResponse } from "next/server";
import { registrationSchema, sanitizeInput } from "@/utils/validation";

const LARAVEL_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`;

export const POST = async (request: Request) => {
  try {
    const body = await sanitizeInput.validateJsonInput(request);
    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        errors: validationResult.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, password, username, full_name, password_confirmation } = validationResult.data;

    const laravelResponse = await fetch(LARAVEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        username,
        full_name,
        email,
        password,
        password_confirmation,
        phone: body.phone || null
      }),
    });

    const data = await laravelResponse.json();

    if (!laravelResponse.ok) {
      // Trả thẳng lỗi 422 từ Laravel về FE (Ví dụ: Trùng email)
      return NextResponse.json(data, { status: laravelResponse.status });
    }

    return NextResponse.json({ message: "Đăng ký thành công!", data }, { status: 200 });

  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json({ message: "Lỗi kết nối Server" }, { status: 500 });
  }
};