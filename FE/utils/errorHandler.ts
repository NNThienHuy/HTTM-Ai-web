import { NextResponse } from "next/server";
import { ZodError } from "zod"; 

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

/**
 * Hàm xử lý lỗi tập trung cho các API route
 * @param error L
 * @returns 
 */
export const handleApiError = (error: unknown): NextResponse => {
  console.error("[API Error]:", error);

  if (error instanceof AppError) {
    return new NextResponse(
      JSON.stringify({ message: error.message }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (error instanceof ZodError) {
    return new NextResponse(
      JSON.stringify({
        message: "Validation failed",
        errors: error.flatten().fieldErrors, 
      }),
      {
        status: 400, 
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new NextResponse(
    JSON.stringify({ message: "An unexpected internal server error occurred" }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
};