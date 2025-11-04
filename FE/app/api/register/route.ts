import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import {
  registrationSchema,
  sanitizeInput,
  commonValidations
} from "@/utils/validation";


class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

const handleApiError = (error: unknown) => {
  if (error instanceof AppError) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: error.statusCode, headers: { "Content-Type": "application/json" } }
    );
  } else if (error instanceof Error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } else {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || 
                    request.headers.get("x-real-ip") || 
                    "unknown";

    if (!commonValidations.checkRateLimit(clientIP, 5, 15 * 60 * 1000)) {
      throw new AppError("Too many registration attempts. Please try again later.", 429);
    }

    const body = await sanitizeInput.validateJsonInput(request);

    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { email, password } = validationResult.data;

    const existingUser = await prisma.user.findFirst({ 
      where: { email } 
    });

    if (existingUser) {
      throw new AppError("Email is already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 14);

    const newUser = await prisma.user.create({
      data: {
        id: nanoid(),
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return new NextResponse(
      JSON.stringify({ 
        message: "User registered successfully",
        userId: newUser.id 
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
