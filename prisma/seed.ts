import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ── Admin User ──────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@bejanko.com" },
    update: {},
    create: {
      name: "B.E. Janko Jnr",
      email: "admin@bejanko.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user:", admin.email);

  // ── Essays ──────────────────────────────────────
  const essays = [
    {
      title: "The Weight of Unwritten Things",
      slug: "weight-of-unwritten-things",
      content: "<p>There is a particular heaviness that comes from carrying stories you have never told. Not because they are too painful or too private, but because you have not yet found the right words. The unwritten thing sits in you like a stone in a riverbed—shaped by the current, but immovable.</p><h2>The Paradox of Silence</h2><p>Every writer knows this weight. It is the paradox of silence: the more you need to say, the harder it becomes to begin. The blank page is not empty—it is full of everything you have not yet dared to commit to language.</p><h2>Finding the First Word</h2><p>The trick, if there is one, is to begin badly. To write the wrong sentence, the clumsy paragraph, the embarrassing first draft. Because the unwritten thing does not need perfection. It needs permission.</p><p>Give yourself that permission. Write the thing that scares you. Write it poorly if you must. But write it.</p>",
      excerpt: "On the stories we carry but never commit to paper, and why the unwritten word weighs more than the written one.",
      readingTime: 8,
      startHere: true,
      published: true,
    },
    {
      title: "Marginalia as Method",
      slug: "marginalia-as-method",
      content: "<p>I learned to write in the margins of other people's books. Not out of disrespect, but out of dialogue. Every underline was a handshake, every annotation a letter to an author who would never read it.</p><h2>The Conversation Between Reader and Writer</h2><p>Marginalia is proof that reading is not passive. When you write in the margins, you are not consuming a text—you are wrestling with it. You are saying: I was here. I disagreed. I was changed.</p><h2>From Margins to Pages</h2><p>My own voice emerged from those margins. The notes I left in borrowed books became the seeds of essays. The questions I scribbled became the openings of longer works. Writing in the margins taught me that every great work begins as a response to something else.</p>",
      excerpt: "How writing in the margins of other people's work taught me to find my own voice between the lines.",
      readingTime: 6,
      startHere: true,
      published: true,
    },
    {
      title: "A Case for Slowness",
      slug: "case-for-slowness",
      content: "<p>Speed is the enemy of depth. In a world that rewards velocity—fast content, fast takes, fast responses—the deliberate act of slowing down becomes revolutionary.</p><h2>The Cult of Productivity</h2><p>We have been taught that more is better, that faster is smarter, that efficiency is the highest virtue. But what do we lose when we optimize every moment? We lose the digression, the tangent, the beautiful waste of time that leads somewhere unexpected.</p><h2>Slow Reading, Slow Writing</h2><p>A book read slowly is a different book than one consumed quickly. A sentence written slowly carries weight that a rapid draft cannot match. Slowness is not laziness—it is a form of attention.</p><h2>The Practice</h2><p>Try this: spend an hour with a single page. Read it once for meaning, again for rhythm, again for what lies beneath the words. You will find that slowness reveals what speed conceals.</p>",
      excerpt: "In a world optimized for speed, the deliberate act of slowing down becomes a radical creative practice.",
      readingTime: 10,
      startHere: true,
      published: true,
    },
    {
      title: "On the Discipline of Revision",
      slug: "discipline-of-revision",
      content: "<p>The willingness to cut what you love is the truest measure of a writer's commitment to their craft. Revision is not editing—it is reimagining.</p><h2>Kill Your Darlings</h2><p>The phrase is worn thin from repetition, but the truth beneath it remains sharp. The sentence you are most proud of is often the one that must go. Not because it is bad, but because it serves you instead of the reader.</p><p>Discipline in revision means reading your own work as a stranger would. It means asking not 'is this beautiful?' but 'is this necessary?'</p>",
      excerpt: "Why the willingness to cut what you love is the truest measure of a writer's commitment to their craft.",
      readingTime: 7,
      published: true,
    },
    {
      title: "Reading as Resistance",
      slug: "reading-as-resistance",
      content: "<p>In an age of distraction, sitting with a book becomes an act of quiet defiance. To read—really read, with full attention—is to refuse the fragmentation that digital life demands.</p><p>A book asks for sustained attention. It asks you to hold a single thread for hours, to resist the pull of notifications and feeds. In this sense, reading is a political act. It is a declaration that your attention belongs to you.</p>",
      excerpt: "In an age of distraction, sitting with a book becomes an act of quiet defiance.",
      readingTime: 5,
      published: true,
    },
    {
      title: "The Architecture of Sentences",
      slug: "architecture-of-sentences",
      content: "<p>How the structure of a sentence shapes meaning in ways we rarely notice. A sentence is not merely a vehicle for information—it is a small building, and like any building, its architecture determines how we move through it.</p><p>Consider the difference between a sentence that places the subject first and one that delays it. The first is a door thrown open; the second is a corridor. Both arrive at the same room, but the experience of arrival is utterly different.</p>",
      excerpt: "How the structure of a sentence shapes meaning in ways we rarely notice.",
      readingTime: 9,
      published: true,
    },
  ];

  for (const essay of essays) {
    await db.essay.upsert({
      where: { slug: essay.slug },
      update: {},
      create: { ...essay, authorId: admin.id },
    });
  }
  console.log(`Seeded ${essays.length} essays`);

  // ── Notes ───────────────────────────────────────
  const notes = [
    {
      title: "On Silence",
      slug: "on-silence",
      content: "<p>Silence is not the absence of sound. It is the presence of attention. When you sit in a quiet room and truly listen, you hear everything—the hum of the world continuing without your participation.</p><p>Writers need silence the way painters need light. Not as a luxury, but as a medium.</p>",
      published: true,
    },
    {
      title: "Fragment: Morning Practice",
      slug: "fragment-morning-practice",
      content: "<p>The best writing happens before the mind has fully woken. There is a narrow window between sleep and consciousness where the censor is still drowsy. Write in that window.</p>",
      published: true,
    },
    {
      title: null,
      slug: "untitled-note-1",
      content: "<p>Rereading my marginalia from five years ago. I was a different reader then—more generous with my exclamation marks, less patient with ambiguity. Growth looks like the willingness to sit with what you do not understand.</p>",
      published: true,
    },
    {
      title: "On Notebooks",
      slug: "on-notebooks",
      content: "<p>The notebook you carry says something about the writer you want to be. Mine is small enough to fit in a pocket—a reminder that writing should be portable, available, always within reach.</p>",
      published: true,
    },
    {
      title: null,
      slug: "untitled-note-2",
      content: "<p>Overheard at the café: 'I don't have time to read.' But you have time to scroll. You have time to argue with strangers. You have time for everything except the thing that might change you.</p>",
      published: true,
    },
  ];

  for (const note of notes) {
    await db.note.upsert({
      where: { slug: note.slug },
      update: {},
      create: { ...note, authorId: admin.id },
    });
  }
  console.log(`Seeded ${notes.length} notes`);

  // ── Quotes ──────────────────────────────────────
  const quotes = [
    { content: "We write to taste life twice, in the moment and in retrospect.", source: "Anais Nin", published: true },
    { content: "The first draft is just you telling yourself the story.", source: "Terry Pratchett", published: true },
    { content: "A writer is someone for whom writing is more difficult than it is for other people.", source: "Thomas Mann", published: true },
    { content: "You can always edit a bad page. You can't edit a blank page.", source: "Jodi Picoult", published: true },
    { content: "I can shake off everything as I write; my sorrows disappear, my courage is reborn.", source: "Anne Frank", published: true },
    { content: "There is no greater agony than bearing an untold story inside you.", source: "Maya Angelou", published: true },
  ];

  for (const quote of quotes) {
    const existing = await db.quote.findFirst({
      where: { content: quote.content, authorId: admin.id },
    });
    if (!existing) {
      await db.quote.create({
        data: { ...quote, authorId: admin.id },
      });
    }
  }
  console.log(`Seeded ${quotes.length} quotes`);

  // ── Books ───────────────────────────────────────
  const books = [
    { title: "Marginalia", slug: "marginalia", bookAuthor: "B.E. Janko Jnr", year: 2025, excerpt: "A collection of essays on reading, writing, and the spaces between.", shelf: "MINE" as const, sortOrder: 0, published: true },
    { title: "The Writing Life", slug: "the-writing-life", bookAuthor: "Annie Dillard", year: 1989, excerpt: "A meditation on the art of writing and the dedication it demands.", shelf: "OTHERS" as const, sortOrder: 0, published: true },
    { title: "Several Short Sentences About Writing", slug: "several-short-sentences", bookAuthor: "Verlyn Klinkenborg", year: 2012, excerpt: "A radical approach to writing that begins with the sentence.", shelf: "OTHERS" as const, sortOrder: 1, published: true },
    { title: "Bird by Bird", slug: "bird-by-bird", bookAuthor: "Anne Lamott", year: 1994, excerpt: "Instructions on writing and life, told with warmth and humor.", shelf: "OTHERS" as const, sortOrder: 2, published: true },
  ];

  for (const book of books) {
    await db.book.upsert({
      where: { slug: book.slug },
      update: {},
      create: book,
    });
  }
  console.log(`Seeded ${books.length} books`);

  // ── Author Profiles ─────────────────────────────
  const authors = [
    { name: "B.E. Janko Jnr", slug: "be-janko-jnr", bio: "Writer, thinker, creator. Focused on language, meaning, and the quiet work of paying attention.", excerpt: "Writer & Creator", role: "Founder", sortOrder: 0, published: true },
    { name: "Amara Osei", slug: "amara-osei", bio: "Amara writes about memory, migration, and the languages we inherit.", excerpt: "Guest Contributor", role: "Guest Writer", sortOrder: 1, published: true },
    { name: "David Mwangi", slug: "david-mwangi", bio: "David explores the intersection of oral tradition and modern storytelling.", excerpt: "Guest Contributor", role: "Guest Writer", sortOrder: 2, published: true },
  ];

  for (const author of authors) {
    await db.authorProfile.upsert({
      where: { slug: author.slug },
      update: {},
      create: author,
    });
  }
  console.log(`Seeded ${authors.length} author profiles`);

  // ── Site Settings ───────────────────────────────
  const settings = [
    { key: "siteName", value: "Mind Substances" },
    { key: "siteDescription", value: "Essays, notes, and fragments on language, meaning, and the quiet work of paying attention." },
    { key: "contactEmail", value: "hello@bejanko.com" },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`Seeded ${settings.length} site settings`);

  console.log("\nSeed complete!");
  console.log("Login: admin@bejanko.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
