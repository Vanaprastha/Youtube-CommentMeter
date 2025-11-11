import { extractVideoId, isValidVideoId, TEST_CASES } from "../lib/youtube-utils"

describe("YouTube URL parsing", () => {
  describe("extractVideoId", () => {
    TEST_CASES.forEach(({ url, expected }) => {
      it(`should extract "${expected}" from "${url}"`, () => {
        expect(extractVideoId(url)).toBe(expected)
      })
    })

    it("should handle null and undefined inputs", () => {
      expect(extractVideoId(null as any)).toBe(null)
      expect(extractVideoId(undefined as any)).toBe(null)
    })
  })

  describe("isValidVideoId", () => {
    it("should validate correct video IDs", () => {
      expect(isValidVideoId("dQw4w9WgXcQ")).toBe(true)
      expect(isValidVideoId("9bZkp7q19f0")).toBe(true)
    })

    it("should reject invalid video IDs", () => {
      expect(isValidVideoId("too-short")).toBe(false)
      expect(isValidVideoId("way-too-long-id")).toBe(false)
      expect(isValidVideoId("invalid@chars")).toBe(false)
      expect(isValidVideoId("")).toBe(false)
    })
  })
})
