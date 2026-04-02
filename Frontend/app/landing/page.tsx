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

                    {/* SEO Link */}
                    <Link href="/how-to-find-hackathon-teammates" className={styles.navLink}>
                        How to find teammates for hackathons →
                    </Link>
                </section>

                {/* NEW SECTION (Problem - SEO BOOST) */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Why Finding Teammates is Hard</h2>
                    <p className={styles.sectionSub}>
                        Most students struggle not because of lack of skills — but lack of access.
                    </p>

                    <div className={styles.cardsGrid}>
                        <div className={styles.card}>
                            <h3>Everyone Already Has a Team</h3>
                            <p>
                                You join late and realize groups are already formed, leaving you stuck without options.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Random Teams Don’t Work</h3>
                            <p>
                                Joining random groups leads to poor communication, mismatched skills, and failed projects.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>No Visibility</h3>
                            <p>
                                You don’t know who’s looking for teammates or what skills they bring.
                            </p>
                        </div>
                    </div>
                </section>

                {/* NEW SECTION (How it works) */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>How CollabVault Helps</h2>
                    <p className={styles.sectionSub}>
                        A smarter way to build teams for hackathons and projects.
                    </p>

                    <div className={styles.cardsGrid}>
                        <div className={styles.card}>
                            <h3>Step 1: Create Profile</h3>
                            <p>
                                Add your skills, interests, and what you’re looking for.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Step 2: Discover People</h3>
                            <p>
                                Browse students who match your skillset and goals.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Step 3: Build Your Team</h3>
                            <p>
                                Connect, collaborate, and start building immediately.
                            </p>
                        </div>
                    </div>
                </section>

                {/* NEW SECTION (Tips - SEO BOOST) */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Tips to Build a Strong Hackathon Team</h2>
                    <p className={styles.sectionSub}>
                        A good team increases your chances of winning significantly.
                    </p>

                    <div className={styles.cardsGrid}>
                        <div className={styles.card}>
                            <h3>Balanced Skills</h3>
                            <p>
                                Combine developers, designers, and idea thinkers.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Communication Matters</h3>
                            <p>
                                Teams fail not due to skills — but lack of coordination.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Start Early</h3>
                            <p>
                                Don’t wait till the last moment to build your team.
                            </p>
                        </div>
                    </div>
                </section>

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
