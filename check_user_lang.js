import Parse from 'parse/node.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.prod' });

Parse.initialize(process.env.APP_ID);
Parse.serverURL = process.env.SERVER_URL || 'http://localhost:8080/app';
Parse.masterKey = process.env.MASTER_KEY;

async function checkUserLanguage() {
  try {
    const email = 'leonardo.guimaraes@opensignbr.com';
    console.log(`🔍 Verificando idioma do usuário: ${email}\n`);

    // Buscar em contracts_Users
    const query = new Parse.Query('contracts_Users');
    query.equalTo('Email', email);
    const user = await query.first({ useMasterKey: true });

    if (user) {
      console.log('✅ Usuário encontrado em contracts_Users:');
      console.log(`   ObjectId: ${user.id}`);
      console.log(`   Name: ${user.get('Name')}`);
      console.log(`   Email: ${user.get('Email')}`);
      console.log(`   Language (maiúsculo): ${user.get('Language') || '❌ NÃO DEFINIDO'}`);
      console.log(`   language (minúsculo): ${user.get('language') || '❌ NÃO DEFINIDO'}`);
      console.log(`   Company: ${user.get('Company') || 'N/A'}`);
    } else {
      console.log('❌ Usuário NÃO encontrado em contracts_Users');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

checkUserLanguage();
