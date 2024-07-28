"use client";

import { UploadBody } from "@/components/upload/uploadbody";
import useAuthentication from "@/lib/hooks/useAuthentication";

export default function Upload() {
  useAuthentication();
  return <UploadBody />;
}
