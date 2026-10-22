import mammoth from 'mammoth';
import { callAiChat, getSavedAiConfig } from './aiService';

// 1. Extract raw text from file (DOCX, JSON, TXT)
export async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
      type: 'docx',
      text: result.value || '',
    };
  }

  if (extension === 'json') {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      return {
        type: 'json',
        data: parsed,
        text,
      };
    } catch (e) {
      throw new Error('Invalid JSON resume file format.');
    }
  }

  // Plain text / Markdown / txt
  const text = await file.text();
  return {
    type: 'text',
    text,
  };
}

// 2. Rule-Based Fallback Parser (Offline / Zero-Config)
export function parseResumeHeuristically(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = {
    personalInfo: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      relocation: '',
      linkedin: '',
      github: '',
      photo: '',
      showPhoto: true,
      photoStyle: 'square-frame',
    },
    summary: '',
    skills: [],
    experience: [],
    education: [],
    languages: [],
    certifications: [],
  };

  // Find email, phone
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  if (emailMatch) parsed.personalInfo.email = emailMatch[1];

  const phoneMatch = rawText.match(/(\+?\d[\d\s\-()]{8,}\d)/);
  if (phoneMatch) parsed.personalInfo.phone = phoneMatch[1].trim();

  const linkedinMatch = rawText.match(/(linkedin\.com\/[^\s]+)/i);
  if (linkedinMatch) parsed.personalInfo.linkedin = linkedinMatch[1];

  const githubMatch = rawText.match(/(github\.com\/[^\s]+)/i);
  if (githubMatch) parsed.personalInfo.github = githubMatch[1];

  // First non-empty lines are often Name & Title
  if (lines.length > 0) {
    parsed.personalInfo.fullName = lines[0].replace(/\|.*/, '').trim();
  }
  if (lines.length > 1 && !lines[1].includes('@') && !lines[1].match(/^\d/)) {
    parsed.personalInfo.title = lines[1].trim();
  }

  // Section splitting
  let currentSection = '';
  const sectionContent = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    languages: [],
    certifications: [],
  };

  for (const line of lines.slice(1)) {
    const upper = line.toUpperCase();
    if (upper === 'SUMMARY' || upper.startsWith('PROFESSIONAL SUMMARY') || upper.startsWith('PROFILE')) {
      currentSection = 'summary';
      continue;
    } else if (upper.startsWith('SKILLS') || upper.startsWith('TECHNICAL SKILLS') || upper.startsWith('COMPETENCIES')) {
      currentSection = 'skills';
      continue;
    } else if (upper.startsWith('EXPERIENCE') || upper.startsWith('WORK EXPERIENCE') || upper.startsWith('EMPLOYMENT')) {
      currentSection = 'experience';
      continue;
    } else if (upper.startsWith('EDUCATION') || upper.startsWith('ACADEMIC')) {
      currentSection = 'education';
      continue;
    } else if (upper.startsWith('LANGUAGES')) {
      currentSection = 'languages';
      continue;
    } else if (upper.startsWith('CERTIFICATIONS') || upper.startsWith('CERTIFICATES')) {
      currentSection = 'certifications';
      continue;
    }

    if (currentSection) {
      sectionContent[currentSection].push(line);
    }
  }

  // Process Summary
  if (sectionContent.summary.length > 0) {
    parsed.summary = sectionContent.summary.join(' ');
  }

  // Process Skills
  if (sectionContent.skills.length > 0) {
    sectionContent.skills.forEach((sLine, idx) => {
      const parts = sLine.split(':');
      if (parts.length > 1) {
        parsed.skills.push({
          id: `skill-${idx}`,
          category: parts[0].trim(),
          items: parts.slice(1).join(':').trim(),
        });
      } else {
        parsed.skills.push({
          id: `skill-${idx}`,
          category: 'Core Competency',
          items: sLine,
        });
      }
    });
  }

  // Process Experience
  if (sectionContent.experience.length > 0) {
    let currentExp = null;
    sectionContent.experience.forEach((eLine, idx) => {
      if (eLine.includes('|') || eLine.includes('–') || eLine.includes(' - ') || !currentExp) {
        if (currentExp) parsed.experience.push(currentExp);
        currentExp = {
          id: `exp-${idx}`,
          role: eLine.split('|')[0]?.trim() || eLine,
          company: eLine.split('|')[1]?.trim() || '',
          period: '',
          product: '',
          highlights: [],
        };
      } else if (eLine.startsWith('•') || eLine.startsWith('-') || eLine.startsWith('*')) {
        currentExp?.highlights.push(eLine.replace(/^[•\-*]\s*/, '').trim());
      } else if (eLine.toLowerCase().startsWith('product:')) {
        currentExp.product = eLine;
      } else {
        if (currentExp && currentExp.highlights.length === 0 && !currentExp.period) {
          currentExp.period = eLine;
        } else {
          currentExp?.highlights.push(eLine);
        }
      }
    });
    if (currentExp) parsed.experience.push(currentExp);
  }

  // Process Education
  if (sectionContent.education.length > 0) {
    sectionContent.education.forEach((eduLine, idx) => {
      parsed.education.push({
        id: `edu-${idx}`,
        school: eduLine,
        degree: '',
        score: '',
        year: '',
      });
    });
  }

  // Process Languages
  if (sectionContent.languages.length > 0) {
    sectionContent.languages.forEach((lLine, idx) => {
      lLine.split(/[,•|]/).forEach((name, i) => {
        if (name.trim()) {
          parsed.languages.push({
            id: `lang-${idx}-${i}`,
            name: name.trim(),
            proficiency: 'Fluent',
          });
        }
      });
    });
  }

  return parsed;
}

