"use client";
import React from "react";

export default function Page() {
  return <TradingCalculator />;
}

import { useMemo, useState } from "react";

function TradingCalculator() {
  const [balance, setBalance] = useState(0);
  const [riskPct, setRiskPct] = useState(0);
  const [entry, setEntry] = useState(0);
  const [stop, setStop] = useState(0);
  const [tp, setTp] = useState(0);
  const [direction, setDirection] = useState< "long" | "short">("long");

  const fmt = (n: number) => {
    if (Number.isNaN(n) || !Number.isFinite(n)) return "-";
    const abs = Math.abs(n);
    const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
    const minFrac = Math.min(4, digits);

    const fmtOpts: Intl.NumberFormatOptions = {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: digits,
    };

    // Build parts to detect exact ".0000" (or locale-equivalent) output
    const nf = new Intl.NumberFormat(undefined, fmtOpts);
    const parts = nf.formatToParts(n);
    const fraction = parts.find((p) => p.type === "fraction")?.value;

    // If it would render as exactly four zeros after separator, show integer only
    if (fraction === "0000") {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
    }

    return nf.format(n);
  };

  const toNum = (v: number | string) => {
    const n = typeof v === "number" ? v : Number(v);
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
      className={`p-4 rounded-xl border-2 border-black shadow-[6px_6px_0_0_#000] ${
        color || "bg-white"
      }`}
    >
      <div className="text-sm text-black">{label}</div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
      {sub ? <div className="text-xs text-black/70 mt-1">{sub}</div> : null}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F6F6F6] text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-5 text-center">
          <h1 className="tw-title">Futures Calculator</h1>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <div className="tw-card">
          
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm text-gray-600">
                  <span className="text-sm text-gray-600">Balance (USDT)</span>
                </span>
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
                    className="tw-input tw-select"
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
                <span className="text-sm text-gray-600">Take Profit Price</span>
                <input
                  type="number"
                  step="0.0000001"
                  className="tw-input"
                  value={tp}
                  onChange={(e) => setTp(toNum(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <Stat
              color="bg-sky-200"
              label="Risk (USDT)"
              value={Number.isFinite(values.riskUSDT) && values.riskUSDT > 0 ? `$ ${fmt(values.riskUSDT)}` : "-"}
              sub="Max loss according to Risk%"
            />
            <Stat color="bg-sky-200" label="SL Distance" value={values.slDist > 0 ? fmt(values.slDist) : "-"} sub="Distance between Entry and Stop" />
            <Stat color="bg-sky-200" label="Drawdown % " value={values.ddPctAuto ? `${fmt(values.ddPctAuto)}%` : "-"} sub="Percent distance from Entry to SL" />
            <Stat color="bg-sky-200" label="Position Size (coin)" value={fmt(values.posSize)} sub="Suggested number of coins/contracts" />
            <Stat
              color="bg-sky-200"
              label="Notional Value (USDT)"
              value={Number.isFinite(values.notional) && values.notional > 0 ? `$ ${fmt(values.notional)}` : "-"}
              sub="Actual position size"
            />
            <Stat
              color="bg-sky-200"
              label="Leverage Needed"
              value={Number.isFinite(values.levNeeded) ? "x" + Math.floor(values.levNeeded).toString() : "-"}
              sub="Minimum leverage to cover margin"
            />
            <Stat color="bg-sky-200" label="Risk : Reward (if TP)" value={values.rrDisplay || "-"} sub="RR shown as 1 : X" />
            <Stat color="bg-sky-200" label="PnL at TP (USDT)" value={Number.isFinite(values.pnlAtTp) ? `$ ${fmt(values.pnlAtTp)}` : "-"} sub="Estimated profit if TP is hit" />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-black/70">
          <p>Made with ❤️ by xxcookiered</p>
        </footer>
      </div>
    </div>
  );
}
