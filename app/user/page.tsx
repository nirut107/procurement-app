'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Order() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
	console.log("status", status)
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  return (
    <>
      <div className="flex flex-grow">user</div>
    </>
  );
}
