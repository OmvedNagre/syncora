/**
 * GIF Service: Tenor API proxy with curated fallback library
 * Ensures seamless GIF search and selection even without an external API key.
 */

const CURATED_GIFS = [
  // Love & Couples
  { id: 'c1', title: 'Cat Cuddle Hug', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWp3MmptcWk1NGZsdmgyanEwaWR5MnpxYmRtb2Z5bXZidW10b2R4MyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MDJ9IbxxvDUQM/giphy.gif', category: 'love' },
  { id: 'c2', title: 'Bubu Dudu Heart', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTRmaTZrb3A4eTRsdnNkcWllYzh4Z24xajdtbGFoNzVmaHJrcDJ0MSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/VbawWIGNndJ7a/giphy.gif', category: 'love' },
  { id: 'c3', title: 'Romantic Sunset Kiss', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZms2NW9qNThqOTl0Mnk4M2k1b2w2ZW9mYm54eTh4b2twMzNpdmtxOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/G3va31oEEnIkM/giphy.gif', category: 'love' },
  
  // Coding & Pair Programming
  { id: 'c4', title: 'Hacker Fast Typing', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjVyZW1mZzBqNDRmbmhpdzRjNXl6bHl5YWlscjRjcTNjN2ZtdnU3NyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ule4akeXnUSva/giphy.gif', category: 'coding' },
  { id: 'c5', title: 'It Works No Bug', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjE1cTN3NDR3NXRzY3RmbnptY2oxMDR3YmZpYmZ0cTRscDVpd2VrcyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/111ebonMs90YLu/giphy.gif', category: 'coding' },
  { id: 'c6', title: 'Computer Rage Smash', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZqcDdtN3JtdWNwbGptcTNmOG11OHhwbWlhdHpiOXFqbnV6dWJvYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/9K2nFglCAQClO/giphy.gif', category: 'coding' },

  // Celebration & Happy
  { id: 'c7', title: 'Minions Yay Celebrate', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzZ1N2s0dHFmaGFpYTF6MWR2ZXk2b2J3cm53NGQ0eXVobnRhYmhnciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/artj92V8o75VPL7AeQ/giphy.gif', category: 'happy' },
  { id: 'c8', title: 'Leo DiCaprio Cheers Toast', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMm43dnR4bnYxaWFpOWdrMnVxdnJrcG1pNDRvaHJpZWVvbTNqajN2MCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GCLlQnV7dXZ2E/giphy.gif', category: 'happy' },
  { id: 'c9', title: 'Dancing Cat Jam', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVqNHlvMXVpNDdtbmxvbXNuZmlmdnNyNnFsaXJpcTBpa3ZsdHRrMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jpbnoe3UIa8TU8LM13/giphy.gif', category: 'happy' },

  // Reaction & Laughter
  { id: 'c10', title: 'Popcorn Michael Jackson', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjRrcDNsNG5pNHc0eHJkY3JxdWVpbnN4bXBpMmV5dG1sMXptN3B1eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GLbiGvv9qrpny/giphy.gif', category: 'reaction' },
  { id: 'c11', title: 'Laughing Dog Spat', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnpsdHhyZXVmMXNmaWVodDV2bHB5Y3NpbmtxcWc1bmwxaWZicmU0OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/B0vFTrb0ZGDf2/giphy.gif', category: 'reaction' },
  { id: 'c12', title: 'Mind Blown Galaxy', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnNwYmNwbXN2bHFmbnVreGZzNmEwbjBkaGg2ODk3dTFxNXhnbTZyNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26ufdipQqU2lhNA4g/giphy.gif', category: 'reaction' },
  { id: 'c13', title: 'Fire Flame Hot', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG13a2U5cGR4cG12MnY5cnlrcWpoOW1kdzdsNWdrYXNrdm12Y2Z6cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/nrXif9YExO9EI/giphy.gif', category: 'reaction' },
  { id: 'c14', title: 'Lofi Girl Relax Study', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGphcXl0eGprYmprYXk4a2ZmaDRyZ29vczU5MGxnbmd4aGplMWtndCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M9gmm2854uNms/giphy.gif', category: 'lofi' }
];

export async function searchGifs(query = '', category = '') {
  const cleanQuery = query.toLowerCase().trim();

  // Filter curated database first
  let matches = CURATED_GIFS;
  if (cleanQuery) {
    matches = CURATED_GIFS.filter(g => 
      g.title.toLowerCase().includes(cleanQuery) || 
      g.category.toLowerCase().includes(cleanQuery)
    );
  } else if (category && category !== 'all') {
    matches = CURATED_GIFS.filter(g => g.category.toLowerCase() === category.toLowerCase());
  }

  // If query had no matches in curated, return all so the user is never left with an empty screen
  if (matches.length === 0) {
    matches = CURATED_GIFS;
  }

  return matches;
}
