"""
Resume parser and skill extraction module using PyMuPDF and regex keyword matching.
Designed specifically for SkillBridge (SIH26044).
"""

import re
try:
    import pymupdf as fitz
except ImportError:
    import fitz


# Master Canonical Skill Catalog with Aliases
SKILL_CATALOG = [
    # Languages
    {"name": "Python", "category": "Programming Languages", "aliases": ["python", "python3"]},
    {"name": "Java", "category": "Programming Languages", "aliases": ["java", "core java", "advanced java"]},
    {"name": "JavaScript", "category": "Programming Languages", "aliases": ["javascript", "js", "ecmascript"]},
    {"name": "TypeScript", "category": "Programming Languages", "aliases": ["typescript", "ts"]},
    {"name": "C++", "category": "Programming Languages", "aliases": ["c++", "cpp"]},
    {"name": "C#", "category": "Programming Languages", "aliases": ["c#", "c-sharp", "csharp"]},
    {"name": "PHP", "category": "Programming Languages", "aliases": ["php"]},
    {"name": "Ruby", "category": "Programming Languages", "aliases": ["ruby"]},
    {"name": "Go", "category": "Programming Languages", "aliases": ["golang", r"\bgo\b"]},
    {"name": "Rust", "category": "Programming Languages", "aliases": ["rust"]},

    # Web & Frontend / Backend
    {"name": "React", "category": "Web Development", "aliases": ["react", "reactjs", "react.js", "react native"]},
    {"name": "Django", "category": "Web Development", "aliases": ["django", "django rest framework", "drf"]},
    {"name": "Node.js", "category": "Web Development", "aliases": ["node", "nodejs", "node.js"]},
    {"name": "Express.js", "category": "Web Development", "aliases": ["express", "expressjs", "express.js"]},
    {"name": "HTML", "category": "Web Development", "aliases": ["html", "html5"]},
    {"name": "CSS", "category": "Web Development", "aliases": ["css", "css3", "tailwind", "tailwind css", "bootstrap"]},
    {"name": "Next.js", "category": "Web Development", "aliases": ["nextjs", "next.js"]},
    {"name": "Angular", "category": "Web Development", "aliases": ["angular", "angularjs"]},
    {"name": "Vue.js", "category": "Web Development", "aliases": ["vue", "vuejs", "vue.js"]},
    {"name": "FastAPI", "category": "Web Development", "aliases": ["fastapi", "fast-api"]},
    {"name": "Flask", "category": "Web Development", "aliases": ["flask"]},

    # Databases
    {"name": "SQL", "category": "Databases", "aliases": ["sql", "rdbms"]},
    {"name": "PostgreSQL", "category": "Databases", "aliases": ["postgresql", "postgres", "psql"]},
    {"name": "MongoDB", "category": "Databases", "aliases": ["mongodb", "mongo"]},
    {"name": "MySQL", "category": "Databases", "aliases": ["mysql"]},
    {"name": "Redis", "category": "Databases", "aliases": ["redis"]},
    {"name": "SQLite", "category": "Databases", "aliases": ["sqlite", "sqlite3"]},

    # AI, Data Science & Machine Learning
    {"name": "Machine Learning", "category": "AI & Data Science", "aliases": ["machine learning", "ml"]},
    {"name": "Deep Learning", "category": "AI & Data Science", "aliases": ["deep learning", "dl", "neural networks", "ann", "cnn", "rnn"]},
    {"name": "Natural Language Processing", "category": "AI & Data Science", "aliases": ["natural language processing", "nlp"]},
    {"name": "TensorFlow", "category": "AI & Data Science", "aliases": ["tensorflow", "tf"]},
    {"name": "PyTorch", "category": "AI & Data Science", "aliases": ["pytorch"]},
    {"name": "Pandas", "category": "AI & Data Science", "aliases": ["pandas"]},
    {"name": "NumPy", "category": "AI & Data Science", "aliases": ["numpy"]},
    {"name": "Scikit-Learn", "category": "AI & Data Science", "aliases": ["scikit-learn", "scikit learn", "sklearn"]},
    {"name": "Data Analysis", "category": "AI & Data Science", "aliases": ["data analysis", "data analytics", "exploratory data analysis", "eda"]},
    {"name": "Excel", "category": "Data & Analytics", "aliases": ["excel", "ms excel", "microsoft excel", "spreadsheets"]},
    {"name": "Power BI", "category": "Data & Analytics", "aliases": ["power bi", "powerbi", "power-bi"]},
    {"name": "Tableau", "category": "Data & Analytics", "aliases": ["tableau"]},

    # Cloud & DevOps
    {"name": "AWS", "category": "Cloud & DevOps", "aliases": ["aws", "amazon web services", "ec2", "s3", "lambda"]},
    {"name": "Docker", "category": "Cloud & DevOps", "aliases": ["docker", "containerization"]},
    {"name": "Kubernetes", "category": "Cloud & DevOps", "aliases": ["kubernetes", "k8s"]},
    {"name": "Git", "category": "Cloud & DevOps", "aliases": ["git", "github", "gitlab"]},
    {"name": "Linux", "category": "Cloud & DevOps", "aliases": ["linux", "ubuntu", "bash", "shell scripting"]},
    {"name": "Azure", "category": "Cloud & DevOps", "aliases": ["azure", "microsoft azure"]},
    {"name": "GCP", "category": "Cloud & DevOps", "aliases": ["gcp", "google cloud", "google cloud platform"]},
]


