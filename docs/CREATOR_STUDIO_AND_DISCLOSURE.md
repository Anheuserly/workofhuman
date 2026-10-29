# Creator Studio & Transparent AI Disclosure

This document outlines the publishing architecture, media intake capabilities, supported disciplinary taxonomy, and transparent AI provenance standards of **WorkOfHuman**.

---

## 1. Supported Creative Disciplines (33 Taxonomy Types)

WorkOfHuman is built to house serious creative output across every medium. Defined in [`src/lib/platform.ts`](../src/lib/platform.ts), the platform indexes projects across 33 specialized categories:

### Visual Arts & Design
- `digital_art` — Digital illustration, matte painting, concept art.
- `paintings` — Traditional oil, acrylic, watercolor, mixed media.
- `photography` — Editorial, architectural, portrait, landscape photography.
- `ui_ux_design` — Interface design studies, design systems, interactive prototypes.
- `graphic_design` — Typography, brand identity, poster design, packaging.
- `3d_models` — Character modeling, procedural environments, hard-surface assets.
- `fashion_design` — Apparel design, textile studies, digital fashion.
- `handmade_crafts` — Artisan craftsmanship, woodworking, ceramics, physical sculpture.

### Motion & Cinema
- `films` — Independent narrative feature-length or mid-length films.
- `short_movies` — Experimental shorts and narrative film festival entries.
- `cinematic_edits` — Color grading studies, montage sequences, visual essays.
- `documentaries` — Investigative, human interest, and cultural documentaries.
- `animations` — 2D cel animation, 3D motion graphics, stop-motion.

### Sound & Music
- `music` — Compositions, instrumental arrangements, sound design.
- `songs` — Vocal tracks, lyrical arrangements, acoustic performances.
- `podcasts` — Thoughtful long-form audio essays, interviews, creator commentary.
- `audio_tracks` — Field recordings, Foley libraries, ambient soundscapes.

### Literature & Written Word
- `books` — Manuscript chapters, published book portfolios.
- `stories` — Short fiction, narrative scripts, screenplays.
- `poetry` — Contemporary, classical, and spoken word verse.
- `articles` — Long-form cultural critique, essays, design writing.
- `blogs` — Creator journals, process documentation, research logs.

### Engineering, Software & Inventions
- `coding_projects` — Open source tools, libraries, generative algorithms.
- `websites` — Web design studies, creative frontend showcases.
- `apps` — Native mobile and desktop software utilities.
- `indie_games` — Interactive game prototypes, game design documents.
- `inventions` — Hardware blueprints, patents, physical prototypes.
- `startup_ideas` — Concept validation, whitepapers, systemic solutions.
- `architecture` — Spatial design, architectural renderings, urban planning.

### Transparent AI Experiments
- `ai_generated_art` — Latent space exploration with prompt provenance.
- `ai_music` — Generative audio compositions with model attribution.
- `ai_films` — AI-rendered narrative shorts and synthetic cinematography.
- `experimental_projects` — Cross-disciplinary boundary-pushing creations.

---

## 2. Transparent AI Provenance Standards

### The WorkOfHuman Philosophy
Many platforms either ban AI entirely or allow generative media to be masqueraded as purely handmade craft. **WorkOfHuman takes a progressive, transparent third path:**

1. **AI is recognized as a powerful creative medium** when guided by human vision, direction, and curatorial intent.
2. **Deceptive omission harms both creators and viewers.** Transparent disclosure protects human artisan value while celebrating genuine technological innovation.
3. **Provable Provenance**: Every project card indicates whether AI tools participated in the creation.

### Database Representation
```sql
ai_generated BOOLEAN DEFAULT false,
ai_model VARCHAR(160)
```

- When `ai_generated = false`: The project represents strictly traditional, manual, or human-coded craft.
- When `ai_generated = true`: The project is cataloged in the dedicated [`/ai`](../src/app/ai/page.tsx) hub, and the specific toolchain is displayed (e.g. *Midjourney v6.1*, *Flux 1.1 Pro*, *Suno v3*, *Claude 3.7 Sonnet*).

---

## 3. Upload Studio Architecture (`/studio/upload`)

The upload studio is structured as a single high-performance pipeline:

1. **Media Ingestion**:
   - Universal drop zone supporting image raster/vectors (`.png`, `.jpg`, `.webp`, `.svg`, `.avif`).
   - Motion video containers (`.mp4`, `.webm`, `.mov`).
   - High-fidelity audio (`.mp3`, `.wav`, `.flac`).
   - Documents & code files (`.pdf`, `.zip`, `.gltf`/`.glb`).
2. **Metadata Intake**:
   - Project Title & SEO slug generation.
   - Narrative project description.
   - Category selector (mapped to the 33 taxonomy types).
   - Tagging array for algorithmic search.
3. **Disclosure Form**:
   - Checkbox: *“Was AI used in the creation of this project?”*
   - Model specification input field.
4. **Publish Action**:
   - Inserts record into `projects` table.
   - Triggers revalidation of `/explore` and creator's `/[username]` portfolio.
