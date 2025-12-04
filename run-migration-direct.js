#!/usr/bin/env node
/**
 * Script para executar a migration específica diretamente
 * Solução alternativa quando parse-dbtool não funciona
 *
 * Este script executa a migration 20251126073945-add_istemporarypassword_field.cjs
 * diretamente usando o Parse SDK
 */

import dotenv from 'dotenv';
import Parse from 'parse/node.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar Parse
const APP_ID = process.env.APP_ID || 'OpenSignBR';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080/app';
const MASTER_KEY = process.env.MASTER_KEY;

if (!MASTER_KEY) {
  console.error('❌ MASTER_KEY não definido no arquivo .env');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     OpenSignBR - Direct Migration Runner                   ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📋 Configuração:`);
console.log(`   APP_ID: ${APP_ID}`);
console.log(`   SERVER_URL: ${SERVER_URL}`);
console.log(`   MASTER_KEY: ${'*'.repeat(Math.min(MASTER_KEY.length, 20))}`);
console.log('');

Parse.initialize(APP_ID, undefined, MASTER_KEY);
Parse.serverURL = SERVER_URL;

async function runMigration() {
  try {
    // 1. Verificar se a migration já foi executada
    console.log('🔍 Verificando histórico de migrations...');

    const MigrationQuery = new Parse.Query('_Migration');
    MigrationQuery.equalTo('name', '20251126073945-add_istemporarypassword_field');
    const existingMigration = await MigrationQuery.first({ useMasterKey: true });

    if (existingMigration) {
      console.log('');
      console.log('⚠️  Migration já foi executada anteriormente!');
      console.log(`   Executada em: ${existingMigration.createdAt}`);
      console.log('');
      console.log('Para executar novamente, primeiro desfaça a migration:');
      console.log('   node run-migration-direct.js --undo');
      return;
    }

    console.log('✅ Migration não encontrada no histórico, prosseguindo...');
    console.log('');

    // 2. Executar a migration
    console.log('🚀 Adicionando campo IsTemporaryPassword à tabela contracts_Users...');

    const schema = new Parse.Schema('contracts_Users');
    schema.addBoolean('IsTemporaryPassword');
    await schema.update();

    console.log('✅ Campo adicionado com sucesso!');
    console.log('');

    // 3. Registrar a migration
    console.log('📝 Registrando migration no histórico...');

    const Migration = Parse.Object.extend('_Migration');
    const migration = new Migration();
    migration.set('name', '20251126073945-add_istemporarypassword_field');
    migration.set('batch', 1);
    await migration.save(null, { useMasterKey: true });

    console.log('✅ Migration registrada com sucesso!');
    console.log('');

    // 4. Verificar o campo
    console.log('🔍 Verificando se o campo foi criado...');

    const schemaData = await schema.get();
    const hasField = schemaData.fields.hasOwnProperty('IsTemporaryPassword');

    if (hasField) {
      console.log('✅ Campo IsTemporaryPassword confirmado na tabela!');
      console.log(`   Tipo: ${schemaData.fields.IsTemporaryPassword.type}`);
    } else {
      console.log('❌ Erro: Campo não foi criado!');
      process.exit(1);
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ Migration concluída com sucesso!              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('');
    console.error('❌ Erro ao executar migration:', error.message);
    console.error('');
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

async function undoMigration() {
  try {
    console.log('⏪ Desfazendo migration...');
    console.log('');

    // 1. Remover o campo
    console.log('🗑️  Removendo campo IsTemporaryPassword...');

    const schema = new Parse.Schema('contracts_Users');
    schema.deleteField('IsTemporaryPassword');
    await schema.update();

    console.log('✅ Campo removido com sucesso!');
    console.log('');

    // 2. Remover o registro da migration
    console.log('📝 Removendo registro da migration...');

    const MigrationQuery = new Parse.Query('_Migration');
    MigrationQuery.equalTo('name', '20251126073945-add_istemporarypassword_field');
    const migration = await MigrationQuery.first({ useMasterKey: true });

    if (migration) {
      await migration.destroy({ useMasterKey: true });
      console.log('✅ Registro removido com sucesso!');
    } else {
      console.log('⚠️  Registro não encontrado no histórico');
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        ✅ Migration desfeita com sucesso!                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('');
    console.error('❌ Erro ao desfazer migration:', error.message);
    console.error('');
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

async function showStatus() {
  try {
    console.log('📊 Status da Migration:');
    console.log('');

    // Verificar na tabela _Migration
    const MigrationQuery = new Parse.Query('_Migration');
    MigrationQuery.equalTo('name', '20251126073945-add_istemporarypassword_field');
    const migration = await MigrationQuery.first({ useMasterKey: true });

    if (migration) {
      console.log('✅ Migration EXECUTADA');
      console.log(`   Data: ${migration.createdAt}`);
      console.log(`   Batch: ${migration.get('batch')}`);
    } else {
      console.log('❌ Migration NÃO EXECUTADA');
    }

    console.log('');

    // Verificar se o campo existe
    const schema = new Parse.Schema('contracts_Users');
    const schemaData = await schema.get();
    const hasField = schemaData.fields.hasOwnProperty('IsTemporaryPassword');

    if (hasField) {
      console.log('✅ Campo IsTemporaryPassword EXISTE na tabela');
      console.log(`   Tipo: ${schemaData.fields.IsTemporaryPassword.type}`);
    } else {
      console.log('❌ Campo IsTemporaryPassword NÃO EXISTE na tabela');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--undo') || args.includes('-u')) {
  undoMigration().then(() => process.exit(0));
} else if (args.includes('--status') || args.includes('-s')) {
  showStatus().then(() => process.exit(0));
} else if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso: node run-migration-direct.js [OPÇÃO]');
  console.log('');
  console.log('Opções:');
  console.log('  (nenhuma)    Executa a migration');
  console.log('  --status     Mostra o status da migration');
  console.log('  --undo       Desfaz a migration');
  console.log('  --help       Mostra esta mensagem');
  console.log('');
  process.exit(0);
} else {
  runMigration().then(() => process.exit(0));
}
