import os
import shutil
import json

def create_directory_structure():
    directories = [
        'src/contracts',
        'src/components/ui',
        'src/components/web3',
        'src/context',
        'src/hooks',
        'src/styles',
        'src/utils',
        'public',
        'scripts'
    ]
    
    for dir in directories:
        os.makedirs(dir, exist_ok=True)

def copy_configuration_files():
    # Copiar archivos de configuración
    files_to_copy = {
        '.env.example': '.env',
        'tailwind.config.js': 'tailwind.config.js',
        # Añadir más archivos según necesidad
    }
    
    for source, dest in files_to_copy.items():
        if os.path.exists(source):
            shutil.copy2(source, dest)

def main():
    create_directory_structure()
    copy_configuration_files()
    print("✅ Estructura del proyecto creada exitosamente")

if __name__ == "__main__":
    main() 
    