def extract_text_from_pdf(pdf_file_or_path):
    """
    Extracts plain text from a PDF file using PyMuPDF (fitz).
    Accepts a filepath string or a Django UploadedFile/BytesIO object.
    """
    text_content = []
    try:
        if hasattr(pdf_file_or_path, 'read'):
            # In-memory uploaded file
            content = pdf_file_or_path.read()
            doc = fitz.open(stream=content, filetype="pdf")
        else:
            doc = fitz.open(pdf_file_or_path)

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text("text")
            if page_text:
                text_content.append(page_text)
        
        doc.close()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

    return "\n".join(text_content)


def extract_skills(text):
    """
    Identifies and extracts normalized skills from text.
    Avoids false positives and partial-word matches using word boundary regex.
    Returns a sorted list of unique canonical skill names found.
    """
    if not text:
        return []

    # Normalize text for matching
    cleaned_text = " " + text.lower() + " "
    # Replace newlines, commas, slashes, tabs, parens with spaces to separate tokens cleanly
    normalized_text = re.sub(r'[\r\n\t,;/()\[\]{}:|]', ' ', cleaned_text)
    normalized_text = re.sub(r'\s+', ' ', normalized_text)

    found_skills = set()

    for item in SKILL_CATALOG:
        canonical_name = item["name"]
        aliases = item.get("aliases", [canonical_name.lower()])

        for alias in aliases:
            # Special regex handling for characters like ++, #, .
            if alias in ["c++", "cpp"]:
                pattern = r'(?:\bc\+\+|\bcpp\b)'
            elif alias in ["c#", "csharp", "c-sharp"]:
                pattern = r'(?:\bc#\b|\bcsharp\b|\bc-sharp\b)'
            elif alias == r"\bgo\b":
                pattern = r'\bgo\b(?!\s+(?:to|on|ahead|away|into|through|back))'
            elif alias in [".net", "asp.net"]:
                pattern = r'(?:\basp\.net\b|\b\.net\b)'
            elif alias in ["node.js", "nodejs", "node"]:
                pattern = r'(?:\bnode\.js\b|\bnodejs\b|\bnode\s+js\b|\bnode\b(?!\s+(?:red|balancer)))'
            elif alias in ["react", "reactjs", "react.js"]:
                pattern = r'(?:\breact\.js\b|\breactjs\b|\breact\b(?!\s+(?:ion|or|ant)))'
            elif alias in ["vue", "vuejs", "vue.js"]:
                pattern = r'(?:\bvue\.js\b|\bvuejs\b|\bvue\b)'
            elif alias in ["nextjs", "next.js"]:
                pattern = r'(?:\bnext\.js\b|\bnextjs\b)'
            elif alias in ["git", "github", "gitlab"]:
                pattern = r'(?:\bgit\b|\bgithub\b|\bgitlab\b)'
            elif alias == "java":
                # Ensure java does not match javascript
                pattern = r'\bjava\b(?!\s*script)'
            elif alias == "js":
                pattern = r'\bjs\b'
            elif alias == "ml":
                pattern = r'\bml\b'
            elif alias == "dl":
                pattern = r'\bdl\b'
            elif alias == "nlp":
                pattern = r'\bnlp\b'
            elif alias == "aws":
                pattern = r'\baws\b'
            elif alias == "gcp":
                pattern = r'\bgcp\b'
            elif alias == "sql":
                # Ensure sql doesn't match mysql or postgresql unintentionally
                pattern = r'\bsql\b'
            else:
                escaped = re.escape(alias.lower())
                pattern = r'\b' + escaped + r'\b'

            if re.search(pattern, normalized_text, re.IGNORECASE):
                found_skills.add(canonical_name)
                break

    return sorted(list(found_skills))
