---
name: atmospheric-ui
description: Create and refine premium minimalist websites and interfaces with atmospheric tonal gradients, matte/frosted surfaces, editorial layouts, modular cards, and fluid restrained motion. Use for visual direction, UI styling, interaction design, and frontend implementation.
---

# ATMOSPHERIC UI — Personal Art Direction Skill

## Purpose
This skill is the source of truth for VISUAL ART DIRECTION. Build distinct websites with a consistent material and motion language, not identical templates. The primary reference is a minimal rounded blue-grey gradient page with tonal pill navigation, ample whitespace, a large low-positioned headline, and a subtle pill CTA. Adapt its design principles, not its literal composition.

## Collaboration with UI UX Pro Max
- ATMOSPHERIC UI owns: palette behavior, gradients, materiality, typography mood, visual composition, card shapes, visual transitions, art direction.
- UI UX Pro Max owns: accessibility, information architecture, usability, semantic HTML, responsive behavior, component completeness, interaction conventions, and quality assurance.
- UI UX Pro Max style/palette/font recommendations are inspiration only; NEVER overwrite this skill's visual identity with its default templates or generated style presets.
- Resolve conflicts by preserving accessibility and function while finding an aesthetically compatible implementation. Legibility and usable controls are mandatory.
- When both are relevant, explicitly consult both and apply this division of responsibility.

## Core identity (always)
1. Tonal harmony: UI surfaces belong to the same visual atmosphere as their background; no disconnected generic white cards.
2. Soft atmospheric depth: diffused light, smooth color blending, understated layers, generous negative space.
3. Editorial restraint: clear hierarchy, considered asymmetry, spatial text placement, precise alignment, limited decorative clutter.
4. Soft geometry: rounded containers, pill controls, selective large-radius cards, intentional sizing and spacing.
5. Calm motion: fluid, purposeful, continuous transformations, never bouncy or distracting by default.

## Color and gradient behavior
- Default inspiration: mist white, powder blue, blue-grey, muted slate, warm-grey haze. This is a reference palette, NOT a universal mandatory palette.
- For other projects, adapt the same method to sage, sand, rose, mineral, etc. Preserve low-to-moderate saturation and tonal cohesion.
- Prefer layered radial/mesh gradients with large diffused color fields; mix cool and slightly warm undertones when appropriate.
- Optionally add fine-grain/noise very subtly. Avoid harsh banding, neon rainbow gradients, obvious linear color stripes, or excessive blur that destroys contrast.
- Treat color as light across a surface rather than a flat decoration. Keep text legible over every gradient state.

## Material library (choose selectively)
- Tonal matte: mostly opaque surface with small luminance shift from background; default for dense content and forms.
- Frosted: translucent material with backdrop blur and restrained border highlight; use when layered over visual content and contrast is safe.
- Raised: restrained outer shadows plus top-edge highlight for soft convex buttons/cards.
- Recessed: delicate inset shadow and lower-luminance tonal fill for input wells, toggles, sliders.
- Dimensional glass: subtle rim lighting and translucent depth for a small number of focal elements, not the whole interface.
- Do NOT apply backdrop-filter to every card; mix materials based on hierarchy and context.

## Layout patterns
- Hero: oversized rounded visual canvas, ample upper whitespace, tonal pill nav, low or spatially positioned editorial headline and restrained CTA. Use as one possible pattern, not a fixed template.
- Editorial split: large typography against full-bleed photography or softly rendered visual.
- Modular storytelling: asymmetric cards of varying heights, clear active-card hierarchy, one dominant card among quieter siblings.
- Product cards: immersive imagery integrated with restrained metadata, labels, and a clear action.
- Nested panels: grouped information modules within a larger tonal card.
- Text may occupy corners/edges with small labels, thin rules, restrained metadata. Never sacrifice scanability.
- Mobile: recompose, don't simply shrink desktop bento layouts. Keep readable text and touch targets.

## Typography
- Contemporary neutral sans-serif with refined proportions; optional tasteful serif for editorial accent. Choose fonts to fit brand and language; do not hardcode a single font pairing for every project.
- Large but controlled display text, readable body text, deliberate line breaks, subtle micro-labels and generous whitespace.
- Avoid uniformly centered sections, cramped text, tiny low-contrast body copy, and random font changes.

## Motion system
- Micro-interactions: subtle tonal color shift, shadow/highlight response, small positional adjustments and opacity transitions.
- Cards: expandable/collapsible panels with shared-element continuity, smooth layout morphing and preserved spatial context.
- Navigation: compact pill or control may expand contextually into a panel, then return smoothly.
- Scroll: staggered reveals, sticky card sequences, horizontal storytelling only when it aids comprehension; avoid scroll hijacking.
- Ambient gradients: very slow subtle drift, if performance and readability allow.
- Suggested starting durations: 180–300ms for hover/focus, 300–550ms for card transitions, longer only for purposeful editorial sequences. Tune by interaction, not rigidly.
- Use easing with smooth deceleration, avoid elastic/bouncy effects unless explicitly requested.
- Prefer CSS transitions for simple interactions, Motion or GSAP for complex layout/scroll timelines. Keep animation performant; animate transform/opacity when possible.
- Respect prefers-reduced-motion, keyboard operation, focus visibility, and touch behavior. Never hide critical content behind motion.

## 3D and visual effects
- Selective softly lit organic/parametric forms, ribbed waves, subtle translucent objects, soft studio lighting.
- Prefer an art-directed hero or feature visual over scattering 3D objects throughout the page.
- 3D should enhance material identity and composition, not obscure product information or harm loading performance.

## Anti-patterns
- Generic SaaS purple-blue gradients, repetitive uniform bento grids, arbitrary glass everywhere, heavy drop shadows, harsh outlines, over-saturated palettes, random decorative blobs, excess floating objects, too many competing animations, excessive center alignment, low-contrast text, inaccessible custom controls.
- Do not mechanically reproduce the same reference screenshot for every client.

## Implementation workflow
1. Read project CLAUDE.md and requirements; identify audience, brand, content, and platform.
2. Consult UI UX Pro Max for UX, accessibility, and implementation best practices, but disregard conflicting generic art direction.
3. Propose a concise design direction: palette method, material mix, layout archetype, typography, motion intensity.
4. Build semantic responsive components with reusable design tokens and accessible states.
5. Review desktop/mobile, contrast, focus, motion reduction, performance, and visual coherence.
6. Before delivery, state how the result applies ATMOSPHERIC UI and where UI UX Pro Max informed usability.

## Example token starting point (adapt, don't blindly copy)
```css
:root {
  --atmo-mist: #f5f7f8;
  --atmo-ice: #dbe4eb;
  --atmo-powder: #a8bdcf;
  --atmo-slate: #8495a7;
  --atmo-ink: #263340;
  --atmo-radius-card: 28px;
  --atmo-radius-hero: 48px;
  --atmo-radius-pill: 999px;
  --atmo-ease: cubic-bezier(.22, 1, .36, 1);
}
```
These colors are illustrative, not exact sampled values from Pinterest.
