import { auth } from "@clerk/nextjs/server";

export const getIsAdmin = async () => {
  const { userId } = await auth();
  return userId === process.env.ADMIN_ID;
};
