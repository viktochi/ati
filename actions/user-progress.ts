"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";

const POINTS_TO_REFILL = 10;
export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    throw new Error("Unauthorized");
  }
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course is empty");
  }

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    });
    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }
  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImageSrc: user.imageUrl || "/mascot.svg",
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  // Debug logging
  console.log('=== REDUCE HEARTS DEBUG ===');
  console.log('User ID:', userId);
  console.log('Challenge ID:', challengeId);
  console.log('User has subscription:', !!userSubscription);
  console.log('Subscription isActive:', userSubscription?.isActive);
  console.log('Current hearts:', currentUserProgress?.hearts);

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;
  console.log('Is practice mode:', isPractice);

  if (isPractice) {
    console.log('Practice mode detected - returning early');
    return { error: "practice" };
  }

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  // This is the key check - if user has active subscription, don't reduce hearts
  if (userSubscription?.isActive) {
    console.log('User has active subscription - skipping heart reduction');
    revalidatePath("/learn");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  if (currentUserProgress.hearts === 0) {
    console.log('User has 0 hearts - showing hearts modal');
    return { error: "hearts" };
  }

  console.log('Reducing hearts from', currentUserProgress.hearts, 'to', Math.max(currentUserProgress.hearts - 1, 0));

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already full");
  }

  if (currentUserProgress.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points");
  }

  await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: currentUserProgress.points - POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
