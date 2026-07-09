import { describe, it, expect } from 'vitest';
import { normalizeSlug } from '../web/src/lib/slug';
import { titleFrom } from '../web/src/lib/chatStore';
import { attachmentsBlock } from '../server/ai/routes';
import { parseRetrySeconds, isQuotaError } from '../server/ai/provider';

describe('normalizeSlug (rotas)', () => {
  it('remove acentos e caixa', () => {
    expect(normalizeSlug('Tripulação')).toBe('tripulacao');
    expect(normalizeSlug('TRIPULACAO')).toBe('tripulacao');
  });
  it('ignora hífen, underscore e espaço', () => {
    expect(normalizeSlug('Motor-ADE')).toBe('motorade');
    expect(normalizeSlug('motor ade')).toBe('motorade');
    expect(normalizeSlug('motor_ade')).toBe('motorade');
  });
  it('slug simples passa intacto', () => {
    expect(normalizeSlug('comandos')).toBe('comandos');
  });
});

describe('titleFrom (chat store)', () => {
  it('usa a primeira mensagem do usuário', () => {
    expect(titleFrom([
      { role: 'assistant', content: 'oi' },
      { role: 'user', content: 'como funciona o AIOS?' },
    ])).toBe('como funciona o AIOS?');
  });
  it('trunca em 44 chars com reticências', () => {
    const long = 'a'.repeat(60);
    const t = titleFrom([{ role: 'user', content: long }]);
    expect(t).toBe('a'.repeat(44) + '…');
  });
  it('fallback quando não há mensagem do usuário', () => {
    expect(titleFrom([])).toBe('nova conversa');
  });
});

describe('attachmentsBlock (contexto de anexos)', () => {
  it('vazio → string vazia', () => {
    expect(attachmentsBlock([])).toBe('');
  });
  it('formata com marcador [ANEXO: nome]', () => {
    const out = attachmentsBlock([{ name: 'a.md', size: 10, text: 'conteudo' }]);
    expect(out).toContain('[ANEXO: a.md]');
    expect(out).toContain('conteudo');
    expect(out.startsWith('\n\n')).toBe(true);
  });
  it('respeita o teto total de 50k chars', () => {
    const big = 'x'.repeat(60_000);
    const out = attachmentsBlock([
      { name: 'um.txt', size: 1, text: big },
      { name: 'dois.txt', size: 1, text: big },
    ]);
    // só o primeiro entra (já consome o orçamento inteiro)
    expect(out).toContain('[ANEXO: um.txt]');
    expect(out).not.toContain('[ANEXO: dois.txt]');
    expect(out.length).toBeLessThan(50_100);
  });
});

describe('provider — classificação de erros de quota', () => {
  it('parseRetrySeconds lê "try again in Xs"', () => {
    expect(parseRetrySeconds('rate limit, please try again in 12.5s')).toBe(13);
    expect(parseRetrySeconds('try again in 2m30.1s')).toBe(151);
    expect(parseRetrySeconds('mensagem sem tempo')).toBeNull();
  });
  it('isQuotaError reconhece 429/413/rate_limit/créditos', () => {
    expect(isQuotaError('Groq 429: rate_limit_exceeded')).toBe(true);
    expect(isQuotaError('Anthropic 400: credit balance is too low')).toBe(true);
    expect(isQuotaError('tokens per minute exceeded')).toBe(true);
    expect(isQuotaError('Anthropic 401: invalid api key')).toBe(false);
  });
});
