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
            {/* Overlay Effects */}
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

                {/* Hero Section (VHS Box Style) */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.pill}>⚡ Your Tech Community Hub</div>
                        <h1>Find Your Perfect Hackathon Team</h1>
                        <p className={styles.heroSub}>
                            Connect with talented developers, share projects, and build amazing things together. Your next great
                            collaboration starts here.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/signup" className={styles.btnPrimary}>Start Building Together -{">"}</Link>
                            <Link href="/login" className={styles.btnSecondary}>Sign In</Link>
                        </div>
                    </div>

                    <div className={styles.visualContainer}>
                        {/* The Sphere acts as the abstract branding graphic */}
                        <div className={styles.sphere} title="Collaborate"></div>
                    </div>
                </section>

                {/* Features Section */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Everything You Need to Collaborate</h2>
                    <p className={styles.sectionSub}>Powerful features designed to help you connect, communicate, and create together.</p>

                    <div className={styles.cardsGrid}>
                        {/* Card 1 */}
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>⚡</div>
                            <h3>Share & Discover</h3>
                            <p>Post about hackathons, projects, and ideas. Discover what the community is building and get
                                inspired by innovative projects.</p>
                        </div>

                        {/* Card 2 */}
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>👥</div>
                            <h3>Find Teammates</h3>
                            <p>Swipe through developer profiles and connect with people who match your skills and interests.
                                Build your dream team effortlessly.</p>
                        </div>

                        {/* Card 3 */}
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>💬</div>
                            <h3>Real-Time Chat</h3>
                            <p>Communicate seamlessly with 1-on-1 messaging and team chats. Stay connected and collaborate in
                                real-time.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.ctaSection}>
                    <h2>Ready to Join the Community?</h2>
                    <p>Join a growing community of developers connecting, collaborating, and building amazing projects together. Be part of the journey!</p>
                    <div className={styles.ctaActions}>
                        <Link href="/signup" className={styles.btnPrimary}>Create Your Account -{">"}</Link>
                        <Link href="/login" className={styles.btnSecondary}>Already a Member?</Link>
                    </div>
                </section>

                <footer className={styles.footer}>
                    
                </footer>
            </div>
        </div>
    )
}
