import { DB, readDB, writeDB, Database } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: (<Database>DB).rooms,
    totalRooms: (<Database>DB).rooms.length,
  });
};

export const POST = async (request: NextRequest) => {
  const payload = checkToken();
  if(payload == null){
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();
  // check if room already exists
  const body = await request.json();
  const { rooms } = body;
  for (const room of rooms){
    if(room.name === body.name){
      return NextResponse.json(
        {
          ok: false,
          message: `Room ${body.name} already exists`,
        },
        { status: 400 }
      );
    }
  }
  

  // generate roomId
  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: `Room ${"replace this with room name"} already exists`,
  //   },
  //   { status: 400 }
  // );

  const roomId = nanoid();
  (<Database>DB).rooms.push({
    roomId: roomId,
    roomName: body.name,
  });

  //call writeDB after modifying Database
  writeDB();

  return NextResponse.json({
    ok: true,
    //roomId,
    message: `Room ${"replace this with room name"} has been created`,
  });
};
