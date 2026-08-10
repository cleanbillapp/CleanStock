"use client";

import { useState, useEffect } from "react";

type ListItem = {
  code: string;
  companyName: string | null;
  date: string | null;
  close: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  error: string | null;
};

const FAVORITES_KEY = "cleanstock_favorites";

type Quote = { Date: string; C: number };

function PriceChart({ quotes }: { quotes: Quote[] }) {
  if (quotes.length < 2) return null;

  const width = 400;
  const height = 120;
  const padding = 8;

  const closes = quotes.map((q) => q.C);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const points = quotes.map((q, i) => {
    const x = padding + (i / (quotes.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((q.C - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const isUp = closes[closes.length - 1] >= closes[0];

  return (
    <div style={{ marginTop: 12 }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={isUp ? "#3fb950" : "#f85149"}
          strokeWidth={2}
        />
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#8b949e",
          marginTop: 4,
        }}
      >
        <span>{quotes[0].Date}</span>
        <span>{quotes[quotes.length - 1].Date}</span>
      </div>
    </div>
  );
}

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export default function Home() {
  // --- 単一銘柄検索(詳細表示) ---
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // --- お気に入り ---
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favData, setFavData] = useState<ListItem[] | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  async function loadFavoriteQuotes(codes: string[]) {
    if (codes.length === 0) {
      setFavData([]);
      return;
    }
    setFavLoading(true);
    setFavError(null);
    try {
      const res = await fetch(
        `/api/stocks?codes=${encodeURIComponent(codes.join(","))}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取得に失敗しました");
      setFavData(data.results);
    } catch (err: any) {
      setFavError(err.message);
    } finally {
      setFavLoading(false);
    }
  }

  useEffect(() => {
    if (favorites.length > 0) {
      loadFavoriteQuotes(favorites);
    } else {
      setFavData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  function toggleFavorite(targetCode: string) {
    const next = favorites.includes(targetCode)
      ? favorites.filter((c) => c !== targetCode)
      : [...favorites, targetCode];
    setFavorites(next);
    saveFavorites(next);
  }

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

  const isFavorite = code && favorites.includes(code);

  // --- 複数銘柄の一覧表示 ---
  const [codesInput, setCodesInput] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [listResults, setListResults] = useState<ListItem[] | null>(null);

  async function handleListSearch() {
    if (!codesInput) return;
    setListLoading(true);
    setListError(null);
    setListResults(null);

    try {
      const res = await fetch(
        `/api/stocks?codes=${encodeURIComponent(codesInput)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "取得に失敗しました");
      }

      setListResults(data.results);
    } catch (err: any) {
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>CleanStock</h1>
        <svg
          viewBox="0 0 130 10"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: 140, height: 7, marginTop: -3 }}
        >
          <ellipse cx="65" cy="4.2" rx="8" ry="1.5" fill="#F4B400" />
          <polygon points="2,5 65,3.6 128,5 65,6.4" fill="#F4B400" />
        </svg>
      </div>
      <div style={{ marginTop: 6 }} />

      <a
        href="/glossary"
        style={{ color: "#58a6ff", fontSize: 13, textDecoration: "none" }}
      >
        指標の見方はこちら →
      </a>
      <div style={{ marginBottom: 16 }} />

      {/* お気に入り一覧 */}
      <h2 style={{ fontSize: 16, marginBottom: 8, color: "#8b949e" }}>
        お気に入り
      </h2>

      {favLoading && <p style={{ color: "#8b949e" }}>読み込み中...</p>}
      {favError && <p style={{ color: "#f85149" }}>{favError}</p>}

      {favorites.length === 0 && !favLoading ? (
        <p style={{ color: "#8b949e", marginBottom: 24 }}>
          まだお気に入りがありません。下の検索から銘柄を検索して★で登録できます。
        </p>
      ) : (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {(favData ?? []).map((item, i) => (
            <div
              key={item.code}
              style={{
                padding: 16,
                borderTop: i === 0 ? "none" : "1px solid #30363d",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {item.companyName ?? item.code}
                  <span style={{ color: "#8b949e", fontWeight: "normal" }}>
                    {" "}
                    ({item.code})
                  </span>
                </div>
                {item.error ? (
                  <p style={{ color: "#f85149", margin: 0 }}>{item.error}</p>
                ) : item.close ? (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
                    <span>終値: {item.close}</span>
                    <span>始値: {item.open}</span>
                    <span>高値: {item.high}</span>
                    <span>安値: {item.low}</span>
                  </div>
                ) : (
                  <p style={{ color: "#8b949e", margin: 0 }}>データなし</p>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(item.code)}
                aria-label="お気に入り解除"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#e3b341",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 単一銘柄検索 */}
      <h2 style={{ fontSize: 16, marginBottom: 8, color: "#8b949e" }}>
        銘柄検索
      </h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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

      {error && <p style={{ color: "#f85149", marginBottom: 16 }}>{error}</p>}

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: 18, margin: 0 }}>
                {companyName ?? code}
              </h3>
              <button
                onClick={() => toggleFavorite(code)}
                aria-label="お気に入り登録"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: isFavorite ? "#e3b341" : "#484f58",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ★
              </button>
            </div>

            {latestQuote ? (
              <>
                <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", lineHeight: 1.8 }}>
                  <li>日付: {latestQuote.Date}</li>
                  <li>終値: {latestQuote.C}</li>
                  <li>始値: {latestQuote.O}</li>
                  <li>高値: {latestQuote.H}</li>
                  <li>安値: {latestQuote.L}</li>
                  <li>出来高: {latestQuote.Vo}</li>
                </ul>
                <PriceChart quotes={quotesList} />
              </>
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
            <h3 style={{ fontSize: 18, marginTop: 0 }}>財務情報(直近開示)</h3>

            {latestStatement ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8 }}>
                <li>開示日: {latestStatement.DiscDate}</li>
                <li>売上高: {latestStatement.Sales}</li>
                <li>営業利益: {latestStatement.OP}</li>
                <li>純利益: {latestStatement.NP}</li>
                <li>EPS: {latestStatement.EPS}</li>
                {latestQuote?.C && latestStatement?.EPS && Number(latestStatement.EPS) > 0 ? (
                  <li>
                    PER: {(latestQuote.C / Number(latestStatement.EPS)).toFixed(2)}倍
                  </li>
                ) : null}
                {latestQuote?.C &&
                latestStatement?.Eq &&
                latestStatement?.ShOutFY &&
                Number(latestStatement.ShOutFY) > 0 ? (
                  <li>
                    PBR:{" "}
                    {(
                      latestQuote.C /
                      (Number(latestStatement.Eq) / Number(latestStatement.ShOutFY))
                    ).toFixed(2)}
                    倍
                  </li>
                ) : null}
                {latestStatement?.NP &&
                latestStatement?.Eq &&
                Number(latestStatement.Eq) > 0 ? (
                  <li>
                    ROE:{" "}
                    {((Number(latestStatement.NP) / Number(latestStatement.Eq)) * 100).toFixed(2)}
                    %
                  </li>
                ) : null}
                {latestStatement?.OP &&
                latestStatement?.Sales &&
                Number(latestStatement.Sales) > 0 ? (
                  <li>
                    営業利益率:{" "}
                    {((Number(latestStatement.OP) / Number(latestStatement.Sales)) * 100).toFixed(2)}
                    %
                  </li>
                ) : null}
                {latestStatement?.NP &&
                latestStatement?.Sales &&
                Number(latestStatement.Sales) > 0 ? (
                  <li>
                    純利益率:{" "}
                    {((Number(latestStatement.NP) / Number(latestStatement.Sales)) * 100).toFixed(2)}
                    %
                  </li>
                ) : null}
                {latestStatement?.NP &&
                latestStatement?.TA &&
                Number(latestStatement.TA) > 0 ? (
                  <li>
                    ROA:{" "}
                    {((Number(latestStatement.NP) / Number(latestStatement.TA)) * 100).toFixed(2)}
                    %
                  </li>
                ) : null}
                {latestStatement?.Eq &&
                latestStatement?.TA &&
                Number(latestStatement.TA) > 0 ? (
                  <li>
                    自己資本比率:{" "}
                    {((Number(latestStatement.Eq) / Number(latestStatement.TA)) * 100).toFixed(2)}
                    %
                  </li>
                ) : null}
                {latestQuote?.C &&
                latestStatement?.FEPS &&
                Number(latestStatement.FEPS) > 0 ? (
                  <li>
                    予想PER:{" "}
                    {(latestQuote.C / Number(latestStatement.FEPS)).toFixed(2)}
                    倍
                  </li>
                ) : null}
              </ul>
            ) : (
              <p>財務データがありません</p>
            )}
            {code && (
              <a
                href={`https://finance.yahoo.co.jp/quote/${code}.T/financials`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  color: "#58a6ff",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                決算短信・詳細な決算情報を見る →
              </a>
            )}
          </section>
        </div>
      )}

      {/* 複数銘柄の一覧表示 */}
      <h2 style={{ fontSize: 16, margin: "32px 0 8px", color: "#8b949e" }}>
        複数銘柄の一覧
      </h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={codesInput}
          onChange={(e) => setCodesInput(e.target.value)}
          placeholder="コードをカンマ区切り (例: 7203,6758,9984)"
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
          onClick={handleListSearch}
          disabled={listLoading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#238636",
            color: "white",
            fontSize: 16,
          }}
        >
          {listLoading ? "取得中..." : "一覧取得"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>
        一度に取得できるのは最大10銘柄です
      </p>

      {listError && (
        <p style={{ color: "#f85149", marginBottom: 16 }}>{listError}</p>
      )}

      {listResults && (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {listResults.map((item, i) => (
            <div
              key={item.code}
              style={{
                padding: 16,
                borderTop: i === 0 ? "none" : "1px solid #30363d",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {item.companyName ?? item.code}
                  <span style={{ color: "#8b949e", fontWeight: "normal" }}>
                    {" "}
                    ({item.code})
                  </span>
                </div>
                {item.error ? (
                  <p style={{ color: "#f85149", margin: 0 }}>{item.error}</p>
                ) : item.close ? (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
                    <span>終値: {item.close}</span>
                    <span>始値: {item.open}</span>
                    <span>高値: {item.high}</span>
                    <span>安値: {item.low}</span>
                  </div>
                ) : (
                  <p style={{ color: "#8b949e", margin: 0 }}>データなし</p>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(item.code)}
                aria-label="お気に入り登録"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: favorites.includes(item.code) ? "#e3b341" : "#484f58",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
