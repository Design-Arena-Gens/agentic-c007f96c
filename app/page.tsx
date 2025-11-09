'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle, Bot, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  current: number;
  profit: number;
  timestamp: Date;
}

interface Signal {
  pair: string;
  action: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  sl: number;
  tp: number;
  reason: string;
}

export default function Home() {
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [autoTrade, setAutoTrade] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);

  const forexPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD'];

  // Simulate real-time price data
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setChartData(prev => {
        const newData = [...prev.slice(-20), {
          time: now.toLocaleTimeString(),
          price: 1.0850 + (Math.random() - 0.5) * 0.01,
        }];
        return newData;
      });

      // Update open trades
      setTrades(prev => prev.map(trade => {
        const volatility = 0.0005;
        const newPrice = trade.current + (Math.random() - 0.5) * volatility;
        const profit = trade.type === 'BUY'
          ? (newPrice - trade.entry) * 100000
          : (trade.entry - newPrice) * 100000;

        return {
          ...trade,
          current: newPrice,
          profit: profit
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate total profit
  useEffect(() => {
    const total = trades.reduce((sum, trade) => sum + trade.profit, 0);
    setTotalProfit(total);
    setBalance(10000 + total);
  }, [trades]);

  // AI Analysis simulation
  const analyzeMarket = async () => {
    setIsAnalyzing(true);
    setSignals([]);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newSignals: Signal[] = forexPairs.slice(0, 3).map(pair => {
      const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const entry = 1.0850 + (Math.random() - 0.5) * 0.02;
      const confidence = 65 + Math.random() * 30;

      return {
        pair,
        action,
        confidence: Math.round(confidence),
        entry: parseFloat(entry.toFixed(5)),
        sl: parseFloat((entry - (action === 'BUY' ? 0.0050 : -0.0050)).toFixed(5)),
        tp: parseFloat((entry + (action === 'BUY' ? 0.0150 : -0.0150)).toFixed(5)),
        reason: `${action === 'BUY' ? 'Bullish' : 'Bearish'} momentum detected. Strong ${confidence > 80 ? 'buying' : 'selling'} pressure with favorable risk/reward ratio.`
      };
    });

    setSignals(newSignals);
    setIsAnalyzing(false);

    // Auto-execute if enabled
    if (autoTrade && newSignals.length > 0) {
      const bestSignal = newSignals.reduce((max, signal) =>
        signal.confidence > max.confidence ? signal : max
      );
      executeTrade(bestSignal);
    }
  };

  const executeTrade = (signal: Signal) => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      pair: signal.pair,
      type: signal.action,
      entry: signal.entry,
      current: signal.entry,
      profit: 0,
      timestamp: new Date()
    };

    setTrades(prev => [...prev, newTrade]);
  };

  const closeTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bot className="w-8 h-8" />
                AI Forex Trading Bot
              </h1>
              <p className="text-blue-100 mt-2">Powered by Advanced AI Market Analysis</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Account Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
              <p className={`text-sm ${totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} ({((totalProfit / 10000) * 100).toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Trades</p>
                <p className="text-2xl font-bold mt-1">{trades.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {trades.length > 0
                    ? `${Math.round((trades.filter(t => t.profit > 0).length / trades.length) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Profit</p>
                <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(totalProfit).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">AI Signals</p>
                <p className="text-2xl font-bold mt-1">{signals.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={analyzeMarket}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </button>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTrade}
                  onChange={(e) => setAutoTrade(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm">Auto-Execute Best Signals</span>
              </label>
            </div>

            <div className="text-sm text-gray-400">
              Last Analysis: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">EUR/USD Live Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis domain={['auto', 'auto']} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Signals */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">AI Trading Signals</h2>
            {signals.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Run AI analysis to generate trading signals</p>
            ) : (
              <div className="space-y-4">
                {signals.map((signal, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{signal.pair}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          signal.action === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {signal.action}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">Confidence: {signal.confidence}%</span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>Entry: {signal.entry}</p>
                      <p>Stop Loss: {signal.sl}</p>
                      <p>Take Profit: {signal.tp}</p>
                      <p className="text-xs text-gray-400 mt-2">{signal.reason}</p>
                    </div>
                    <button
                      onClick={() => executeTrade(signal)}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold text-sm transition-colors"
                    >
                      Execute Trade
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Trades */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Open Positions</h2>
            {trades.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No open trades</p>
            ) : (
              <div className="space-y-4">
                {trades.map(trade => (
                  <div key={trade.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{trade.pair}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trade.type === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {trade.type}
                        </span>
                      </div>
                      {trade.profit >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>Entry: {trade.entry.toFixed(5)}</p>
                      <p>Current: {trade.current.toFixed(5)}</p>
                      <p className={`font-semibold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        P/L: ${trade.profit.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => closeTrade(trade.id)}
                      className="w-full mt-3 bg-red-600 hover:bg-red-700 py-2 rounded font-semibold text-sm transition-colors"
                    >
                      Close Position
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <p className="text-yellow-200 text-sm">
            <strong>⚠️ Demo Mode:</strong> This is a simulated trading dashboard for educational purposes.
            No real trades are executed. Real forex trading involves substantial risk and requires proper
            broker integration, regulatory compliance, and risk management systems.
          </p>
        </div>
      </div>
    </div>
  );
}
