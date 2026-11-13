# IA para Empreendedores — Iniciação (v22)

Site estático do aluno para GitHub Pages: nove aulas, Gemini como laboratório principal, casos da Café Horizonte (fictícia). Não usa backend, API Key nem conta de automação; o site não envia dados ao Gemini.

## Publicação
1. Extraia o ZIP e envie os arquivos para a raiz de um repositório do GitHub.
2. Em Settings → Pages: Deploy from a branch, `main`, pasta `/ (root)`.
3. Abra a URL e teste as aulas no computador e no celular.

## Novidades da v17
- Alternativas dos quizzes das aulas sorteadas a cada acesso.
- Aula 7: bloco "Desenhe seu primeiro workflow".
- Aula 8: bloco "Privacidade, LGPD e ética no uso da IA".
- Arquivo de comentários fictícios sem gabarito (o gabarito fica com o instrutor, fora do site).
- Remoção de código sem uso e padronização do texto de versão.

## Visual da v18
- Nova camada `assets/css/visual-v18.css`: paleta índigo, turquesa e âmbar, cabeçalhos com gradiente, cartões com cor própria por aula, botões em pílula, barra de progresso colorida, barra de leitura nas aulas, grade de 2 colunas na lista de aulas e tema escuro refeito.

## Novidades da v19
- Uma analogia por aula (removidas as duplicadas nas etapas guiadas).
- Prática de demonstração em cada aula, com outras ferramentas (segunda IA para comparação, NotebookLM, Canva, Google Forms e planilhas, Gems, plataformas de automação) e um bloco "Ligando as pontas" que conecta cada aula à seguinte.
- **Modo Professor** em `professor/index.html`: apresentação para projetor, 5 slides por aula, teclas ←/→, F (tela cheia), N (notas), 1–9 (aulas). A página não é linkada no site do aluno; compartilhe o endereço só com quem precisar.

## Revisão da v20
- As práticas de demonstração passaram para depois do conteúdo e antes do quiz de cada aula.
- Removidos blocos que repetiam conteúdo já existente (aula 7: fluxo e mapa antes/depois; aula 8: ética e minimização).
- Contraste dos rótulos e do rodapé corrigido.

## Novidades da v21
- Barra "Nesta aula" (Entenda, Pratique, Confira, Aprofunde, Concluir) fixa sob o cabeçalho, com destaque da parte em que você está.
- Leituras de apoio recolhidas em dois blocos opcionais: "Conceitos em detalhe" e "Aprofunde o tema". O caminho principal ficou mais curto.
- Botão Copiar em todos os prompts das práticas.
- Topo das aulas mais limpo (removidos três elementos de navegação repetidos).

## Novidades da v22
- **Aula Zero** (`aula-zero.html`): 11 experimentos com botão Copiar, caminho mínimo (1, 2, 4 e 7), três arquivos fictícios e caderno para download em `assets/dados/aula-zero/`.
- A aula 6 passou a usar os mesmos arquivos fictícios da Aula Zero.
- Modo Professor com slides da Aula Zero (tecla Z).
- Kit revisado separado (guia do professor e apresentação), que não vai para o site.

## Avisos
- O progresso fica só no navegador do aluno. O certificado do site é simbólico e não comprova frequência.
- Recursos do Gemini (arquivos, Canvas, pesquisa) dependem de conta e podem mudar; confira antes da aula.
- Não publique o gabarito do instrutor nem a documentação institucional do curso.


## Correções de funcionamento e segurança

- Estrutura `assets/` restaurada para estilos, scripts e downloads da Aula Zero.
- Página inicial do aluno reconstruída e Modo Professor preservado em `professor/index.html`.
- As nove páginas de aula foram reconstruídas a partir de `roteiros-etapas.json` e do conteúdo da apresentação existente; o histórico não continha os HTMLs originais. Incluem práticas, conferência, anotações, progresso, construtor C.O.I.R.F. e Projeto Integrador.
- Backups são validados antes da substituição de dados; versões de backup 10 e 22 são aceitas. Arquivos inválidos são rejeitados, e falhas de gravação acionam restauração dos registros anteriores.
- Conteúdo salvo é escapado antes de aparecer em HTML; progresso considera apenas os nove identificadores válidos e únicos.
- Cópia de prompts confirma a operação ou orienta a cópia manual. Falhas de armazenamento exibem um aviso.
- Layout das aulas ajustado para telas pequenas e controles de preferências habilitados na página de fontes.

## Verificações locais

Execute `python tests/check-site.py` para verificar recursos locais, âncoras, IDs, SVGs e JSON. A sintaxe JavaScript pode ser conferida com `node --check assets/js/app.js`, `node --check assets/js/assessment.js` e `node --check assets/js/etapas.js`.

O teste de navegador usa Node.js e o pacote Playwright disponível no ambiente de desenvolvimento. Com um servidor estático iniciado por `python -m http.server 8000`, execute `node tests/browser.cjs`. Para usar um Chromium já instalado, defina `CHROMIUM_PATH=/caminho/para/chromium`. O teste percorre as 27 páginas, aulas, notas, projeto, avaliação, certificado, backups, proteção contra injeção, cópia, preferências e layouts de celular. Ele usa um perfil isolado, sem alterar dados de alunos.

O endereço do Modo Professor é público e não possui autenticação. O certificado continua simbólico, gerado localmente; não é uma comprovação institucional.
