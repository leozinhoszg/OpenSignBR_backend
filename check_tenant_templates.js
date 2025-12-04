import Parse from 'parse/node';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.prod' });

Parse.initialize(process.env.APP_ID);
Parse.serverURL = process.env.SERVER_URL || 'http://localhost:8080/app';
Parse.masterKey = process.env.MASTER_KEY;

async function checkTenantTemplates() {
  try {
    console.log('🔍 Verificando templates personalizados dos Tenants...\n');

    const query = new Parse.Query('partners_Tenant');
    const tenants = await query.find({ useMasterKey: true });

    console.log(`📊 Total de tenants: ${tenants.length}\n`);

    for (const tenant of tenants) {
      const requestBody = tenant.get('RequestBody');
      const requestSubject = tenant.get('RequestSubject');
      const userId = tenant.get('UserId');

      if (requestBody || requestSubject) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📋 Tenant ID: ${tenant.id}`);
        console.log(`👤 User ID: ${userId?.id || 'N/A'}`);
        console.log(`📧 RequestSubject: ${requestSubject || '❌ NÃO DEFINIDO'}`);
        console.log(`📝 RequestBody: ${requestBody ? '✅ DEFINIDO' : '❌ NÃO DEFINIDO'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    }

    const tenantsWithCustomTemplates = tenants.filter(t =>
      t.get('RequestBody') || t.get('RequestSubject')
    );

    console.log(`\n📊 Resumo:`);
    console.log(`   Total: ${tenants.length} tenants`);
    console.log(`   Com templates customizados: ${tenantsWithCustomTemplates.length}`);
    console.log(`   Sem templates customizados: ${tenants.length - tenantsWithCustomTemplates.length}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkTenantTemplates();
