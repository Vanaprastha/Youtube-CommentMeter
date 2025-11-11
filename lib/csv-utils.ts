interface CSVExportItem {
  id: string
  text: string
  likeCount: number
  publishedAt: string
  sentimentLabel: string
  sentimentScore: number
}

export function generateCSV(items: CSVExportItem[]): string {
  const headers = ["id", "text", "likeCount", "publishedAt", "sentimentLabel", "sentimentScore"]

  const escapeCSVField = (field: string | number): string => {
    const stringField = String(field)

    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
      return `"${stringField.replace(/"/g, '""')}"`
    }

    return stringField
  }

  const rows = items.map((item) => [
    escapeCSVField(item.id),
    escapeCSVField(item.text),
    escapeCSVField(item.likeCount),
    escapeCSVField(item.publishedAt),
    escapeCSVField(item.sentimentLabel),
    escapeCSVField(item.sentimentScore.toFixed(3)),
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
