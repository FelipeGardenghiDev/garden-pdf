# 📑 Garden PDF

> **100% Client-Side, Private, Offline-First PDF Toolkit.**
> Mescle, extraia, gire, aplique marcas d'água, comprima e reordene páginas de arquivos PDF diretamente no seu navegador ou via APK Android sem enviar nenhum dado para servidores na nuvem.

Parte da **Garden Suite** — ferramentas de código aberto de nível Senior/Staff, focadas em autonomia, performance e privacidade.

[![Part of Garden Suite](https://img.shields.io/badge/Part%20of-Garden%20Apps-10B981?style=flat-square)](https://github.com/FelipeGardenghiDev/garden-cut)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Capacitor Android](https://img.shields.io/badge/Capacitor-Android%20APK-3880FF?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Offline--First-blueviolet?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

---

## ✨ Recursos

- 🔒 **100% Client-Side & Local-First**: O processamento é feito inteiramente na memória RAM da máquina através da biblioteca `pdf-lib`. Seus documentos confidenciais nunca tocam a internet.
- 🧩 **Mesclagem (Merge)**: Una dezenas de arquivos PDF em um único documento contínuo com ordenação flexível.
- ✂️ **Extração de Páginas (Split / Extract)**: Selecione páginas ou intervalos (ex: `1, 3, 5`) para gerar um novo PDF isolado.
- 🔄 **Rotação de Páginas**: Corrija a orientação de documentos escaneados girando 90°, 180° ou 270°.
- 💧 **Marca d'Água (Watermark)**: Aplique carimbos de "CONFIDENCIAL", "RASCUNHO", "CÓPIA" ou texto personalizado com opacidade e rotação automáticas.
- ⚡ **Otimizador de Compressão**: Compactação estrutural de Object Streams e remoção de redundâncias de metadados com relatório de economia percentual.
- 🔀 **Reordenação de Páginas**: Mude a sequência das páginas do documento com navegação visual.
- 📱 **PWA & APK Android Nativo**: Empacotado via Capacitor (`@capacitor/android`) para rodar em celulares e tablets offline.
- ⚡ **Zero Bloatware & Sem Limites**: Sem limites de tamanho arbitrário, sem paywall, sem fila de espera.

---

## 🚀 Deploy Web & Aplicativo Android (APK)

* **Web App (GitHub Pages):** [felipegardenghidev.github.io/garden-pdf](https://felipegardenghidev.github.io/garden-pdf/)
* **Download do APK Android:** A cada commit na branch principal, o GitHub Actions compila automaticamente o APK nativo através do pipeline Capacitor + Gradle e disponibiliza o artefato `garden-pdf-debug-apk` para download direto na aba **Actions** do repositório, dispensando o Android Studio na máquina local.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS v4 + Lucide Icons
- **PDF Core**: `pdf-lib` (Manipulação em memória e streaming de objetos)
- **Mobile Engine**: Capacitor 8 (Android)
- **Testes & CI**: Vitest + GitHub Actions

---

## 📄 Licença
Distribuído sob a licença MIT. Criado por Felipe Gardenghi.