// 3. AI-Powered Deep Structured Parsing
export async function parseResumeWithAi(rawText) {
  const config = getSavedAiConfig();

  const systemPrompt = `You are a high-precision resume document parsing engine.
Extract all structured data from the provided raw resume text into strict, valid JSON matching this exact schema:
{
  "personalInfo": {
    "fullName": "Candidate Name",
    "title": "Professional Title / Headline",
    "email": "email address",
    "phone": "phone number",
    "location": "City, Country",
    "relocation": "Relocation / Visa status if any",
    "linkedin": "linkedin URL or handle",
    "github": "github URL or handle",
    "showPhoto": true,
    "photoStyle": "square-frame"
  },
  "summary": "Professional summary or career profile paragraph",
  "skills": [
    { "category": "Testing / API / Automation / Tools / etc.", "items": "Comma separated skills" }
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name & Location",
      "period": "Dates (e.g. 2021 - 2024)",
      "product": "Product or Project context if present",
      "highlights": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "school": "University or School Name",
      "degree": "Degree and Major",
      "score": "GPA or Percentage if present",
      "year": "Graduation year"
    }
  ],
  "languages": [
    { "name": "Language Name", "proficiency": "Native / Fluent / Professional" }
  ],
  "certifications": [
    { "name": "Certification Title", "issuer": "Issuer or Body", "year": "Year" }
  ]
}

CRITICAL RULES:
1. Output ONLY pure, valid JSON.
2. NO markdown code blocks (\`\`\`json), NO conversational preamble.
3. Keep all factual dates, numbers, and achievements intact.`;

  const userPrompt = `RAW RESUME TEXT:\n${rawText}`;

  const responseText = await callAiChat({
    systemPrompt,
    userPrompt,
    config,
  });

  const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsedJson = JSON.parse(cleaned);

  // Ensure ID properties
  parsedJson.skills = (parsedJson.skills || []).map((s, i) => ({ id: `skill-${i}`, ...s }));
  parsedJson.experience = (parsedJson.experience || []).map((e, i) => ({ id: `exp-${i}`, ...e }));
  parsedJson.education = (parsedJson.education || []).map((e, i) => ({ id: `edu-${i}`, ...e }));
  parsedJson.languages = (parsedJson.languages || []).map((l, i) => ({ id: `lang-${i}`, ...l }));
  parsedJson.certifications = (parsedJson.certifications || []).map((c, i) => ({ id: `cert-${i}`, ...c }));

  return parsedJson;
}
