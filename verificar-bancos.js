// Script para verificar todos os bancos de dados e coleções no MongoDB
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';

async function verificarBancos() {
  console.log('========================================');
  console.log('Verificando todos os bancos MongoDB');
  console.log('========================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Conectado ao MongoDB\n');

    // Listar todos os bancos de dados
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    console.log('Bancos de dados encontrados:\n');

    for (const dbInfo of dbs.databases) {
      console.log(`📦 Banco: ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);

      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      if (collections.length > 0) {
        console.log('   Coleções:');
        for (const coll of collections) {
          const count = await db.collection(coll.name).countDocuments();
          console.log(`   - ${coll.name}: ${count} documentos`);
        }
      } else {
        console.log('   (sem coleções)');
      }
      console.log('');
    }

    // Verificar especificamente tabelas de usuários em cada banco
    console.log('\n========================================');
    console.log('Procurando usuários em todos os bancos...');
    console.log('========================================\n');

    for (const dbInfo of dbs.databases) {
      const db = client.db(dbInfo.name);

      try {
        const userCount = await db.collection('_User').countDocuments();
        if (userCount > 0) {
          console.log(`⚠️ Encontrado ${userCount} usuários em: ${dbInfo.name}/_User`);
        }
      } catch (err) {
        // Collection não existe
      }

      try {
        const contractsUserCount = await db.collection('contracts_Users').countDocuments();
        if (contractsUserCount > 0) {
          console.log(
            `⚠️ Encontrado ${contractsUserCount} usuários em: ${dbInfo.name}/contracts_Users`
          );
        }
      } catch (err) {
        // Collection não existe
      }
    }
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verificarBancos();
