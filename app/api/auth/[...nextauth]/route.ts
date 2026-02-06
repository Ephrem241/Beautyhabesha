import NextAuth from "next-auth";
import { NextResponse } from "next/server";

async function makeHandler() {
	const mod = await import("@/lib/auth");
	return NextAuth(mod.authOptions);
}

export async function GET(request: Request) {
	try {
		const handler = await makeHandler();
		return handler(request as any);
	} catch (err) {
		console.error("NextAuth GET handler error:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const handler = await makeHandler();
		return handler(request as any);
	} catch (err) {
		console.error("NextAuth POST handler error:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
