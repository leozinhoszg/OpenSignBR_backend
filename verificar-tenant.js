// Script para verificar e limpar tabela partners_Tenant
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'OpenSignBR';

async function verificarTenant() {
  console.log('========================================');
  console.log('Verificando tabela partners_Tenant');
  console.log('========================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Verificar partners_Tenant
    const tenantCount = await db.collection('partners_Tenant').countDocuments();
    console.log(`Registros em partners_Tenant: ${tenantCount}\n`);

    if (tenantCount > 0) {
      const tenants = await db.collection('partners_Tenant').find({}).toArray();
      console.log('Tenants encontrados:');
      tenants.forEach((tenant, index) => {
        console.log(`\n${index + 1}. ObjectId: ${tenant._id}`);
        console.log(`   TenantName: ${tenant.TenantName || '(não definido)'}`);
        console.log(`   Domain: ${tenant.Domain || '(não definido)'}`);
        console.log(`   Logo: ${tenant.Logo || '(não definido)'}`);
      });

      console.log('\n========================================');
      console.log('Limpando tabela partners_Tenant...');
      console.log('========================================\n');

      const result = await db.collection('partners_Tenant').deleteMany({});
      console.log(`✓ ${result.deletedCount} tenants removidos\n`);
    } else {
      console.log('✓ Tabela partners_Tenant já está vazia\n');
    }

    // Verificar novamente todas as tabelas críticas
    console.log('========================================');
    console.log('Verificação final de todas as tabelas:');
    console.log('========================================\n');

    const tables = ['_User', 'contracts_Users', 'partners_Tenant', 'contracts_Teams', '_Session'];
    for (const table of tables) {
      const count = await db.collection(table).countDocuments();
      console.log(`${table}: ${count} documentos`);
    }

    console.log('\n========================================');
    console.log('✅ Verificação concluída!');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verificarTenant();
