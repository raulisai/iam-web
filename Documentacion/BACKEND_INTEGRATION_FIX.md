# 🔧 Correcciones de Integración Backend-Frontend

## Problemas Identificados y Soluciones

### 1. ❌ Error de CORS

**Problema:**
```
Access to fetch at 'http://localhost:5000/api/bot-rules/' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Causa:**  
El backend Flask no tiene configurado CORS para permitir peticiones desde el frontend en desarrollo (localhost:5173).

**Solución - Backend (Flask):**

#### Opción A: Usar flask-cors (Recomendado)

1. Instalar flask-cors:
```bash
pip install flask-cors
```

2. Configurar en `app.py` o el archivo principal:
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configuración CORS para desarrollo
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Para producción, especificar dominios exactos:
# CORS(app, resources={
#     r"/api/*": {
#         "origins": ["https://tu-dominio.com"],
#         ...
#     }
# })
```

#### Opción B: CORS Manual

Si no puedes instalar flask-cors, agrega esto a tu app:
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.after_request
def after_request(response):
    # Permitir origen del frontend
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:5173', 'http://127.0.0.1:5173']:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Manejar peticiones OPTIONS para preflight
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response, 200
```

---

### 2. ❌ Error 500 en POST /api/bot-rules/

**Problema:**
```
POST http://localhost:5000/api/bot-rules/ net::ERR_FAILED 500 (INTERNAL SERVER ERROR)
```

**Causa:**  
El frontend estaba enviando campos que el backend no esperaba:
- ❌ Enviaba: `rule_key`, `descr`, `is_active`
- ✅ Backend espera: `name`, `condition`, `action`, `priority` (opcional), `active` (opcional)

**Cambios Realizados en Frontend:**

#### Antes (Incorrecto):
```typescript
// bot_rules.ts
export interface CreateBotRuleData {
    rule_key: string;      // ❌ Backend no lo espera
    name: string;
    descr?: string;        // ❌ Backend no lo espera  
    condition: Record<string, any>;
    action: Record<string, any>;
    is_active?: boolean;   // ❌ Nombre incorrecto
}
```

#### Después (Correcto):
```typescript
// bot_rules.ts
export interface CreateBotRuleData {
    name: string;                    // ✅
    condition: Record<string, any>;  // ✅
    action: Record<string, any>;     // ✅
    priority?: number;               // ✅ Opcional
    active?: boolean;                // ✅ Nombre correcto
}
```

#### Regla generada (Antes):
```typescript
{
    rule_key: "auto_meditation_morning_1728123456",  // ❌
    name: "🤖 Meditación - Morning",
    descr: "Sugerencia automática...",              // ❌
    condition: { time: "06:00", days: ["mon", "tue"] },
    action: { type: "create_task", ... },
    is_active: true                                 // ❌
}
```

#### Regla generada (Después):
```typescript
{
    name: "🤖 Meditación - Morning",                // ✅
    condition: { time: "06:00", days: ["mon", "tue"] },
    action: { type: "create_task", ... },
    priority: 10,                                    // ✅
    active: true                                     // ✅
}
```

**Verificación Backend:**

Asegúrate que el controlador de bot rules acepta estos campos:
```python
# controllers/bot_rule_controller.py
def create_rule(data):
    # Validar campos requeridos
    if not data.get('name'):
        return jsonify({'error': 'Missing required field: name'}), 400
    if not data.get('condition'):
        return jsonify({'error': 'Missing required field: condition'}), 400
    if not data.get('action'):
        return jsonify({'error': 'Missing required field: action'}), 400
    
    # Crear regla
    new_rule = BotRule(
        user_id=g.current_user['id'],
        name=data['name'],
        condition=data['condition'],  # JSON
        action=data['action'],        # JSON
        priority=data.get('priority', 10),
        active=data.get('active', True)
    )
    
    db.session.add(new_rule)
    db.session.commit()
    
    return jsonify(new_rule.to_dict()), 201
