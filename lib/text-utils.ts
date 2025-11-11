import type { Keyword } from "./types"

// Indonesian and English stopwords
const STOPWORDS = new Set([
  // English stopwords
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "am",
  "so",
  "very",
  "just",
  "now",
  "then",
  "than",
  "only",
  "also",
  "back",
  "after",
  "use",
  "two",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "give",
  "day",
  "most",
  "like",
  "get",
  "go",
  "know",
  "time",
  "person",
  "year",
  "work",
  "part",
  "take",
  "place",
  "make",
  "seem",
  "come",
  "over",
  "think",
  "well",
  "some",

  // Indonesian stopwords
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "untuk",
  "dengan",
  "pada",
  "dalam",
  "oleh",
  "sebagai",
  "adalah",
  "akan",
  "telah",
  "sudah",
  "belum",
  "masih",
  "sedang",
  "bisa",
  "dapat",
  "harus",
  "tidak",
  "bukan",
  "jangan",
  "agar",
  "supaya",
  "kalau",
  "jika",
  "bila",
  "ketika",
  "saat",
  "waktu",
  "setelah",
  "sebelum",
  "selama",
  "sambil",
  "karena",
  "sebab",
  "akibat",
  "sehingga",
  "itu",
  "ini",
  "dia",
  "mereka",
  "kita",
  "kami",
  "saya",
  "aku",
  "kamu",
  "anda",
  "beliau",
  "nya",
  "mu",
  "ku",
  "lah",
  "kah",
  "pun",
  "per",
  "se",
  "ter",
  "ber",
  "me",
  "pe",
  "ke",
  "ada",
  "tak",
  "gak",
  "ga",
  "nggak",
  "ngga",
  "udah",
  "dah",
  "udh",
  "aja",
  "sih",
  "dong",
  "kok",
  "lho",
  "deh",
  "tuh",
  "nih",
  "tapi",
  "trus",
  "terus",
  "abis",
  "habis",
  "gimana",
  "kenapa",
  "mengapa",
  "bagaimana",
  "dimana",
  "kemana",
  "darimana",
  "kapan",
  "siapa",
  "apa",
])

export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/\d+/g, "") // Remove numbers
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .split(" ")
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
}

export function extractKeywords(text: string, maxKeywords = 50): Keyword[] {
  const tokens = tokenizeText(text)
  const wordFreq = new Map<string, number>()
  const bigramFreq = new Map<string, number>()

  // Count unigrams
  tokens.forEach((token) => {
    wordFreq.set(token, (wordFreq.get(token) || 0) + 1)
  })

  // Count bigrams
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`
    bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1)
  }

  // Combine and sort by frequency
  const allKeywords: Keyword[] = []

  // Add unigrams (minimum frequency 2)
  wordFreq.forEach((frequency, word) => {
    if (frequency > 1) {
      allKeywords.push({ word, frequency })
    }
  })

  // Add bigrams (minimum frequency 2)
  bigramFreq.forEach((frequency, word) => {
    if (frequency > 1) {
      allKeywords.push({ word, frequency })
    }
  })

  // Sort by frequency (descending) and return top keywords
  return allKeywords.sort((a, b) => b.frequency - a.frequency).slice(0, maxKeywords)
}

export function cleanText(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/[^\w\s]/g, " ") // Remove special characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}
