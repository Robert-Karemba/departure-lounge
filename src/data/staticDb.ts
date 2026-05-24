import { Story, Chapter } from "../types";

export const DEFAULT_STORIES: Story[] = [
  {
    id: "story-loss-1",
    title: "Unfinished Conversations",
    body: "My grandfather and I used to sit on the porch in the late July heat, peeling oranges in one continuous spiral. We didn't talk much, but the rhythm of the knife and the sweet citrus mist was its own language. When he passed, he left a notebook with half-written recipes and unsent postcards. I keep one in my wallet. It’s been three years, but sometimes, when I pull up to an intersection under a yellow light, I still turn to my right, expecting him to hand me a perfect slice of orange.",
    category: "loss",
    authorId: "admin-id-1234",
    authorUsername: "curator",
    createdAt: "2026-05-24T11:00:00Z",
    excerpt: "A quiet reflection on porch summer afternoons, peeling oranges, and the remnants of unvoiced thoughts left in a grandfather's notebook.",
    read_time: 2,
    ai_selected: true,
    status: "approved"
  },
  {
    id: "story-love-1",
    title: "Yellow Umbrella",
    body: "It was pouring on the London Underground, and everyone was wearing black, damp coats, staring at their phones. Then she walked in carrying a vibrant yellow umbrella that smelled like rain and lavender. She sat across from me and caught me staring at her wet shoes. She laughed, eyes lighting up, and said, 'The sky is crying, but we don't have to.' We talked for exactly four stops about nothing and everything. When she stood up at Waterloo, she handed me the yellow umbrella and whispered, 'Keep it warm.' I never saw her again, but I carry that umbrella every time the clouds gather.",
    category: "love",
    authorId: "admin-id-1234",
    authorUsername: "curator",
    createdAt: "2026-05-24T11:05:00Z",
    excerpt: "A fleeting meeting on a rainwater-soaked Underground train, marked by a bright yellow umbrella and a brief contact of souls.",
    read_time: 2,
    ai_selected: true,
    status: "approved"
  },
  {
    id: "story-adventure-1",
    title: "Patagonian Wind",
    body: "In Patagonia, the wind doesn't just blow; it commands. I spent six days trekking alone near Fitz Roy, with freezing sleet stinging my cheeks and a pack that felt like lead. On the third night, the storm ripped my tent stakes from the earth. I was shivering, holding onto the tearing canvas under a roof of infinite stars, feeling utterly small and disposable. It was terrifying, and yet, looking up at the Milky Way stretching across the jagged peaks, I felt a strange, wild peace. I survived the night, but the quiet of that vast mountain valley never really left me.",
    category: "adventure",
    authorId: "admin-id-1234",
    authorUsername: "curator",
    createdAt: "2026-05-24T11:10:00Z",
    excerpt: "A solitary journey through freezing wind and towering Patagonian peaks, discovering a wild calm beneath a sky of infinite stars.",
    read_time: 3,
    ai_selected: true,
    status: "approved"
  },
  {
    id: "story-family-1",
    title: "Ritual of the Sundays",
    body: "Every Sunday morning, my mother would wake up at 5:00 AM to start the bread dough. The kitchen was always the warmest room in the house, smelling of yeast, scalded milk, and soft woodsmoke. I loved the rhythmic thumping of her knuckles against the wooden board, kneading life into the flour. She told me that bread has memory, and if you knead it with anger, it will rise heavy and sour. It has taken me forty years and my own kitchen to understand what she meant. Now, my daughter sits on the counter, dust of flour on her nose, listening to the same quiet thump of my hands.",
    category: "family",
    authorId: "admin-id-1234",
    authorUsername: "curator",
    createdAt: "2026-05-23T10:00:00Z",
    excerpt: "A warm story about family traditions, early Sunday mornings, and the kneading of memories across generations.",
    read_time: 2,
    ai_selected: true,
    status: "approved"
  },
  {
    id: "story-work-1",
    title: "Leaving the Glass Tower",
    body: "For twelve years I lived behind a dual-monitor setup on the 24th floor, writing optimization software for logistics companies. My life was measured in sprint reviews, ticket backlogs, and fluorescent lighting. Then, one Tuesday, I went home early and bought twenty pounds of raw gray clay. My first pots were lumpy, collapsing under their own weight on the wheel, but my hands were covered in cold, organic mud. I quit the logistics firm four months later. I make half of what I used to, but when I open the hot kiln in the quiet morning mist, I am holding something real that I made myself.",
    category: "work",
    authorId: "admin-id-1234",
    authorUsername: "curator",
    createdAt: "2026-05-22T08:30:00Z",
    excerpt: "Trading a tech career in a logistics corporate tower for the cold, muddy touch of a potter's wheel and real fulfillment.",
    read_time: 3,
    ai_selected: true,
    status: "approved"
  },
  {
    id: "story-other-1",
    title: "The Midnight Coffee Shop",
    body: "There is a 24-hour diner on Route 9 where the coffee tastes like burnt water, but the booths are covered in faded red vinyl that holds fifty years of confessions. I sit here when the insomnia gets too loud. Last night, the waitress, a woman named Clara with tired, kind eyes, gave me a slice of apple pie on the house. She said, 'The night is always longest right before the sun shows up. Hang in there.' We didn't exchange names beyond that, but sitting in that glowing glass box under the highway lights, I felt less alone.",
    category: "other",
    authorId: "admin-id-1234",
    authorUsername: "curator",
    createdAt: "2026-05-21T02:15:00Z",
    excerpt: "Finding silent solidarity and a warm slice of pie at a retro highway diner in the middle of a sleepless night shift.",
    read_time: 2,
    ai_selected: true,
    status: "approved"
  }
];

export const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: "chapter-1",
    title: "Unfinished Conversations",
    category: "Loss",
    page_start: 3,
    page_end: 12,
    storyId: "story-loss-1"
  },
  {
    id: "chapter-2",
    title: "Yellow Umbrella",
    category: "Love",
    page_start: 13,
    page_end: 22,
    storyId: "story-love-1"
  },
  {
    id: "chapter-3",
    title: "Patagonian Wind",
    category: "Adventure",
    page_start: 23,
    page_end: 35,
    storyId: "story-adventure-1"
  },
  {
    id: "chapter-4",
    title: "Ritual of the Sundays",
    category: "Family",
    page_start: 36,
    page_end: 44,
    storyId: "story-family-1"
  },
  {
    id: "chapter-5",
    title: "Leaving the Glass Tower",
    category: "Work",
    page_start: 45,
    page_end: 56,
    storyId: "story-work-1"
  },
  {
    id: "chapter-6",
    title: "The Midnight Coffee Shop",
    category: "Other",
    page_start: 57,
    page_end: 64,
    storyId: "story-other-1"
  }
];
