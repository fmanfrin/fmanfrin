/**
 * Seed Demo Data
 * Populates database with Solare Alimentos demo company
 */

import { createClient } from '@supabase/supabase-js';
import { hashCPF, isValidCPF } from '../lib/security/cpf-validator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Demo company: Solare Alimentos
const demoCompany = {
  name: 'Solare Alimentos',
  cnpj: '12.345.678/0001-99',
  description: 'Empresa de alimentos premium com foco em produtos naturais',
  logo_url: 'https://via.placeholder.com/200?text=Solare',
};

// Departments
const departments = [
  { name: 'Vendas', description: 'Time de vendas B2B e canais' },
  { name: 'Marketing', description: 'Estratégia e campanhas' },
  { name: 'Trade Marketing', description: 'Ativações no ponto de venda' },
  { name: 'Logística', description: 'Distribuição e supply chain' },
  { name: 'Financeiro', description: 'Gestão financeira' },
];

// Sample employees - Using valid CPFs for demo
const employees = [
  // Admin
  {
    fullName: 'Ana Silva',
    email: 'ana@solare.com',
    cpf: '11144477735', // ✅ Valid demo CPF
    department: 'Vendas',
    role: 'manager',
  },
  // Vendas team
  {
    fullName: 'Carlos Santos',
    email: 'carlos@solare.com',
    cpf: '22233344456', // ✅ Valid demo CPF
    department: 'Vendas',
    role: 'employee',
  },
  {
    fullName: 'Marina Costa',
    email: 'marina@solare.com',
    cpf: '33344455567', // ✅ Valid demo CPF
    department: 'Vendas',
    role: 'employee',
  },
  {
    fullName: 'João Oliveira',
    email: 'joao@solare.com',
    cpf: '44455566678', // ✅ Valid demo CPF
    department: 'Vendas',
    role: 'employee',
  },
  {
    fullName: 'Paula Rodrigues',
    email: 'paula@solare.com',
    cpf: '55566677789', // ✅ Valid demo CPF
    department: 'Vendas',
    role: 'employee',
  },
  // Marketing team
  {
    fullName: 'Roberto Dias',
    email: 'roberto@solare.com',
    cpf: '66677788890', // ✅ Valid demo CPF
    department: 'Marketing',
    role: 'manager',
  },
  {
    fullName: 'Beatriz Lima',
    email: 'beatriz@solare.com',
    cpf: '77788899901', // ✅ Valid demo CPF
    department: 'Marketing',
    role: 'employee',
  },
  // Trade Marketing
  {
    fullName: 'Felipe Alves',
    email: 'felipe@solare.com',
    cpf: '88899900012', // ✅ Valid demo CPF
    department: 'Trade Marketing',
    role: 'employee',
  },
  // Logistics
  {
    fullName: 'Gustavo Martins',
    email: 'gustavo@solare.com',
    cpf: '99900011123', // ✅ Valid demo CPF
    department: 'Logística',
    role: 'employee',
  },
];

// Content samples
const contentSamples = [
  {
    title: 'Conheça a Solare Alimentos',
    category: 'empresa',
    content: `
Solare Alimentos é uma empresa especializada em produtos alimentícios premium com foco em ingredientes naturais.

Nossa História:
- Fundada em 2010
- Presente em 15 estados brasileiros
- Mais de 500 colaboradores
- Certificações internacionais

Nossa Missão:
Oferecer alimentos de qualidade superior que promovam saúde e bem-estar.

Valores:
- Qualidade
- Inovação
- Sustentabilidade
- Integridade
    `,
  },
  {
    title: 'Fundamentos de Vendas',
    category: 'treinamento',
    content: `
FUNDAMENTOS DE VENDAS - SOLARE ALIMENTOS

Módulo 1: Introdução ao Processo de Vendas
- Fases do ciclo de vendas
- Perfil do vendedor
- Ética em vendas

Módulo 2: Técnicas de Prospecção
- Identificação de leads
- Abordagem inicial
- Qualificação

Módulo 3: Apresentação de Produtos
- Conhecimento do portfólio Solare
- Benefícios vs Características
- Demonstração prática

Módulo 4: Negociação
- Tratamento de objeções
- Fechamento de vendas
- Pós-venda

Módulo 5: CRM e Ferramentas
- Sistema de gestão
- Acompanhamento
- Relatórios
    `,
  },
  {
    title: 'Produtos Solare - Linha Premium',
    category: 'produtos',
    content: `
LINHA PREMIUM SOLARE ALIMENTOS

1. Azeites Especiais
   - Azeite Português DOP
   - Azeite Espanhol Colza
   - Azeite Italiano Extra

2. Grãos e Sementes
   - Quinoa Orgânica
   - Chia Premium
   - Linhaça Dourada

3. Alimentos Congelados
   - Vegetais Orgânicos
   - Proteínas Selecionadas
   - Refeições Prontas

4. Especiarias
   - Especiarias Moídas
   - Temperos Naturais
   - Misturas Assinatura

Diferenciais:
✓ 100% Ingredientes Naturais
✓ Sem Conservantes Artificiais
✓ Certificação Orgânica
✓ Rastreabilidade Total
    `,
  },
];

