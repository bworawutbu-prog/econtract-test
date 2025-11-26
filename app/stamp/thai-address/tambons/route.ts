import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
	try {
		const filePath = path.join(process.cwd(), "store", "thaiAddressData", "thTambons.json");
		const fileContent = await fs.readFile(filePath, "utf8");
		const data = JSON.parse(fileContent);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: "Failed to load tambons" }, { status: 500 });
	}
} 