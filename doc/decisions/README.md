# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions.

## What is an ADR?

An ADR captures the context, decision, and consequences of an architecturally significant choice.

## Format

We use the [Michael Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Naming Convention

- Filename: `NNN-kebab-case-title.md` (e.g., `001-use-localStorage-for-tracking.md`)
- NNN = zero-padded sequence number (001, 002, 003...)
- Title in heading must match: `# NNN. Title` (e.g., `# 001. Use localStorage for Tracking`)

## Index

<!-- New ADRs added below -->
- [001. Use JSON Files for Data Storage](001-use-json-files-for-data-storage.md)
- [002. Use Zod for Runtime Schema Validation](002-use-zod-for-runtime-schema-validation.md)
- [003. Use Playwright for Notion Scraping](003-use-playwright-for-notion-scraping.md)
