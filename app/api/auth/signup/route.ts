import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { create } from "domain";

const prisma = new PrismaClient();

export async function POST(req: Request, res: Response) {
  try {
    const { name, email, password } = await req.json();
    if (!password || !email) {
      throw new Error("no password or email");
    }
    if (password.length == 0 || email.length == 0) {
      throw new Error("empty pasword or email");
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });
    return Response.json(newUser);
  } catch (error) {
    console.log(error);
    return NextResponse.rewrite(new URL('/user', req.url));
  }
}
