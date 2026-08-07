import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CleanStock",
  description: "日本株ファンダメンタルズ表示アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#0d1117", color: "#e6edf3" }}>
        {children}
      </body>
    </html>
  );
}