```

---

### 3. ❌ Error 400 en POST /api/task-templates/

**Problema:**
```
POST http://localhost:5000/api/task-templates/ 400 (BAD REQUEST)
Error: Missing required fields
```

**Causa:**  
El backend espera ciertos campos requeridos, pero el frontend no los estaba enviando correctamente.

**Solución:**

#### Campos requeridos por backend:
```python
# Basado en profile_routes.py como referencia
required_fields = [
    'key',        # ✅ string único
    'name',       # ✅ nombre del template
    'category',   # ✅ 'mind' o 'body'
]

optional_fields = [
    'descr',              # descripción
    'estimated_minutes',  # duración estimada
    'difficulty',         # 1-5
    'reward_xp',          # puntos de experiencia
    'default_params',     # JSON con parámetros
    'created_by'          # 'system' o user_id
]
```

#### Frontend actualizado:
```typescript
// task_templates.ts
export interface CreateTaskTemplateData {
    key: string;                          // ✅ Requerido
    name: string;                         // ✅ Requerido
    category: 'mind' | 'body';            // ✅ Requerido
    descr?: string;                       // ⚪ Opcional
    estimated_minutes?: number;           // ⚪ Opcional
    difficulty?: number;                  // ⚪ Opcional
    reward_xp?: number;                   // ⚪ Opcional
    default_params?: Record<string, any>; // ⚪ Opcional
    created_by?: string;                  // ⚪ Opcional
}
```

#### Ejemplo de template válido:
```typescript
{
    key: "custom-1728123456-abc123",          // ✅ Único
    name: "Mi Meditación Personalizada",      // ✅
    category: "mind",                         // ✅
    descr: "Sesión de 20 minutos",           // ⚪
    estimated_minutes: 20,                    // ⚪
    difficulty: 3,                            // ⚪
    reward_xp: 60,                           // ⚪
    default_params: { guided: true },        // ⚪
    created_by: "user"                       // ⚪
}
```

**Verificación Backend:**

```python
# controllers/task_template_controller.py
def create_template(data):
    # Validar campos requeridos
    required = ['key', 'name', 'category']
    for field in required:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validar category
    if data['category'] not in ['mind', 'body']:
        return jsonify({'error': 'Invalid category. Must be "mind" or "body"'}), 400
    
    # Crear template
    new_template = TaskTemplate(
        user_id=g.current_user['id'],
        key=data['key'],
        name=data['name'],
        category=data['category'],
        descr=data.get('descr'),
        estimated_minutes=data.get('estimated_minutes'),
        difficulty=data.get('difficulty', 3),
        reward_xp=data.get('reward_xp', 50),
        default_params=data.get('default_params', {}),
        created_by=data.get('created_by', 'user')
    )
    
    db.session.add(new_template)
    db.session.commit()
    
    return jsonify(new_template.to_dict()), 201
```

---

## 📋 Checklist de Verificación

### Backend:
- [ ] **CORS configurado** (flask-cors o manual)
- [ ] **Bot Rules** acepta: `name`, `condition`, `action`, `priority?`, `active?`
- [ ] **Task Templates** acepta: `key`, `name`, `category`, + opcionales
- [ ] **Error handling** devuelve JSON con estructura `{ "error": "mensaje" }`
- [ ] **Auth middleware** funciona correctamente con token JWT
- [ ] **Logs de depuración** para ver qué datos llegan

### Frontend:
- [x] **CreateBotRuleData** corregido (sin `rule_key`, `descr`, `is_active`)
- [x] **generateBotRules()** genera estructura correcta
- [x] **CreateTaskTemplateData** con campos correctos
- [x] **Error handling** mejorado en servicios
- [x] **Manejo de respuestas** no-JSON

---

## 🧪 Testing

### Test 1: CORS
```bash
# En terminal, probar preflight OPTIONS
curl -X OPTIONS http://localhost:5000/api/bot-rules/ \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# Debe devolver 200 con headers CORS
```

### Test 2: Bot Rules
```bash
# POST con token válido
curl -X POST http://localhost:5000/api/bot-rules/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "name": "Test Rule",
    "condition": {"time": "09:00", "days": ["mon"]},
    "action": {"type": "create_task", "activity": "meditation"},
    "priority": 10,
    "active": true
  }'

