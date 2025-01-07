'use client'
import { useSession } from "next-auth/react";

export default function Order() {
	const {data: session, status} = useSession()

	console.log('session', session)
	console.log('status', status)
	return (
	  <>
		  <div className="flex flex-grow">customer</div>
	  </>
	);
  }