# 📑 Garden PDF

> **100% Client-Side, Private, Offline-First PDF Toolkit.**
> Mescle, extraia, gire e aplique marcas d'água em arquivos PDF diretamente no seu navegador ou via APK Android sem enviar nenhum dado para servidores na nuvem.

Parte da **Garden Suite** — ferramentas de código aberto de nível Senior/Staff, focadas em autonomia, performance e privacidade.

---

## ✨ Recursos

- 🔒 **100% Client-Side & Local-First**: O processamento é feito inteiramente na memória RAM da máquina através da biblioteca `pdf-lib`. Seus documentos confidenciais nunca tocam a internet.
- 🧩 **Mesclagem (Merge)**: Una dezenas de arquivos PDF em um único documento contínuo com ordenação flexível.
- ✂️ **Extração de Páginas (Split / Extract)**: Selecione páginas ou intervalos (ex: `1, 3-5, 8`) para gerar um novo PDF isolado.
- 🔄 **Rotação de Páginas**: Corrija a orientação de documentos escaneados girando 90°, 180° ou 270°.
- 💧 **Marca d'Água (Watermark)**: Aplique carimbos de "CONFIDENCIAL", "RASCUNHO", "CÓPIA" ou texto personalizado com opacidade e rotação automáticas.
- 📱 **PWA & APK Android Nativo**: Empacotado via Capacitor (`@capacitor/android`) para rodar em celulares e tablets offline.
- ⚡ **Zero Bloatware & Sem Limites**: Sem limites de tamanho arbitrário, sem paywall, sem fila de espera.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS v4 + Lucide Icons
- **PDF Core**: `pdf-lib` (WebAssembly & Pure JS PDF manipulation)
- **Mobile Engine**: Capacitor 8 (Android)
- **Testes & CI**: Vitest + GitHub Actions

---

## 🚀 Como Executar

### 1. Requisitos
- Node.js 20+
- npm 10+

### 2. Instalação e Desenvolvimento Web
```bash
git clone https://github.com/FelipeGardenghiDev/garden-pdf.git
cd garden-pdf
npm install
npm run dev
```

### 3. Testes Unitários
```bash
npm test
```

### 4. Build para Produção
```bash
npm run build
```

### 5. Executar no Android (APK / Emulador)
```bash
npm run mobile:sync
npm run mobile:open # Abre o projeto no Android Studio
```

---

## 📜 Licença

MIT License © 2026 Felipe Gardenghi. Feito com foco em privacidade absoluta e liberdade de ferramentas.
