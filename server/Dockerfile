FROM node:22-slim

# Install Python, pip, required system libraries, and LibreOffice for high-quality docx-to-pdf conversion
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Python requirements and install using a virtual environment
COPY requirements.txt ./
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Start the application
CMD ["npm", "start"]
