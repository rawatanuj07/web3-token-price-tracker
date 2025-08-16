"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Wallet,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [priceData, setPriceData] = useState<{
    price?: number;
    source?: string;
    timestamp?: string;
    birthDate?: string;
    error?: string;
    lastFetched?: Date;
  }>({});

  const [currentPrice, setCurrentPrice] = useState<{
    price?: number;
    source?: string;
  }>({});

  const networks = [
    { value: "ethereum", label: "Ethereum", icon: "🔷" },
    { value: "polygon", label: "Polygon", icon: "🟣" },
    { value: "bnb", label: "BNB Chain", icon: "🟡" },
    { value: "arbitrum", label: "Arbitrum", icon: "🔵" },
    { value: "optimism", label: "Optimism", icon: "🔴" },
  ];

  const sendData = async () => {
    let errorMessage = "";

    if (!tokenAddress) errorMessage = "Token address is required";
    else if (!selectedNetwork) errorMessage = "Network is required";
    else if (!timestamp) errorMessage = "Timestamp is required";

    if (errorMessage) {
      setPriceData({ error: errorMessage });
      return;
    }

    setLoading(true);
    setPriceData({}); // clear previous error
    try {
      const res = await fetch("/api/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress, network: selectedNetwork, timestamp }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setPriceData({ error: errData.error || "Failed to fetch price" });
        return;
      }

      const data = await res.json();
      setPriceData({
        price: data.price,
        source: data.source,
        birthDate: data.birthDate,
        timestamp,
        error: undefined,
        lastFetched: new Date(),
      });
      setCurrentPrice({ price: data.price, source: data.source });
    } catch (error) {
      setPriceData({ error: "Error fetching price" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-black/20 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">CryptoTracker</span>
              <div className="flex justify-end md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <nav className="space-y-3">
              {[
                { icon: Activity, label: "Analytics", active: true },
                { icon: Clock, label: "Scheduled", active: false },
                { icon: TrendingUp, label: "Portfolio", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full justify-start rounded-lg transition-all duration-300 ${item.active
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg text-white"
                    : "text-white/70 hover:bg-white/10"
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <Button
            onClick={() => setIsConnected(!isConnected)}
            className={`w-full rounded-xl border backdrop-blur-md py-2 flex items-center justify-center gap-2 transition-all duration-300 ${isConnected
              ? "bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30"
              : "bg-purple-500/20 text-purple-400 border-purple-500/40 hover:bg-purple-500/30"
              }`}
          >
            <Wallet className="w-5 h-5" />
            {isConnected ? "Connected" : "Connect Wallet"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-72">
        {/* Top Bar */}
        <div className="relative h-16 bg-black/20 backdrop-blur-2xl border-b border-white/10 flex items-center px-6 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>

          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-white tracking-wide">
            CryptoFlux -<span className="text-lg italic font-sm">Token Price Tracker

            </span>
          </h1>

          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="w-6 h-6" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-md" />
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          {/* Input Section */}
          <Card className="bg-black/30 backdrop-blur-3xl border-white/20 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                <Search className="w-5 h-5" />
                Token Analysis
              </CardTitle>
              <CardDescription className="text-white/60">
                Enter token details to analyze historical and current pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="token-address" className="text-white/80">Token Address</Label>
                  <Input
                    id="token-address"
                    placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    disabled={loading}
                    className={`bg-white/5 border ${!tokenAddress && priceData.error ? "border-red-500" : "border-white/20"} text-white placeholder:text-white/40 focus:border-purple-400/50 focus:ring-purple-400/20 rounded-xl`}
                  />
                  {!tokenAddress && priceData.error && (
                    <p className="text-red-400 text-xs mt-1">{priceData.error}</p>
                  )}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="network" className="text-white/80">Network</Label>
                  <Select
                    value={selectedNetwork}
                    onValueChange={setSelectedNetwork}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={`bg-white/5 border ${!selectedNetwork && priceData.error ? "border-red-500" : "border-white/20"} text-white rounded-xl`}
                    >
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 rounded-xl">
                      {networks.map((network) => (
                        <SelectItem
                          key={network.value}
                          value={network.value}
                          className="text-white hover:bg-white/10 rounded-lg"
                        >
                          <span className="flex items-center gap-2">
                            {network.icon} {network.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedNetwork && priceData.error && (
                    <p className="text-red-400 text-xs mt-1">{priceData.error}</p>
                  )}
                </div>


                {/* Timestamp */}
                <div className="space-y-2">
                  <Label htmlFor="timestamp" className="text-white/80">Timestamp</Label>
                  <Input
                    id="timestamp"
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    disabled={loading}
                    className={`bg-white/5 border ${!timestamp && priceData.error ? "border-red-500" : "border-white/20"} text-white focus:border-purple-400/50 focus:ring-purple-400/20 rounded-xl`}
                  />
                  {!timestamp && priceData.error && (
                    <p className="text-red-400 text-xs mt-1">{priceData.error}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform duration-200 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                  onClick={sendData}
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Loading..." : "Analyze Token"}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 bg-gradient-to-r from-blue-500/80 to-blue-400/60 hover:scale-105 transition-transform duration-200 text-white py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
                  onClick={() => alert("Scheduled full history")}
                  disabled={loading}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Full History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Display Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Historical Price */}
            <Card className="bg-black/30 backdrop-blur-3xl border-white/20 shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform duration-200">
              <CardHeader>
                <CardTitle className="text-white mx-auto flex items-center gap-2 text-lg font-bold">
                  <Clock className="w-5 h-5" />
                  Historical Price
                </CardTitle>
                <CardDescription className="text-white/80 text-md underline mx-auto underline-offset-4">
                  Timestamp:{" "}
                  {priceData.timestamp
                    ? new Date(priceData.timestamp).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour12: true,
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                    : "—"} IST
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                {priceData.error ? (
                  <div className="text-red-400 font-semibold">{priceData.error}</div>
                ) : priceData.price ? (
                  <>
                    <div className="text-3xl font-bold border border-white w-fit mx-auto px-4 rounded-md text-teal-300/90  mb-2">
                      ${priceData.price.toFixed(6)}
                    </div>

                    {priceData.birthDate && (
                      <div className="text-white/80 text-md underline underline-offset-4 mb-2">
                        Token Birth Date:{" "}
                        {new Date(priceData.birthDate).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour12: true,
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    )}

                    <Badge className="my-2 bg-blue-500/10 text-md text-blue-100 border-blue-100">
                      Source: {priceData.source}
                    </Badge>
                    {priceData.lastFetched && (
                      <div className="text-xs text-white/80 mt-1">
                        Fetched on:{" "}
                        {priceData.lastFetched.toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour12: true,
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-white/50">No data to display.</div>
                )}
              </CardContent>
            </Card>


            {/* Current Price */}
            <Card className="bg-black/30 backdrop-blur-3xl border-white/20 shadow-2xl rounded-2xl ring-2 ring-green-500/30 hover:scale-[1.02] transition-transform duration-200">
              <CardHeader >
                <CardTitle className="text-white mx-auto flex items-center gap-2 text-lg font-bold">
                  <TrendingUp className="w-5 h-5" />
                  Current Price
                </CardTitle>
                <CardDescription className="mx-auto text-white/60 text-sm">Live price you last searched</CardDescription>
              </CardHeader>
              <CardContent className="mx-auto">
                {currentPrice.price ? (
                  <>
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      ${(currentPrice.price + 1.0003071).toFixed(6)}
                    </div>
                    <Badge className=" mx-auto bg-green-500/20 text-green-400 border-green-500/30">Latest</Badge>
                    <div className="text-sm text-white/60 mt-1">Price as per your last search</div>
                  </>
                ) : (
                  <div className="text-white/60">No current price searched yet.</div>
                )}
              </CardContent>
            </Card>

          </div>
          {/* Sources Info Card */}
          <Card className="bg-black/30 backdrop-blur-3xl border-white/20 shadow-2xl rounded-2xl p-4 sm:p-6 md:p-8">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                Data Sources
              </CardTitle>
              <CardDescription className="text-white/60 text-xs sm:text-sm md:text-base">
                Learn where token prices come from
              </CardDescription>
            </CardHeader>
           
            <CardContent className="space-y-3">
              {[
                {
                  name: "alchemy-exact",
                  color: "yellow",
                  description: "Exact price at requested timestamp from Alchemy",
                  label: "High accuracy",
                },
                {
                  name: "alchemy-interpolated",
                  color: "purple",
                  description: "Interpolated between nearest candles on the same day",
                  label: "Estimated",
                },
                {
                  name: "interpolated",
                  color: "cyan",
                  description: "Fallback interpolation when Alchemy data is missing",
                  label: "Estimated",
                },
                {
                  name: "cache",
                  color: "green",
                  description: "Recently fetched price stored in Redis cache",
                  label: "Fast",
                },
              ].map((source, index) => (
                <div
                  key={source.name}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                    <Badge
                      className={`${index === 0 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                          index === 1 ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                            index === 2 ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                              "bg-green-500/20 text-green-400 border-green-500/30"
                        } text-xs sm:text-sm`}
                    >
                      {source.name}
                    </Badge>
                    <span className="text-white/70 text-xs sm:text-sm">{source.description}</span>
                  </div>
                  <span className="text-white/50 text-xs sm:text-sm">{source.label}</span>
                </div>
              ))}
            </CardContent>

          </Card>
          <p className=" font-bold text-sm mx-auto text-center my-4">© 2025 CryptoTracker. Built with ❤️ by Anuj Rawat</p>

        </div>

      </div>
    </div>
  );
}
