# 📦 Padrão de Mockups de Produtos — Quadricolor
**Status:** v1.0 (Sistema de Padronização)  
**Ferramenta:** Nano Banana (Gerador de Imagens IA)  
**Data:** 2026-05-13  
**Objetivo:** Consistência visual + escalabilidade para futuras criações

---

## 🎯 Especificações Técnicas

### Dimensões & Formato
| Propriedade | Valor |
|-------------|-------|
| **Resolução** | 1200 x 1200 px (quadrado) |
| **Ratio** | 1:1 (ideal para web e redes sociais) |
| **Formato** | PNG com fundo transparente (para site) ou JPG (para social) |
| **DPI** | 72 DPI (web) / 300 DPI (print, se necessário) |
| **Tamanho arquivo** | < 500 KB PNG / < 200 KB JPG |

### Paleta Visual & Iluminação
| Elemento | Especificação |
|----------|--------------|
| **Fundo** | Branco puro (#FFFFFF) — sem gradiente |
| **Iluminação** | 3D marcada com sombra realista |
| **Luz primária** | 45° de cima à direita (luz natural) |
| **Luz secundária** | Sutil luz de preenchimento na esquerda (0.3 intensidade) |
| **Sombra** | Sombra realista embaixo (profundidade ~30px) |
| **Efeito de reflexo** | Sutil reflexo no fundo (opcional, se produto reflete luz) |

---

## 📝 Template de Prompt para Nano Banana

### Estrutura Base
```
[TIPO_PRODUTO] em fundo branco puro, vista frontal/angular [ANGULO], 
iluminação 3D profissional marcada com sombra realista embaixo, 
estilo fotográfico corporativo, sem texto, 
render de alta qualidade 8k, lighting dramático e limpo.
```

### Prompts por Produto

#### 1. **Cartão de Visita Premium**
```
A stack of premium business cards (cartões de visita) fanned out slightly, 
white background, professional studio lighting from top-right at 45 degrees, 
realistic shadow underneath, sharp focus on card details and texture, 
corporate photography style, 8k quality, dramatic lighting that emphasizes paper texture and finish.
Details: Card should show embossing, subtle color variations (Quadricolor CMYK reference), 
and premium finish (matte or glossy).
```

#### 2. **Camiseta Personalizada**
```
A folded premium t-shirt displayed flat-lay, white background, 
studio lighting from 45 degrees top-right, realistic shadow underneath,
featuring vibrant custom print on chest area (abstract colorful design), 
fabric texture clearly visible, 8k product photography, dramatic professional lighting.
Color: Base color is deep navy or black (mostra bem o print), print is colorful.
```

#### 3. **Abadá Junino**
```
A vibrant junino festa abadá (sleeveless shirt) hanging or displayed on mannequin torso, 
white background, professional 3D studio lighting from top-right 45 degrees, 
realistic shadow underneath, colorful festive patterns visible (red, yellow, green, blue), 
fabric drape and folds emphasized, 8k quality, corporate product photography style.
Details: Traditional junino patterns, bright colors, fabric movement visible.
```

#### 4. **Banner Lona 440g**
```
A rolled banner (lona) displayed standing, white background, 
studio lighting 45 degrees from top-right, realistic shadow underneath,
colorful graphic design visible on surface (geometric or photo pattern), 
material texture (lona) clearly visible, 8k product render, 
professional photography with dramatic lighting that shows material quality.
Texture: Heavy fabric appearance, slight wrinkles/natural movement.
```

#### 5. **Brinde Personalizado**
```
A collection of branded merchandise items (3-4 items: pen, mug, keychain, sticker pack),
arranged artfully on white background, studio lighting from top-right 45 degrees,
realistic shadows underneath each item, vibrant custom branding/logos visible,
8k quality product photography, professional lighting that emphasizes brand consistency.
Style: Overhead 3/4 angle view, items slightly overlapping, corporate presentation.
```

#### 6. **Adesivo Vinil**
```
Stacked vinyl stickers fanned out, white background, 
studio lighting from top-right 45 degrees, realistic shadow underneath,
colorful designs visible on sticker faces (geometric, floral, or illustrated),
glossy finish emphasized by light reflection, 8k product render,
professional photography lighting, sharp focus on color and finish details.
Details: Show sticker thickness, glossy reflection, color vibrancy, multiple designs.
```

#### 7. **Comunicação Visual / Sinalização**
```
A modern signage piece (wayfinding or brand sign) displayed on wall or easel,
white background, professional 3D studio lighting from top-right 45 degrees,
realistic shadow underneath, brand identity clearly visible (colors, typography, logo),
material texture emphasized (metal, acrylic, or composite), 8k quality render,
dramatic corporate photography lighting that shows depth and dimension.
Details: Professional signage appearance, business context, clear branding.
```

---

## 🎨 Guia de Cores & Branding

### Cores Quadricolor CMYK (use em design do produto)
- **Cyan:** #03A1E1
- **Magenta:** #FF0F8C  
- **Yellow:** #F4D500
- **Black:** #000000

### Cores Complementares (para padrões/designs)
- **Gradiente primário:** #F39C2A (laranja) → #E15D69 (coral) → #E83B8E (pink)
- **Destaques:** Use pelo menos uma cor CMYK no design do produto

### Tipografia (se visível)
- **Headlines:** Montserrat Bold/ExtraBold
- **Body:** Poppins Regular/SemiBold
- **Monoespaço:** JetBrains Mono (se código/técnico)

---

## 🔄 Workflow de Geração

### Passo 1: Preparação
```
1. Defina qual produto está gerando mockup
2. Escolha o prompt correspondente (de cima)
3. Adapte o prompt com:
   - Cores específicas do cliente (se custom)
   - Ângulo preferido (frontal, 3/4, overhead, flat-lay)
   - Detalhes extras (logo cliente, padrão específico)
```

### Passo 2: Nano Banana Settings
```
Model: [Melhor modelo disponível para qualidade fotográfica]
Quality: Ultra (8k)
Style: Product Photography / Corporate
Aspect Ratio: 1:1 (1200x1200)
Lighting: Studio Professional
Iterations: 3-4 (escolher melhor resultado)
```

### Passo 3: Refinamento Local
```
1. Baixe o resultado PNG
2. No Photoshop/Figma/Canva:
   - Ajuste fundo para branco puro (#FFFFFF) se necessário
   - Aumente contraste da sombra (realce realismo)
   - Normalize cores para paleta Quadricolor
   - Remova artefatos/glitches da IA
   - Exporte em PNG (transparente) e JPG (fundo branco sólido)
```

### Passo 4: Validação & Arquivo
```
Checklist antes de usar:
  ☑ Fundo branco ou transparente
  ☑ Sombra realista embaixo
  ☑ Iluminação 3D marcada (visible depth)
  ☑ Cores fiéis à Quadricolor CMYK
  ☑ Resolução 1200x1200 px
  ☑ Arquivo < 500 KB PNG ou < 200 KB JPG
  ☑ Sem texto/branding (puro produto)

Nomeação:
  product-[CATEGORIA]-[VARIANTE]-[DATA].png
  
  Exemplos:
  - product-cartao-premium-branco-2026-05.png
  - product-camisa-personalizada-navy-2026-05.png
  - product-adesivo-vinil-colorido-2026-05.png
```

---

## 📦 Armazenamento & Organização

### Estrutura de Pastas
```
quadricolor._/site/public/
├── products/
│   ├── cartao-de-visita/
│   │   ├── premium-branco.png
│   │   ├── premium-branco.jpg
│   │   └── standard-colorido.png
│   ├── camisa-personalizada/
│   │   ├── navy-print-front.png
│   │   ├── navy-print-back.png
│   │   └── white-custom.png
│   ├── adesivo-vinil/
│   │   ├── colorido-01.png
│   │   ├── colorido-02.png
│   │   └── monocromatico.png
│   ├── banner-lona/
│   ├── abadaq-junino/
│   ├── brinde-personalizado/
│   └── comunicacao-visual/
└── mockups/ (backup/originals)
    ├── cartao-de-visita/
    ├── ... (espelha products/)
```

---

## 🎬 Exemplos de Resultados Esperados

### Cartão de Visita
- Stack de 3-5 cartões com slight fan/spread
- Detalhes de relevo e textura visíveis
- Sombra dramática embaixo
- Fundo branco puro, sem distrações

### Camiseta
- Produto em 3/4 view ou flat-lay
- Detalhe do print bem iluminado
- Folds e drape naturais
- Textura do tecido realista

### Adesivo
- Fan/spread mostrando thickness
- Glossy finish com reflection
- Designs coloridos vibrantes
- Shadow realista embaixo

---

## 🔧 Ajustes Pós-Geração (Nano Banana → Photoshop)

### Sombra (se não estiver perfeita)
```
1. Crie nova camada embaixo do produto
2. Adicione sombra Gaussian Blur (10-15px)
3. Opacity: 30-40%
4. Cor: Preto (#000000) ou cinza (se produto é claro)
```

### Fundo (se não for branco puro)
```
1. Levels/Curves: ajuste branco para #FFFFFF
2. Ou: Magic Wand → Select similar colors → Delete
3. Preencha com #FFFFFF se necessário
```

### Cores (se estiverem dessaturadas)
```
1. Hue/Saturation: +10 a +20 (depende do produto)
2. Vibrancy: +5 a +15 (realça cores quentes)
3. Color Balance: Ajuste para paleta Quadricolor se necessário
```

### Transparência (para PNG)
```
1. Selecione fundo branco (Select by Color)
2. Layer Mask → Add Layer Mask
3. Delete white background
4. Export PNG-32 (preserva alpha channel)
```

---

## 📊 Checklist de Qualidade

Antes de publicar no site/social, valide:

```
VISUAL QUALITY
☑ Produto em foco nítido (sharp)
☑ Sombra realista e dimensionada (~30px)
☑ Iluminação marcada (3D evidente)
☑ Sem glitches/artefatos da IA
☑ Cores vibrantes mas naturais

ESPECIFICAÇÕES
☑ Resolução exata: 1200x1200 px
☑ Fundo: Branco puro (#FFFFFF) ou transparente
☑ Formato: PNG (web) ou JPG (social)
☑ Tamanho arquivo: < 500 KB PNG, < 200 KB JPG
☑ Nome padrão seguido

CONSISTÊNCIA BRANDING
☑ Cores Quadricolor CMYK presentes (se aplicável)
☑ Estilo: Corporativo e profissional
☑ Luz: Consistente com outros produtos (45° top-right)
☑ Nenhum texto/logo (puro produto)

PRONTO PARA PUBLICAR
☑ Salvo em local correto (public/products/)
☑ Versão PNG e JPG disponíveis
☑ Thumbnails 400x400 gerados (para preview)
☑ Aprovado por QA visual
```

---

## 🚀 Próximas Etapas

1. **Gerar mockups iniciais** dos 7 produtos usando Nano Banana + prompts acima
2. **Refinamento local** (Photoshop) para padronização
3. **Integrar ao site** (adicionar imagens aos cards de produtos)
4. **Documentar variantes** (se houver cores/estilos diferentes)
5. **Treinar processo** para criar novas variantes mantendo padrão

---

**Documento de Referência para:** Quadricolor._  
**Mantido por:** Design System  
**Versão:** 1.0 | **Próxima revisão:** quando houver novos produtos  
