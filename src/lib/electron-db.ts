type DBResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  changes?: number;
};

class ElectronDB {
  private ensureElectron() {
    if (!window.electron?.db) {
      throw new Error('Electron database API not available');
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    this.ensureElectron();
    const result: DBResult<T[]> = await window.electron.db.query(sql, params);

    if (!result.success) {
      throw new Error(result.error || 'Database query failed');
    }

    return result.data || [];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    this.ensureElectron();
    const result: DBResult<T> = await window.electron.db.get(sql, params);

    if (!result.success) {
      throw new Error(result.error || 'Database get failed');
    }

    return result.data || null;
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number }> {
    this.ensureElectron();
    const result: DBResult = await window.electron.db.execute(sql, params);

    if (!result.success) {
      throw new Error(result.error || 'Database execute failed');
    }

    return { changes: result.changes || 0 };
  }

  async insert(table: string, data: Record<string, any>): Promise<string> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    await this.execute(sql, values);

    return data.id || '';
  }

  async update(table: string, id: string, data: Record<string, any>): Promise<void> {
    const entries = Object.entries(data);
    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    await this.execute(sql, [...values, id]);
  }

  async delete(table: string, id: string): Promise<void> {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    await this.execute(sql, [id]);
  }

  async select<T = any>(
    table: string,
    options: {
      where?: Record<string, any>;
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    const params: any[] = [];

    if (options.where && Object.keys(options.where).length > 0) {
      const whereClause = Object.keys(options.where)
        .map(key => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(options.where));
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    if (options.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    return this.query<T>(sql, params);
  }
}

export const db = new ElectronDB();
