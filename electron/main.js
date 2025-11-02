const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');

let mainWindow;
let db;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getAppDataPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'database.db');
}

function initDatabase() {
  const dbPath = getAppDataPath();
  console.log('Database path:', dbPath);

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  createTables();

  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      license_key TEXT UNIQUE NOT NULL,
      activated_at TEXT NOT NULL,
      expires_at TEXT,
      status TEXT DEFAULT 'active',
      machine_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS yritykset (
      id TEXT PRIMARY KEY,
      nimi TEXT NOT NULL,
      y_tunnus TEXT,
      osoite TEXT,
      postinumero TEXT,
      postitoimipaikka TEXT,
      puhelin TEXT,
      email TEXT,
      logo_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_id TEXT,
      email TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asiakkaat (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT,
      numero TEXT NOT NULL,
      nimi TEXT NOT NULL,
      email TEXT,
      puhelin TEXT,
      osoite TEXT,
      postinumero TEXT,
      postitoimipaikka TEXT,
      ytunnus TEXT,
      huomiot TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE,
      UNIQUE(company_id, numero)
    );

    CREATE TABLE IF NOT EXISTS laitteet (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      asiakas_id TEXT NOT NULL,
      user_id TEXT,
      merkki TEXT,
      malli TEXT,
      sarjanumero TEXT,
      lisatiedot TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE,
      FOREIGN KEY (asiakas_id) REFERENCES asiakkaat(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS huollot (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      asiakas_id TEXT NOT NULL,
      laite_id TEXT,
      teknikko_id TEXT,
      user_id TEXT,
      numero TEXT NOT NULL,
      vika TEXT,
      toimenpiteet TEXT,
      status TEXT DEFAULT 'odottaa',
      prioriteetti TEXT DEFAULT 'normaali',
      tuntihinta REAL DEFAULT 0,
      tyoaika_minuutit INTEGER DEFAULT 0,
      varaosat_hinta REAL DEFAULT 0,
      alv_prosentti REAL DEFAULT 25.5,
      kokonaishinta REAL DEFAULT 0,
      takuu INTEGER DEFAULT 0,
      luotu TEXT DEFAULT (datetime('now')),
      valmis TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE,
      FOREIGN KEY (asiakas_id) REFERENCES asiakkaat(id) ON DELETE CASCADE,
      FOREIGN KEY (laite_id) REFERENCES laitteet(id) ON DELETE SET NULL,
      UNIQUE(company_id, numero)
    );

    CREATE TABLE IF NOT EXISTS varaosat (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT,
      nimi TEXT NOT NULL,
      tuotekoodi TEXT,
      valmistaja TEXT,
      maara INTEGER DEFAULT 0,
      yksikko TEXT DEFAULT 'kpl',
      ostohinta REAL DEFAULT 0,
      myyntihinta REAL DEFAULT 0,
      min_maara INTEGER DEFAULT 0,
      sijainti TEXT,
      huomiot TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS huolto_varaosat (
      id TEXT PRIMARY KEY,
      huolto_id TEXT NOT NULL,
      varaosa_id TEXT NOT NULL,
      maara REAL DEFAULT 1,
      yksikko_hinta REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (huolto_id) REFERENCES huollot(id) ON DELETE CASCADE,
      FOREIGN KEY (varaosa_id) REFERENCES varaosat(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS laskut (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      huolto_id TEXT,
      asiakas_id TEXT NOT NULL,
      numero TEXT NOT NULL,
      pvm TEXT NOT NULL,
      erapaiva TEXT NOT NULL,
      maksettu INTEGER DEFAULT 0,
      maksupvm TEXT,
      summa REAL DEFAULT 0,
      alv REAL DEFAULT 0,
      yhteensa REAL DEFAULT 0,
      viite TEXT,
      huomiot TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE,
      FOREIGN KEY (huolto_id) REFERENCES huollot(id) ON DELETE SET NULL,
      FOREIGN KEY (asiakas_id) REFERENCES asiakkaat(id) ON DELETE CASCADE,
      UNIQUE(company_id, numero)
    );

    CREATE TABLE IF NOT EXISTS tekniikat (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      user_id TEXT,
      nimi TEXT NOT NULL,
      email TEXT,
      puhelin TEXT,
      aktiivinen INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS yrityksen_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      valuutta TEXT DEFAULT 'EUR',
      kieli TEXT DEFAULT 'fi',
      aikavyohyke TEXT DEFAULT 'Europe/Helsinki',
      pvm_formaatti TEXT DEFAULT 'dd.MM.yyyy',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lasku_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      maksuaika_pv INTEGER DEFAULT 14,
      viivastyskorko REAL DEFAULT 8.0,
      pankkitili TEXT,
      bic TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS numerointi_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      asiakas_etuliite TEXT DEFAULT 'AS',
      asiakas_seuraava INTEGER DEFAULT 1,
      huolto_etuliite TEXT DEFAULT 'HU',
      huolto_seuraava INTEGER DEFAULT 1,
      lasku_etuliite TEXT DEFAULT 'LA',
      lasku_seuraava INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hinnoittelu_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      tuntihinta REAL DEFAULT 60.0,
      varaosakate REAL DEFAULT 1.3,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS takuu_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      oletus_kk INTEGER DEFAULT 12,
      varaosat_kk INTEGER DEFAULT 12,
      tyo_kk INTEGER DEFAULT 6,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS varasto_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      low_stock_alert INTEGER DEFAULT 1,
      alert_threshold INTEGER DEFAULT 5,
      auto_reduce_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ilmoitus_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      email_ilmoitukset INTEGER DEFAULT 1,
      palvelu_valmis INTEGER DEFAULT 1,
      low_stock INTEGER DEFAULT 1,
      erapaiva_muistutus INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alv_asetukset (
      id TEXT PRIMARY KEY,
      company_id TEXT UNIQUE NOT NULL,
      oletus_alv REAL DEFAULT 25.5,
      alennettu_alv REAL DEFAULT 14.0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS service_statuses (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      nimi TEXT NOT NULL,
      vari TEXT DEFAULT '#6b7280',
      jarjestys INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS maksutavat (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      nimi TEXT NOT NULL,
      aktiivinen INTEGER DEFAULT 1,
      jarjestys INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS laite_valmistajat (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      nimi TEXT NOT NULL,
      aktiivinen INTEGER DEFAULT 1,
      jarjestys INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'kayttaja',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES yritykset(id) ON DELETE CASCADE,
      UNIQUE(user_id, company_id)
    );

    CREATE INDEX IF NOT EXISTS idx_asiakkaat_company ON asiakkaat(company_id);
    CREATE INDEX IF NOT EXISTS idx_laitteet_company ON laitteet(company_id);
    CREATE INDEX IF NOT EXISTS idx_laitteet_asiakas ON laitteet(asiakas_id);
    CREATE INDEX IF NOT EXISTS idx_huollot_company ON huollot(company_id);
    CREATE INDEX IF NOT EXISTS idx_huollot_asiakas ON huollot(asiakas_id);
    CREATE INDEX IF NOT EXISTS idx_huollot_status ON huollot(status);
    CREATE INDEX IF NOT EXISTS idx_varaosat_company ON varaosat(company_id);
    CREATE INDEX IF NOT EXISTS idx_laskut_company ON laskut(company_id);
    CREATE INDEX IF NOT EXISTS idx_laskut_maksettu ON laskut(maksettu);
  `);

  console.log('Database tables created successfully');
}

function generateMachineId() {
  const networkInterfaces = require('os').networkInterfaces();
  const macs = [];

  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.mac && net.mac !== '00:00:00:00:00:00') {
        macs.push(net.mac);
      }
    }
  }

  const machineString = macs.join('-') + '-' + require('os').hostname();
  return crypto.createHash('sha256').update(machineString).digest('hex').substring(0, 32);
}

function validateLicenseKey(key) {
  const pattern = /^HU-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Huoltosovellus'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

ipcMain.handle('check-license', async () => {
  try {
    const license = db.prepare('SELECT * FROM licenses WHERE status = ? LIMIT 1').get('active');

    if (!license) {
      return { valid: false, message: 'Ei aktiivista lisenssiä' };
    }

    if (license.expires_at) {
      const expiryDate = new Date(license.expires_at);
      if (expiryDate < new Date()) {
        db.prepare('UPDATE licenses SET status = ? WHERE id = ?').run('expired', license.id);
        return { valid: false, message: 'Lisenssi on vanhentunut' };
      }
    }

    return {
      valid: true,
      license: {
        key: license.license_key,
        activated_at: license.activated_at,
        expires_at: license.expires_at
      }
    };
  } catch (error) {
    console.error('License check error:', error);
    return { valid: false, message: 'Virhe lisenssin tarkistuksessa' };
  }
});

ipcMain.handle('activate-license', async (event, licenseKey) => {
  try {
    if (!validateLicenseKey(licenseKey)) {
      return { success: false, message: 'Virheellinen lisenssiavain muoto' };
    }

    const existingLicense = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(licenseKey);

    if (existingLicense) {
      if (existingLicense.status === 'active') {
        return { success: false, message: 'Tämä lisenssi on jo käytössä' };
      }
    }

    const machineId = generateMachineId();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare('DELETE FROM licenses').run();

    db.prepare(`
      INSERT INTO licenses (id, license_key, activated_at, machine_id, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, licenseKey, now, machineId, 'active');

    const defaultCompanyId = crypto.randomUUID();
    const defaultUserId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO yritykset (id, nimi, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(defaultCompanyId, 'Oma Yritys', now, now);

    db.prepare(`
      INSERT INTO profiles (id, user_id, company_id, email, full_name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), defaultUserId, defaultCompanyId, 'admin@yritys.fi', 'Admin', 'admin', now, now);

    const settingsTables = [
      'yrityksen_asetukset',
      'lasku_asetukset',
      'numerointi_asetukset',
      'hinnoittelu_asetukset',
      'takuu_asetukset',
      'varasto_asetukset',
      'ilmoitus_asetukset',
      'alv_asetukset'
    ];

    for (const table of settingsTables) {
      db.prepare(`
        INSERT INTO ${table} (id, company_id, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(crypto.randomUUID(), defaultCompanyId, now, now);
    }

    return {
      success: true,
      message: 'Lisenssi aktivoitu onnistuneesti',
      userId: defaultUserId,
      companyId: defaultCompanyId
    };
  } catch (error) {
    console.error('License activation error:', error);
    return { success: false, message: 'Virhe lisenssin aktivoinnissa: ' + error.message };
  }
});

ipcMain.handle('db-query', async (event, { sql, params = [] }) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.all(...params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-execute', async (event, { sql, params = [] }) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { success: true, changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  } catch (error) {
    console.error('Database execute error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get', async (event, { sql, params = [] }) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database get error:', error);
    return { success: false, error: error.message };
  }
});
