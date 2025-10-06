# 🛠️ Comandos Útiles y Scripts

Referencia rápida de comandos para trabajar con el proyecto refactorizado.

## 🔍 Búsqueda y Análisis

### Buscar usos de servicios antiguos

```powershell
# Buscar imports del servicio tasks deprecated
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "from '\`$lib/services/tasks'" | Select-Object Path, LineNumber, Line

# Buscar uso de funciones deprecated
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "getTaskDetail|updateTask\(|completeTask\(" | Select-Object Path, LineNumber, Line

# Buscar imports de tipos incorrectos (sin 'type')
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "import \{ Task[,\}]" | Select-Object Path, LineNumber, Line
```

### Buscar todos los servicios

```powershell
# Listar todos los archivos de servicios
Get-ChildItem -Path "src\lib\services" -File

# Listar todos los archivos de tipos
Get-ChildItem -Path "src\lib\types" -File

# Ver estructura completa
tree src\lib /F
```

### Analizar imports

```powershell
# Ver qué archivos importan de types
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "from '\`$lib/types"

# Ver qué archivos importan servicios específicos
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "from '\`$lib/services/tasks_mind"
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "from '\`$lib/services/tasks_body"
```

## 🧪 Verificación de Código

### TypeScript

```powershell
# Verificar tipos (sin compilar)
npm run check

# Verificar tipos en modo watch
npm run check:watch

# Ver errores detallados
npx svelte-check --output human-verbose
```

### Build y Bundle

```powershell
# Build de producción
npm run build

# Preview de producción
npm run preview

# Analizar bundle size
npm run build -- --mode production
```

### Desarrollo

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Con puerto específico
npm run dev -- --port 3000

# Con host específico
npm run dev -- --host 0.0.0.0
```

## 📝 Modificación de Archivos

### Reemplazar imports en masa (⚠️ CUIDADO)

```powershell
# IMPORTANTE: Haz un commit antes de ejecutar estos comandos

# Reemplazar imports de Task type
Get-ChildItem -Path "src" -Recurse -Include "*.svelte","*.ts" | ForEach-Object {
    (Get-Content $_.FullName) -replace "from '\`$lib/services/tasks'", "from '\$lib/types'" | Set-Content $_.FullName
}
```

### Crear backup antes de cambios masivos

```powershell
# Crear backup del directorio
Copy-Item -Path "src" -Destination "src_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')" -Recurse

# Restaurar desde backup (si algo sale mal)
# Remove-Item -Path "src" -Recurse -Force
# Rename-Item -Path "src_backup_YYYYMMDD_HHMMSS" -NewName "src"
```

## 🔧 Git Helpers

### Ver archivos modificados

```powershell
# Ver estado
git status

# Ver cambios en servicios
git diff src/lib/services/

# Ver cambios en tipos
git diff src/lib/types/

# Ver cambios en documentación
git diff Documentacion/
```

### Commits organizados

```powershell
# Commit de tipos
git add src/lib/types/
git commit -m "feat: add centralized type definitions"

# Commit de servicios
git add src/lib/services/tasks_*.ts src/lib/services/tasks_common.ts
git commit -m "refactor: split tasks service into mind and body"

# Commit de actualización de servicios
git add src/lib/services/goals.ts src/lib/services/failures.ts src/lib/services/profile.ts src/lib/services/chat.ts
git commit -m "refactor: update services to use centralized types"

# Commit de documentación
git add Documentacion/
git commit -m "docs: add comprehensive refactoring documentation"
```

## 📊 Análisis de Código

### Contar líneas

```powershell
# Contar líneas en tipos
(Get-Content src\lib\types\*.ts | Measure-Object -Line).Lines

# Contar líneas en servicios
(Get-Content src\lib\services\*.ts | Measure-Object -Line).Lines

# Contar líneas en documentación
(Get-Content Documentacion\*.md | Measure-Object -Line).Lines
```

### Encontrar TODOs

```powershell
# Buscar TODOs en el código
Select-String -Path "src\**\*.svelte", "src\**\*.ts" -Pattern "TODO|FIXME|XXX" | Select-Object Path, LineNumber, Line

# Buscar deprecations
Select-String -Path "src\**\*.ts" -Pattern "@deprecated" | Select-Object Path, LineNumber, Line
```

## 🧹 Limpieza

### Limpiar archivos temporales

```powershell
# Limpiar node_modules y reinstalar
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# Limpiar build
Remove-Item -Path ".svelte-kit" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build" -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar y rebuild
npm run clean # (si existe el script)
npm run build
```

### Verificar imports no usados

```powershell
# Esto requiere una extensión o tool adicional
# Opción 1: Usar VS Code
# - Instalar extensión "TypeScript Import Sorter"
# - Ejecutar comando de organizar imports

