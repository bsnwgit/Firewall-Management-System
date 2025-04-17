import os
import subprocess
import sys
import socket
from pathlib import Path

def get_network_info():
    """Get network information about the server."""
    hostname = socket.gethostname()
    ip_addresses = []
    
    # Get all network interfaces
    for interface in socket.if_nameindex():
        try:
            ip = socket.if_indextoname(interface[0])
            ip_addresses.append(ip)
        except:
            continue
    
    # Get host IP
    try:
        host_ip = socket.gethostbyname(hostname)
        ip_addresses.append(host_ip)
    except:
        pass
    
    return {
        'hostname': hostname,
        'ip_addresses': list(set(ip_addresses))  # Remove duplicates
    }

def run_command(command, cwd=None):
    """Run a shell command and return its output."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            check=True,
            text=True,
            capture_output=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error output: {e.stderr}")
        sys.exit(1)

def create_directory_structure():
    """Create the necessary directory structure."""
    directories = [
        "frontend",
        "frontend/src",
        "frontend/src/components",
        "frontend/src/pages",
        "frontend/src/services",
        "frontend/public",
        "models",
        "schemas",
        "routes",
        "services",
        "auth",
        "data"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def create_requirements_txt():
    """Create requirements.txt with all necessary dependencies."""
    requirements = [
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "requests==2.31.0",
        "python-dotenv==1.0.0",
        "pydantic==2.4.2",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.6",
        "email-validator==2.1.0",
        "sqlalchemy==2.0.23",
        "aiosqlite==0.19.0",
        "websockets==11.0.3"
    ]
    
    with open("requirements.txt", "w") as f:
        f.write("\n".join(requirements))
    print("Created requirements.txt")

def create_frontend_package_json():
    """Create package.json for the frontend."""
    package_json = {
        "name": "firewall-management-system",
        "version": "1.0.0",
        "private": True,
        "dependencies": {
            "@emotion/react": "^11.11.1",
            "@emotion/styled": "^11.11.0",
            "@mui/material": "^5.14.20",
            "@mui/icons-material": "^5.14.20",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-grid-layout": "^1.4.4",
            "react-scripts": "5.0.1",
            "axios": "^1.6.2",
            "recharts": "^2.10.3",
            "react-router-dom": "^6.20.1",
            "socket.io-client": "^4.7.2"
        },
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
        },
        "eslintConfig": {
            "extends": [
                "react-app",
                "react-app/jest"
            ]
        },
        "browserslist": {
            "production": [
                ">0.2%",
                "not dead",
                "not op_mini all"
            ],
            "development": [
                "last 1 chrome version",
                "last 1 firefox version",
                "last 1 safari version"
            ]
        }
    }
    
    with open("frontend/package.json", "w") as f:
        import json
        json.dump(package_json, f, indent=2)
    print("Created frontend/package.json")

def create_env_file():
    """Create .env file with default configuration."""
    network_info = get_network_info()
    
    env_content = f"""# Database Configuration
DATABASE_URL=sqlite:///data/firewall_manager.db

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Network Configuration
HOSTNAME={network_info['hostname']}
IP_ADDRESSES={','.join(network_info['ip_addresses'])}
ALLOWED_HOSTS=*

# Frontend Configuration
FRONTEND_URL=http://{network_info['ip_addresses'][0]}:3000
"""
    with open(".env", "w") as f:
        f.write(env_content)
    print("Created .env file")

def create_gitignore():
    """Create .gitignore file."""
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.venv
env/
venv/
ENV/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Database
*.db
*.sqlite3

# Logs
*.log
"""
    with open(".gitignore", "w") as f:
        f.write(gitignore_content)
    print("Created .gitignore file")

def main():
    print("Starting setup...")
    
    # Get network information
    network_info = get_network_info()
    print("\nNetwork Information:")
    print(f"Hostname: {network_info['hostname']}")
    print("Available IP addresses:")
    for ip in network_info['ip_addresses']:
        print(f"  - {ip}")
    
    # Create directory structure
    create_directory_structure()
    
    # Create requirements.txt
    create_requirements_txt()
    
    # Create frontend package.json
    create_frontend_package_json()
    
    # Create .env file
    create_env_file()
    
    # Create .gitignore
    create_gitignore()
    
    # Install Python dependencies
    print("\nInstalling Python dependencies...")
    run_command("pip install -r requirements.txt")
    
    # Install Node.js dependencies
    print("\nInstalling Node.js dependencies...")
    run_command("npm install", cwd="frontend")
    
    # Initialize database
    print("\nInitializing database...")
    run_command("python -c 'from models import init_db; init_db()'")
    
    print("\nSetup completed successfully!")
    print("\nTo start the backend server, run:")
    print("uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    print("\nTo start the frontend development server, run:")
    print("cd frontend && npm start")
    print("\nThe application will be available at:")
    for ip in network_info['ip_addresses']:
        print(f"  - Backend API: http://{ip}:8000")
        print(f"  - Frontend: http://{ip}:3000")

if __name__ == "__main__":
    main() 