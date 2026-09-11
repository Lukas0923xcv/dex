#!/usr/bin/env bash
# ==============================================================================
# Pokémon GO Dex Tracker - One-Command Installer for Ubuntu Server 26 / Linux
# Repository: https://github.com/Lukas0923xcv/dex.git
# ==============================================================================

set -e

COLOR_BLUE='\033[0;34m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}"
cat << "EOF"
  ____       _       ____             _____               _             
 |  _ \ ___ | | _____|  _ \  _____  |_   _| __ __ _  ___| | _____ _ __ 
 | |_) / _ \| |/ / _ \ | | |/ _ \ \/ / | || '__/ _` |/ __| |/ / _ \ '__|
 |  __/ (_) |   <  __/ |_| |  __/>  <  | || | | (_| | (__|   <  __/ |   
 |_|   \___/|_|\_\___|____/ \___/_/\_\ |_||_|  \__,_|\___|_|\_\___|_|   
EOF
echo -e "${COLOR_RESET}"
echo -e "${COLOR_GREEN}Starting Pokémon GO Dex Tracker Installation on Linux / Ubuntu 26...${COLOR_RESET}\n"

# 1. Verify sudo / root access
if [ "$EUID" -ne 0 ]; then
  SUDO="sudo"
  echo -e "${COLOR_YELLOW}[i] Running with sudo privileges...${COLOR_RESET}"
else
  SUDO=""
fi

# 2. Update package lists and check dependencies
echo -e "${COLOR_BLUE}[1/5] Checking system dependencies (git, curl)...${COLOR_RESET}"
$SUDO apt-get update -qq
$SUDO apt-get install -y -qq git curl ca-certificates gnupg >/dev/null

# 3. Check / Install Docker and Docker Compose
echo -e "${COLOR_BLUE}[2/5] Checking Docker & Docker Compose...${COLOR_RESET}"
if ! command -v docker &> /dev/null; then
  echo -e "${COLOR_YELLOW}[i] Docker is not installed. Installing Docker Engine...${COLOR_RESET}"
  
  # Try Ubuntu's native repository first (fastest and most compatible for Ubuntu 24/26)
  if $SUDO apt-get install -y docker.io docker-compose-v2 >/dev/null 2>&1 || \
     $SUDO apt-get install -y docker.io docker-compose >/dev/null 2>&1; then
    echo -e "${COLOR_GREEN}[✓] Docker installed from native repository!${COLOR_RESET}"
  else
    # Fallback to official docker.com repository
    $SUDO install -m 0755 -d /etc/apt/keyrings
    $SUDO curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    $SUDO chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null

    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
    echo -e "${COLOR_GREEN}[✓] Docker installed successfully!${COLOR_RESET}"
  fi
  $SUDO systemctl enable --now docker
else
  echo -e "${COLOR_GREEN}[✓] Docker is already installed: $(docker --version)${COLOR_RESET}"
fi

# Determine compose command
if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  $SUDO apt-get install -y docker-compose-v2 >/dev/null 2>&1 || true
  COMPOSE_CMD="docker compose"
fi

# 4. Clone or update repository
APP_DIR="/opt/pogo-dex"
REPO_URL="https://github.com/Lukas0923xcv/dex.git"

echo -e "${COLOR_BLUE}[3/5] Setting up application repository at ${APP_DIR}...${COLOR_RESET}"
if [ -d "$APP_DIR/.git" ]; then
  echo -e "${COLOR_YELLOW}[i] Updating existing installation...${COLOR_RESET}"
  cd "$APP_DIR"
  $SUDO git fetch origin main
  $SUDO git reset --hard origin/main
else
  if [ -d ".git" ] && [ -f "docker-compose.yml" ]; then
    APP_DIR="$(pwd)"
    echo -e "${COLOR_YELLOW}[i] Using current directory: ${APP_DIR}${COLOR_RESET}"
  else
    $SUDO mkdir -p "$APP_DIR"
    $SUDO git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
  fi
fi

# 5. Create persistent SQLite data directory
echo -e "${COLOR_BLUE}[4/5] Preparing persistent data directory with SQLite WAL mode...${COLOR_RESET}"
$SUDO mkdir -p "$APP_DIR/data"
$SUDO chmod -R 777 "$APP_DIR/data"

# 6. Build and launch Docker Compose stack
echo -e "${COLOR_BLUE}[5/5] Building and launching Pokémon GO Dex Tracker container...${COLOR_RESET}"
cd "$APP_DIR"
$SUDO $COMPOSE_CMD up -d --build

# 7. Success Banner
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "\n${COLOR_GREEN}========================================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}  🎉 Pokémon GO Dex Tracker is now running!${COLOR_RESET}"
echo -e "${COLOR_GREEN}========================================================================${COLOR_RESET}"
echo -e "  🌐 Web Access:         ${COLOR_YELLOW}http://${HOST_IP}:3000${COLOR_RESET} (or http://localhost:3000)"
echo -e "  📁 Persistent Data:    ${COLOR_YELLOW}${APP_DIR}/data/dex.db${COLOR_RESET}"
echo -e "  📊 View Logs:          ${COLOR_BLUE}cd ${APP_DIR} && docker compose logs -f${COLOR_RESET}"
echo -e "  🛑 Stop Service:       ${COLOR_BLUE}cd ${APP_DIR} && docker compose down${COLOR_RESET}"
echo -e "  🚀 Restart Service:    ${COLOR_BLUE}cd ${APP_DIR} && docker compose restart${COLOR_RESET}"
echo -e "${COLOR_GREEN}========================================================================${COLOR_RESET}\n"
