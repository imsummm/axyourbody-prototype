---
name: AX YOUR BODY
colors:
  surface: '#f9f9f6'
  surface-dim: '#dadad7'
  surface-bright: '#f9f9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#5e3f3c'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#936e6b'
  outline-variant: '#e8bcb8'
  surface-tint: '#c0001b'
  primary: '#b7001a'
  on-primary: '#ffffff'
  primary-container: '#e60023'
  on-primary-container: '#fff7f6'
  inverse-primary: '#ffb3ad'
  secondary: '#5f5f59'
  on-secondary: '#ffffff'
  secondary-container: '#e2e0d8'
  on-secondary-container: '#63635d'
  tertiary: '#595b57'
  on-tertiary: '#ffffff'
  tertiary-container: '#72736f'
  on-tertiary-container: '#fafaf4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930012'
  secondary-fixed: '#e5e2db'
  secondary-fixed-dim: '#c8c6bf'
  on-secondary-fixed: '#1c1c17'
  on-secondary-fixed-variant: '#474742'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c6c7c2'
  on-tertiary-fixed: '#1a1c19'
  on-tertiary-fixed-variant: '#464744'
  background: '#f9f9f6'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  caption:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a calm, encouraging, and emotionally grounded sanctuary for the modern office professional returning to home workouts after exhaustive work cycles. The visual tone eliminates all forms of guilt, urgency, and punitive accountability. There are strictly no punitive cues, no red warning states for skipped days, no calorie tallies, and zero focus on weight-loss or aggressive metrics. Forbidden terminology includes words such as "실패", "경고", "오류", and "달성률". 

The aesthetic is Modern Japanese-Scandinavian Minimalist (Warm Gallery style): clean, serene, tactilely soft, and intentional. The interface relies on warm off-white canvases, generous breathing room, clean lines, and purposeful touches of primary red reserved exclusively for forward momentum and current-state awareness.

## Colors

The palette is anchored in warm, soothing mineral tones to keep cognitive load minimal while sustaining quiet optimism.

- **Primary (`#e60023`)**: Strictly isolated to high-intent primary CTA buttons and active navigation indicators (active tab pip or icon accent). Never used for alerts, missed routines, or negative feedback.
- **Canvas / Background (`#ffffff`)**: The pristine root canvas.
- **Soft Surface (`#fbfbf9`)**: The base background layer for page sections and grouped modules.
- **Card Background (`#f6f6f3`)**: Dedicated resting background for surface modules, item cards, and default state containers.
- **Secondary Surface / Sub-surface (`#e5e5e0`)**: Subtle contrast layer used for secondary buttons, inactive input backgrounds, and hover/pressed states.
- **Hairline / Border (`#dadad3`)**: Crisp 1px structural borders dividing content cleanly without visual noise.
- **Text Primary (`#000000`)**: Key headings, selected chip labels, and high-emphasis copy.
- **Text Secondary (`#33332e`)**: Body text, instructions, and list content.
- **Text Muted (`#62625b`)**: Metadata, supporting timestamps, and secondary captions.

## Typography

The typographic system harmonizes `Inter` for numeric metrics and Latin UI controls with `Noto Sans KR` for Korean body and headings. Only three weights are permitted: 400 (Regular), 600 (Semi-Bold), and 700 (Bold).

Maintain comfortable tracking and open line heights across all scales to encourage sustained readability during physical activity or post-work unwinding. Never truncate encouraging affirmations; wrap them fluidly.

## Layout & Spacing

A mobile-first fixed vertical flow engineered for single-thumb navigation. 

- **Outer Margin**: 16px (`1rem`) on phone viewports, expanding to 20px (`1.25rem`) on tablets.
- **Card Padding**: Standardized at 20px internally to yield an airy, uncluttered presentation.
- **List & Component Gap**: Default to 12px or 16px (`space-md`) vertical separation.
- **Content Max-Width**: Centered at a maximum width of 480px on larger displays to preserve native mobile ergonomics.

