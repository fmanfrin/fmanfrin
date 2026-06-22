const crypto = require('crypto');

function hashCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  return crypto.createHash('sha256').update(digits).digest('hex');
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║           ELEVARE TREINAMENTOS - SEED DEMO            ║');
console.log('╚════════════════════════════════════════════════════════╝');

console.log('\n✅ SEED DEMO CONCLUÍDO COM SUCESSO!\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('📊 Resumo do que foi criado:');
console.log('  • Organização: Solare Alimentos');
console.log('  • Departamentos: 5');
console.log('  • Colaboradores: 9');
console.log('  • Conteúdos: 3');
console.log('  • Treinamentos: 3');
console.log('  • Níveis: 6\n');

console.log('👥 Colaboradores de Teste:\n');
const employees = [
  { name: 'Ana Silva', email: 'ana@solare.com', role: 'Admin' },
  { name: 'Carlos Santos', email: 'carlos@solare.com', role: 'Employee' },
  { name: 'Marina Costa', email: 'marina@solare.com', role: 'Employee' },
  { name: 'João Oliveira', email: 'joao@solare.com', role: 'Employee' },
  { name: 'Paula Rodrigues', email: 'paula@solare.com', role: 'Employee' },
  { name: 'Roberto Dias', email: 'roberto@solare.com', role: 'Manager' },
  { name: 'Beatriz Lima', email: 'beatriz@solare.com', role: 'Employee' },
  { name: 'Felipe Alves', email: 'felipe@solare.com', role: 'Employee' },
  { name: 'Gustavo Martins', email: 'gustavo@solare.com', role: 'Employee' },
];

employees.forEach(emp => {
  console.log(`  ${emp.email.padEnd(25)} - ${emp.name.padEnd(20)} (${emp.role})`);
});

console.log('\n🔐 Para fazer login:\n');
console.log('  1. Email: ana@solare.com (Admin)');
console.log('  2. Clique em "Forgot Password" para resetar');
console.log('  3. Use nova password para fazer login\n');

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✨ Próximo passo: npm run dev\n');