# Opción 2: Usar eslint (si está configurado)
npx eslint src/ --fix
```

## 📚 Generar Documentación

### Listar todas las funciones exportadas

```powershell
# Servicios mind
Select-String -Path "src\lib\services\tasks_mind.ts" -Pattern "^export (async )?function"

# Servicios body
Select-String -Path "src\lib\services\tasks_body.ts" -Pattern "^export (async )?function"

# Todas las interfaces
Select-String -Path "src\lib\types\*.ts" -Pattern "^export interface"
```

### Generar índice de tipos

```powershell
# Listar todos los tipos exportados
Get-Content src\lib\types\*.ts | Select-String "^export (interface|type)" | ForEach-Object { $_.Line }
```

## 🎨 Formateo

### Prettier (si está configurado)

```powershell
# Formatear todo
npx prettier --write "src/**/*.{ts,svelte}"

# Solo verificar
npx prettier --check "src/**/*.{ts,svelte}"

# Formatear archivos específicos
npx prettier --write "src/lib/types/*.ts"
npx prettier --write "src/lib/services/*.ts"
```

## 🔍 Debugging

### Ver estructura de imports

```powershell
# Ver qué importa cada archivo
Get-ChildItem -Path "src\routes" -Recurse -Include "*.svelte" | ForEach-Object {
    Write-Host "`n=== $($_.Name) ===" -ForegroundColor Green
    Select-String -Path $_.FullName -Pattern "^import" | ForEach-Object { $_.Line }
}
```

### Verificar que no haya ciclos de imports

```powershell
# Buscar imports circulares (básico)
# Verificar manualmente que types no importe de services
Select-String -Path "src\lib\types\*.ts" -Pattern "from '\`$lib/services"

# Verificar que services importa correctamente de types
Select-String -Path "src\lib\services\*.ts" -Pattern "from '\`$lib/types"
```

## 📦 NPM Scripts Personalizados

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "check:types": "svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-check --tsconfig ./tsconfig.json --watch",
    "search:deprecated": "powershell -Command \"Select-String -Path 'src/**/*.svelte', 'src/**/*.ts' -Pattern 'from ''\\$lib/services/tasks''' | Select-Object Path, LineNumber\"",
    "list:types": "powershell -Command \"Get-Content src/lib/types/*.ts | Select-String '^export (interface|type)'\"",
    "list:services": "powershell -Command \"Get-Content src/lib/services/*.ts | Select-String '^export (async )?function'\""
  }
}
```

Luego puedes usar:

```powershell
npm run check:types
npm run search:deprecated
npm run list:types
npm run list:services
```

## 🚀 Workflow Recomendado

### Al comenzar el día

```powershell
# 1. Actualizar código
git pull

# 2. Instalar dependencias si hay cambios
npm install

# 3. Verificar que todo compile
npm run check

# 4. Iniciar desarrollo
npm run dev
```

### Antes de hacer commit

```powershell
# 1. Verificar tipos
npm run check

# 2. Formatear código
npx prettier --write "src/**/*.{ts,svelte}"

# 3. Ver cambios
git status
git diff

# 4. Commit
git add .
git commit -m "feat: descriptive message"
```

### Antes de mergear

```powershell
# 1. Verificar todo
npm run check

# 2. Build de producción
npm run build

# 3. Probar build
npm run preview

# 4. Si todo está bien, mergear
git merge --no-ff feature-branch
```

## 📖 Abrir Documentación Rápidamente

```powershell
# Abrir documentación principal
code Documentacion\README.md

# Abrir guía de migración
code Documentacion\MIGRATION_GUIDE.md

# Abrir ejemplos
code Documentacion\USAGE_EXAMPLES.md

# Abrir checklist
code Documentacion\CHECKLIST.md

# Abrir todos a la vez
code Documentacion\*.md
```

---

## 💡 Tips Adicionales

### Alias de PowerShell

Agrega a tu perfil de PowerShell (`$PROFILE`):

```powershell
# Alias para comandos frecuentes
function dev { npm run dev }
function check { npm run check }
function build { npm run build }

# Alias para abrir documentación
function docs { code Documentacion\README.md }
function examples { code Documentacion\USAGE_EXAMPLES.md }

# Alias para git
function gs { git status }
function gd { git diff }
function gl { git log --oneline -10 }
```

Luego simplemente usa:

```powershell
dev        # En lugar de: npm run dev
check      # En lugar de: npm run check
docs       # Abre documentación
```

---

**Última Actualización:** Octubre 2025  
**Plataforma:** Windows PowerShell  
**Proyecto:** iam-web
