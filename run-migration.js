import Parse from 'parse/node.js';
import migration from './databases/migrations/20251126073945-add_istemporarypassword_field.cjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    // Load environment variables from .env.prod
    const envPath = path.join(__dirname, '../../.env.prod');
    dotenv.config({ path: envPath });

    const APP_ID = process.env.APP_ID || process.env.APPLICATION_ID || 'OpenSignBR';
    const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080/app';
    const MASTER_KEY = process.env.MASTER_KEY;

    console.log('Configuração:');
    console.log('- APP_ID:', APP_ID);
    console.log('- SERVER_URL:', SERVER_URL);
    console.log('- MASTER_KEY:', MASTER_KEY ? '***' + MASTER_KEY.slice(-4) : 'NOT SET');

    if (!MASTER_KEY) {
      throw new Error('MASTER_KEY não está definida!');
    }

    Parse.initialize(APP_ID);
    Parse.serverURL = SERVER_URL;
    Parse.masterKey = MASTER_KEY;

    console.log('\n🔄 Executando migration: add_istemporarypassword_field...');
    await migration.up(Parse);
    console.log('✅ Migration aplicada com sucesso!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
