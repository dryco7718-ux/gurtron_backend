import { supabase } from "./supabase";
import { logger } from "./logger";

export type AchievementData = {
  yearsExperience: string;
  studentsGuided: string;
  batchSuccess: string;
};

export type WhyData = {
  title: string;
  description: string;
  rows: Array<{ label: string; old: string; neu: string }>;
};

export type FacultyMember = {
  id: string;
  name: string;
  role: string;
  image?: string;
};

export type Review = {
  id: string;
  name: string;
  role: string;
  content: string;
};

export type FaqItem = {
  id: string;
  q: string;
  a: string;
};

export type ContactData = {
  phone: string;
  email: string;
  location: string;
  mapsLink: string;
};

export type StoryData = {
  title: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  publishedAt: string;
};

export type Topper = {
  id: string;
  name: string;
  score: string;
  subject: string;
  image?: string;
};

export type SiteData = {
  achievements: AchievementData;
  why: WhyData;
  faculty: FacultyMember[];
  reviews: Review[];
  faqs: FaqItem[];
  contact: ContactData;
  ourStory: StoryData;
  toppers: Topper[];
  blogPosts: BlogPost[];
};

export async function loadSiteData(): Promise<SiteData> {
  const [
    achievementsRes,
    whyRes,
    whyRowsRes,
    facultyRes,
    reviewsRes,
    faqsRes,
    contactRes,
    storyRes,
    storyStatsRes,
    toppersRes,
    blogPostsRes,
  ] = await Promise.all([
    supabase.from("achievements").select("key, value"),
    supabase.from("why_gurtron").select("*").limit(1).single(),
    supabase.from("why_gurtron_rows").select("label, old, neu"),
    supabase.from("faculty").select("*").order("name"),
    supabase.from("reviews").select("*").order("name"),
    supabase.from("faqs").select("*").order("question"),
    supabase.from("contact_details").select("*").limit(1).single(),
    supabase.from("our_story").select("*").limit(1).single(),
    supabase.from("our_story_stats").select("value, label"),
    supabase.from("toppers").select("*").order("name"),
    supabase.from("blog_posts").select("*").order("published_at", { ascending: false }),
  ]);

  if (achievementsRes.error) throw new Error(achievementsRes.error.message);

  let blogPostsRaw = blogPostsRes.data ?? [];
  if (blogPostsRes.error) {
    const msg = blogPostsRes.error.message ?? "";
    if (/blog_posts|relation.*blog_posts|table.*blog_posts/i.test(msg)) {
      logger.warn({ err: blogPostsRes.error }, "blog_posts table unavailable while loading site data");
      blogPostsRaw = [];
    } else {
      throw new Error(blogPostsRes.error.message);
    }
  }

  const getVal = (key: string) =>
    achievementsRes.data?.find((r) => r.key === key)?.value ?? "";

  const achievements: AchievementData = {
    yearsExperience: getVal("yearsExperience"),
    studentsGuided: getVal("studentsGuided"),
    batchSuccess: getVal("batchSuccess"),
  };

  const why: WhyData = {
    title: whyRes.data?.title ?? "",
    description: whyRes.data?.description ?? "",
    rows: whyRowsRes.data ?? [],
  };

  const faculty: FacultyMember[] = (facultyRes.data ?? []).map(
    (f: { id: string; name: string; role: string; image_url: string | null }) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      image: f.image_url ?? undefined,
    }),
  );

  const reviews: Review[] = (reviewsRes.data ?? []).map(
    (r: { id: string; name: string; role: string; content: string }) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      content: r.content,
    }),
  );

  const faqs: FaqItem[] = (faqsRes.data ?? []).map(
    (f: { id: string; question: string; answer: string }) => ({
      id: f.id,
      q: f.question,
      a: f.answer,
    }),
  );

  const contact: ContactData = {
    phone: contactRes.data?.phone ?? "",
    email: contactRes.data?.email ?? "",
    location: contactRes.data?.location ?? "",
    mapsLink: contactRes.data?.maps_link ?? "",
  };

  const ourStory: StoryData = {
    title: storyRes.data?.title ?? "",
    description: storyRes.data?.description ?? "",
    stats: storyStatsRes.data ?? [],
  };

  const toppers: Topper[] = (toppersRes.data ?? []).map(
    (t: { id: string; name: string; score: string; subject: string; image_url: string | null }) => ({
      id: t.id,
      name: t.name,
      score: t.score,
      subject: t.subject,
      image: t.image_url ?? undefined,
    }),
  );

  const blogPosts: BlogPost[] = (blogPostsRaw ?? []).map(
    (b: { id: string; title: string; slug: string; summary: string; content: string; published_at: string }) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      summary: b.summary,
      content: b.content,
      publishedAt: b.published_at,
    }),
  );

  return { achievements, why, faculty, reviews, faqs, contact, ourStory, toppers, blogPosts };
}

