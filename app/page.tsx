"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleSearch() {
    if (!code) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/stock?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "取得に失敗しました");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const companyInfo = result?.listed?.data?.[0];
  const companyName = companyInfo?.CoNameEn ?? companyInfo?.CoName;

  const quotesList = result?.quotes?.data ?? [];
  const latestQuote = quotesList[quotesList.length - 1];

  const statementsList = result?.statements?.data ?? [];
  const latestStatement = statementsList[0];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>CleanStock</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="銘柄コード (例: 7203)"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #30363d",
            background: "#161b22",
            color: "#e6edf3",
            fontSize: 16,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#238636",
            color: "white",
            fontSize: 16,
          }}
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#f85149", marginBottom: 16 }}>{error}</p>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0 }}>
              {companyName ?? code}
            </h2>

            {latestQuote ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8 }}>
                <li>日付: {latestQuote.Date}</li>
                <li>終値: {latestQuote.C}</li>
                <li>始値: {latestQuote.O}</li>
                <li>高値: {latestQuote.H}</li>
                <li>安値: {latestQuote.L}</li>
                <li>出来高: {latestQuote.Vo}</li>
              </ul>
            ) : (
              <p>株価データがありません</p>
            )}
          </section>

          <section
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0 }}>財務情報(直近開示)</h2>

            {latestStatement ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8 }}>
                                <li>開示日: {latestStatement.DisclosedDate}</li>
                <li>売上高: {latestStatement.NetSales}</li>
                <li>営業利益: {latestStatement.OperatingProfit}</li>
                <li>純利益: {latestStatement.Profit}</li>
                <li>EPS: {latestStatement.EPS}</li>

              </ul>
            ) : (
              <p>財務データがありません</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