# Debe devolver 201 con la regla creada
```

### Test 3: Task Templates
```bash
# POST con token válido
curl -X POST http://localhost:5000/api/task-templates/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "key": "test-template-123",
    "name": "Test Template",
    "category": "mind",
    "descr": "Test description",
    "estimated_minutes": 30,
    "difficulty": 3,
    "reward_xp": 50
  }'

# Debe devolver 201 con el template creado
```

---

## 🔍 Debugging

### Logs útiles en Backend:

```python
# En cada endpoint, agrega logs
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@bot_rule_routes.route('/', methods=['POST'])
@token_required
def create_bot_rule():
    data = request.get_json()
    logger.debug(f"📥 Received bot rule data: {data}")
    logger.debug(f"👤 User: {g.current_user}")
    
    # ... resto del código
    
    logger.debug(f"✅ Created bot rule: {new_rule.id}")
    return jsonify(new_rule.to_dict()), 201
```

### Logs en Frontend (ya implementados):

```typescript
console.log('🤖 Generando reglas de bot...', {
    activities: selectedActivityObjects.length,
    schedules: selectedSchedules.length,
    days: selectedDays.length
});

console.log(`📋 Creando ${botRules.length} reglas de bot...`);
console.log('✅ Regla creada:', ruleData.name);
console.log('❌ Error creando regla:', ruleData.name, err);
```

---

## 📊 Estructura Final de Datos

### Bot Rule (Frontend → Backend):
```json
{
  "name": "🤖 Meditación - Morning",
  "condition": {
    "time": "06:00",
    "days": ["mon", "tue", "wed", "thu", "fri"]
  },
  "action": {
    "type": "create_task",
    "activity": "meditation",
    "category": "mind",
    "duration": 15
  },
  "priority": 10,
  "active": true
}
```

### Task Template (Frontend → Backend):
```json
{
  "key": "custom-1728123456-abc123",
  "name": "Meditación Personalizada",
  "category": "mind",
  "descr": "Sesión de meditación de 20 minutos",
  "estimated_minutes": 20,
  "difficulty": 3,
  "reward_xp": 60,
  "default_params": {
    "guided": true,
    "music": false
  },
  "created_by": "user"
}
```

---

## 🚀 Pasos para Aplicar Correcciones

### 1. Backend (Flask):
```bash
cd iam-backend

# Instalar flask-cors
pip install flask-cors

# Agregar a requirements.txt
echo "flask-cors==4.0.0" >> requirements.txt

# Modificar app.py con configuración CORS
# (ver código arriba)

# Reiniciar servidor
python app.py
```

### 2. Frontend (SvelteKit):
```bash
cd iam-web

# Las correcciones ya están aplicadas en:
# - src/lib/services/bot_rules.ts
# - src/lib/services/task_templates.ts
# - src/lib/utils/onboarding.ts

# Reiniciar dev server
npm run dev
```

### 3. Probar:
1. Ir a http://localhost:5173/onboarding
2. Completar los pasos
3. Ver logs en consola del navegador
4. Ver logs en terminal del backend
5. Verificar que no hay errores CORS
6. Verificar que se crean las reglas y templates

---

## ✅ Resultado Esperado

Después de aplicar estas correcciones:

```
Frontend (localhost:5173)
  ↓ POST /api/bot-rules/
  ↓ { name, condition, action, priority, active }
Backend (localhost:5000)
  ↓ CORS: ✅ Allow-Origin
  ↓ Auth: ✅ Token válido
  ↓ Validate: ✅ Campos correctos
  ↓ Create: ✅ BotRule guardado
  ↑ Response: 201 { id, name, ... }
Frontend
  ↓ Success ✅
  ↓ console.log('✅ Regla creada')
```

Sin errores de:
- ❌ CORS
- ❌ 500 Internal Server Error
- ❌ 400 Bad Request

---

**Fecha**: 11 de octubre, 2025  
**Archivo**: BACKEND_INTEGRATION_FIX.md  
**Estado**: ✅ Correcciones aplicadas en frontend, pendiente backend CORS
