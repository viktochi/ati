import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ challengeOptionId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeOptionId } = await params;
  const data = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, Number(challengeOptionId)),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ challengeOptionId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeOptionId } = await params;
  const body = await req.json();
  const data = await db
    .update(challengeOptions)
    .set({ ...body })
    .where(eq(challengeOptions.id, Number(challengeOptionId)))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ challengeOptionId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeOptionId } = await params;
  const data = await db
    .delete(challengeOptions)
    .where(eq(challengeOptions.id, Number(challengeOptionId)))
    .returning();

  return NextResponse.json(data[0]);
};
