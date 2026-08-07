"use client";

import dynamic from "next/dynamic";
import { ProfilePageLoading } from "./ProfilePageLoading";

const ProfileHubView = dynamic(() => import("./ProfileHubView"), {
  ssr: false,
  loading: () => <ProfilePageLoading />,
});

export function ProfileHubClient() {
  return <ProfileHubView />;
}
