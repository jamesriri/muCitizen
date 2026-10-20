import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiPayload {
  static ok<T>(data: T, message?: string, meta?: ApiResponse<T>["meta"]) {
    return NextResponse.json<ApiResponse<T>>(
      {
        success: true,
        message,
        data,
        meta,
      },
      { status: 200 },
    );
  }

  static created<T>(
    data: T,
    message: string = "Resource created successfully",
  ) {
    return NextResponse.json<ApiResponse<T>>(
      {
        success: true,
        message,
        data,
      },
      { status: 201 },
    );
  }

  static badRequest(
    message: string = "Bad Request",
    errors?: Record<string, string[]> | string,
  ) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message,
        errors,
      },
      { status: 400 },
    );
  }

  static unauthorized(message: string = "Unauthorized access") {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message,
      },
      { status: 401 },
    );
  }

  static forbidden(message: string = "Forbidden resource") {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message,
      },
      { status: 403 },
    );
  }

  static notFound(message: string = "Resource not found") {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message,
      },
      { status: 404 },
    );
  }

  static internalError(message: string = "Internal server error") {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
