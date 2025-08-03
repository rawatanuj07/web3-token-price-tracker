"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Wallet,
  Search,
  Bell,
  Settings,
  BarChart3,
  Activity,
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

  const networks = [
    { value: "ethereum", label: "Ethereum", icon: "🔷" },
    { value: "polygon", label: "Polygon", icon: "🟣" },
    { value: "bnb", label: "BNB Chain", icon: "🟡" },
    { value: "arbitrum", label: "Arbitrum", icon: "🔵" },
    { value: "optimism", label: "Optimism", icon: "🔴" },
  ];

  const scheduledSnapshots = [
    {
      token: "USDC",
      network: "Ethereum",
      time: "2024-01-15 14:30",
      price: "$0.9998",
      status: "completed",
    },
    {
      token: "WETH",
      network: "Polygon",
      time: "2024-01-15 16:00",
      price: "$2,847.32",
      status: "pending",
    },
    {
      token: "MATIC",
      network: "Polygon",
      time: "2024-01-15 18:00",
      price: "$0.8234",
      status: "scheduled",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-xl border-r border-white/10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CryptoTracker</span>
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 bg-white/5"
            >
              <Activity className="w-4 h-4 mr-3" />
              Analytics
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10"
            >
              <Clock className="w-4 h-4 mr-3" />
              Scheduled
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10"
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Portfolio
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={() => setIsConnected(!isConnected)}
            className={`w-full ${
              isConnected
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-purple-500/20 text-purple-400 border-purple-500/30"
            } border backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnected ? "Connected" : "Connect Wallet"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-white">Token Price Tracker</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Token Analysis
              </CardTitle>
              <CardDescription className="text-white/60">
                Enter token details to analyze historical and current pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-address" className="text-white/80">
                    Token Address
                  </Label>
                  <Input
                    id="token-address"
                    placeholder="0x..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="network" className="text-white/80">
                    Network
                  </Label>
                  <Select
                    value={selectedNetwork}
                    onValueChange={setSelectedNetwork}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-purple-500/50 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {networks.map((network) => (
                        <SelectItem
                          key={network.value}
                          value={network.value}
                          className="text-white hover:bg-white/10"
                        >
                          <span className="flex items-center gap-2">
                            <span>{network.icon}</span>
                            {network.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timestamp" className="text-white/80">
                    Timestamp
                  </Label>
                  <Input
                    id="timestamp"
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="bg-white/5 border-white/20 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => {
                  console.log("Fetching price data for:", timestamp);
                  fetch("/api/price", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tokenAddress,
                      network: selectedNetwork,
                      timestamp,
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.error) {
                        alert(data.error);
                      } else {
                        // Handle successful response
                        alert(
                          `Price for ${data.tokenAddress} at ${data.timestamp} is $${data.price}`
                        );
                        console.log("Price data:", data);
                      }
                    })
                    .catch((error) => {
                      console.error("Error fetching price data:", error);
                      alert("Error fetching price data");
                    });
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze Token
              </Button>
              <Button
                variant="secondary"
                className="w-full w-full bg-gradient-to-b from-blue-500 to-blue-500/60  hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => {
                  fetch("/api/schedule-full-history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tokenAddress,
                      network: selectedNetwork,
                    }),
                  })
                    .then(() => alert("Scheduled full history successfully!"))
                    .catch(() => alert("Error scheduling full history."));
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Full History
              </Button>
            </CardContent>
          </Card>

          {/* Price Display Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historical Price
                </CardTitle>
                <CardDescription className="text-white/60">
                  Price at selected timestamp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  $2,847.32
                </div>
                <div className="text-sm text-white/60">
                  January 15, 2024 14:30 UTC
                </div>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30"
                >
                  Historical Data
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl ring-2 ring-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Current Price
                </CardTitle>
                <CardDescription className="text-white/60">
                  Live market price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  $2,891.45
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    +1.55%
                  </Badge>
                  <span className="text-sm text-white/60">24h change</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Snapshots */}
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Snapshots
              </CardTitle>
              <CardDescription className="text-white/60">
                Automated price tracking schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledSnapshots.map((snapshot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {snapshot.token}
                        </div>
                        <div className="text-white/60 text-sm">
                          {snapshot.network} • {snapshot.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {snapshot.price}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            snapshot.status === "completed"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : snapshot.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {snapshot.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-white/10" />

              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Snapshot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
