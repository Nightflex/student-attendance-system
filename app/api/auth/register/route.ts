import { NextResponse } from 'next/server';
import { registerStudent } from '@/lib/auth/register';
import type { CreateStudentRequest } from '@/lib/types';

interface StudentError extends Error {
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateStudentRequest = await request.json();

    // --- 1. Server-Side Validation ---
    // Check for presence and basic format of required fields first.
    // It's important to check presence before trimming/type coercion.
    const requiredFields: (keyof CreateStudentRequest)[] = [
      'first_name', 'last_name', 'roll_number', 'email',
      'password', 'confirm_password', 'course_id',
      'semester', 'batch_year'
    ];

    for (const field of requiredFields) {
        // Check if field exists and is not an empty string after trimming.
        if (!body[field] || (typeof body[field] === 'string' && !(body[field] as string).trim())) {
            return NextResponse.json(
                { error: `Missing required field: ${field.replace('_', ' ')}` },
                { status: 400 } // Bad Request
            );
        }
        // For non-string fields that should be numbers, ensure they are numbers.
        // This check happens after confirming the field exists.
        if (['course_id', 'semester', 'batch_year'].includes(field)) {
            const numValue = Number(body[field]);
            if (isNaN(numValue) || numValue <= 0) {
                 return NextResponse.json(
                    { error: `Invalid value for ${field.replace('_', ' ')}.` },
                    { status: 400 }
                );
            }
             // Update the body with the parsed number to ensure consistency for the lib function.
             // Create a new object with the updated field to avoid type issues
             Object.assign(body, { [field]: numValue });
        }
    }

    // Specific validation rules
    const email = body.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
       return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (body.password !== body.confirm_password) {
       return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }
    if (body.password.length < 6) {
       return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Sanitize string fields before passing to library function
    // Although the lib function also trims, doing it here ensures clean data early.
    const sanitizedData: CreateStudentRequest = {
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        roll_number: body.roll_number.trim(),
        email: email,
        phone_number: body.phone_number?.trim() || "",
        password: body.password,
        confirm_password: body.confirm_password,
        course_id: Number(body.course_id),
        semester: Number(body.semester),
        batch_year: Number(body.batch_year),
    };

    // --- 2. Call Library Function ---
    const newStudent = await registerStudent(sanitizedData);

    // --- 3. Return Success Response ---
    return NextResponse.json(
      {
        success: true,
        student: {
            id: newStudent.student_id,
            name: newStudent.name,
            email: newStudent.email,
            roll_number: newStudent.roll_number,
        },
        message: 'Student registered successfully!',
      },
      { status: 201 }
    );

  } catch (error) {
    const err = error as StudentError;
    console.error("Student Registration API Error:", err);

    // --- 4. Handle Errors from Library Function ---
    if (err.message?.includes('already exists')) {
        return NextResponse.json(
            { error: err.message },
            { status: 409 }
        );
    }
    if (err.message?.includes('Failed to create student record')) {
         return NextResponse.json(
            { error: 'Registration failed. Please try again later.' },
            { status: 500 }
        );
    }

    // Generic error response for unexpected issues or other DB errors from lib
    return NextResponse.json(
      { error: err.message || 'Failed to register student due to a server error.' },
      { status: 500 }
    );
  }
}

// Explicitly disable other HTTP methods
export const GET = () => new Response('Method Not Allowed', { status: 405 });
export const PUT = () => new Response('Method Not Allowed', { status: 405 });
export const DELETE = () => new Response('Method Not Allowed', { status: 405 });