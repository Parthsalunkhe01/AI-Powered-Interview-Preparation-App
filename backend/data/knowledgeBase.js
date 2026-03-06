/**
 * Professional Knowledge Base for AI Interview Platform
 * Contains curated roles, mappings to recommended skills, and top tech companies.
 */

const ROLES = [
    "Full Stack Developer",
    "Backend Engineer",
    "Frontend Engineer",
    "Mobile App Developer",
    "Android Developer",
    "iOS Developer",
    "Data Scientist",
    "Data Engineer",
    "DevOps Engineer",
    "Cloud Architect",
    "System Design Engineer",
    "AI/ML Engineer",
    "QA Automation Engineer",
    "Security Engineer",
    "Product Manager (Technical)",
    "Embedded Systems Engineer"
];

const SKILLS_BY_ROLE = {
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "TypeScript", "Next.js", "Docker", "REST API"],
    "Backend Engineer": ["Node.js", "Python", "Java", "Go", "PostgreSQL", "Redis", "Microservices", "Docker", "Kubernetes", "gRPC"],
    "Frontend Engineer": ["React", "Vue.js", "Angular", "TypeScript", "Tailwind CSS", "Redux", "Webpack", "Vite", "Browser Performance"],
    "Android Developer": ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "Retrofit", "Room", "Dagger Hilt", "MVVM", "Android Studio"],
    "iOS Developer": ["Swift", "SwiftUI", "Objective-C", "Xcode", "CocoaPods", "Combine", "Core Data", "App Store Connect"],
    "Data Scientist": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Data Visualization", "Statistics"],
    "Data Engineer": ["Python", "SQL", "Apache Spark", "Apache Kafka", "Airflow", "ETL", "BigQuery", "Snowflake", "Data Modeling"],
    "DevOps Engineer": ["AWS", "Azure", "GCP", "Terraform", "Ansible", "CI/CD", "Jenkins", "GitHub Actions", "Prometheus", "Grafana"],
    "Cloud Architect": ["AWS", "Google Cloud", "Distributed Systems", "Serverless", "IAM", "VPC", "CloudFormation", "Cost Optimization"],
    "Product Manager (Technical)": ["Product Strategy", "User Stories", "Agile", "Scrum", "SQL", "A/B Testing", "System Architecture Concepts"],
    "AI/ML Engineer": ["Python", "PyTorch", "NLP", "Computer Vision", "Deep Learning", "LLMs", "Cuda", "Model Deployment"]
};

const COMPANIES = [
    "Google",
    "Amazon",
    "Microsoft",
    "Meta",
    "Netflix",
    "Apple",
    "Uber",
    "Airbnb",
    "Tesla",
    "NVIDIA",
    "Salesforce",
    "Spotify",
    "Adobe",
    "Oracle",
    "Intel",
    "IBM",
    "Twitter (X)",
    "LinkedIn",
    "Goldman Sachs",
    "Morgan Stanley",
    "JPMorgan Chase",
    "Visa",
    "Stripe",
    "Coinbase",
    "Walmart Global Tech"
];

// Fuzzy Mapping for Normalization (Input -> Standard Name)
const ROLE_NORMALIZATION_MAP = {
    "android dev": "Android Developer",
    "android developer": "Android Developer",
    "fullstack": "Full Stack Developer",
    "full stack": "Full Stack Developer",
    "backend": "Backend Engineer",
    "backend dev": "Backend Engineer",
    "frontend": "Frontend Engineer",
    "swe": "Software Engineer",
    "ml engineer": "AI/ML Engineer",
    "pm": "Product Manager (Technical)",
    "devops": "DevOps Engineer"
};

const COMPANY_NORMALIZATION_MAP = {
    "google inc": "Google",
    "alphabet": "Google",
    "meta platforms": "Meta",
    "facebook": "Meta",
    "amazon web services": "Amazon",
    "aws": "Amazon",
    "microsoft corp": "Microsoft",
    "apple inc": "Apple",
    "netflix inc": "Netflix"
};

module.exports = {
    ROLES,
    SKILLS_BY_ROLE,
    COMPANIES,
    ROLE_NORMALIZATION_MAP,
    COMPANY_NORMALIZATION_MAP
};
