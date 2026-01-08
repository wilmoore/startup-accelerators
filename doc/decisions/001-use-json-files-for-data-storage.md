# 001. Use JSON Files for Data Storage

Date: 2026-01-07

## Status

Accepted

## Context

The application needs to persist data about funding opportunities, products, and applications. The data needs to be:
- Portable across environments
- Version-controllable with git
- Human-readable for debugging and manual editing
- Accessible without a database server

## Decision

Use plain JSON files stored in the `data/` directory, organized by entity type:
- `data/opportunities/accelerators.json`
- `data/opportunities/grants.json`
- `data/opportunities/angels.json`
- `data/products/products.json`
- `data/applications/applications.json`

Each file contains a wrapper object with `lastUpdated` timestamp and the data array.

## Consequences

**Positive:**
- Zero infrastructure requirements
- Data can be committed to git for history and backup
- Easy to share across machines
- Human-readable and editable
- Works offline

**Negative:**
- No concurrent write protection
- Performance may degrade with very large datasets
- No query optimization (full file reads)
- Schema migrations require manual handling

## Alternatives Considered

1. **SQLite**: Rejected due to binary format being less git-friendly
2. **PostgreSQL/MySQL**: Rejected due to requiring server infrastructure
3. **Cloud databases (Supabase, Firebase)**: Rejected to avoid external dependencies for MVP

## Related

- Planning: `.plan/.done/feature-accelerator-pipeline-foundation/`
