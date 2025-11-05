import { NextResponse } from "next/server";
import {
  registrationSchema,
  sanitizeInput
} from "@/utils/validation"; 
import { handleApiError, AppError } from "@/utils/errorHandler"; 

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000/api/auth/register";

export const POST = async (request: Request) => {
  try {
    const body = await sanitizeInput.validateJsonInput(request);

    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { email, password, name } = validationResult.data; 

    const laravelResponse = await fetch(LARAVEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: name, 
        email: email,
        password: password,
        password_confirmation: password, 
      }),
    });

    const data = await laravelResponse.json();


    if (!laravelResponse.ok) {

      const errorMessage = data.message || "Lỗi đăng ký từ backend";
      throw new AppError(errorMessage, laravelResponse.status);
    }

    return new NextResponse(
      JSON.stringify({ 
        message: "Đăng ký thành công!",
        data: data, 
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    
    return handleApiError(error);
  }
};