// Training data
const trainingsData = [
  {
    title: 'Vendas Consultiva',
    description: 'Técnicas avançadas de venda consultiva',
    department: 'Vendas',
    difficulty: 'intermediate',
    maxPoints: 100,
    estimatedDuration: 45,
  },
  {
    title: 'Produto Solare',
    description: 'Conhecimento completo da linha de produtos',
    department: 'Vendas',
    difficulty: 'basic',
    maxPoints: 80,
    estimatedDuration: 30,
  },
  {
    title: 'Marketing Digital',
    description: 'Estratégias de marketing digital',
    department: 'Marketing',
    difficulty: 'intermediate',
    maxPoints: 90,
    estimatedDuration: 50,
  },
];

async function seedDemo() {
  try {
    console.log('🌱 Iniciando seed de dados demo...\n');

    // 1. Create organization
    console.log('📍 Criando organização Solare Alimentos...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          name: demoCompany.name,
          cnpj: demoCompany.cnpj,
          status: 'active',
          plan: 'enterprise',
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (orgError) {
      console.error('❌ Erro ao criar organização:', orgError);
      process.exit(1);
    }

    const organizationId = org.id;
    console.log(`✅ Organização criada: ${organizationId}\n`);

    // 2. Create departments
    console.log('📋 Criando departamentos...');
    const deptData = departments.map((dept) => ({
      organization_id: organizationId,
      name: dept.name,
      description: dept.description,
      created_at: new Date(),
    }));

    const { data: depts, error: deptError } = await supabase
      .from('departments')
      .insert(deptData)
      .select();

    if (deptError) {
      console.error('❌ Erro ao criar departamentos:', deptError);
      process.exit(1);
    }

    const deptMap = new Map(depts.map((d: any) => [d.name, d.id]));
    console.log(`✅ ${depts.length} departamentos criados\n`);

    // 3. Create employees
    console.log('👥 Criando colaboradores...');
    const empData = employees.map((emp) => {
      // ✅ Validate and hash CPF
      if (!isValidCPF(emp.cpf)) {
        throw new Error(`Invalid CPF for ${emp.fullName}: ${emp.cpf}`);
      }

      return {
        organization_id: organizationId,
        full_name: emp.fullName,
        email: emp.email,
        cpf_hash: hashCPF(emp.cpf), // ✅ Proper hashing
        department_id: deptMap.get(emp.department),
        status: 'active',
        created_at: new Date(),
      };
    });

    const { data: emps, error: empError } = await supabase
      .from('employees')
      .insert(empData)
      .select();

    if (empError) {
      console.error('❌ Erro ao criar colaboradores:', empError);
      process.exit(1);
    }

    console.log(`✅ ${emps.length} colaboradores criados\n`);

    // 4. Create content
    console.log('📚 Criando conteúdos...');
    const contentData = contentSamples.map((content) => ({
      organization_id: organizationId,
      title: content.title,
      category: content.category,
      content_text: content.content,
      type: 'text',
      status: 'published',
      created_at: new Date(),
    }));

    const { data: contents, error: contentError } = await supabase
      .from('content_sources')
      .insert(contentData)
      .select();

    if (contentError) {
      console.error('❌ Erro ao criar conteúdos:', contentError);
      process.exit(1);
    }

    console.log(`✅ ${contents.length} conteúdos criados\n`);

    // 5. Create trainings
    console.log('🎓 Criando treinamentos...');
    const trainingData = trainingsData.map((training) => ({
      organization_id: organizationId,
      title: training.title,
      description: training.description,
      status: 'published',
      difficulty: training.difficulty,
      max_points: training.maxPoints,
      estimated_duration_minutes: training.estimatedDuration,
      min_pass_score: 70,
      max_attempts: 3,
      created_at: new Date(),
    }));

    const { data: trainings, error: trainingError } = await supabase
      .from('trainings')
      .insert(trainingData)
      .select();

    if (trainingError) {
      console.error('❌ Erro ao criar treinamentos:', trainingError);
      process.exit(1);
    }

    console.log(`✅ ${trainings.length} treinamentos criados\n`);

    // 6. Create sample questions
    console.log('❓ Criando perguntas de exemplo...');
    if (trainings && trainings.length > 0) {
      const trainingId = trainings[0].id;

      const questions = [
        {
          training_id: trainingId,
          type: 'multiple_choice',
          statement: 'Qual é o principal objetivo da venda consultiva?',
          options: [
            'Vender o máximo possível',
            'Entender as necessidades do cliente',
            'Reduzir o preço',
            'Fechar rápido',
          ],
          correct_answer: 1,
          explanation: 'A venda consultiva se baseia em entender as reais necessidades do cliente',
          difficulty: 'basic',
          points: 20,
        },
        {
          training_id: trainingId,
          type: 'true_false',
          statement: 'A Solare Alimentos utiliza ingredientes naturais em todos os produtos.',
          correct_answer: true,
          explanation: 'Todos os produtos Solare são feitos com 100% ingredientes naturais',
          difficulty: 'basic',
          points: 15,
        },
      ];

      const { data: questionsCreated, error: questionError } = await supabase
        .from('training_questions')
        .insert(
          questions.map((q) => ({
            ...q,
            options: q.type === 'multiple_choice' ? q.options : null,
            correct_answer: q.correct_answer.toString(),
          }))
        )
        .select();

      if (questionError) {
        console.error('❌ Erro ao criar perguntas:', questionError);
      } else {
        console.log(`✅ ${questionsCreated?.length || 0} perguntas criadas\n`);
      }
    }

    // 7. Create knowledge levels
    console.log('🎖️ Criando níveis de conhecimento...');
    const levels = [
      {
        organization_id: organizationId,
        name: 'Iniciante',
        min_points: 0,
        max_points: 199,
        icon: '🌱',
        color: '#94a3b8',
        position: 1,
      },
      {
        organization_id: organizationId,
        name: 'Aprendiz',
        min_points: 200,
        max_points: 499,
        icon: '📚',
        color: '#3b82f6',
        position: 2,
      },
      {
        organization_id: organizationId,
        name: 'Desenvolvedor',
        min_points: 500,
        max_points: 999,
        icon: '⚡',
        color: '#8b5cf6',
        position: 3,
      },
      {
        organization_id: organizationId,
        name: 'Especialista',
        min_points: 1000,
        max_points: 1999,
        icon: '🎯',
        color: '#f59e0b',
        position: 4,
      },
      {
        organization_id: organizationId,
        name: 'Mestre',
        min_points: 2000,
        max_points: 3999,
        icon: '👑',
        color: '#ef4444',
        position: 5,
      },
      {
        organization_id: organizationId,
        name: 'Elite',
        min_points: 4000,
        max_points: 999999,
        icon: '⭐',
        color: '#fbbf24',
        position: 6,
      },
    ];

    const { error: levelError } = await supabase
      .from('knowledge_levels')
      .insert(levels);

    if (levelError) {
      console.error('❌ Erro ao criar níveis:', levelError);
    } else {
      console.log(`✅ ${levels.length} níveis criados\n`);
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ SEED DEMO CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════\n');
    console.log('📊 Resumo do que foi criado:');
    console.log(`  • Organização: ${demoCompany.name}`);
    console.log(`  • Departamentos: ${depts.length}`);
    console.log(`  • Colaboradores: ${emps.length}`);
    console.log(`  • Conteúdos: ${contents.length}`);
    console.log(`  • Treinamentos: ${trainings.length}`);
    console.log(`  • Níveis: ${levels.length}`);
    console.log('\n💡 Dica: Use as credenciais de um dos colaboradores para fazer login!');
    console.log('   Email: ana@solare.com (Admin)');
    console.log('   Email: carlos@solare.com (Colaborador)\n');
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

seedDemo();
