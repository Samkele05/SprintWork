# SprintWork AI Career Curriculum & Algorithm Design

This document outlines the theoretical framework and algorithmic logic for the AI-powered features in SprintWork.

---

## 1. Career Development Framework: The 4-Stage Journey

SprintWork follows a research-backed 4-stage framework for career development:

| Stage | Goal | AI Feature |
|---|---|---|
| **Explore** | Identify career paths and skill gaps | Smart Job Matching & Skill Gap Analysis |
| **Build** | Create professional assets | AI CV Tailoring & Resume Builder |
| **Connect** | Build professional network | Networking Hub & Recruiter Matching |
| **Refine** | Master interview and soft skills | AI Mock Interviews & Scoring |

---

## 2. AI Mock Interview Curriculum

The interview curriculum is divided into four specialized tracks, each with a structured progression:

### A. Behavioral Track (STAR Method)
- **Focus:** Soft skills, leadership, conflict resolution.
- **Curriculum:**
  1. **Foundations:** Introduction to the STAR method.
  2. **Conflict Resolution:** Handling difficult coworkers or situations.
  3. **Leadership:** Demonstrating initiative and team management.
  4. **Adaptability:** Navigating change and fast-paced environments.
- **Algorithm:** AI evaluates responses based on the presence of **Situation, Task, Action, and Result** components.

### B. Technical Track (DSA & System Design)
- **Focus:** Problem-solving, coding proficiency, architecture.
- **Curriculum:**
  1. **Data Structures:** Arrays, Linked Lists, Trees, Graphs.
  2. **Algorithms:** Sorting, Searching, Dynamic Programming.
  3. **System Design:** Scalability, Load Balancing, Database Sharding.
- **Algorithm:** AI checks for technical accuracy, time/space complexity analysis, and edge case handling.

### C. Case Study Track
- **Focus:** Analytical thinking, business logic.
- **Curriculum:**
  1. **Market Entry:** Analyzing new business opportunities.
  2. **Profitability:** Identifying cost-cutting and revenue-growth strategies.
  3. **Product Design:** Designing user-centric products.

---

## 3. Core Algorithms

### A. Smart Job Matching Algorithm (Hybrid Approach)
The matching score ($S$) is calculated as a weighted sum of multiple factors:

$$S = w_1 \cdot S_{skills} + w_2 \cdot S_{experience} + w_3 \cdot S_{location} + w_4 \cdot S_{salary}$$

- **$S_{skills}$:** Calculated using Jaccard Similarity or BERT embeddings between user skills and job requirements.
- **$S_{experience}$:** Difference between required and actual years of experience.
- **$S_{location}$:** Binary (1 if match/remote, 0 otherwise) or distance-based decay.
- **$S_{salary}$:** Overlap between user expectations and job budget.

### B. AI CV Tailoring Algorithm
1. **Extraction:** Use LLM to extract key requirements (Skills, Keywords, Responsibilities) from a job description.
2. **Analysis:** Compare extracted keywords with the user's current resume.
3. **Optimization:**
   - **Keyword Injection:** Naturally integrate missing high-priority keywords.
   - **Action Verb Enhancement:** Replace passive language with strong action verbs (e.g., "Managed" → "Spearheaded").
   - **Quantification:** Prompt user to add metrics (e.g., "Increased sales by 20%").

### C. Interview Scoring Rubric (0-100)
- **Content (40%):** Accuracy, relevance, and depth of the answer.
- **Structure (30%):** Use of STAR method or logical flow.
- **Communication (20%):** Clarity, tone, and professional language.
- **Confidence (10%):** Sentiment analysis and pace of speech.

---

## 4. Skill Development Curriculum

Personalized learning paths are generated based on the **Skill Gap Analysis**:

1. **Identify Target Role:** User selects a dream job.
2. **Analyze Gaps:** AI compares user profile with top 10% of successful candidates in that role.
3. **Prioritize Skills:** Skills are ranked by "Impact" (how often they appear in job posts) and "Difficulty" (time to learn).
4. **Recommend Resources:** Map skills to specific courses, projects, or certifications.
