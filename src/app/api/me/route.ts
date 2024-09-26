import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Thanakon Saokham",
    studentId: "660610761",
  });
};
