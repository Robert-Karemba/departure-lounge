import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// JSON parser middleware
app.use(express.json());

// Database Path setup
const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

// Ensure data folder exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database Operations
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], stories: [], chapters: [], volumes: [] };
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [], stories: [], chapters: [], volumes: [] };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  console.log("Gemini API Key detected. Initializing client...");
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("No GEMINI_API_KEY found. Operating in local fallback mode.");
}

// Authentication Helpers
function parseAuthToken(authHeader: string | undefined): any | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const db = readDb();
  // Find user by token. (Token format is token-<userId>-<timestamp>)
  if (token.startsWith("token-")) {
    const parts = token.split("-");
    const userId = parts[1];
    const user = db.users.find((u: any) => u.id === userId);
    return user || null;
  }
  return null;
}

// ==========================================
// API ROUTES
// ==========================================

// Authenticate current user
app.get("/api/auth/me", (req, res) => {
  const user = parseAuthToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Return user details sans password
  const { password, ...userSansPassword } = user;
  res.json(userSansPassword);
});

// Register User
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = readDb();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this email" });
  }

  const userId = `user-${Math.random().toString(36).substring(2, 11)}`;
  
  // Set user as admin if they match the primary email listed in the current context
  const role = email.toLowerCase() === "karobert96@gmail.com" ? "admin" : "user";

  const newUser = {
    id: userId,
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: password, // simple storage
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = `token-${userId}-${Date.now()}`;
  res.status(201).json({
    token,
    user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
  });
});

// Login User
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

// Get stories (Browse)
app.get("/api/stories", (req, res) => {
  const { category } = req.query;
  const db = readDb();

  // Return approved stories
  let publicStories = db.stories.filter((s: any) => s.status === "approved");

  if (category && category !== "all") {
    publicStories = publicStories.filter((s: any) => s.category === category);
  }

  // Sort by newest first
  publicStories.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(publicStories);
});

