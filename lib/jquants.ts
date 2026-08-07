// J-Quants APIとの認証・通信をまとめたヘルパー
// 認証情報はVercelの環境変数から読み込みます(コードには書きません)

const BASE_URL = "https://api.jquants.com/v1";

let cachedIdToken: string | null = null;
let cachedIdTokenExpiry = 0;

async function getRefreshToken(): Promise<string> {
  const mailaddress = process.env.JQUANTS_MAILADDRESS;
  const password = process.env.JQUANTS_PASSWORD;

  if (!mailaddress || !password) {
    throw new Error(
      "JQUANTS_MAILADDRESS / JQUANTS_PASSWORD が環境変数に設定されていません"
    );
  }

  const res = await fetch(`${BASE_URL}/token/auth_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mailaddress, password }),
  });

  if (!res.ok) {
    throw new Error(`リフレッシュトークン取得失敗: ${res.status}`);
  }

  const data = await res.json();
  return data.refreshToken;
}

async function getIdToken(): Promise<string> {
  // 有効期限内ならキャッシュを再利用(毎回ログインしない)
  if (cachedIdToken && Date.now() < cachedIdTokenExpiry) {
    return cachedIdToken;
  }

  const refreshToken = await getRefreshToken();

  const res = await fetch(
    `${BASE_URL}/token/auth_refresh?refreshtoken=${encodeURIComponent(
      refreshToken
    )}`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`IDトークン取得失敗: ${res.status}`);
  }

  const data = await res.json();
  cachedIdToken = data.idToken;
  // 安全のため23時間でキャッシュを切る(実際は24時間有効)
  cachedIdTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedIdToken as string;
}

async function callApi(path: string, params: Record<string, string> = {}) {
  const idToken = await getIdToken();
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) {
    throw new Error(`J-Quants API呼び出し失敗 (${path}): ${res.status}`);
  }

  return res.json();
}

// 上場銘柄一覧(銘柄コード・会社名など)を取得
export async function fetchListedInfo(code?: string) {
  return callApi("/listed/info", code ? { code } : {});
}

// 株価四本値(始値・高値・安値・終値)を取得
export async function fetchDailyQuotes(code: string) {
  return callApi("/prices/daily_quotes", { code });
}

// 財務情報(売上高・利益・PER関連の元データなど)を取得
export async function fetchStatements(code: string) {
  return callApi("/fins/statements", { code });
}
