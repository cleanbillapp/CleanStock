export default function GlossaryPage() {
  const items = [
    {
      name: "PER(株価収益率)",
      formula: "株価 ÷ EPS(1株当たり純利益)",
      desc: "株価が1株あたりの利益の何倍まで買われているかを示す。数値が低いほど「利益に対して株価が割安」とされるが、成長期待が高い会社は高めに出やすい。同業種内での比較が基本。",
    },
    {
      name: "予想PER",
      formula: "株価 ÷ 会社予想EPS",
      desc: "今期の実績ではなく、会社が発表している来期の業績予想をもとにしたPER。今後の成長見通しに対して株価が割安かどうかを見る指標。",
    },
    {
      name: "PBR(株価純資産倍率)",
      formula: "株価 ÷ BPS(1株当たり純資産)",
      desc: "株価が会社の純資産(解散した場合に株主に残る価値の目安)の何倍かを示す。1倍未満は「解散価値より株価が安い」状態とされる。",
    },
    {
      name: "ROE(自己資本利益率)",
      formula: "純利益 ÷ 自己資本 × 100",
      desc: "株主が出したお金(自己資本)を使って、どれだけ効率よく利益を生み出しているかを示す。高いほど資本効率が良い経営とされる。ただし借金(負債)が多い会社は数値が高く出やすい点に注意。",
    },
    {
      name: "ROA(総資産利益率)",
      formula: "純利益 ÷ 総資産 × 100",
      desc: "借金も含めた会社の資産全体を使って、どれだけ利益を生み出しているかを示す。ROEと違い、借金の多さに影響されにくいので、事業そのものの効率を見やすい。",
    },
    {
      name: "営業利益率",
      formula: "営業利益 ÷ 売上高 × 100",
      desc: "本業(商品やサービスの販売)でどれだけ効率よく稼げているかを示す。同業他社と比べることで、価格競争力やコスト管理力が見えてくる。",
    },
    {
      name: "純利益率",
      formula: "純利益 ÷ 売上高 × 100",
      desc: "税金や特別損益まで含めた最終的な儲けが、売上のうちどれくらいを占めるかを示す。",
    },
    {
      name: "自己資本比率",
      formula: "自己資本 ÷ 総資産 × 100",
      desc: "会社の資産のうち、借金に頼らず自己資本でまかなえている割合。高いほど財務が安定しているとされる一方、低すぎると倒産リスクが高まりやすい。業種によって適正水準は異なる。",
    },
  ];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <a
        href="/"
        style={{ color: "#58a6ff", fontSize: 14, textDecoration: "none" }}
      >
        ← 戻る
      </a>

      <h1 style={{ fontSize: 22, margin: "16px 0" }}>指標の見方</h1>

      <p style={{ color: "#8b949e", fontSize: 14, marginBottom: 24 }}>
        CleanStockで自動計算している指標の意味と計算式をまとめています。
        あくまで判断材料の一つであり、これらの数値だけで投資判断を行うことは推奨されません。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item) => (
          <section
            key={item.name}
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>{item.name}</h2>
            <p
              style={{
                fontFamily: "monospace",
                color: "#58a6ff",
                fontSize: 13,
                margin: "0 0 8px",
              }}
            >
              {item.formula}
            </p>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14 }}>
              {item.desc}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
