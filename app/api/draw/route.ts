import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import { drawGrid } from "../../../lib/draw-server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const drawXTarget = formData.get("drawXTarget");
    const files = formData.getAll("files") as File[];
    const buffers = await Promise.all(
      files.map(async (file) => Buffer.from(await file.arrayBuffer()))
    );

    const gridImageBuffer = await drawGrid(
      buffers,
      parseInt(drawXTarget as string, 10)
    );
    const base64 = gridImageBuffer.toString("base64");
    return NextResponse.json({ status: "success", base64 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}
