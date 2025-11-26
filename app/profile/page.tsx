"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import Image from "next/image";
import { useAppDispatch, type RootState } from "@/store";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import PersonIcon from "@/assets/webp/profile/person.webp";

// Lazy-load heavy profile sections to keep initial /profile chunk smaller
const ProfileSetting = dynamic(
  () => import("./profileComponents/ProfileSetting"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-white p-4 shadow-theme animate-pulse">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-48 rounded bg-gray-200" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

const SignatureSetting = dynamic(
  () => import("./profileComponents/SignatureSetting"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-white p-4 shadow-theme animate-pulse">
        <div className="mb-3 h-4 w-40 rounded bg-gray-200" />
        <div className="h-40 w-full rounded-xl bg-gray-200" />
      </div>
    ),
  }
);

const EmailSetting = dynamic(
  () => import("./profileComponents/EmailSetting"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-white p-4 shadow-theme animate-pulse">
        <div className="mb-3 h-4 w-32 rounded bg-gray-200" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-8 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

function Profile() {
  // Get user data from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: userProfile,
    loading: profileLoading,
    error: profileError,
  } = useSelector((state: RootState) => state.userProfile);
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const userRoles = Array.isArray(user?.role) ? user.role : [];

  const primaryRole =
    userRoles.length > 0
      ? userRoles[0].name
      : typeof user?.role === "string"
      ? user.role
      : "Member";
  const userAvatar = user?.avatar;

  return (
    <section className="profile-page">
      <div className="flex items-center gap-2 mb-5">
        <Image src={PersonIcon} alt="Peron Icon" width={32} height={32} />
        <span className="text-[28px] font-bold">Profile</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ProfileSetting
          profileLoading={profileLoading}
          userProfile={userProfile}
        />

        <SignatureSetting dispatch={dispatch} />

        <EmailSetting
          dispatch={dispatch}
          profileLoading={profileLoading}
          userProfile={userProfile}
        />
      </div>
    </section>
  );
}

export default Profile;
