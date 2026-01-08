# 002. Use Zod for Runtime Schema Validation

Date: 2026-01-07

## Status

Accepted

## Context

With JSON file storage, we need runtime validation to ensure data integrity when:
- Reading potentially corrupted/manually edited files
- Creating new records programmatically
- Scraping external data sources

TypeScript provides compile-time type safety but not runtime validation.

## Decision

Use Zod for schema definitions that provide:
- Runtime validation with detailed error messages
- Automatic TypeScript type inference via `z.infer<>`
- Default values with `.default()`
- Coercion and transformation support

Define schemas in `src/types/` and derive TypeScript types from them.

## Consequences

**Positive:**
- Single source of truth for types and validation
- Runtime protection against malformed data
- Clear error messages for validation failures
- TypeScript types stay in sync with validation logic

**Negative:**
- `.default()` creates input/output type mismatch requiring explicit casts
- Additional bundle size (~12KB)
- Learning curve for advanced Zod patterns

## Alternatives Considered

1. **io-ts**: More verbose, steeper learning curve
2. **Yup**: Less TypeScript-focused
3. **Manual validation**: Error-prone, no type inference
4. **JSON Schema + ajv**: Schema separate from types, manual type sync

## Related

- Planning: `.plan/.done/feature-accelerator-pipeline-foundation/`
