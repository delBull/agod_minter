# Guía de Migración y Configuración del Proyecto Web3

## Estructura del Proyecto 

bash
├── src/
│ ├── contracts/
│ ├── components/
│ │ ├── ui/
│ │ └── web3/
│ ├── context/
│ ├── hooks/
│ ├── styles/
│ └── utils/
├── public/
└── scripts/

## Script de Instalación

bash:setup.sh
#!/bin/bash
Crear estructura de directorios
mkdir -p src/{contracts,components/{ui,web3},context,hooks,styles,utils} public scripts
Instalar dependencias principales
npm install @thirdweb-dev/react @thirdweb-dev/sdk ethers@^5
npm install tailwindcss postcss autoprefixer
npm install framer-motion @tabler/icons-react
npm install aceternity-ui # (reemplazar con los componentes específicos que uses)
Configurar Tailwind
npx tailwindcss init -p

## Dependencias Necesarias

json:package.json
{
"dependencies": {
"@thirdweb-dev/react": "^4.x.x",
"@thirdweb-dev/sdk": "^4.x.x",
"ethers": "^5.x.x",
"framer-motion": "^10.x.x",
"@tabler/icons-react": "^2.x.x",
"tailwindcss": "^3.x.x",
"postcss": "^8.x.x",
"autoprefixer": "^10.x.x"
}
}

## Variables de Entorno

plaintext:.env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id
NEXT_PUBLIC_CHAIN_ID=tu_chain_id
NEXT_PUBLIC_RPC_URL=tu_rpc_url
NEXT_PUBLIC_CONTRACT_ADDRESS=tu_contract_address

## Configuración de Tailwind

javascript:tailwind.config.js
/ @type {import('tailwindcss').Config} /
module.exports = {
content: [
"./src//.{js,ts,jsx,tsx}",
],
theme: {
extend: {
// Tus extensiones personalizadas
},
},
plugins: [],
}

## Archivos Base Necesarios

### Web3 Provider

typescript:src/context/Web3Provider.tsx
import { ThirdwebProvider } from "@thirdweb-dev/react";
export const Web3Provider = ({ children }) => {
return (
<ThirdwebProvider
clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
activeChain={process.env.NEXT_PUBLIC_CHAIN_ID}
>
{children}
</ThirdwebProvider>
);
};

### Hook de Conexión

typescript:src/hooks/useWeb3Connect.ts
import { useAddress, useConnect, useDisconnect } from "@thirdweb-dev/react";

export const useWeb3Connect = () => {
  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();

  return {
    address,
    connect,
    disconnect,
    isConnected: !!address
  };
};

## Pasos de Implementación

1. **Inicialización**
   ```bash
   # Clonar el repositorio nuevo
   git clone <nuevo-repo>
   cd <nuevo-repo>

   # Ejecutar script de instalación
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configuración de Variables de Entorno**
   - Copiar el archivo `.env.example` a `.env`
   - Rellenar las variables con los valores correspondientes

3. **Migración de Contratos**
   - Copiar los archivos de contratos a `src/contracts/`
   - Actualizar las direcciones si es necesario

4. **Implementación de Componentes**
   - Migrar componentes UI a `src/components/ui/`
   - Migrar componentes Web3 a `src/components/web3/`

5. **Configuración de Estilos**
   - Copiar configuraciones de Tailwind
   - Migrar estilos personalizados

## Verificación

Lista de verificación post-migración:

- [ ] Dependencias instaladas correctamente
- [ ] Variables de entorno configuradas
- [ ] Providers implementados
- [ ] Contratos migrados y verificados
- [ ] Componentes UI funcionando
- [ ] Conexión Web3 funcionando
- [ ] Estilos aplicados correctamente

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Construcción
npm run build

# Verificar contratos
npx hardhat verify --network <red> <dirección-contrato>
```

## Notas Adicionales

- Asegúrate de tener Node.js v16 o superior
- Verifica la compatibilidad de versiones entre dependencias
- Prueba la conexión con wallet antes de desplegar
- Verifica las interacciones con los smart contracts en testnet

```

También puedes crear un script de automatización para la migración:

```python:scripts/migrate.py
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
```

Para usar esta guía:

1. Guarda el contenido en un archivo `project-setup.md`
2. Guarda el script Python en `scripts/migrate.py`
3. En el nuevo proyecto, puedes:
   - Seguir la guía manualmente
   - Usar el script de Python para automatizar la creación de la estructura
   - Usar el script bash para la instalación de dependencias

¿Te gustaría que profundice en alguna parte específica o necesitas más detalles sobre algún aspecto en particular?

```

</rewritten_file>

