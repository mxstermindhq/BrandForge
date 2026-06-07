import { createClient, type Client } from "@libsql/client";

type Row = Record<string, unknown>;

function emptyMeta(changes = 0): D1Meta & Record<string, unknown> {
  return {
    duration: 0,
    size_after: 0,
    rows_read: 0,
    rows_written: changes,
    changed_db: changes > 0,
    changes,
    last_row_id: 0,
  };
}

function rowToObject<T>(row: Row): T {
  return row as T;
}

class TursoPreparedStatement {
  constructor(
    private readonly client: Client,
    readonly sql: string,
    readonly args: unknown[] = [],
  ) {}

  bind(...values: unknown[]): TursoPreparedStatement {
    return new TursoPreparedStatement(this.client, this.sql, values);
  }

  raw(): TursoPreparedStatement {
    return this;
  }

  async first<T = unknown>(): Promise<T | null> {
    const rs = await this.client.execute({
      sql: this.sql,
      args: this.args as (string | number | null | Uint8Array)[],
    });
    if (!rs.rows.length) return null;
    return rowToObject<T>(rs.rows[0] as Row);
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const rs = await this.client.execute({
      sql: this.sql,
      args: this.args as (string | number | null | Uint8Array)[],
    });
    return {
      results: rs.rows.map((row) => rowToObject<T>(row as Row)),
      success: true,
      meta: emptyMeta(),
    };
  }

  async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    const rs = await this.client.execute({
      sql: this.sql,
      args: this.args as (string | number | null | Uint8Array)[],
    });
    return {
      results: [],
      success: true,
      meta: emptyMeta(rs.rowsAffected ?? 0),
    };
  }
}

/** Minimal D1Database shim backed by Turso/libSQL (SQLite-compatible). */
export function createTursoDb(url: string, authToken: string): D1Database {
  const client = createClient({ url, authToken });
  const db = {
    prepare(sql: string): D1PreparedStatement {
      return new TursoPreparedStatement(client, sql) as unknown as D1PreparedStatement;
    },
    async batch(statements: D1PreparedStatement[]): Promise<D1Result<unknown>[]> {
      const batch = statements.map((stmt) => {
        const s = stmt as unknown as TursoPreparedStatement;
        return {
          sql: s.sql,
          args: s.args as (string | number | null | Uint8Array)[],
        };
      });
      await client.batch(batch, "write");
      return batch.map(() => ({
        results: [],
        success: true,
        meta: emptyMeta(),
      })) as D1Result<unknown>[];
    },
    async exec(): Promise<D1ExecResult> {
      throw new Error("exec() not implemented for Turso adapter");
    },
    async dump(): Promise<ArrayBuffer> {
      throw new Error("dump() not implemented for Turso adapter");
    },
  };
  return db as unknown as D1Database;
}
