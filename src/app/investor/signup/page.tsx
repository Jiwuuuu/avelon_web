"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { completeEmailAuth, completeWalletAuth, goToInvestorPortal } from "@/lib/investor-auth-flow";
import { getInvestorSession, syncInvestorAuthCookieWithStorage } from "@/lib/investor-session";

// ── Types ──────────────────────────────────────────────────────────────────
type Page = "landing" | "login" | "signup";

// ── Icons (inline SVG) ────────────────────────────────────────────────────
const AvelonLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="2" y="8" width="10" height="16" rx="1" fill="#E85C1A" />
    <rect x="14" y="4" width="6" height="20" rx="1" fill="#E85C1A" opacity="0.6" />
    <rect x="22" y="12" width="8" height="12" rx="1" fill="#E85C1A" opacity="0.35" />
  </svg>
);

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="#E85C1A" />
    <rect x="11" y="1" width="6" height="6" rx="1" fill="#E85C1A" opacity="0.5" />
    <rect x="1" y="11" width="6" height="6" rx="1" fill="#E85C1A" opacity="0.5" />
    <rect x="11" y="11" width="6" height="6" rx="1" fill="#E85C1A" />
  </svg>
);

const IconPercent = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="5" cy="5" r="3" stroke="#E85C1A" strokeWidth="1.5" />
    <circle cx="13" cy="13" r="3" stroke="#E85C1A" strokeWidth="1.5" />
    <line x1="14" y1="4" x2="4" y2="14" stroke="#E85C1A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconCoin = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="#E85C1A" strokeWidth="1.5" />
    <text x="9" y="13" textAnchor="middle" fontSize="9" fill="#E85C1A" fontWeight="bold">$</text>
  </svg>
);

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="#E85C1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEmail = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1.4" />
    <path d="M2 6l7 5 7-5" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="#9CA3AF" strokeWidth="1.4" />
    <path d="M6 8V6a3 3 0 016 0v2" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconEye = ({ visible }: { visible: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {visible ? (
      <>
        <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="#9CA3AF" strokeWidth="1.4" />
        <circle cx="9" cy="9" r="2" stroke="#9CA3AF" strokeWidth="1.4" />
      </>
    ) : (
      <>
        <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="#9CA3AF" strokeWidth="1.4" />
        <line x1="3" y1="3" x2="15" y2="15" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
      </>
    )}
  </svg>
);

// ── MetaMask Fox Icon (image — place Metamask-Bitcoin-Wallet.webp in /public) ──
const MetaMaskIcon = () => (
  <img
    src="/Metamask-Bitcoin-Wallet.webp"
    alt="MetaMask"
    width={24}
    height={24}
    style={{ borderRadius: 4, display: "block" }}
  />
);

// ── HeroIllustration ──────────────────────────────────────────────────────
const HeroIllustration = () => (
  <svg viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 520, filter: "drop-shadow(0 20px 60px rgba(232,92,26,0.15))" }}>
    {/* Glow */}
    <ellipse cx="280" cy="200" rx="180" ry="140" fill="#E85C1A" opacity="0.07" />

    {/* Platform base */}
    <path d="M100 290 L260 220 L420 290 L260 360 Z" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />
    <path d="M100 290 L260 360 L260 370 L100 300 Z" fill="#E8E8E8" />
    <path d="M420 290 L260 360 L260 370 L420 300 Z" fill="#EBEBEB" />

    {/* Bar 1 */}
    <path d="M160 290 L200 270 L200 190 L160 210 Z" fill="#1A1A1A" />
    <path d="M200 190 L240 170 L240 250 L200 270 Z" fill="#2A2A2A" />
    <path d="M160 210 L200 190 L240 170 L200 150 Z" fill="#333" />

    {/* Bar 2 */}
    <path d="M240 290 L280 270 L280 150 L240 170 Z" fill="#1A1A1A" />
    <path d="M280 150 L320 130 L320 250 L280 270 Z" fill="#2A2A2A" />
    <path d="M240 170 L280 150 L320 130 L280 110 Z" fill="#333" />

    {/* Bar 3 */}
    <path d="M320 290 L360 270 L360 200 L320 220 Z" fill="#1A1A1A" />
    <path d="M360 200 L400 180 L400 260 L360 270 Z" fill="#2A2A2A" />
    <path d="M320 220 L360 200 L400 180 L360 160 Z" fill="#333" />

    {/* Arrow up */}
    <path d="M195 260 L310 140" stroke="#E85C1A" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M295 130 L315 142 L305 162" stroke="#E85C1A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Floating coins */}
    <circle cx="380" cy="90" r="20" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="380" y="96" textAnchor="middle" fontSize="14" fill="#E85C1A" fontWeight="bold">$</text>

    <circle cx="120" cy="180" r="16" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="120" y="186" textAnchor="middle" fontSize="12" fill="#E85C1A" fontWeight="bold">$</text>

    <circle cx="400" cy="230" r="13" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="400" y="235" textAnchor="middle" fontSize="10" fill="#E85C1A" fontWeight="bold">$</text>

    {/* Wallet card */}
    <rect x="340" y="280" width="110" height="70" rx="10" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <rect x="340" y="280" width="110" height="22" rx="10" fill="#E85C1A" opacity="0.15" />
    <rect x="350" y="315" width="40" height="6" rx="3" fill="#E0E0E0" />
    <rect x="350" y="327" width="60" height="6" rx="3" fill="#F0F0F0" />
  </svg>
);

