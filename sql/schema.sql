-- Supabase / PostgreSQL schema for GurTron content management

-- Achievement counters
CREATE TABLE achievements (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Why GurTron content and comparison rows
CREATE TABLE why_gurtron (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL
);

CREATE TABLE why_gurtron_rows (
  id serial PRIMARY KEY,
  why_id integer NOT NULL REFERENCES why_gurtron(id) ON DELETE CASCADE,
  label text NOT NULL,
  old text NOT NULL,
  neu text NOT NULL
);

-- Faculty members
CREATE TABLE faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  image_url text
);

-- Student / parent reviews
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  content text NOT NULL
);

-- Frequently asked questions
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL
);

-- Contact details
CREATE TABLE contact_details (
  id serial PRIMARY KEY,
  phone text NOT NULL,
  email text NOT NULL,
  location text NOT NULL,
  maps_link text
);

-- Our story content and stats
CREATE TABLE our_story (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL
);

CREATE TABLE our_story_stats (
  id serial PRIMARY KEY,
  story_id integer NOT NULL REFERENCES our_story(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL
);

-- Recent toppers
CREATE TABLE toppers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  score text NOT NULL,
  subject text NOT NULL,
  image_url text
);

-- Blog posts for announcements, updates, and SEO content
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  content text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);

-- Seed data
INSERT INTO achievements (key, value) VALUES
  ('yearsExperience', '5+'),
  ('studentsGuided', '100+'),
  ('batchSuccess', '98%');

INSERT INTO why_gurtron (title, description) VALUES
  ('Modern coaching built for smarter results.', 'GurTron is not just a coaching institute. It is an intelligent education ecosystem that blends expert guidance with powerful AI tools.');

INSERT INTO why_gurtron_rows (why_id, label, old, neu) VALUES
  (1, 'Delivery', 'Offline only', 'Offline coaching with digital support'),
  (1, 'Tests', 'Manual test prep', 'AI-created timed quizzes'),
  (1, 'Analytics', 'No data insights', 'Batch-wide performance tracking'),
  (1, 'Practice', 'Limited sets', 'Regular chapter-based practice'),
  (1, 'Strategy', 'One-size coaching', 'Personalised exam plans');

INSERT INTO faculty (name, role, image_url) VALUES
  ('Manoj Sir', 'Physics', NULL),
  ('Vijay Sir', 'Mathematics', NULL),
  ('Sudhir Sir', 'Botany', NULL),
  ('Kavita Mam', 'Zoology', NULL);

INSERT INTO reviews (name, role, content) VALUES
  ('Aditi Sharma', 'NEET Aspirant', 'GurTron made my preparation focused and consistent, with clear guidance for every chapter.'),
  ('Rohit Kumar', 'JEE Aspirant', 'Weekly tests and mentor feedback helped me stay on track and improve my confidence.'),
  ('Sneha Verma', 'Parent', 'My child gained real momentum with GurTron’s coaching, guidance and exam-ready practice.');

INSERT INTO faqs (question, answer) VALUES
  ('How does GurTron work?', 'GurTron blends offline coaching with AI-driven tests, progress analytics and personalised practice plans.'),
  ('Is digital access included?', 'Yes, every student gets GurTron digital support as part of the program, with tests and analytics included.'),
  ('Which classes are supported?', 'We support NEET, JEE, CBSE and HBSE students across Class 11, 12 and repeaters.');

INSERT INTO contact_details (phone, email, location, maps_link) VALUES
  ('+91 82958 52556', 'info@gurtroninstitute.com', 'Near City Kids, Sain Chowk, Narnaul, Haryana', 'https://maps.app.goo.gl/dggbBmyUmo2CdSot6');

INSERT INTO our_story (title, description) VALUES
  ('From a small coaching center to GurTron’s smart learning journey.', 'GurTron started with a simple goal: help students grow with clear coaching, strong practice and gentle guidance. Today we blend classroom trust with intelligent tools to keep learning practical.');

INSERT INTO our_story_stats (story_id, label, value) VALUES
  (1, 'Coaching', '12+ years'),
  (1, 'Focus', 'NEET & JEE'),
  (1, 'Reach', '1000+ students'),
  (1, 'Approach', 'Smart support');

INSERT INTO toppers (name, score, subject, image_url) VALUES
  ('Janvi Sharma', '100/100', 'Physics', NULL),
  ('Paramjeet Singh', '99.4%', 'Chemistry', NULL),
  ('Yogesh Gupta', '99.8%', 'Biology', NULL);

INSERT INTO blog_posts (title, slug, summary, content, published_at) VALUES
  ('Why GurTron is the smart choice for NEET & JEE coaching', 'why-gurtron-smart-choice', 'Discover how GurTron blends expert coaching, tests, and analytics for predictable results.', 'GurTron brings focused lesson plans, weekly mock tests, and progress tracking to help students prepare smarter for their exams.', '2026-01-05T08:00:00Z'),
  ('Top strategies to improve your exam rank in 3 months', 'exam-rank-strategy', 'Use targeted revision, consistent test practice, and mentor support to improve your rank quickly.', 'Our coaching strategy focuses on high-value chapters, daily performance reviews, and personalized study plans that adapt as you progress.', '2026-01-10T08:00:00Z');
