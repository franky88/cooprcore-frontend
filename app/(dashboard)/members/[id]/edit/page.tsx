"use client";

import { use } from "react";
import EditMemberForm from "@/components/members/EditMemberForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditMemberPage({ params }: Props) {
  const { id } = use(params);
  return <EditMemberForm memberId={id} />;
}