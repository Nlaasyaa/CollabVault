import { db } from "./db.js";

const SKILLS = [
    "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "C#", "Kotlin", "Swift", "PHP", "Ruby", "R", "MATLAB", "Scala", "Dart", "Bash / Shell", "SQL", "NoSQL",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "React.js", "Next.js", "Vue.js", "Angular", "Svelte", "UI/UX Fundamentals", "Responsive Design", "Web Accessibility (A11y)", "DOM Manipulation",
    "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails", "REST API Design", "GraphQL", "WebSockets", "Microservices", "Authentication (JWT/OAuth)",
    "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "MariaDB", "Firebase Firestore", "DynamoDB", "Elasticsearch",
    "Linux", "Docker", "Kubernetes", "Git", "GitHub Actions", "Jenkins", "CI/CD", "Nginx", "Terraform", "Ansible", "AWS", "Azure", "Google Cloud Platform", "Cloud Architecture", "Monitoring (Prometheus/Grafana)",
    "Machine Learning", "Deep Learning", "Data Science", "NumPy", "Pandas", "Matplotlib", "Scikit-Learn", "TensorFlow", "PyTorch", "Keras", "NLP", "Computer Vision", "Reinforcement Learning", "Model Deployment", "ML Ops",
    "ETL Pipelines", "Apache Spark", "Apache Kafka", "Airflow", "Hadoop", "Data Modeling", "Big Data Systems",
    "Network Security", "Ethical Hacking", "Penetration Testing", "OWASP", "Cryptography", "Identity and Access Management", "Vulnerability Assessment", "Secure Coding",
    "Android Development", "iOS Development", "React Native", "Flutter",
    "Unity", "Unreal Engine", "Game Physics", "Game Design Basics",
    "Computer Networks", "Operating Systems", "Distributed Systems", "Virtualization", "System Design", "Load Balancing", "Caching Strategies",
    "Agile Methodology", "Scrum", "Unit Testing", "Integration Testing", "E2E Testing", "Jest", "Cypress", "Design Patterns", "Clean Architecture", "Refactoring",
    "Postman", "Figma", "Jira", "VS Code", "API Testing", "Debugging"
];

const INTERESTS = [
    "Hackathons", "Competitive Programming", "Coding Contests", "Kaggle Competitions", "Open-Source Contributions", "Game Jams", "Capture The Flag (CTF)", "Innovation Challenges", "Robotics Competitions", "Startup Pitch Competitions",
    "Machine Learning Projects", "Deep Learning Research", "Generative AI", "AI for Social Good", "NLP Applications", "Computer Vision Projects", "Autonomous Systems", "Data Analysis", "Data Engineering", "Edge AI",
    "Full-Stack Web Development", "Frontend Projects", "Backend Development", "DevOps Practices", "API Development", "Cloud-Native Applications", "Mobile App Development", "Cross-Platform App Development", "Game Development", "Microservices Architecture",
    "FinTech", "HealthTech", "EdTech", "AgriTech", "Clean Energy", "Smart City Solutions", "Cybersecurity", "Blockchain Applications", "Internet of Things (IoT)", "AR/VR Experiences", "Autonomous Vehicles", "Social Media Platforms", "E-commerce Systems",
    "Research Paper Writing", "Benchmarking Model Performance", "Distributed Systems Research", "Algorithms and Optimization", "Human-Computer Interaction", "Systems Programming", "Quantum Computing", "High-Performance Computing",
    "Peer Learning", "Building Startups", "Open-Source Community Work", "Mentoring", "Project Management", "UI/UX Brainstorming", "Code Reviews", "Agile Collaboration",
    "Creative Coding", "Tech and Design", "Motion Graphics for Apps", "UX Case Studies", "Digital Product Prototyping", "Minimalist App Design", "Gamification Concepts"
];

async function seedData() {
    console.log("Seeding Skills...");
    for (const skill of SKILLS) {
        try {
            await db.query("INSERT IGNORE INTO skills (name) VALUES (?)", [skill]);
        } catch (err) {
            console.error(`Error inserting skill ${skill}:`, err.message);
        }
    }

    console.log("Seeding Interests...");
    for (const interest of INTERESTS) {
        try {
            await db.query("INSERT IGNORE INTO interests (name) VALUES (?)", [interest]);
        } catch (err) {
            console.error(`Error inserting interest ${interest}:`, err.message);
        }
    }

    console.log("Seeding complete!");
    process.exit(0);
}

seedData();
