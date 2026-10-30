# Fragoso Souza Advocacia — site

Proposta de site institucional para a Fragoso Souza Advocacia (Brasília/DF), feita pela Concept Agência.

Site estático (HTML, CSS e JavaScript, sem build). Para ver localmente:

```bash
npx http-server . -p 5178 -c-1
```

## Contato

Todo contato passa pelo formulário qualificador em `assets/js/main.js`. Ao final, ele abre o WhatsApp com as respostas preenchidas.

## Antes de publicar

- `FSA_WHATSAPP` em `assets/js/main.js`: número real do escritório.
- `FSA_LEAD_ENDPOINT` (opcional): endereço para receber as solicitações.
- Seção "O advogado": formação e especialização.
- Rodapé: endereço do escritório.
- `privacidade.html`: e-mail de contato.
- Foto do advogado em alta resolução (`assets/img/fellipe.jpg`).
- Confirmar as áreas de atuação.
