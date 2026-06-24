# Meme Generator App — Backend API 🚀

Ce projet constitue le serveur backend pour l'application de génération de mèmes. Il gère le stockage cloud des médias (images et audio) via Supabase, et l'orchestration des services d'intelligence artificielle (OpenAI GPT-4o et Whisper-1).

## 🛠️ Technologies Utilisées
- **Node.js & Express.js** : Framework de base du serveur.
- **Supabase (PostgreSQL & Storage)** : Gestion de la base de données et stockage des fichiers binaires.
- **Multer** : Middleware pour la capture et la manipulation des fichiers (upload stream).
- **OpenAI API** : Analyse automatique de ton et transcription Audio Voice-to-Meme.

---

## 📋 Prérequis & Configuration de l'environnement

Créez un fichier `.env` à la racine du projet et configurez les variables suivantes :

```env
PORT=5000
SUPABASE_URL=[https://votre-projet.supabase.co](https://votre-projet.supabase.co)
SUPABASE_KEY=votre-cle-anon-publique
OPENAI_API_KEY=sk-proj-votre-cle-openai