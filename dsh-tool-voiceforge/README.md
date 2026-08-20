# dsh-tool-voiceforge

> Voice AI Engine Plugin for DeepSeek Harness — TTS Scripting, Voice Cloning, Audio Analysis, Podcast Production

VoiceForge is a comprehensive voice AI engine powering speech synthesis, voice cloning, audio analysis, and multilingual voice mapping across 200+ countries.

## Installation

```bash
npm install
npm run build
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `tts_script_generator` | Generate optimized SSML/TTS scripts with voice style prosody, emphasis markers, and timing annotations |
| 2 | `voice_cloning_spec` | Produce voice cloning specifications: pipeline stages, hardware requirements, quality gates |
| 3 | `audio_analyzer` | Analyze audio files for quality, content, speaker identification, or emotion detection |
| 4 | `podcast_producer` | Generate complete podcast production plans: segments, timeline, equipment checklist |
| 5 | `subtitle_generator` | Create time-aligned subtitles in SRT, VTT, or ASS format with reading-speed validation |
| 6 | `voice_emotion_advisor` | Provide emotion annotations, prosody settings, delivery tips, and practice exercises |
| 7 | `audio_quality_checker` | Validate audio specs against broadcast/podcast/phone standards with scoring |
| 8 | `multilingual_voice_mapper` | Map source voice to optimal targets across languages with compatibility analysis |

## Usage

Install via DeepSeek Harness:

```bash
dsh plugin install dsh-tool-voiceforge
```

Or add to your `cordis.yml`:

```yaml
plugins:
  - dsh-tool-voiceforge
```

## Architecture

```
dsh-tool-voiceforge/
├── package.json        # NPM package config (MIT license)
├── tsconfig.json       # TypeScript ES2022 config
├── cordis.yml          # DSH plugin manifest
├── README.md           # This file
├── src/
│   └── index.ts        # Plugin source — 8 tools, all interfaces, utility functions
└── lib/                # Compiled output (after npm run build)
```

## Technical Highlights

- **Seeded random** generation for deterministic output across all tools
- **Complete TypeScript interfaces** for all inputs and outputs
- **Rich markdown formatting** with tables, code blocks, and structured layouts
- **WCAG-inspired** audio quality scoring with pass/warn/fail grading
- **SRT / VTT / ASS** subtitle format support with full specification compliance
- **Multilingual voice database** simulation with cross-language compatibility scoring
- **Emotion-aware prosody** settings with audience-specific adjustments

## Author

chengganping-ship-it

## License

MIT
