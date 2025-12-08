FROM node:18-alpine

WORKDIR /app

# 1. Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# 2. Installer TOUTES les dépendances (dev inclus pour TypeScript)
RUN npm ci

# 3. Copier le code source
COPY . .

# 4. Compiler TypeScript (nécessite typescript installé)
RUN npm run build

# 5. Optionnel: Réinstaller seulement production pour image plus petite
RUN npm ci --only=production

# 6. Exposer le port
EXPOSE 5000

# 7. Démarrer l'application
CMD ["npm", "start"]
