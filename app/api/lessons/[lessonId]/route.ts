import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, Number(lessonId)),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const body = await req.json();
  const data = await db
    .update(lessons)
    .set({ ...body })
    .where(eq(lessons.id, Number(lessonId)))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const data = await db
    .delete(lessons)
    .where(eq(lessons.id, Number(lessonId)))
    .returning();

  return NextResponse.json(data[0]);
};
