import { NextResponse } from "next/server";
import { renderPortfolioPdf } from "@/lib/pdf/portfolio";
import { getPortfolioBundle } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPortfolioBundle();
    const bytes = await renderPortfolioPdf(data);

    const filename = `${slugify(data.profile.full_name) || "portfolio"}-portfolio.pdf`;

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[portfolio-pdf]", error);
    return NextResponse.json(
      { error: "The PDF could not be generated. Please try again." },
      { status: 500 }
    );
  }
}
