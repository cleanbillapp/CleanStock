// J-Quants API V2 との通信をまとめたヘルパー
// APIキーはVercelの環境変数(JQUANTS_API_KEY)から読み込みます

const BASE_URL = "https://api.jquants.com/v2";

function getApiKey(): string {
  const apiKey = process.env.JQUANTS_API_KEY;

  if (!apiKey) {
    throw new Error("JQUANTS_API_KEY が環境変数に設定されていません");
  }

  return apiKey;
}

// V2は5桁コード(末尾0付き)が必要。4桁で来たら自動変換する
function normalizeCode(code: string): string {
  return code.length === 4 ? `${code}0` : code;
}

async function callApi(path: string, params: Record<string, string> = {}) {
  const apiKey = getApiKey();
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`J-Quants API呼び出し失敗 (${path}): ${res.status}`);
  }

  return res.json();
}

// 上場銘柄情報(会社名など)を取得
export async function fetchListedInfo(code: string) {
  return callApi("/equities/master", { code: normalizeCode(code) });
}

// 株価四本値(始値・高値・安値・終値)を取得
export async function fetchDailyQuotes(code: string) {
  return callApi("/equities/bars/daily", { code: normalizeCode(code) });
}

// 財務情報(売上高・利益など)を取得
export async function fetchStatements(code: string) {
  return callApi("/fins/summary", { code: normalizeCode(code) });
}
