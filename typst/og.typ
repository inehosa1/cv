// Imagen Open Graph (1200×630) para compartir el CV en LinkedIn, Slack, WhatsApp...
#let lang = sys.inputs.at("lang", default: "es")
#let cv = yaml("/data/cv." + lang + ".yaml")
#let b = cv.basics

#set page(width: 1200pt, height: 630pt, margin: 80pt, fill: rgb("#0b1120"))
#set text(font: "Inter", fill: rgb("#e2e8f0"))

#place(top + left, dx: -80pt, dy: -80pt, rect(width: 1200pt, height: 14pt, fill: rgb("#e5484d")))

#align(horizon)[
  #text(size: 76pt, weight: "bold", tracking: -0.02em, b.name)
  #v(10pt)
  #text(size: 34pt, weight: "semibold", fill: rgb("#ff7a7e"), b.label)
  #v(36pt)
  #set text(size: 26pt, fill: rgb("#94a3b8"))
  #cv.competencies.slice(0, 4).join("  ·  ")
]

#place(bottom + left, text(size: 24pt, fill: rgb("#94a3b8"))[
  #b.location.city, #b.location.country #h(1fr) #b.url.replace(regex("^https?://"), "").trim("/", at: end)
])
