"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import styles from "./landing.module.css"

export default function LandingPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/")
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        return null;
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.noiseWrapper}></div>
            <div className={styles.scanlines}></div>

            <div className={styles.container}>
                {/* Nav */}
                <nav className={styles.nav}>
                    <div className={styles.logo}>CollabVault</div>
                    <div className={styles.navLinks}>
                        <Link href="/contact" className={styles.navLink}>Contact Us</Link>
                        <Link href="/login" className={styles.navLink}>Login</Link>
                        <Link href="/signup" className={styles.btnNav}>Get Started</Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.pill}>⚡ No Team? Start Here</div>

                        <h1>
                            Everyone has a team.<br />
                            Except you.
                        </h1>

                        <p className={styles.heroSub}>
                            Stop joining random groups. Find the RIGHT teammates based on skills, interests, and compatibility — in minutes.
                        </p>

                        <div className={styles.heroActions}>
                            <Link href="/signup" className={styles.btnPrimary}>
                                Find Your Team
                            </Link>
                            <Link href="/login" className={styles.btnSecondary}>
                                login
                            </Link>
                        </div>
                    </div>

                    <div className={styles.visualContainer}>
                        <div className={styles.sphere}></div>
                    </div>
                </section>

                {/* Features */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Why CollabVault Works</h2>
                    <p className={styles.sectionSub}>
                        Build better teams faster — without wasting time searching.
                    </p>

                    <div className={styles.cardsGrid}>
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>⚡</div>
                            <h3>Discover Opportunities</h3>
                            <p>
                                Find hackathons and projects where you actually belong.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardIcon}>👥</div>
                            <h3>Smart Matching</h3>
                            <p>
                                Get matched with people who complement your skills — not random teammates.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardIcon}>💬</div>
                            <h3>Build Faster</h3>
                            <p>
                                Connect instantly and start building without wasting time forming teams.
                            </p>
                        </div>
                    </div>
                </section>
                {/* Hero Section */}
<section className={styles.heroSection}>
   ...
</section>

{/* 👇 PASTE SWIPE PREVIEW HERE */}
<section style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
  <div style={{
    width: "280px",
    padding: "20px",
    borderRadius: "16px",
    background: "#111",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  }}>
    <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Riya • Frontend Dev</h3>

    <p style={{ fontSize: "12px", marginTop: "6px" }}>
      Skills: React, UI/UX
    </p>

    <p style={{ fontSize: "12px" }}>
      Interests: Hackathons, AI
    </p>

    <div style={{
      marginTop: "12px",
      fontSize: "14px",
      color: "#e46880",
      fontWeight: "bold"
    }}>
      87% Match
    </div>

    <div style={{
      marginTop: "16px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <span>❌</span>
      <span>❤️</span>
    </div>
  </div>
</section>

{/* Features Section */}
<section className={styles.featuresSection}>
                {/* CTA */}
                <section className={styles.ctaSection}>
                    <h2>Ready to find your team?</h2>
                    <p>
                        Stop searching. Start building with the right people.
                    </p>

                    <div className={styles.ctaActions}>
                        <Link href="/signup" className={styles.btnPrimary}>
                            Get Started →
                        </Link>
                        <Link href="/login" className={styles.btnSecondary}>
                            Already a Member?
                        </Link>
                    </div>
                </section>

                <footer className={styles.footer}>
                    <Link href="/privacy" className={styles.footerLink}>
                        Privacy Policy
                    </Link>
                </footer>
            </div>
        </div>
    )
}
