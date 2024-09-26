import { DB, readDB, writeDB, Database, Payload } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export const GET = async (request: NextRequest) => {
  readDB();
  const roomId = request.nextUrl.searchParams.get('roomId');
  const rooms = (<Database>DB).rooms.find((room) => room.roomId === roomId);

  if (!rooms) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const result = [];
  for (const message of (<Database>DB).messages)
    if (message.roomId === roomId) result.push(message);
  return NextResponse.json({
    ok: true,
    messages: result,
  });
};

export const POST = async (request: NextRequest) => {
  readDB();
  const body = await request.json();
  const {roomId , messageText} = body;
  const room = (<Database>DB).rooms.find((room) => room.roomId === roomId);
  if (!room) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();
  (<Database>DB).messages.push({
    roomId,
    messageId,
    messageText,
  });

  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();
  const body = await request.json();
  const { messageId } = body;
  // const message = (<Database>DB).messages.find((message) => message.messageId === messageId);

  const headersData = headers();
  if (!headersData) return null;
  const rawAuthHeader = headersData.get("authorization");
  if (!rawAuthHeader) return null;
  const token = rawAuthHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET || "This is another secret";

  //preparing "role" variable for reading role information from token
  let role = null;

  try {
    const payload =  jwt.verify(token, secret);
    role = (<Payload>payload).role;
  } catch {
    return null;
  }
  
  if(payload === null || (<Payload>payload).role !== "SUPER_ADMIN"){
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();
  const index = (<Database>DB).messages.find((message) => message.messageId === messageId);

  if(!index){
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }

  (<Database>DB).messages = (<Database>DB).messages.filter((message) => message.messageId !== messageId);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