// Submit a new story (curation by Gemini AI)
app.post("/api/stories", async (req, res) => {
  const user = parseAuthToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Sign in to submit your story." });
  }

  const { title, body, category: selfSelectedCategory } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "Title and story body are required" });
  }

  const db = readDb();
  const storyId = `story-${Math.random().toString(36).substring(2, 11)}`;

  let category = selfSelectedCategory || "other";
  let readTime = Math.max(1, Math.round(body.split(/\s+/).length / 180)); // Fallback: 180 wpm
  let excerpt = body.split(/[.!?]+/).slice(0, 2).join(". ") + ".";
  if (excerpt.length > 140) {
    excerpt = excerpt.substring(0, 137) + "...";
  }
  let aiSelected = body.length > 200; // Poetic length checks
  let isSafe = true;
  let systemFeedback = "We loved reading your recollection. Thank you for locking it into the lounge.";

  // Call Gemini AI server-side
  if (ai) {
    try {
      console.log(`Analyzing story: "${title}" with Gemini 3.5 Flash...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the Editor-in-Chief and AI Curator of "Departure Lounge", a beautifully polished, anonymous anthology of human memories.
An anonymous user submitted a story. I need you to read, clean, moderate, categorize, summarize, and rate its emotional resonance for inclusion in our book.

STORY TITLE: "${title}"
STORY BODY:
"${body}"

Analyze the story and output a JSON response matching this schema:
{
  "category": "loss" | "love" | "adventure" | "family" | "work" | "other",
  "read_time_minutes": number, // integer, usually 1 to 5 based on length & pacing
  "excerpt": string, // brief, poetic 2-sentence summary/hook of the story. Do not mention "this story is about" or use clinical words. Keep it highly emotive and deep. Max 140 characters.
  "ai_selected": boolean, // true if the story is genuinely touching, well-written, meaningful, or possesses significant emotional depth. false if it is spam, average, low-effort, gibberish, or overly dry. Be moderately selective (e.g. 50-60% selection rate for coherent emotional writing).
  "is_safe": boolean, // true if it is safe, does not contain massive hate speech, extreme toxicity, or explicit advertising spam.
  "system_feedback": string // a brief reassuring sentence of feedback about the writing. e.g. "A beautiful, nostalgic reflection on family."
}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, enum: ["loss", "love", "adventure", "family", "work", "other"] },
              read_time_minutes: { type: Type.INTEGER },
              excerpt: { type: Type.STRING },
              ai_selected: { type: Type.BOOLEAN },
              is_safe: { type: Type.BOOLEAN },
              system_feedback: { type: Type.STRING }
            },
            required: ["category", "read_time_minutes", "excerpt", "ai_selected", "is_safe", "system_feedback"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const analysis = JSON.parse(resultText);
        console.log("Gemini curation result:", analysis);
        
        category = analysis.category || category;
        readTime = analysis.read_time_minutes || readTime;
        excerpt = analysis.excerpt || excerpt;
        aiSelected = analysis.ai_selected ?? aiSelected;
        isSafe = analysis.is_safe ?? isSafe;
        systemFeedback = analysis.system_feedback || systemFeedback;
      }
    } catch (err) {
      console.error("Gemini analysis error:", err);
      // fallback handles it nicely
    }
  }

  // Create active story
  const newStory = {
    id: storyId,
    title: title.trim(),
    body: body.trim(),
    category,
    authorId: user.id,
    authorUsername: user.username,
    createdAt: new Date().toISOString(),
    excerpt,
    read_time: readTime,
    ai_selected: aiSelected,
    status: isSafe ? "approved" : "rejected"
  };

  db.stories.push(newStory);

  // If approved & selected by AI, automatically append to Chapters!
  if (isSafe && aiSelected) {
    // Determine last chapter page number
    let startPage = 1;
    if (db.chapters && db.chapters.length > 0) {
      const sortedChapters = [...db.chapters].sort((a: any, b: any) => b.page_end - a.page_end);
      startPage = sortedChapters[0].page_end + 1;
    } else {
      db.chapters = [];
    }

    const endPage = startPage + Math.max(4, readTime * 4) + Math.floor(Math.random() * 3);
    const chapterId = `chapter-${Math.random().toString(36).substring(2, 11)}`;
    const chapterTitle = newStory.title;
    const readableCategoryName = category.charAt(0).toUpperCase() + category.slice(1);

    db.chapters.push({
      id: chapterId,
      title: chapterTitle,
      category: readableCategoryName,
      page_start: startPage,
      page_end: endPage,
      storyId: storyId
    });
  }

  writeDb(db);

  res.status(201).json({
    story: newStory,
    ai_selected: aiSelected,
    feedback: systemFeedback,
    is_safe: isSafe
  });
});

// Get user specific submissions
app.get("/api/stories/contributor/:userId", (req, res) => {
  const user = parseAuthToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { userId } = req.params;
  const db = readDb();
  
  // Return submissions by this user
  const userStories = db.stories.filter((s: any) => s.authorId === userId);
  res.json(userStories);
});

// Admin Statistics Dashboard
app.get("/api/admin/stats", (req, res) => {
  const user = parseAuthToken(req.headers.authorization);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }

  const db = readDb();
  const pending = db.stories.filter((s: any) => s.status === "pending").length;
  const approved = db.stories.filter((s: any) => s.status === "approved").length;
  const rejected = db.stories.filter((s: any) => s.status === "rejected").length;
  const aiSelected = db.stories.filter((s: any) => s.ai_selected === true).length;

  res.json({
    pending_stories: pending,
    approved_stories: approved,
    ai_selected_stories: aiSelected,
    rejected_stories: rejected
  });
});

// Admin change story status or toggle AI selection
app.post("/api/admin/stories/:storyId/status", (req, res) => {
  const user = parseAuthToken(req.headers.authorization);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { storyId } = req.params;
  const { status, ai_selected } = req.body;

  const db = readDb();
  const storyIndex = db.stories.findIndex((s: any) => s.id === storyId);

  if (storyIndex === -1) {
    return res.status(404).json({ error: "Story not found" });
  }

  const story = db.stories[storyIndex];

  if (status) story.status = status;
  if (ai_selected !== undefined) {
    const prevSelected = story.ai_selected;
    story.ai_selected = ai_selected;

    // Adjust Chapter Index accordingly
    if (ai_selected && !prevSelected) {
      // Add Chapter
      let startPage = 1;
      if (db.chapters && db.chapters.length > 0) {
        const sortedChapters = [...db.chapters].sort((a: any, b: any) => b.page_end - a.page_end);
        startPage = sortedChapters[0].page_end + 1;
      } else {
        db.chapters = [];
      }
      const endPage = startPage + Math.max(4, story.read_time * 4) + Math.floor(Math.random() * 3);
      db.chapters.push({
        id: `chapter-${Math.random().toString(36).substring(2, 11)}`,
        title: story.title,
        category: story.category.charAt(0).toUpperCase() + story.category.slice(1),
        page_start: startPage,
        page_end: endPage,
        storyId: story.id
      });
    } else if (!ai_selected && prevSelected) {
      // Remove Chapter
      db.chapters = db.chapters.filter((c: any) => c.storyId !== storyId);
    }
  }

  writeDb(db);
  res.json({ success: true, story });
});

// Get Chapters for a Volume (Volume 1)
app.get("/api/chapters/1", (req, res) => {
  const db = readDb();
  res.json(db.chapters || []);
});

// ==========================================
// VITE CLIENT INTEGRATION
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Departure Lounge server is now running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
