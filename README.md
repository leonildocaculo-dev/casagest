# CasaGest - Sistema de Gestão Imobiliária

O **CasaGest** é uma plataforma moderna e completa para gestão de imóveis, negociação de propostas e administração de contratos de arrendamento e venda.

O projeto foi construído utilizando uma arquitetura desacoplada (Headless), separando de forma limpa a interface do utilizador (Frontend) e a lógica de negócio (Backend).

## 🚀 Tecnologias Utilizadas

### Backend (API)
* **Framework:** Laravel 11.x (API RESTful)
* **Base de Dados:** PostgreSQL 16
* **Autenticação:** Laravel Sanctum (Token-based Auth)
* **Uploads e Ficheiros:** Laravel Storage + Spatie MediaLibrary
* **Geração de PDF:** dompdf (Para contratos e relatórios)
* **Testes:** Pest PHP

### Frontend (Web)
* **Framework:** Next.js 15 (App Router, React Server Components)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS + shadcn/ui
* **Gestão de Estado/API:** TanStack Query (React Query)
* **Formulários:** React Hook Form + Zod

---

## 🎯 Funcionalidades Principais

* **Gestão de Perfis de Utilizador:** Permissões granulares para **Administradores**, **Proprietários** e **Clientes**.
* **Catálogo de Imóveis:** Criação, edição, upload de galerias de fotos e aprovação de publicações.
* **Pesquisa Avançada:** Filtros por localização, preço, tipologia e características dos imóveis.
* **Sistema de Negociação (Propostas):** Fluxo completo de envio, contraproposta e aceitação/rejeição entre Cliente e Proprietário.
* **Geração de Contratos:** Criação automatizada de contratos em PDF baseados nos dados da proposta.
* **Gestão de Pagamentos:** Registo de sinais e rendas/pagamentos associados.
* **Painel Administrativo:** Dashboard de métricas e registo completo de Logs de Auditoria (Audit Logs) para rastreabilidade de ações críticas.

---

## 🛠️ Como Instalar e Executar Localmente

### Pré-requisitos
* PHP 8.2+
* Node.js 18+
* PostgreSQL
* Composer

### 1. Configurar o Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurar as credenciais da base de dados no ficheiro .env
php artisan migrate --seed
php artisan serve
```

### 2. Configurar o Frontend (Next.js)
```bash
cd frontend
npm install
# Configure o ficheiro .env.local com a URL da API (ex: NEXT_PUBLIC_API_URL=http://localhost:8000/api)
npm run dev
```

---

## 🛣️ Roadmap e Futuro

De acordo com o nosso planeamento de evolução, estão previstas as seguintes atualizações pós-MVP:
1. **Pesquisa Geográfica:** Integração de mapas interativos (PostGIS, Mapbox/Leaflet) com filtro por raio de distância.
2. **Notificações em Tempo Real:** Alertas instâneos para novas propostas e pagamentos usando WebSockets (Laravel Reverb).
3. **Assinatura Eletrónica:** Validade jurídica nos contratos em PDF integrando DocuSign ou Autentique.
4. **Aplicação Mobile:** Criação de app móvel consumindo a mesma API Laravel (React Native ou Flutter).

---

© 2026 CasaGest - Desenvolvido para modernizar o setor imobiliário.
