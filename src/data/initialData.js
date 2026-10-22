import { DEFAULT_PHOTO_URL } from '../assets/defaultPhoto.js';

export const INITIAL_RESUME_DATA = {
  personalInfo: {
    fullName: "TP AKSHAY SASEENDRAN",
    title: "QA Lead | Functional, API & Performance Testing",
    email: "akshaytp1571@gmail.com",
    phone: "+91 7907915152",
    location: "Kerala, India",
    relocation: "Relocating to UAE",
    linkedin: "linkedin.com/in/akshay-saseendran",
    github: "github.com/akshay-qa",
    website: "",
    photo: DEFAULT_PHOTO_URL,
    showPhoto: true,
    photoStyle: "square-frame", // 'square-frame', 'circle', 'rounded'
  },
  summary:
    "QA Lead with 5 years of experience in software testing for enterprise web and mobile products. Led a QA team for an end-to-end Order-to-Cash automation platform for a leading ready-mix concrete and cement manufacturer, covering three mobile apps and a central web interface. Hands-on in manual functional testing, API testing (Postman, Rest Assured), performance testing (JMeter), and Selenium automation. Experienced in production L2 support, team leadership, and Agile delivery using JIRA.",
  skills: [
    {
      id: "skill-1",
      category: "Testing",
      items: "Manual functional testing, regression testing, end-to-end testing, cross-platform testing (web, Android, iOS)",
    },
    {
      id: "skill-2",
      category: "API",
      items: "Postman, Rest Assured, API response validation",
    },
    {
      id: "skill-3",
      category: "Performance",
      items: "JMeter",
    },
    {
      id: "skill-4",
      category: "Automation",
      items: "Selenium WebDriver, Java, TestNG, Python (test data and analysis tools)",
    },
    {
      id: "skill-5",
      category: "Tools",
      items: "JIRA, MantisBT, Google Apps Script, SQL",
    },
    {
      id: "skill-6",
      category: "Process",
      items: "Agile/Scrum, production L2 support, team leadership",
    },
    {
      id: "skill-7",
      category: "AI",
      items: "Generative AI for test case and script generation",
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "QA Lead",
      company: "Tata Consultancy Services (TCS), Bangalore",
      period: "April 2021 – September 2026",
      product: "Product: Digifleet, an order-to-cash automation platform for a leading ready-mix concrete and cement manufacturer",
      highlights: [
        "Led a QA team for an end-to-end order-to-cash platform spanning three mobile apps and a central web interface.",
        "Owned test strategy and execution across manual functional, regression, and cross-platform testing for web and mobile (Android/iOS).",
        "Performed API testing using Postman and Rest Assured, and built Python tools to convert JSON responses to Excel for faster validation.",
        "Ran performance testing with JMeter to verify scalability and reliability.",
        "Built and maintained Selenium (Java, TestNG) automation scripts for critical regression scenarios on the web interface.",
        "Designed a workflow automation and reporting system for MantisBT using Google Apps Script and APIs, providing automated notifications and daily/weekly reports to stakeholders.",
        "Provided L2 production support after go-live and led the support team, handling escalations and driving issue resolution.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "Government Engineering College Wayanad, Kerala",
      degree: "Bachelor of Technology (B.Tech), Computer Science and Engineering",
      score: "CGPA: 7.24/10.00",
      year: "2015 – 2019",
    },
    {
      id: "edu-2",
      school: "Rani Jai Higher Secondary School, Nirmalagiri, Kannur, Kerala",
      degree: "Class XII (Senior Secondary Examination), HSE",
      score: "Aggregate 89.5%",
      year: "01/2015",
    },
    {
      id: "edu-3",
      school: "Holy Cross Public School, Kudiyanmala, Kannur, Kerala",
      degree: "Class X (Secondary Examination), CBSE",
      score: "CGPA: 8.6/10",
      year: "01/2013",
    },
  ],
  languages: [
    { id: "lang-1", name: "Malayalam", proficiency: "Native" },
    { id: "lang-2", name: "English", proficiency: "Full Professional" },
    { id: "lang-3", name: "Tamil", proficiency: "Professional Working" },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "ISTQB Certified Tester Foundation Level",
      issuer: "ISTQB",
      year: "2021",
    },
    {
      id: "cert-2",
      name: "Selenium Automation Specialist",
      issuer: "TCS Internal Certification",
      year: "2022",
    },
  ],
  projects: [],
  customSections: [],
};

export const DEFAULT_THEME = {
  templateId: "classic", // Default exact match of the uploaded file!
  primaryColor: "#3E5566", // Exact heading color from original docx
  secondaryColor: "#56707F", // Exact border/subheading color from original docx
  accentColor: "#2563eb",
  fontFamily: "Calibri",
  fontSize: "compact", // 'compact', 'normal', 'relaxed'
  sectionSpacing: "compact",
  singlePage: true, // 1-page fit optimization
};

export const TEMPLATES_CONFIG = [
  {
    id: "classic",
    name: "Executive Classic",
    badge: "Default (As per file)",
    description: "Original document style with framed photo, slate teal headings, and crisp dividing rules.",
    previewColor: "#3E5566",
    tag: "Original File",
  },
  {
    id: "modern",
    name: "Modern Two-Tone",
    badge: "Popular",
    description: "Sleek dual-column layout with high-contrast accent sidebar and structured timelines.",
    previewColor: "#0f766e",
    tag: "Tech & QA",
  },
  {
    id: "minimal",
    name: "Minimalist ATS Pro",
    badge: "ATS Friendly",
    description: "Ultra-clean single column layout optimized for maximum scannability and applicant tracking systems.",
    previewColor: "#1e293b",
    tag: "Corporate",
  },
  {
    id: "creative",
    name: "Emerald Horizon",
    badge: "Vibrant",
    description: "Modern top banner with gradient accents, pill badges for skills, and polished card containers.",
    previewColor: "#059669",
    tag: "Modern",
  },
  {
    id: "executive",
    name: "Nordic Luxury",
    badge: "Leadership",
    description: "Sophisticated serif typography with elegant gold/navy accents for senior roles and leadership.",
    previewColor: "#1e3a8a",
    tag: "Executive",
  },
  {
    id: "compact",
    name: "Grid Master (1-Page)",
    badge: "High Density",
    description: "Engineered to fit maximum achievements and technical depth into a balanced, crisp single page.",
    previewColor: "#4f46e5",
    tag: "Dense Layout",
  },
];
