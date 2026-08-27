"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  dark: "#1A1A1A",
  darkAlt: "#242424",
  light: "#F5F5F5",
  orange: "#E85C1A",
  orangeGlow: "rgba(232,92,26,0.18)",
  white: "#FFFFFF",
  textDim: "rgba(255,255,255,0.55)",
  textMuted: "#6B7280",
  border: "#E5E5E5",
  borderDark: "rgba(255,255,255,0.08)",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
});

// ── Font face injection ─────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @font-face {
      font-family: 'Gilroy';
      src: url('/fonts/Gilroy-ExtraBold.otf') format('opentype');
      font-weight: 800;
      font-display: swap;
    }
    @font-face {
      font-family: 'Gilroy';
      src: url('/fonts/Gilroy-Light.otf') format('opentype');
      font-weight: 300;
      font-display: swap;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: white; font-family: 'Gilroy', sans-serif; }
    ::selection { background: ${C.orange}; color: white; }
    a { text-decoration: none; }
  `}</style>
);

// ── SVG Logos & Icons ───────────────────────────────────────────────────────
const AvelonLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="2" y="8" width="10" height="16" rx="1" fill={C.orange} />
    <rect x="14" y="4" width="6" height="20" rx="1" fill={C.orange} opacity="0.6" />
    <rect x="22" y="12" width="8" height="12" rx="1" fill={C.orange} opacity="0.35" />
  </svg>
);

const NoiseOverlay = ({ opacity = 0.06 }: { opacity?: number }) => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
    backgroundImage: "url('/images/noise-texture.webp')",
    backgroundRepeat: "repeat",
    opacity,
  }} />
);

// ── Hero Illustration ────────────────────────────────────────────────────────
const HeroIllustration = () => (
  <svg viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", maxWidth: 520, filter: `drop-shadow(0 20px 60px ${C.orangeGlow})` }}>
    <ellipse cx="280" cy="200" rx="180" ry="140" fill={C.orange} opacity="0.07" />
    <path d="M100 290 L260 220 L420 290 L260 360 Z" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />
    <path d="M100 290 L260 360 L260 370 L100 300 Z" fill="#E8E8E8" />
    <path d="M420 290 L260 360 L260 370 L420 300 Z" fill="#EBEBEB" />
    <path d="M160 290 L200 270 L200 190 L160 210 Z" fill="#1A1A1A" />
    <path d="M200 190 L240 170 L240 250 L200 270 Z" fill="#2A2A2A" />
    <path d="M160 210 L200 190 L240 170 L200 150 Z" fill="#333" />
    <path d="M240 290 L280 270 L280 150 L240 170 Z" fill="#1A1A1A" />
    <path d="M280 150 L320 130 L320 250 L280 270 Z" fill="#2A2A2A" />
    <path d="M240 170 L280 150 L320 130 L280 110 Z" fill="#333" />
    <path d="M320 290 L360 270 L360 200 L320 220 Z" fill="#1A1A1A" />
    <path d="M360 200 L400 180 L400 260 L360 270 Z" fill="#2A2A2A" />
    <path d="M320 220 L360 200 L400 180 L360 160 Z" fill="#333" />
    <path d="M195 260 L310 140" stroke={C.orange} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M295 130 L315 142 L305 162" stroke={C.orange} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="380" cy="90" r="20" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="380" y="96" textAnchor="middle" fontSize="14" fill={C.orange} fontWeight="bold">$</text>
    <circle cx="120" cy="180" r="16" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="120" y="186" textAnchor="middle" fontSize="12" fill={C.orange} fontWeight="bold">$</text>
    <circle cx="400" cy="230" r="13" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="400" y="235" textAnchor="middle" fontSize="10" fill={C.orange} fontWeight="bold">$</text>
    <rect x="340" y="280" width="110" height="70" rx="10" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <rect x="340" y="280" width="110" height="22" rx="10" fill={C.orange} opacity="0.15" />
    <rect x="350" y="315" width="40" height="6" rx="3" fill="#E0E0E0" />
    <rect x="350" y="327" width="60" height="6" rx="3" fill="#F0F0F0" />
  </svg>
);

// ── Step Card ───────────────────────────────────────────────────────────────
const steps = [
  { num: "01", title: "Sign Up", desc: "Register as an investor in minutes" },
  { num: "02", title: "Connect Wallet", desc: "Securely link your crypto wallet" },
  { num: "03", title: "Deposit ETH", desc: "Add ETH to the liquidity pool" },
  { num: "04", title: "Earn Yield", desc: "Get returns from loan interest" },
  { num: "05", title: "Withdraw", desc: "Claim your earnings anytime" },
];

const StepCard = ({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) => (
  <motion.div {...fadeUp(delay)} style={{
    background: C.white,
    borderRadius: 16,
    padding: "24px 20px",
    flex: 1,
    minWidth: 0,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
  }}>
    {/* Orange bottom bar */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${C.orange}, #FF8C5A)`,
    }} />
    <div style={{
      fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: "0.15em",
      textTransform: "uppercase", marginBottom: 10, fontFamily: "Gilroy, sans-serif",
    }}>{num}</div>
    <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 6, fontFamily: "Gilroy, sans-serif" }}>{title}</div>
    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55, fontFamily: "Gilroy, sans-serif", fontWeight: 300 }}>{desc}</div>
  </motion.div>
);

// ── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => (
  <nav style={{
    position: "sticky", top: 0, zIndex: 100,
    background: C.white,
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 clamp(24px, 5vw, 64px)",
    height: 68,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AvelonLogo />
        <span style={{
          fontFamily: "Gilroy, sans-serif", fontWeight: 800, fontSize: 18,
          color: C.dark, letterSpacing: 1,
        }}>AVELON</span>
      </Link>
      <div style={{ display: "flex", gap: 28 }}>
        {[
          { label: "Home", href: "#home" },
          { label: "How It Works", href: "#how-it-works" },
          { label: "About", href: "#about" },
        ].map(({ label, href }) => (
          <a key={label} href={href} style={{
            fontFamily: "Gilroy, sans-serif", fontWeight: 300,
            fontSize: 14, color: C.textMuted,
            transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = C.dark)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
          >{label}</a>
        ))}
      </div>
    </div>
    <div style={{ display: "flex", gap: 10 }}>
      <Link href="/login" style={{
        padding: "9px 22px", borderRadius: 10,
        border: `1.5px solid ${C.border}`,
        color: C.dark,
        fontFamily: "Gilroy, sans-serif", fontWeight: 800, fontSize: 13,
        background: "transparent",
      }}>Sign In</Link>
      <Link href="/register" style={{
        padding: "9px 22px", borderRadius: 10,
        background: C.dark,
        color: C.white,
        fontFamily: "Gilroy, sans-serif", fontWeight: 800, fontSize: 13,
      }}>Get Started</Link>
    </div>
  </nav>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <GlobalStyles />

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="home" style={{
        background: C.white, position: "relative", overflow: "hidden",
        padding: "clamp(64px, 10vw, 120px) clamp(24px, 5vw, 80px)",
        minHeight: "90vh", display: "flex", alignItems: "center",
      }}>
        {/* Orange radial glow */}
        <div style={{
          position: "absolute", bottom: -120, right: -80,
          width: 560, height: 560,
          background: `radial-gradient(circle, ${C.orangeGlow} 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto", width: "100%",
          display: "flex", alignItems: "center", gap: "clamp(32px, 6vw, 80px)",
          position: "relative",
        }}>
          {/* Left: text */}
          <div style={{ flex: 1 }}>
            <motion.div {...fadeUp(0)} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#FFF5F0", border: "1px solid #FFD4BC",
              borderRadius: 999, padding: "6px 14px", marginBottom: 32,
            }}>
              <AvelonLogo size={16} />
              <span style={{
                fontSize: 12, fontWeight: 300, color: C.orange,
                letterSpacing: "0.2em", textTransform: "uppercase",
                fontFamily: "Gilroy, sans-serif",
              }}>Decentralized Lending Protocol</span>
            </motion.div>

            <motion.h1 {...fadeUp(0.08)} style={{
              fontFamily: "Gilroy, sans-serif", fontWeight: 800,
              fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
              lineHeight: 1.0, color: C.dark,
              letterSpacing: "-0.03em", margin: "0 0 24px",
            }}>
              Grow Your Assets<br />
              by{" "}
              <span style={{ color: C.orange }}>Providing<br />Liquidity</span>
            </motion.h1>

            <motion.p {...fadeUp(0.16)} style={{
              fontFamily: "Gilroy, sans-serif", fontWeight: 300,
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              color: C.textMuted, lineHeight: 1.75,
              maxWidth: 440, marginBottom: 40,
            }}>
              Join Avelon&apos;s on-chain liquidity pool and earn passive returns
              from crypto lending. Secure, transparent, and real-time.
            </motion.p>

            <motion.div {...fadeUp(0.22)} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <Link href="/register" style={{
                padding: "clamp(12px,1.4vw,16px) clamp(24px,2.5vw,36px)",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${C.orange}, #FF8C5A)`,
                color: C.white,
                fontFamily: "Gilroy, sans-serif", fontWeight: 800,
                fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
                boxShadow: `0 8px 28px ${C.orangeGlow}`,
              }}>Get Started</Link>
              <a href="#how-it-works" style={{
                padding: "clamp(12px,1.4vw,16px) clamp(24px,2.5vw,36px)",
                borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                color: C.dark,
                fontFamily: "Gilroy, sans-serif", fontWeight: 800,
                fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
              }}>Learn More</a>
            </motion.div>

            {/* Feature badges */}
            <motion.div {...fadeUp(0.28)} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Audited Smart Contracts", "10% Platform Fee", "Real-Time Earnings"].map(label => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: C.white, border: `1.5px solid ${C.border}`,
                  borderRadius: 999, padding: "7px 14px",
                  fontSize: 12, fontWeight: 300, color: "#374151",
                  fontFamily: "Gilroy, sans-serif",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ flex: 1, display: "flex", justifyContent: "center" }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{
        background: C.light,
        padding: "clamp(64px, 8vw, 100px) clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...fadeUp(0)} style={{
            display: "flex", alignItems: "center", gap: 20, marginBottom: 56,
          }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #D0D0D0)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: C.orange,
                letterSpacing: "0.3em", textTransform: "uppercase",
                fontFamily: "Gilroy, sans-serif", marginBottom: 8,
              }}>Process</div>
              <h2 style={{
                fontFamily: "Gilroy, sans-serif", fontWeight: 800,
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "#111",
                letterSpacing: "-0.03em", whiteSpace: "nowrap",
              }}>How It Works</h2>
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #D0D0D0, transparent)" }} />
          </motion.div>

          <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
            {steps.map((step, i) => (
              <StepCard key={step.num} {...step} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" style={{
        background: C.dark, position: "relative", overflow: "hidden",
        padding: "clamp(64px, 8vw, 100px) clamp(24px, 5vw, 80px)",
      }}>
        <NoiseOverlay />
        <div style={{
          position: "absolute", top: -100, left: -60, width: 420, height: 420,
          background: `radial-gradient(circle, ${C.orangeGlow} 0%, transparent 65%)`,
          pointerEvents: "none", zIndex: 1,
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: "clamp(40px, 6vw, 80px)", alignItems: "center", flexWrap: "wrap" }}>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <motion.div {...fadeUp(0)} style={{
                fontSize: 11, fontWeight: 800, color: C.orange,
                letterSpacing: "0.3em", textTransform: "uppercase",
                fontFamily: "Gilroy, sans-serif", marginBottom: 16,
              }}>About Avelon</motion.div>
              <motion.h2 {...fadeUp(0.08)} style={{
                fontFamily: "Gilroy, sans-serif", fontWeight: 800,
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)", color: C.white,
                letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24,
              }}>
                Built for the<br />
                <span style={{ color: C.orange }}>Philippine Market</span>
              </motion.h2>
              <motion.p {...fadeUp(0.14)} style={{
                fontFamily: "Gilroy, sans-serif", fontWeight: 300,
                fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                color: C.textDim, lineHeight: 1.8, maxWidth: 480, marginBottom: 32,
              }}>
                Avelon is a decentralized lending protocol connecting liquidity providers
                with borrowers through secure, audited smart contracts on the Ethereum
                Base Sepolia network. AI-powered KYC ensures every borrower is verified.
              </motion.p>
              <motion.div {...fadeUp(0.2)}>
                <Link href="/register" style={{
                  display: "inline-block",
                  padding: "13px 30px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.orange}, #FF8C5A)`,
                  color: C.white,
                  fontFamily: "Gilroy, sans-serif", fontWeight: 800, fontSize: 14,
                  boxShadow: `0 6px 24px ${C.orangeGlow}`,
                }}>Start Investing</Link>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div {...fadeUp(0.12)} style={{
              display: "flex", flexDirection: "column", gap: 12, flex: "0 0 auto",
            }}>
              {[
                { label: "Collateral Type", value: "ETH" },
                { label: "Network", value: "Base Sepolia" },
                { label: "Platform Fee", value: "10%" },
                { label: "Revenue Split", value: "90 / 10" },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 40, borderBottom: `1px solid ${C.borderDark}`,
                  paddingBottom: 12, paddingTop: 4,
                }}>
                  <span style={{
                    fontFamily: "Gilroy, sans-serif", fontWeight: 300,
                    fontSize: 13, color: "rgba(255,255,255,0.45)",
                    letterSpacing: "0.02em",
                  }}>{label}</span>
                  <span style={{
                    fontFamily: "Gilroy, sans-serif", fontWeight: 800,
                    fontSize: 15, color: C.white,
                  }}>{value}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#111", borderTop: `1px solid ${C.borderDark}`,
        padding: "32px clamp(24px, 5vw, 80px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
        position: "relative",
      }}>
        <NoiseOverlay opacity={0.03} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
          <AvelonLogo size={22} />
          <span style={{
            fontFamily: "Gilroy, sans-serif", fontWeight: 800, fontSize: 15,
            color: C.white, letterSpacing: 0.5,
          }}>AVELON</span>
          <span style={{
            fontFamily: "Gilroy, sans-serif", fontWeight: 300, fontSize: 13,
            color: "rgba(255,255,255,0.3)", marginLeft: 8,
          }}>Decentralized Lending Protocol</span>
        </div>
        <div style={{ display: "flex", gap: 24, position: "relative", zIndex: 2 }}>
          {[
            { label: "Sign In", href: "/login" },
            { label: "Get Started", href: "/register" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              fontFamily: "Gilroy, sans-serif", fontWeight: 300, fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              transition: "color 0.2s",
            }}>{label}</Link>
          ))}
        </div>
        <p style={{
          fontFamily: "Gilroy, sans-serif", fontWeight: 300, fontSize: 12,
          color: "rgba(255,255,255,0.25)",
          position: "relative", zIndex: 2, width: "100%", textAlign: "right",
        }}>
          © {new Date().getFullYear()} Avelon. Built on Base Sepolia.
        </p>
      </footer>
    </>
  );
}
