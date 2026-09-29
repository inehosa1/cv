// Plantilla PDF del CV. Lee el mismo YAML que la web.
// Uso: typst compile --root . --font-path typst/fonts --input lang=es typst/cv.typ out.pdf
//
// Reglas ATS: una columna, texto real, encabezados estándar, fuentes embebidas.

#let lang = sys.inputs.at("lang", default: "es")
#let cv = yaml("/data/cv." + lang + ".yaml")
#let labels = cv.meta.labels
#let b = cv.basics

// ── Tokens de diseño (sincronizados con src/styles/global.css) ──────────────
#let accent = rgb("#e5484d")
#let ink = rgb("#1e293b")
#let muted = rgb("#64748b")
#let rule-color = rgb("#e2e8f0")
#let chip-fill = rgb("#fff1f1")

// ── Utilidades ────────────────────────────────────────────────────────────
/// `texto con **negrita**` → content.
#let rich(s) = (
  s
    .split("**")
    .enumerate()
    .map(((i, part)) => if calc.odd(i) { strong(part) } else { part })
    .join()
)

#let fmt-date(d) = {
  let parts = str(d).split("-")
  if parts.len() == 2 { labels.months.at(int(parts.at(1)) - 1) + " " + parts.at(0) } else { parts.at(0) }
}

#let fmt-range(start, end) = fmt-date(start) + " – " + if end == none { labels.present } else { fmt-date(end) }

#let pretty-url(u) = u.replace(regex("^https?://(www\.)?"), "").trim("/", at: end)

#let sep = h(0.5em) + text(fill: rule-color)[|] + h(0.5em)

// ── Documento ─────────────────────────────────────────────────────────────
#set document(
  title: cv.meta.title,
  author: b.name,
  description: cv.meta.description,
  keywords: cv.competencies,
)

#set page(
  paper: "a4",
  margin: (x: 1.5cm, top: 1.3cm, bottom: 1.4cm),
  footer: context text(size: 7.5pt, fill: muted)[
    #b.name #h(1fr) #counter(page).display("1 / 1", both: true)
  ],
)

#set text(font: "Inter", size: 9.5pt, fill: ink, lang: lang, hyphenate: false)
#set par(justify: false, leading: 0.55em, spacing: 0.7em)
#set list(indent: 0.2em, body-indent: 0.5em, spacing: 0.5em, marker: text(fill: accent)[•])
#set strong(delta: 200)
#show link: it => it // conservar color del texto; los enlaces siguen siendo clicables

#show heading.where(level: 1): it => {
  v(0.9em, weak: true)
  block(below: 0.6em, width: 100%, stroke: (bottom: 0.8pt + rule-color), inset: (bottom: 0.3em))[
    #text(size: 10.5pt, weight: "bold", fill: accent, tracking: 0.04em, upper(it.body))
  ]
}

// ── Cabecera ──────────────────────────────────────────────────────────────
#block(width: 100%, stroke: (top: 2.5pt + accent), inset: (top: 0.6em))[
  #text(size: 22pt, weight: "bold", tracking: -0.02em, b.name)
  #v(-0.3em)
  #text(size: 11pt, weight: "semibold", fill: accent, b.label)
  #v(0.2em)
  #set text(size: 8.5pt, fill: muted)
  #{
    let loc = b.location.city + ", " + b.location.country
    if "remote" in b.location { loc += " (" + b.location.remote + ")" }
    let items = (loc,)
    if "phone" in b { items.push(link("tel:" + b.phone.replace(" ", ""), b.phone)) }
    items.push(link("mailto:" + b.email, b.email))
    for p in b.profiles { items.push(link(p.url, pretty-url(p.url))) }
    if "url" in b { items.push(link(b.url, pretty-url(b.url))) }
    // box(): cada dato de contacto nunca se parte entre líneas (clave para ATS).
    items.map(box).join(sep)
  }
]

// ── Perfil ────────────────────────────────────────────────────────────────
= #labels.summary
#par(justify: true, rich(b.summary.trim()))

#v(0.3em)
#{
  set text(size: 8pt, weight: "semibold", fill: accent)
  set par(leading: 0.9em)
  cv.competencies.map(c => box(
    fill: chip-fill,
    stroke: 0.5pt + accent.lighten(70%),
    radius: 3pt,
    inset: (x: 0.5em, y: 0.35em),
    c,
  )).join(h(0.35em))
}

// ── Experiencia ───────────────────────────────────────────────────────────
= #labels.work

#for job in cv.work [
  #block(breakable: true, below: 1em)[
    #grid(
      columns: (1fr, auto),
      column-gutter: 1em,
      text(size: 10.5pt, weight: "bold", job.position),
      text(size: 9pt, fill: muted, fmt-range(job.startDate, job.at("endDate", default: none))),
    )
    #v(-0.2em)
    #text(fill: muted, style: "italic", weight: "medium")[
      #if "url" in job { link(job.url, job.name) } else { job.name } · #job.location
    ]
    #if "summary" in job { par(rich(job.summary)) }
    #list(..job.highlights.map(rich))
    #if job.at("technologies", default: ()).len() > 0 {
      text(size: 8.5pt)[*#labels.technologies:* #job.technologies.join(", ")]
    }
  ]
]

// ── Proyectos ─────────────────────────────────────────────────────────────
#if cv.at("projects", default: ()).len() > 0 [
  = #labels.projects
  #for p in cv.projects [
    #block(below: 0.8em)[
      #text(weight: "bold", p.name)
      #if "url" in p [ #sep #text(size: 8.5pt, fill: muted, link(p.url, pretty-url(p.url))) ]
      #v(-0.2em)
      #rich(p.description)
      #if p.at("highlights", default: ()).len() > 0 { list(..p.highlights.map(rich)) }
      #if p.at("technologies", default: ()).len() > 0 {
        linebreak()
        text(size: 8.5pt)[*#labels.technologies:* #p.technologies.join(", ")]
      }
    ]
  ]
]

// ── Habilidades ───────────────────────────────────────────────────────────
= #labels.skills

#block(breakable: false, grid(
  columns: (auto, 1fr),
  column-gutter: 1em,
  row-gutter: 0.65em,
  ..cv.skills.map(s => (
    text(weight: "bold", s.name),
    (s.at("featured", default: ()).map(strong) + s.keywords.map(k => [#k])).join(", "),
  )).flatten()
))

// ── Educación ─────────────────────────────────────────────────────────────
= #labels.education

#for e in cv.education [
  #grid(
    columns: (1fr, auto),
    text(weight: "bold")[#e.studyType #labels.degreeIn #e.area],
    text(fill: muted, fmt-date(e.endDate)),
  )
  #v(-0.3em)
  #text(fill: muted, style: "italic", e.institution)
]

// ── Certificaciones ───────────────────────────────────────────────────────
#if cv.at("certificates", default: ()).len() > 0 [
  = #labels.certificates
  #list(..cv.certificates.map(c => {
    c.name
    if "issuer" in c [ · #text(fill: muted, c.issuer)]
    if "date" in c [ · #text(fill: muted, fmt-date(c.date))]
  }))
]

// ── Idiomas ───────────────────────────────────────────────────────────────
= #labels.languages

#cv.languages.map(l => [*#l.language:* #l.fluency]).join(sep)

// Metadato para que scripts/build-pdf.ts verifique el nº de páginas.
#context [#metadata(counter(page).final().first()) <page-count>]
