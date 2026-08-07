import { NextRequest, NextResponse } from "next/server";
import { fetchListedInfo, fetchDailyQuotes, fetchStatements } from "@/lib/jquants";

// 使い方: /api/stock?code=7203  (例: トヨタ自動車)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "code パラメータが必要です (例: ?code=7203)" },
      { status: 400 }
    );
  }

  try {
    const [listed, quotes, statements] = await Promise.all([
      fetchListedInfo(code),
      fetchDailyQuotes(code),
      fetchStatements(code),
    ]);

    return NextResponse.json({ listed, quotes, statements });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "データ取得に失敗しました" },
      { status: 500 }
    );
  }
}
