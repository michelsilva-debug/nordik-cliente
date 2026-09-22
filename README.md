# NØRDIK Cliente (App de Agendamento)

**O Front-end do cliente para o ecossistema NØRDIK.**

Aplicativo web focado em conversão e usabilidade premium, desenhado para que os clientes das barbearias realizem agendamentos e acompanhem seus planos de fidelidade.

## ? Funcionalidades
- **Agendamento Inteligente:** Seleção de serviço, barbeiro e horários disponíveis em tempo real.
- **Área VIP (Fidelidade):** Acesso simplificado ao cartão fidelidade digital.
- **Planos e Assinaturas:** Exibição do catálogo de planos recorrentes do tenant ativo.
- **Multi-tenant Dinâmico:** O app adapta o nome, logo, serviços e barbeiros com base na barbearia acessada via URL (ex: app.nordik.com/nome-da-barbearia).

## ??? Segurança e Privacidade
- **Data Validation no Banco:** O carrinho de serviços e os preços são sempre recalculados e validados pelo backend (Supabase RPCs), impossibilitando injeção de preços falsos.
- **Isolamento Total:** RLS rigoroso garante que um usuário não consiga interagir com IDs ou agendas de barbearias concorrentes.

## ??? Stack Tecnológica
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Integração:** Supabase Client (JS)
- **Infra:** PWA Ready (Progressive Web App)
