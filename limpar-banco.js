// Script para limpar o banco de dados OpenSignBR usando Node.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'OpenSignBR';

async function limparBanco() {
  console.log('========================================');
  console.log('Limpando banco de dados OpenSignBR');
  console.log('========================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Conectado ao MongoDB\n');

    const db = client.db(DB_NAME);

    // Limpar cada collection
    const collections = [
      '_User',
      'contracts_Users',
      'partners_Tenant',
      'contracts_Teams',
      '_Session',
    ];

    for (const collectionName of collections) {
      try {
        console.log(`Limpando ${collectionName}...`);
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✓ ${result.deletedCount} documentos removidos de ${collectionName}\n`);
      } catch (err) {
        console.log(`⚠ Erro ao limpar ${collectionName}: ${err.message}\n`);
      }
    }

    // Verificar resultado
    console.log('========================================');
    console.log('Verificando resultado...');
    console.log('========================================\n');

    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`${collectionName}: ${count} documentos`);
    }

    console.log('\n========================================');
    console.log('✅ Banco limpo com sucesso!');
    console.log('Agora acesse: http://localhost:3000/addadmin');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    console.error('\nVerifique se o MongoDB está rodando em localhost:27017');
    process.exit(1);
  } finally {
    await client.close();
  }
}

limparBanco();
