import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ unitId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId } = await params;
  const data = await db.query.units.findFirst({
    where: eq(units.id, Number(unitId)),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ unitId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId } = await params;
  const body = await req.json();
  const data = await db
    .update(units)
    .set({ ...body })
    .where(eq(units.id, Number(unitId)))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ unitId: string }> }
) => {
  if (!getIsAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId } = await params;
  const data = await db
    .delete(units)
    .where(eq(units.id, Number(unitId)))
    .returning();

  return NextResponse.json(data[0]);
};