// ── Step Card ─────────────────────────────────────────────────────────────
interface StepProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  last?: boolean;
}
const StepCard = ({ icon, title, desc, last }: StepProps) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
    <div style={{
      background: "white",
      border: "1px solid #F0F0F0",
      borderRadius: 16,
      padding: "20px 18px",
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      flex: 1,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #E85C1A, #FF8C5A)",
        borderRadius: "0 0 16px 16px",
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: "#FFF5F0",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
    {!last && (
      <div style={{ padding: "0 6px", color: "#E85C1A", flexShrink: 0 }}>
        <IconChevron />
      </div>
    )}
  </div>
);

// ── Navbar ─────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => (
  <nav style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 48px", height: 72,
    borderBottom: "1px solid #F0F0F0",
    background: "white",
    position: "sticky", top: 0, zIndex: 100,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <button onClick={() => setPage("landing")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
        <AvelonLogo />
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: "#111", letterSpacing: -0.5 }}>AVELON</span>
      </button>
      <div style={{ display: "flex", gap: 32, marginLeft: 8 }}>
        {["Home", "About", "How It Works"].map(item => (
          <button key={item} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
            fontSize: 14, fontWeight: item === "Home" ? 600 : 400,
            color: item === "Home" ? "#E85C1A" : "#6B7280",
            borderBottom: item === "Home" ? "2px solid #E85C1A" : "none",
            paddingBottom: 2,
          }}>{item}</button>
        ))}
      </div>
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={() => setPage("signup")} style={{
        padding: "10px 24px", borderRadius: 10, background: "#111", border: "none",
        color: "white", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
      }}>Sign Up</button>
      <button onClick={() => setPage("login")} style={{
        padding: "10px 24px", borderRadius: 10, background: "white",
        border: "1.5px solid #E0E0E0", color: "#111",
        fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
      }}>Sign In</button>
    </div>
  </nav>
);

