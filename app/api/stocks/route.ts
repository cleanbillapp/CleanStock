import { NextRequest, NextResponse } from "next/server";
import { fetchListedInfo, fetchDailyQuotes } from "@/lib/jquants";

// 使い方: /api/stocks?codes=7203,6758,9984
export async function GET(req: NextRequest) {
  const codesParam = req.nextUrl.searchParams.get("codes");

  if (!codesParam) {
    return NextResponse.json(
      { error: "codes パラメータが必要です (例: ?codes=7203,6758)" },
      { status: 400 }
    );
  }

  const codes = codesParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 20);

  const results = await Promise.all(
    codes.map(async (code) => {
      try {
        const [listed, quotes] = await Promise.all([
          fetchListedInfo(code),
          fetchDailyQuotes(code),
        ]);

        const companyInfo = listed?.data?.[0];
        const quotesList = quotes?.data ?? [];
        const latestQuote = quotesList[quotesList.length - 1];

        return {
          code,
          companyName: companyInfo?.CoNameEn ?? companyInfo?.CoName ?? null,
          date: latestQuote?.Date ?? null,
          close: latestQuote?.C ?? null,
          open: latestQuote?.O ?? null,
          high: latestQuote?.H ?? null,
          low: latestQuote?.L ?? null,
          volume: latestQuote?.Vo ?? null,
          error: null,
        };
      } catch (err: any) {
        return {
          code,
          companyName: null,
          date: null,
          close: null,
          open: null,
          high: null,
          low: null,
          volume: null,
          error: err.message ?? "取得に失敗しました",
        };
      }
    })
  );

  return NextResponse.json({ results });
}
