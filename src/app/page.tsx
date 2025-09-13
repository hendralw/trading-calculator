"use client";
import React from "react";

export default function Page() {
  return <TradingCalculator />;
}

// ==== Komponenmu di bawah ini (boleh ditempatkan di file terpisah juga) ====
import { useMemo, useState } from "react";
//test commit
function TradingCalculator() {
  const [balance, setBalance] = useState(100);
  const [riskPct, setRiskPct] = useState(2);
  const [entry, setEntry] = useState(0.0065);
  const [stop, setStop] = useState(0.0060);
  const [tp, setTp] = useState(0.009);
  const [direction, setDirection] = useState<"long" | "short">("long");

  const fmt = (n: number) => {
    if (Number.isNaN(n) || !Number.isFinite(n)) return "-";
    const abs = Math.abs(n);
    const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: Math.min(4, digits),
      maximumFractionDigits: digits,
    }).format(n);
  };

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const values = useMemo(() => {
    const B = toNum(balance);
    const Rpct = toNum(riskPct);
    const E = toNum(entry);
    const S = toNum(stop);
    const T = toNum(tp);

    const riskUSDT = (B * Rpct) / 100;

    const slDist = Math.abs(E - S);
    const posSize = slDist > 0 ? riskUSDT / slDist : NaN;
    const notional = posSize * E;

    const M = riskUSDT;
    const levNeeded = M > 0 ? notional / M : NaN;

    let rrValue = NaN as number;
    let rrDisplay: string | null = null;
    if (T && E && S && T !== E) {
      rrValue = Math.abs(Math.abs(T - E) / Math.abs(E - S));
      rrDisplay = `1 : ${fmt(rrValue)}`;
    }

    const movePerCoin = direction === "long" ? T - E : E - T;
    const pnlAtTp = posSize * movePerCoin;

    const ddPctAuto = E > 0 ? (Math.abs(E - S) / E) * 100 : NaN;
    const levFromDd = ddPctAuto > 0 ? 100 / ddPctAuto : NaN;

    return {
      riskUSDT,
      slDist,
      posSize,
      notional,
      levNeeded,
      rrDisplay,
      rrValue,
      pnlAtTp,
      ddPctAuto,
      levFromDd,
    };
  }, [balance, riskPct, entry, stop, tp, direction]);

  const Stat = ({
    label,
    value,
    sub,
    color,
  }: {
    label: string;
    value: React.ReactNode;
    sub?: string | null;
    color?: string;
  }) => (
    <div
      className={`p-4 rounded-2xl border bg-white shadow-sm ${
        color || "border-gray-200"
      }`}
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-400 mt-1">{sub}</div> : null}
    </div>
  );

  const rrColor = (() => {
    if (!values.rrValue || Number.isNaN(values.rrValue)) return "border-gray-200";
    if (values.rrValue > 2) return "border-green-400";
    if (values.rrValue >= 1) return "border-yellow-400";
    return "border-red-400";
  })();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Position Sizing Calculator · Crypto Futures
          </h1>
          <p className="text-gray-600 mt-1">
            Hitung size, notional, dan leverage yang pas dari{" "}
            <span className="font-medium">Entry</span> &{" "}
            <span className="font-medium">Stop Loss</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Input</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Account Balance (USDT)</span>
                <input
                  type="number"
                  step="0.01"
                  className="tw-input"
                  value={balance}
                  onChange={(e) => setBalance(toNum(e.target.value))}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Risk per Trade (%)</span>
                <input
                  type="number"
                  step="0.1"
                  className="tw-input"
                  value={riskPct}
                  onChange={(e) => setRiskPct(toNum(e.target.value))}
                />
              </label>

              <div className="flex items-end gap-3">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-sm text-gray-600">Direction</span>
                  <select
                    className="tw-input"
                    value={direction}
                    onChange={(e) =>
                      setDirection(e.target.value as "long" | "short")
                    }
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Entry Price</span>
                <input
                  type="number"
                  step="0.0000001"
                  className="tw-input"
                  value={entry}
                  onChange={(e) => setEntry(toNum(e.target.value))}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Stop Loss Price</span>
                <input
                  type="number"
                  step="0.0000001"
                  className="tw-input"
                  value={stop}
                  onChange={(e) => setStop(toNum(e.target.value))}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Take Profit (optional)</span>
                <input
                  type="number"
                  step="0.0000001"
                  className="tw-input"
                  value={tp}
                  onChange={(e) => setTp(toNum(e.target.value))}
                />
              </label>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-sm text-gray-700">
              <p className="mb-1">Formulas:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Risk(USDT) = Balance × Risk% / 100</li>
                <li>SL Distance = |Entry − Stop|</li>
                <li>Drawdown% = |Entry − Stop| / Entry × 100</li>
                <li>Position Size(coin) = Risk / SL Distance</li>
                <li>Notional(USDT) = Position Size × Entry</li>
                <li>Margin Used = Risk(USDT)</li>
                <li>Leverage Needed = Notional / MarginUsed</li>
                <li>Leverage from Drawdown = 100 / Drawdown%</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Stat label="Risk (USDT)" value={`$ ${fmt(values.riskUSDT)}`} sub="Jumlah rugi maksimal sesuai Risk%" />
            <Stat label="SL Distance" value={fmt(values.slDist)} sub="Jarak Entry ↔ Stop" />
            <Stat label="Drawdown % (auto)" value={values.ddPctAuto ? `${fmt(values.ddPctAuto)}%` : "-"} sub="Persentase jarak Entry → SL" />
            <Stat label="Position Size (coin)" value={fmt(values.posSize)} sub="Jumlah coin/kontrak yang disarankan" />
            <Stat label="Notional Value (USDT)" value={`$ ${fmt(values.notional)}`} sub="Ukuran posisi sebenarnya" />
            <Stat label="Margin Used (auto)" value={`$ ${fmt(values.riskUSDT)}`} sub="Modal dialokasikan = Balance × Risk%" />
            <Stat label="Leverage Needed" value={fmt(values.levNeeded)} sub="Leverage minimum agar margin cukup" />
            <Stat label="Leverage from Drawdown" value={fmt(values.levFromDd)} sub="Leverage dihitung dari jarak Entry → SL" />
            <Stat label="Risk : Reward (if TP)" value={values.rrDisplay || "-"} sub="RR ditampilkan sebagai 1 : X" color={rrColor} />
            <Stat label="PnL at TP (USDT)" value={Number.isFinite(values.pnlAtTp) ? `$ ${fmt(values.pnlAtTp)}` : "-"} sub="Estimasi profit jika TP tercapai" />
          </div>
        </div>

        <footer className="mt-8 text-xs text-gray-500">
          <p>
            Catatan: Perhitungan ini tidak memasukkan biaya (fee) & pendanaan
            (funding). Rumus likuidasi bervariasi per exchange; leverage dari
            drawdown di sini adalah pendekatan kasar.
          </p>
        </footer>
      </div>
    </div>
  );
}