## Elevation & Depth

This design system deliberately eschews simulated drop shadows, glows, and volumetric elevation gradients. Surfaces rest completely flat, establishing clarity through layered tonal nesting:

1. **Base Layer**: `#ffffff` (Canvas) or `#fbfbf9` (Soft Surface).
2. **Container Layer**: `#f6f6f3` (Cards and surface blocks), bounded by a hairline border of `#dadad3` where delineation is required.
3. **Embedded Sub-layer**: `#e5e5e0` for secondary control areas and recessed counters.
4. **Modal Bottom Sheets**: The sole exception to elevation. Presented with an absolute background surface of `#ffffff` over a 50% opacity neutral-black backdrop scrim (`rgba(0, 0, 0, 0.5)`). No drop shadow is cast from the sheet itself.

## Shapes

The geometry balances friendly architectural softness with modern restraint:

- **16px (`rounded-lg`)**: Applied uniformly to standard interactive components including buttons, text input fields, segmented cells, and standard cards.
- **32px (`rounded-xl` / specialized container)**: Reserved for hero cards, summary banners, and the top corners of modal bottom sheets.
- **Full Pill (`9999px`)**: Exclusively reserved for filter chips, tags, status badges, and tab indicators.
- **Checkboxes & Radios**: Checkboxes use 6px subtle roundedness; radio buttons use complete circular symmetry.

## Components

### Primary Buttons
- **Background**: `#e60023`
- **Text Color**: `#ffffff`, weight 600 (`label-lg`)
- **Corner Radius**: 16px
- **Dimensions**: Full-width or auto with 16px vertical padding, 24px horizontal padding. Zero shadow. Active pressed state drops opacity to 0.88.

### Secondary Buttons
- **Background**: `#e5e5e0`
- **Text Color**: `#000000`, weight 600
- **Corner Radius**: 16px
- **Border**: None or 1px hairline `#dadad3`.

### Filter Chips & Tags
- **Default State**: Background `#f6f6f3`, 1px border `#dadad3`, text `#33332e` (`label-sm`). Full pill radius (`9999px`).
- **Selected State**: Background `#000000`, border `#000000`, text `#ffffff` (`label-sm`, weight 600).

### Cards
- **Background**: `#f6f6f3`
- **Border**: 1px solid `#dadad3`
- **Corner Radius**: 16px for standard item cards; 32px for milestone cards and deep-dive daily summaries.
- **Internal Padding**: 20px.

### Input Fields
- **Background**: `#ffffff` or `#fbfbf9`
- **Border**: 1px solid `#dadad3` (focus state: 1.5px solid `#000000`)
- **Corner Radius**: 16px
- **Text**: `#000000` with placeholder `#62625b`
- **Helper Copy**: Warm and non-judgmental guidance in `#62625b`.

### Checkboxes & Radio Buttons
- **Unselected**: 1.5px border `#dadad3`, transparent fill.
- **Selected**: Solid fill `#000000` with crisp white `#ffffff` check or interior dot.

### Bottom Navigation Tab Bar
- **Surface**: `#ffffff` with a top 1px border `#dadad3`.
- **Height**: 64px + safe area inset.
- **Tabs (4 Total)**:
  1. `오늘` (Today)
  2. `운동` (Workouts)
  3. `먹은 것` (Nourishment / Food Logged)
  4. `몸 변화` (Body Evolution)
- **Inactive Tab**: `#62625b` icon and text.
- **Active Tab**: `#000000` icon with an active indicator pip or highlight in `#e60023`.

### Bottom Sheet Modal
- **Surface**: `#ffffff` with top corner radii of 32px.
- **Scrim**: `rgba(0, 0, 0, 0.5)` backdrop overlay.
- **Handle**: 36px wide by 4px tall pill in `#dadad3`, centered 12px from sheet top.