"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import styles from "./landing.module.css"

/* 🔥 SEO METADATA */
export const metadata = {
    title: "Find Hackathon Teammates | CollabVault",
    description:
        "Find hackathon teammates based on skills and interests. Build teams, collaborate, and win hackathons with CollabVault.",
}

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

                    {/* 🔥 SEO LINK */}
                    <Link href="/how-to-find-hackathon-teammates" className={styles.navLink}>
                        How to find teammates for hackathons →
                    </Link>
                </section>

                {/* EXTRA SEO CONTENT (UI SAME) */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Why Finding Teammates is Hard</h2>
                    <p className={styles.sectionSub}>
                        Most students struggle not because of lack of skills — but lack of access.
                    </p>

                    <div className={styles.cardsGrid}>
                        <div className={styles.card}>
                            <h3>Everyone Already Has a Team</h3>
                            <p>
                                Most students face situations where teams are already formed, leaving them without options.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Random Teams Don’t Work</h3>
                            <p>
                                Random groups often fail due to lack of communication and mismatched skills.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>No Visibility</h3>
                            <p>
                                There’s no easy way to discover people actively looking for teammates.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>How CollabVault Helps</h2>
                    <p className={styles.sectionSub}>
                        A smarter way to build teams for hackathons and projects.
                    </p>

                    <div className={styles.cardsGrid}>
                        <div className={styles.card}>
                            <h3>Create Profile</h3>
                            <p>
                                Add your skills, interests, and preferences.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Discover People</h3>
                            <p>
                                Find teammates who match your goals and skills.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3>Build Teams</h3>
                            <p>
                                Connect instantly and start collaborating.
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

                {/* 🔥 HIDDEN SEO BOOST */}
                <div style={{ display: "none" }}>
                    find hackathon teammates, hackathon team finder, student collaboration platform,
                    how to find teammates for hackathons, build hackathon team online,
                    find project partners, hackathon team matching platform
                </div>

                <p style={{ opacity: 0.01, height: 0 }}>
                    CollabVault helps students find hackathon teammates, build project teams, and collaborate effectively.
                    It is a platform designed for student collaboration, hackathon participation, and team building.
                </p>

                <footer className={styles.footer}>
                    <Link href="/privacy" className={styles.footerLink}>
                        Privacy Policy
                    </Link>
                </footer>
            </div>
        </div>
    )
}