export async function saveSiteData(data: SiteData): Promise<void> {
  const achievementRows = [
    { key: "yearsExperience", value: data.achievements.yearsExperience },
    { key: "studentsGuided", value: data.achievements.studentsGuided },
    { key: "batchSuccess", value: data.achievements.batchSuccess },
  ];

  const { error: achErr } = await supabase.from("achievements").upsert(achievementRows, {
    onConflict: "key",
  });
  if (achErr) throw new Error(`Achievements: ${achErr.message}`);

  const { data: whyInsert, error: whyErr } = await supabase
    .from("why_gurtron")
    .upsert({ id: 1, title: data.why.title, description: data.why.description }, { onConflict: "id" })
    .select("id")
    .single();
  if (whyErr) throw new Error(`Why GurTron: ${whyErr.message}`);

  const whyId = whyInsert.id;
  const { error: delRowsErr } = await supabase
    .from("why_gurtron_rows")
    .delete()
    .eq("why_id", whyId);
  if (delRowsErr) throw new Error(`Why rows delete: ${delRowsErr.message}`);

  if (data.why.rows.length > 0) {
    const { error: insRowsErr } = await supabase.from("why_gurtron_rows").insert(
      data.why.rows.map((r) => ({ why_id: whyId, label: r.label, old: r.old, neu: r.neu })),
    );
    if (insRowsErr) throw new Error(`Why rows insert: ${insRowsErr.message}`);
  }

  const { error: delFacErr } = await supabase.from("faculty").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delFacErr) throw new Error(`Faculty delete: ${delFacErr.message}`);
  if (data.faculty.length > 0) {
    const { error: insFacErr } = await supabase.from("faculty").insert(
      data.faculty.map((f) => ({ name: f.name, role: f.role, image_url: f.image ?? null })),
    );
    if (insFacErr) throw new Error(`Faculty insert: ${insFacErr.message}`);
  }

  const { error: delRevErr } = await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delRevErr) throw new Error(`Reviews delete: ${delRevErr.message}`);
  if (data.reviews.length > 0) {
    const { error: insRevErr } = await supabase.from("reviews").insert(
      data.reviews.map((r) => ({ name: r.name, role: r.role, content: r.content })),
    );
    if (insRevErr) throw new Error(`Reviews insert: ${insRevErr.message}`);
  }

  const { error: delFaqErr } = await supabase.from("faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delFaqErr) throw new Error(`FAQs delete: ${delFaqErr.message}`);
  if (data.faqs.length > 0) {
    const { error: insFaqErr } = await supabase.from("faqs").insert(
      data.faqs.map((f) => ({ question: f.q, answer: f.a })),
    );
    if (insFaqErr) throw new Error(`FAQs insert: ${insFaqErr.message}`);
  }

  const { error: delBlogErr } = await supabase.from("blog_posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delBlogErr) {
    const msg = delBlogErr.message ?? "";
    if (/blog_posts|relation.*blog_posts|table.*blog_posts/i.test(msg)) {
      logger.warn({ err: delBlogErr }, "Skipping blog_posts save because the blog_posts table is unavailable");
    } else {
      throw new Error(`Blog posts delete: ${delBlogErr.message}`);
    }
  }

  if (data.blogPosts.length > 0) {
    const { error: insBlogErr } = await supabase.from("blog_posts").insert(
      data.blogPosts.map((post) => ({
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        published_at: post.publishedAt,
      })),
    );
    if (insBlogErr) {
      const msg = insBlogErr.message ?? "";
      if (/blog_posts|relation.*blog_posts|table.*blog_posts/i.test(msg)) {
        logger.warn({ err: insBlogErr }, "Skipping blog_posts insert because the blog_posts table is unavailable");
      } else {
        throw new Error(`Blog posts insert: ${insBlogErr.message}`);
      }
    }
  }

  const { error: contactErr } = await supabase
    .from("contact_details")
    .upsert(
      {
        id: 1,
        phone: data.contact.phone,
        email: data.contact.email,
        location: data.contact.location,
        maps_link: data.contact.mapsLink,
      },
      { onConflict: "id" },
    );
  if (contactErr) throw new Error(`Contact: ${contactErr.message}`);

  const { data: storyInsert, error: storyErr } = await supabase
    .from("our_story")
    .upsert({ id: 1, title: data.ourStory.title, description: data.ourStory.description }, { onConflict: "id" })
    .select("id")
    .single();
  if (storyErr) throw new Error(`Our Story: ${storyErr.message}`);

  const storyId = storyInsert.id;
  const { error: delStatsErr } = await supabase
    .from("our_story_stats")
    .delete()
    .eq("story_id", storyId);
  if (delStatsErr) throw new Error(`Story stats delete: ${delStatsErr.message}`);

  if (data.ourStory.stats.length > 0) {
    const { error: insStatsErr } = await supabase.from("our_story_stats").insert(
      data.ourStory.stats.map((s) => ({ story_id: storyId, label: s.label, value: s.value })),
    );
    if (insStatsErr) throw new Error(`Story stats insert: ${insStatsErr.message}`);
  }

  const { error: delTopErr } = await supabase.from("toppers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delTopErr) throw new Error(`Toppers delete: ${delTopErr.message}`);
  if (data.toppers.length > 0) {
    const { error: insTopErr } = await supabase.from("toppers").insert(
      data.toppers.map((t) => ({ name: t.name, score: t.score, subject: t.subject, image_url: t.image ?? null })),
    );
    if (insTopErr) throw new Error(`Toppers insert: ${insTopErr.message}`);
  }
}
