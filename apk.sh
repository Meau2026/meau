#!/bin/bash

# Define o perfil padrão como 'preview' se nenhum argumento for passado.
# Exemplo de uso:
# ./apk.sh                  (usa o perfil 'preview')
# ./apk.sh preview          (usa o perfil 'preview')
# ./apk.sh development      (usa o perfil 'development')
PROFILE=${1:-preview}

# Valida se o perfil é um dos esperados
if [[ "$PROFILE" != "preview" && "$PROFILE" != "development" ]]; then
    echo "Erro: Perfil inválido. Use 'preview' ou 'development'."
    exit 1
fi

echo "Iniciando build para Android com o perfil: $PROFILE"
NODE_ENV=production JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 npx dotenv-cli -e .env -- eas build --platform android --profile "$PROFILE" --local
