Regra de Ouro: Este arquivo dita o comportamento operacional da IA e a integridade do projeto. Leia antes de qualquer ação. Última modificação: 2026-05-28.

 1. Protocolo de Execução Automática e Testes
Pensar antes de Agir: Antes de tocar em qualquer arquivo, isole o escopo. Se a alteração afetar o fluxo de dados entre Frontend e Backend, descreva o plano em 2 linhas antes de começar.

Inicar tarefa: assim que a tarefa for iniciada rodar subagentes em paralelo que farão todo tipo de análise e testes necessários durante o processo da implementação.

Mudanças Cirúrgicas: Modifique estritamente as linhas necessárias. Não reescreva arquivos inteiros do React ou rotas do Express se puder resolver o problema localmente. Preserve comentários e a formatação existente.

Validação em Tempo Real: Sempre que você implementar, alterar ou corrigir código (Frontend ou Backend), você deve obrigatoriamente rodar o comando /browser após a escrita para testar a aplicação no navegador e certificar-se de que não há quebras visuais ou erros de runtime usando os subagentes.

Trava Anti-Loop de Erros: Se você tentar corrigir um erro de build ou teste por 2 vezes seguidas e falhar, PARE. Não tente a terceira. Explique o comportamento ao usuário e peça ajuda.

Sincronização de Conhecimento (Final da Task): Evite atualizar arquivos de documentação a cada commit. Apenas ao concluir a tarefa principal, se tiver identificado uma nova restrição ou regra do ecossistema, consolide esse conhecimento de uma vez só atualizando o readme.md, gemini.md e claude.md.

 2. Ambiente e Comandos Locais
Sempre que terminar a tarefa e todas as validações passarem, execute o comando de build