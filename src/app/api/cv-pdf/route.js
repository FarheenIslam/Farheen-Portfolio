import { NextResponse } from "next/server";
import { renderCvPdf } from "@/lib/pdf/cv";
import { getPortfolioBundle } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPortfolioBundle();
    const bytes = await renderCvPdf(data);

    const filename = `${slugify(data.profile.full_name) || "curriculum-vitae"}-cv.pdf`;

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[cv-pdf]", error);
    return NextResponse.json(
      { error: "The CV could not be generated. Please try again." },
      { status: 500 }
    );
  }
}