// ── Landing Page ───────────────────────────────────────────────────────────
const LandingPage = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div style={{ minHeight: "100vh", background: "white", fontFamily: "'Sora', sans-serif" }}>
    {/* Hero */}
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px 48px", display: "flex", alignItems: "center", gap: 48 }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#FFF5F0", border: "1px solid #FFD4BC",
          borderRadius: 999, padding: "6px 16px", marginBottom: 32,
        }}>
          <IconGrid />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#E85C1A" }}>Decentralized Lending Platform</span>
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, color: "#111", margin: "0 0 20px", letterSpacing: -1.5 }}>
          Grow Your Assets by<br />
          <span style={{ color: "#E85C1A" }}>Providing Liquidity</span>
        </h1>

        <p style={{ fontSize: 15, color: "#9CA3AF", lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
          Join Avelon's Liquidity Pool and earn passive returns from crypto lending.
          <span style={{ margin: "0 8px", color: "#E0E0E0" }}>·</span>Secure
          <span style={{ margin: "0 8px", color: "#E0E0E0" }}>·</span>Transparent
          <span style={{ margin: "0 8px", color: "#E0E0E0" }}>·</span>Real Time
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
          {[
            { icon: <IconGrid />, label: "Audited Smart Contracts" },
            { icon: <IconPercent />, label: "10% Platform Fee" },
            { icon: <IconCoin />, label: "Real-Time Earnings" },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "white", border: "1.5px solid #F0F0F0",
              borderRadius: 999, padding: "8px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              fontSize: 13, fontWeight: 500, color: "#374151",
            }}>
              {icon} {label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setPage("signup")} style={{
            padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, #E85C1A, #FF8C5A)",
            border: "none", color: "white", fontFamily: "'Sora', sans-serif",
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(232,92,26,0.3)",
          }}>Get Started</button>
          <button style={{
            padding: "14px 32px", borderRadius: 12, background: "white",
            border: "1.5px solid #E0E0E0", color: "#111",
            fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}>Learn More</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", position: "relative" }}>
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(ellipse at center, rgba(232,92,26,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <HeroIllustration />
      </div>
    </div>

    {/* Divider */}
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #E0E0E0)" }} />
        <span style={{ fontWeight: 700, fontSize: 20, color: "#111", letterSpacing: -0.5 }}>How It Works</span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #E0E0E0, transparent)" }} />
      </div>

      <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 64 }}>
        <StepCard icon={<IconGrid />} title="Sign Up / Sign In" desc="Register to access our service" />
        <StepCard icon={<IconCoin />} title="Connect Wallet" desc="Securely link your crypto wallet" />
        <StepCard icon={<IconPercent />} title="Deposit Assets" desc="Add ETH to the pool" />
        <StepCard icon={<IconCoin />} title="Earn Rewards" desc="Get returns from loan interest" />
        <StepCard icon={<IconGrid />} title="Withdraw Anytime" desc="Claim your earnings instantly" last />
      </div>
    </div>

    {/* About */}
    <div style={{ maxWidth: 1200, margin: "0 auto 64px", padding: "0 48px" }}>
      <div style={{
        background: "linear-gradient(135deg, #FFF5F0 0%, #FFF8F5 50%, #FFFAF8 100%)",
        border: "1px solid #FFD4BC",
        borderRadius: 24, padding: "48px",
      }}>
        <h2 style={{ fontWeight: 800, fontSize: 24, color: "#111", marginBottom: 16, letterSpacing: -0.5 }}>About Us</h2>
        <p style={{ color: "#6B7280", lineHeight: 1.7, maxWidth: 640, fontSize: 15 }}>
          Avelon is a decentralized lending protocol built to democratize access to liquidity.
          We connect investors with borrowers through secure, audited smart contracts —
          creating a transparent ecosystem where everyone benefits.
        </p>
      </div>
    </div>
  </div>
);

// ── Auth Page (Login / Signup) ─────────────────────────────────────────────
const AuthPage = ({
  mode,
  setPage,
  redirectTo,
}: {
  mode: "login" | "signup";
  setPage: (p: Page) => void;
  redirectTo: string;
}) => {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === "login";

  function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = completeEmailAuth({
      email,
      password,
      fullName,
      mode: isLogin ? "login" : "signup",
    });
    if (!res.ok) {
      setError(res.message);
      return;
    }
    goToInvestorPortal(redirectTo);
  }

  function handleWalletAuth() {
    setError(null);
    completeWalletAuth();
    goToInvestorPortal(redirectTo);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "white",
      display: "flex", alignItems: "center",
      fontFamily: "'Sora', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 340, height: 340,
        background: "radial-gradient(circle, rgba(232,92,26,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ padding: "48px 64px", width: "100%", maxWidth: 560 }}>
        <div style={{
          background: "white", border: "1.5px solid #F0F0F0",
          borderRadius: 24, padding: "44px 40px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.06)",
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#FFF5F0", border: "1px solid #FFD4BC",
            borderRadius: 999, padding: "6px 16px", marginBottom: 24,
          }}>
            <IconGrid />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#E85C1A" }}>Decentralized Lending Platform</span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: -0.5 }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 6 }}>
            {isLogin ? "Sign in to your investor account" : "Join Avelon's liquidity pool today"}
          </p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 28, lineHeight: 1.6 }}>
            Provide Ethereum liquidity to power decentralized lending and earn borrower activity
          </p>

          {error && (
            <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 12 }}>{error}</p>
          )}

          <form onSubmit={handleEmailAuth}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  border: "1.5px solid #E5E7EB", borderRadius: 12,
                  padding: "12px 16px", background: "#FAFAFA",
                }}>
                  <IconEmail />
                  <input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    style={{
                      flex: 1, border: "none", background: "none", outline: "none",
                      fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#111",
                    }}
                  />
                </div>
              )}

              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                border: "1.5px solid #E5E7EB", borderRadius: 12,
                padding: "12px 16px", background: "#FAFAFA",
              }}>
                <IconEmail />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  style={{
                    flex: 1, border: "none", background: "none", outline: "none",
                    fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#111",
                  }}
                />
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                border: "1.5px solid #E5E7EB", borderRadius: 12,
                padding: "12px 16px", background: "#FAFAFA",
              }}>
                <IconLock />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  style={{
                    flex: 1, border: "none", background: "none", outline: "none",
                    fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#111",
                  }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <IconEye visible={showPass} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%", marginTop: 20, padding: "14px",
                borderRadius: 12, background: "#111", border: "none",
                color: "white", fontFamily: "'Sora', sans-serif",
                fontWeight: 700, fontSize: 15, cursor: "pointer",
              }}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          </div>

          <button
            type="button"
            onClick={handleWalletAuth}
            style={{
              width: "100%", padding: "13px",
              borderRadius: 12, background: "white",
              border: "1.5px solid #E5E7EB", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: "#111",
            }}
          >
            <MetaMaskIcon />
            <span><strong>Sign {isLogin ? "In" : "Up"}</strong> with MetaMask</span>
          </button>

          {/* Toggle */}
          <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", marginTop: 24 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setPage(isLogin ? "signup" : "login")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#E85C1A", fontWeight: 600, fontFamily: "'Sora', sans-serif", fontSize: 13,
            }}>
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>

      {/* Right decorative panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 48,
      }}>
        <HeroIllustration />
      </div>
    </div>
  );
};

function SignUpContent() {
  const [page, setPage] = useState<Page>("signup");
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next")?.trim() ?? "";
  const redirectTo =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/investor/dashboard";

  useEffect(() => {
    if (!getInvestorSession()) return;
    syncInvestorAuthCookieWithStorage();
    goToInvestorPortal(redirectTo);
  }, [redirectTo]);

  return (
    <>
      <Navbar page={page} setPage={setPage} />

      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <AuthPage mode="login" setPage={setPage} redirectTo={redirectTo} />}
      {page === "signup" && <AuthPage mode="signup" setPage={setPage} redirectTo={redirectTo} />}
    </>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────
export default function InvestorSignUpPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; }
        button { transition: opacity 0.15s, transform 0.15s; }
        button:hover { opacity: 0.85; }
        button:active { transform: scale(0.98); }
        input::placeholder { color: #D1D5DB; }
      `}</style>

      <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>Loading…</div>}>
        <SignUpContent />
      </Suspense>
    </>
  );
}