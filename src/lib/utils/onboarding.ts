// Onboarding Helper Functions

import type { CreateBotRuleData } from '$lib/services/bot_rules';
import type { CreateTaskTemplateData } from '$lib/services/task_templates';

interface ActivityPreference {
	id: string;
	name: string;
	category: 'mind' | 'body';
}

interface SchedulePreference {
	id: string;
	time: string;
}

/**
 * Generate bot rules from activity and schedule preferences
 */
export function generateBotRules(
	activities: ActivityPreference[],
	schedules: SchedulePreference[],
	days: string[]
): CreateBotRuleData[] {
	const rules: CreateBotRuleData[] = [];
	
	// Validate inputs
	if (!activities || activities.length === 0) {
		console.warn('No activities provided to generateBotRules');
		return rules;
	}
	
	if (!schedules || schedules.length === 0) {
		console.warn('No schedules provided to generateBotRules');
		return rules;
	}
	
	for (const activity of activities) {
		if (!activity || !activity.id) continue;
		
		for (const schedule of schedules) {
			if (!schedule || !schedule.time || !schedule.id) continue;
			
			// Extract start time from schedule
			const startTime = schedule.time.includes('-') 
				? schedule.time.split('-')[0].trim()
				: schedule.time.split(':')[0] + ':00';
			
			const rule: CreateBotRuleData = {
				rule_key: `auto_${activity.id}_${schedule.id}`,
				name: `Auto-schedule ${activity.name} - ${schedule.id}`,
				descr: `Automatically create ${activity.name} task during ${schedule.id} (${schedule.time})`,
				condition: {
					time: startTime,
					days: days.length > 0 ? days : ['all']
				},
				action: {
					type: 'create_task',
					activity: activity.id,
					category: activity.category,
					duration: getDefaultDuration(activity.id)
				},
				is_active: true
			};
			
			rules.push(rule);
		}
	}
	
	return rules;
}

/**
 * Get default duration for activity type
 */
function getDefaultDuration(activityId: string): number {
	const durations: Record<string, number> = {
		meditation: 15,
		reading: 30,
		learning: 45,
		creativity: 60,
		exercise: 45,
		yoga: 30,
		running: 30,
		swimming: 45,
		cycling: 60,
		nutrition: 20
	};
	
	return durations[activityId] || 30;
}

/**
 * Get predefined task templates catalog (EXPANDED)
 */
export function getPredefinedTemplates(): CreateTaskTemplateData[] {
	return [
		// ==================== MIND TEMPLATES (40+) ====================
		// Meditation (10)
		{
			key: 'meditation_breathing_10',
			name: 'Respiración Consciente 10min',
			category: 'mind',
			descr: 'Ejercicio de respiración profunda para relajación y concentración',
			estimated_minutes: 10,
			difficulty: 2,
			reward_xp: 40,
			default_params: { type: 'breathing', guided: true },
			created_by: 'system'
		},
		{
			key: 'meditation_mindfulness_20',
			name: 'Meditación Mindfulness 20min',
			category: 'mind',
			descr: 'Práctica de atención plena para reducir estrés y mejorar claridad mental',
			estimated_minutes: 20,
			difficulty: 3,
			reward_xp: 60,
			default_params: { type: 'mindfulness', music: true },
			created_by: 'system'
		},
		{
			key: 'reading_personal_development',
			name: 'Lectura de Desarrollo Personal',
			category: 'mind',
			descr: 'Tiempo dedicado a leer libros de crecimiento personal',
			estimated_minutes: 30,
			difficulty: 2,
			reward_xp: 50,
			default_params: { type: 'personal_dev', track_pages: true },
			created_by: 'system'
		},
		{
			key: 'learning_online_course',
			name: 'Curso Online',
			category: 'mind',
			descr: 'Estudio de curso o tutorial educativo',
			estimated_minutes: 45,
			difficulty: 4,
			reward_xp: 80,
			default_params: { type: 'course', track_progress: true },
			created_by: 'system'
		},
		{
			key: 'creativity_journaling',
			name: 'Journaling Creativo',
			category: 'mind',
			descr: 'Escritura reflexiva y expresión creativa',
			estimated_minutes: 20,
			difficulty: 2,
			reward_xp: 40,
			default_params: { type: 'journal', prompts: true },
			created_by: 'system'
		},
		{
			key: 'creativity_art_practice',
			name: 'Práctica Artística',
			category: 'mind',
			descr: 'Dibujo, pintura o cualquier expresión artística',
			estimated_minutes: 60,
			difficulty: 3,
			reward_xp: 90,
			default_params: { type: 'art', freestyle: true },
			created_by: 'system'
		},
		{
			key: 'meditation_body_scan',
			name: 'Body Scan Meditación',
			category: 'mind',
			descr: 'Escaneo corporal para relajación profunda',
			estimated_minutes: 25,
			difficulty: 2,
			reward_xp: 55,
			default_params: { type: 'body_scan' },
			created_by: 'system'
		},
		{
			key: 'meditation_loving_kindness',
			name: 'Meditación Compasión',
			category: 'mind',
			descr: 'Cultiva compasión hacia ti y los demás',
			estimated_minutes: 15,
			difficulty: 2,
			reward_xp: 45,
			default_params: { type: 'metta' },
			created_by: 'system'
		},
		{
			key: 'meditation_visualization',
			name: 'Visualización Guiada',
			category: 'mind',
			descr: 'Meditación con visualización de objetivos',
			estimated_minutes: 20,
			difficulty: 3,
			reward_xp: 50,
			default_params: { type: 'visualization' },
			created_by: 'system'
		},
		{
			key: 'meditation_walking',
			name: 'Meditación Caminando',
			category: 'mind',
			descr: 'Mindfulness en movimiento al caminar',
			estimated_minutes: 30,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'walking' },
			created_by: 'system'
		},
		{
			key: 'meditation_chakras',
			name: 'Meditación de Chakras',
			category: 'mind',
			descr: 'Equilibrio energético de chakras',
			estimated_minutes: 35,
			difficulty: 4,
			reward_xp: 85,
			default_params: { type: 'chakras' },
			created_by: 'system'
		},
		{
			key: 'meditation_sound_healing',
			name: 'Sanación con Sonido',
			category: 'mind',
			descr: 'Meditación con cuencos tibetanos',
			estimated_minutes: 40,
			difficulty: 2,
			reward_xp: 75,
			default_params: { type: 'sound_healing' },
			created_by: 'system'
		},
		// Reading & Learning (15)
		{
			key: 'reading_fiction',
			name: 'Lectura de Ficción',
			category: 'mind',
			descr: 'Disfruta novelas y cuentos',
			estimated_minutes: 45,
			difficulty: 1,
			reward_xp: 50,
			default_params: { type: 'fiction' },
			created_by: 'system'
		},
		{
			key: 'reading_philosophy',
			name: 'Lectura Filosófica',
			category: 'mind',
			descr: 'Explora grandes pensadores',
			estimated_minutes: 40,
			difficulty: 4,
			reward_xp: 90,
			default_params: { type: 'philosophy' },
			created_by: 'system'
		},
		{
			key: 'reading_biography',
			name: 'Biografías Inspiradoras',
			category: 'mind',
			descr: 'Aprende de vidas extraordinarias',
			estimated_minutes: 35,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'biography' },
			created_by: 'system'
		},
		{
			key: 'reading_poetry',
			name: 'Poesía y Verso',
			category: 'mind',
			descr: 'Explora el arte poético',
			estimated_minutes: 20,
			difficulty: 2,
			reward_xp: 40,
			default_params: { type: 'poetry' },
			created_by: 'system'
		},
		{
			key: 'learning_language',
			name: 'Práctica de Idiomas',
			category: 'mind',
			descr: 'Estudia nuevo idioma',
			estimated_minutes: 30,
			difficulty: 3,
			reward_xp: 70,
			default_params: { type: 'language' },
			created_by: 'system'
		},
		{
			key: 'learning_coding',
			name: 'Programación',
			category: 'mind',
			descr: 'Aprende a programar',
			estimated_minutes: 60,
			difficulty: 5,
			reward_xp: 120,
			default_params: { type: 'coding' },
			created_by: 'system'
		},
		{
			key: 'learning_music_theory',
			name: 'Teoría Musical',
			category: 'mind',
			descr: 'Estudia fundamentos musicales',
			estimated_minutes: 40,
			difficulty: 4,
			reward_xp: 85,
			default_params: { type: 'music_theory' },
			created_by: 'system'
		},
		{
			key: 'learning_instrument',
			name: 'Práctica de Instrumento',
			category: 'mind',
			descr: 'Toca tu instrumento favorito',
			estimated_minutes: 45,
			difficulty: 3,
			reward_xp: 80,
			default_params: { type: 'instrument' },
			created_by: 'system'
		},
		{
			key: 'learning_history',
			name: 'Historia Mundial',
			category: 'mind',
			descr: 'Explora eventos históricos',
			estimated_minutes: 35,
			difficulty: 3,
			reward_xp: 70,
			default_params: { type: 'history' },
			created_by: 'system'
		},
		{
			key: 'learning_science',
			name: 'Divulgación Científica',
			category: 'mind',
			descr: 'Aprende sobre ciencia',
			estimated_minutes: 40,
			difficulty: 4,
			reward_xp: 85,
			default_params: { type: 'science' },
			created_by: 'system'
		},
		{
			key: 'learning_podcast',
			name: 'Podcast Educativo',
			category: 'mind',
			descr: 'Escucha podcasts de aprendizaje',
			estimated_minutes: 45,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'podcast' },
			created_by: 'system'
		},
		{
			key: 'learning_documentary',
			name: 'Documental',
			category: 'mind',
			descr: 'Ve documentales educativos',
			estimated_minutes: 60,
			difficulty: 2,
			reward_xp: 70,
			default_params: { type: 'documentary' },
			created_by: 'system'
		},
		// Creativity (15)
		{
			key: 'creativity_drawing',
			name: 'Dibujo Libre',
			category: 'mind',
			descr: 'Sketching y bocetos creativos',
			estimated_minutes: 40,
			difficulty: 2,
			reward_xp: 65,
			default_params: { type: 'drawing' },
			created_by: 'system'
		},
		{
			key: 'creativity_painting',
			name: 'Pintura',
			category: 'mind',
			descr: 'Acuarela, óleo o acrílico',
			estimated_minutes: 90,
			difficulty: 4,
			reward_xp: 130,
			default_params: { type: 'painting' },
			created_by: 'system'
		},
		{
			key: 'creativity_photography',
			name: 'Fotografía Creativa',
			category: 'mind',
			descr: 'Captura momentos únicos',
			estimated_minutes: 60,
			difficulty: 3,
			reward_xp: 85,
			default_params: { type: 'photography' },
			created_by: 'system'
		},
		{
			key: 'creativity_video_editing',
			name: 'Edición de Video',
			category: 'mind',
			descr: 'Crea y edita contenido',
			estimated_minutes: 90,
			difficulty: 5,
			reward_xp: 140,
			default_params: { type: 'video' },
			created_by: 'system'
		},
		{
			key: 'creativity_music_composition',
			name: 'Composición Musical',
			category: 'mind',
			descr: 'Crea tu propia música',
			estimated_minutes: 60,
			difficulty: 5,
			reward_xp: 120,
			default_params: { type: 'compose' },
			created_by: 'system'
		},
		{
			key: 'creativity_writing_fiction',
			name: 'Escritura Creativa',
			category: 'mind',
			descr: 'Escribe relatos o novelas',
			estimated_minutes: 50,
			difficulty: 4,
			reward_xp: 95,
			default_params: { type: 'fiction_writing' },
			created_by: 'system'
		},
		{
			key: 'creativity_poetry_writing',
			name: 'Escritura de Poesía',
			category: 'mind',
			descr: 'Crea versos y poemas',
			estimated_minutes: 30,
			difficulty: 3,
			reward_xp: 65,
			default_params: { type: 'poetry_writing' },
			created_by: 'system'
		},
		{
			key: 'creativity_blog_writing',
			name: 'Blog Personal',
			category: 'mind',
			descr: 'Escribe artículos de blog',
			estimated_minutes: 45,
			difficulty: 3,
			reward_xp: 75,
			default_params: { type: 'blog' },
			created_by: 'system'
		},
		{
			key: 'creativity_crafts',
			name: 'Manualidades',
			category: 'mind',
			descr: 'Proyectos DIY y artesanía',
			estimated_minutes: 60,
			difficulty: 2,
			reward_xp: 70,
			default_params: { type: 'crafts' },
			created_by: 'system'
		},
		{
			key: 'creativity_design',
			name: 'Diseño Gráfico',
			category: 'mind',
			descr: 'Crea diseños visuales',
			estimated_minutes: 60,
			difficulty: 4,
			reward_xp: 100,
			default_params: { type: 'graphic_design' },
			created_by: 'system'
		},
		{
			key: 'creativity_architecture',
			name: 'Diseño Arquitectónico',
			category: 'mind',
			descr: 'Bocetos de espacios',
			estimated_minutes: 75,
			difficulty: 5,
			reward_xp: 125,
			default_params: { type: 'architecture' },
			created_by: 'system'
		},
		{
			key: 'creativity_cooking',
			name: 'Cocina Creativa',
			category: 'mind',
			descr: 'Experimenta con recetas',
			estimated_minutes: 60,
			difficulty: 3,
			reward_xp: 80,
			default_params: { type: 'cooking' },
			created_by: 'system'
		},
		{
			key: 'creativity_gardening',
			name: 'Jardinería',
			category: 'mind',
			descr: 'Cultiva plantas y flores',
			estimated_minutes: 45,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'gardening' },
			created_by: 'system'
		},
		
		// ==================== BODY TEMPLATES (40+) ====================
		// Exercise (15)
		{
			key: 'exercise_cardio_30',
			name: 'Cardio 30min',
			category: 'body',
			descr: 'Ejercicio cardiovascular para mejorar resistencia',
			estimated_minutes: 30,
			difficulty: 3,
			reward_xp: 70,
			default_params: { type: 'cardio', intensity: 'moderate' },
			created_by: 'system'
		},
		{
			key: 'exercise_strength_45',
			name: 'Entrenamiento de Fuerza 45min',
			category: 'body',
			descr: 'Rutina de fuerza con pesas o peso corporal',
			estimated_minutes: 45,
			difficulty: 4,
			reward_xp: 100,
			default_params: { type: 'strength', equipment: 'weights' },
			created_by: 'system'
		},
		{
			key: 'yoga_hatha_30',
			name: 'Yoga Hatha 30min',
			category: 'body',
			descr: 'Práctica de yoga suave para flexibilidad y equilibrio',
			estimated_minutes: 30,
			difficulty: 2,
			reward_xp: 50,
			default_params: { type: 'hatha', guided: true },
			created_by: 'system'
		},
		{
			key: 'yoga_vinyasa_45',
			name: 'Yoga Vinyasa 45min',
			category: 'body',
			descr: 'Flujo dinámico de yoga para fuerza y flexibilidad',
			estimated_minutes: 45,
			difficulty: 3,
			reward_xp: 80,
			default_params: { type: 'vinyasa', flow: true },
			created_by: 'system'
		},
		{
			key: 'running_easy_30',
			name: 'Running Suave 30min',
			category: 'body',
			descr: 'Carrera a ritmo cómodo para resistencia base',
			estimated_minutes: 30,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'easy_run', pace: 'comfortable' },
			created_by: 'system'
		},
		{
			key: 'running_intervals_45',
			name: 'Running Intervalos 45min',
			category: 'body',
			descr: 'Entrenamiento de intervalos de alta intensidad',
			estimated_minutes: 45,
			difficulty: 5,
			reward_xp: 120,
			default_params: { type: 'intervals', intensity: 'high' },
			created_by: 'system'
		},
		{
			key: 'swimming_technique_30',
			name: 'Natación Técnica 30min',
			category: 'body',
			descr: 'Práctica de técnica de natación',
			estimated_minutes: 30,
			difficulty: 3,
			reward_xp: 70,
			default_params: { type: 'technique', strokes: ['freestyle', 'backstroke'] },
			created_by: 'system'
		},
		{
			key: 'swimming_endurance_45',
			name: 'Natación Resistencia 45min',
			category: 'body',
			descr: 'Nado continuo para mejorar resistencia',
			estimated_minutes: 45,
			difficulty: 4,
			reward_xp: 90,
			default_params: { type: 'endurance', distance: 1000 },
			created_by: 'system'
		},
		{
			key: 'cycling_recovery_45',
			name: 'Ciclismo Recuperación 45min',
			category: 'body',
			descr: 'Pedaleo suave para recuperación activa',
			estimated_minutes: 45,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'recovery', intensity: 'low' },
			created_by: 'system'
		},
		{
			key: 'cycling_hill_training_60',
			name: 'Ciclismo Subidas 60min',
			category: 'body',
			descr: 'Entrenamiento en subidas para fuerza',
			estimated_minutes: 60,
			difficulty: 5,
			reward_xp: 130,
			default_params: { type: 'hills', elevation_gain: 500 },
			created_by: 'system'
		},
		{
			key: 'nutrition_meal_prep',
			name: 'Preparación de Comidas',
			category: 'body',
			descr: 'Planificar y preparar comidas saludables',
			estimated_minutes: 60,
			difficulty: 2,
			reward_xp: 50,
			default_params: { type: 'meal_prep', servings: 5 },
			created_by: 'system'
		},
		{
			key: 'nutrition_hydration_tracking',
			name: 'Registro de Hidratación',
			category: 'body',
			descr: 'Seguimiento de consumo diario de agua',
			estimated_minutes: 5,
			difficulty: 1,
			reward_xp: 20,
			default_params: { type: 'hydration', goal_liters: 2.5 },
			created_by: 'system'
		},
		{
			key: 'stretching_full_body_15',
			name: 'Estiramientos Completos 15min',
			category: 'body',
			descr: 'Rutina de estiramiento para todo el cuerpo',
			estimated_minutes: 15,
			difficulty: 1,
			reward_xp: 30,
			default_params: { type: 'stretching', body_parts: 'all' },
			created_by: 'system'
		},
		{
			key: 'mobility_routine_20',
			name: 'Rutina de Movilidad 20min',
			category: 'body',
			descr: 'Ejercicios para mejorar rango de movimiento',
			estimated_minutes: 20,
			difficulty: 2,
			reward_xp: 40,
			default_params: { type: 'mobility', focus: 'joints' },
			created_by: 'system'
		},
		{
			key: 'exercise_hiit_20',
			name: 'HIIT 20min',
			category: 'body',
			descr: 'Alta intensidad para quemar calorías',
			estimated_minutes: 20,
			difficulty: 5,
			reward_xp: 110,
			default_params: { type: 'hiit' },
			created_by: 'system'
		},
		{
			key: 'exercise_tabata_15',
			name: 'Tabata 15min',
			category: 'body',
			descr: 'Intervalos extremos 20/10',
			estimated_minutes: 15,
			difficulty: 5,
			reward_xp: 100,
			default_params: { type: 'tabata' },
			created_by: 'system'
		},
		{
			key: 'exercise_crossfit_60',
			name: 'WOD CrossFit',
			category: 'body',
			descr: 'Workout of the Day intenso',
			estimated_minutes: 60,
			difficulty: 5,
			reward_xp: 150,
			default_params: { type: 'crossfit' },
			created_by: 'system'
		},
		{
			key: 'exercise_calisthenics',
			name: 'Calistenia',
			category: 'body',
			descr: 'Fuerza con peso corporal',
			estimated_minutes: 40,
			difficulty: 4,
			reward_xp: 95,
			default_params: { type: 'calisthenics' },
			created_by: 'system'
		},
		{
			key: 'exercise_pilates_45',
			name: 'Pilates 45min',
			category: 'body',
			descr: 'Fortalecimiento del core',
			estimated_minutes: 45,
			difficulty: 3,
			reward_xp: 80,
			default_params: { type: 'pilates' },
			created_by: 'system'
		},
		{
			key: 'exercise_boxing_30',
			name: 'Boxeo 30min',
			category: 'body',
			descr: 'Entrenamiento de boxeo',
			estimated_minutes: 30,
			difficulty: 4,
			reward_xp: 85,
			default_params: { type: 'boxing' },
			created_by: 'system'
		},
		{
			key: 'exercise_kickboxing_45',
			name: 'Kickboxing 45min',
			category: 'body',
			descr: 'Cardio y técnica de golpes',
			estimated_minutes: 45,
			difficulty: 4,
			reward_xp: 100,
			default_params: { type: 'kickboxing' },
			created_by: 'system'
		},
		{
			key: 'exercise_abs_core_20',
			name: 'Abdominales 20min',
			category: 'body',
			descr: 'Rutina enfocada en core',
			estimated_minutes: 20,
			difficulty: 3,
			reward_xp: 55,
			default_params: { type: 'abs' },
			created_by: 'system'
		},
		{
			key: 'exercise_legs_45',
			name: 'Día de Pierna 45min',
			category: 'body',
			descr: 'Entrenamiento de piernas',
			estimated_minutes: 45,
			difficulty: 5,
			reward_xp: 110,
			default_params: { type: 'legs' },
			created_by: 'system'
		},
		{
			key: 'exercise_upper_body_40',
			name: 'Tren Superior 40min',
			category: 'body',
			descr: 'Brazos, pecho y espalda',
			estimated_minutes: 40,
			difficulty: 4,
			reward_xp: 95,
			default_params: { type: 'upper_body' },
			created_by: 'system'
		},
		{
			key: 'exercise_full_body_50',
			name: 'Cuerpo Completo 50min',
			category: 'body',
			descr: 'Rutina total body',
			estimated_minutes: 50,
			difficulty: 4,
			reward_xp: 105,
			default_params: { type: 'full_body' },
			created_by: 'system'
		},
		// Yoga & Flexibility (10)
		{
			key: 'yoga_yin_60',
			name: 'Yin Yoga 60min',
			category: 'body',
			descr: 'Posturas pasivas profundas',
			estimated_minutes: 60,
			difficulty: 2,
			reward_xp: 85,
			default_params: { type: 'yin' },
			created_by: 'system'
		},
		{
			key: 'yoga_restorative_45',
			name: 'Yoga Restaurativo',
			category: 'body',
			descr: 'Relajación profunda',
			estimated_minutes: 45,
			difficulty: 1,
			reward_xp: 60,
			default_params: { type: 'restorative' },
			created_by: 'system'
		},
		{
			key: 'yoga_power_60',
			name: 'Power Yoga 60min',
			category: 'body',
			descr: 'Yoga intenso y dinámico',
			estimated_minutes: 60,
			difficulty: 5,
			reward_xp: 130,
			default_params: { type: 'power' },
			created_by: 'system'
		},
		{
			key: 'yoga_ashtanga_75',
			name: 'Ashtanga Yoga 75min',
			category: 'body',
			descr: 'Serie tradicional exigente',
			estimated_minutes: 75,
			difficulty: 5,
			reward_xp: 150,
			default_params: { type: 'ashtanga' },
			created_by: 'system'
		},
		{
			key: 'yoga_kundalini_50',
			name: 'Kundalini Yoga',
			category: 'body',
			descr: 'Energía y chakras',
			estimated_minutes: 50,
			difficulty: 3,
			reward_xp: 90,
			default_params: { type: 'kundalini' },
			created_by: 'system'
		},
		{
			key: 'yoga_nidra_30',
			name: 'Yoga Nidra',
			category: 'body',
			descr: 'Sueño consciente reparador',
			estimated_minutes: 30,
			difficulty: 1,
			reward_xp: 50,
			default_params: { type: 'nidra' },
			created_by: 'system'
		},
		{
			key: 'stretching_morning_10',
			name: 'Estiramientos Matutinos',
			category: 'body',
			descr: 'Despierta tu cuerpo',
			estimated_minutes: 10,
			difficulty: 1,
			reward_xp: 25,
			default_params: { type: 'morning' },
			created_by: 'system'
		},
		{
			key: 'stretching_evening_15',
			name: 'Estiramientos Nocturnos',
			category: 'body',
			descr: 'Relaja antes de dormir',
			estimated_minutes: 15,
			difficulty: 1,
			reward_xp: 30,
			default_params: { type: 'evening' },
			created_by: 'system'
		},
		{
			key: 'foam_rolling_20',
			name: 'Foam Rolling 20min',
			category: 'body',
			descr: 'Auto-masaje miofascial',
			estimated_minutes: 20,
			difficulty: 2,
			reward_xp: 40,
			default_params: { type: 'foam_rolling' },
			created_by: 'system'
		},
		// Sports & Outdoor (15)
		{
			key: 'running_long_90',
			name: 'Carrera Larga 90min',
			category: 'body',
			descr: 'Fondo para resistencia',
			estimated_minutes: 90,
			difficulty: 4,
			reward_xp: 140,
			default_params: { type: 'long_run' },
			created_by: 'system'
		},
		{
			key: 'running_tempo_40',
			name: 'Tempo Run 40min',
			category: 'body',
			descr: 'Ritmo sostenido intenso',
			estimated_minutes: 40,
			difficulty: 4,
			reward_xp: 90,
			default_params: { type: 'tempo' },
			created_by: 'system'
		},
		{
			key: 'running_fartlek_45',
			name: 'Fartlek 45min',
			category: 'body',
			descr: 'Juego de ritmos variados',
			estimated_minutes: 45,
			difficulty: 4,
			reward_xp: 95,
			default_params: { type: 'fartlek' },
			created_by: 'system'
		},
		{
			key: 'cycling_spin_45',
			name: 'Spinning Indoor 45min',
			category: 'body',
			descr: 'Clase de ciclismo indoor',
			estimated_minutes: 45,
			difficulty: 4,
			reward_xp: 100,
			default_params: { type: 'spin' },
			created_by: 'system'
		},
		{
			key: 'cycling_mountain_90',
			name: 'MTB 90min',
			category: 'body',
			descr: 'Mountain bike en trail',
			estimated_minutes: 90,
			difficulty: 5,
			reward_xp: 150,
			default_params: { type: 'mtb' },
			created_by: 'system'
		},
		{
			key: 'cycling_road_120',
			name: 'Ruta de Carretera 2h',
			category: 'body',
			descr: 'Ciclismo en carretera',
			estimated_minutes: 120,
			difficulty: 5,
			reward_xp: 180,
			default_params: { type: 'road' },
			created_by: 'system'
		},
		{
			key: 'swimming_openwater_60',
			name: 'Natación Aguas Abiertas',
			category: 'body',
			descr: 'Nado en lago o mar',
			estimated_minutes: 60,
			difficulty: 5,
			reward_xp: 130,
			default_params: { type: 'open_water' },
			created_by: 'system'
		},
		{
			key: 'swimming_drills_40',
			name: 'Ejercicios Técnica Natación',
			category: 'body',
			descr: 'Drills especializados',
			estimated_minutes: 40,
			difficulty: 3,
			reward_xp: 75,
			default_params: { type: 'drills' },
			created_by: 'system'
		},
		{
			key: 'hiking_moderate_120',
			name: 'Senderismo 2h',
			category: 'body',
			descr: 'Caminata en naturaleza',
			estimated_minutes: 120,
			difficulty: 3,
			reward_xp: 140,
			default_params: { type: 'hiking' },
			created_by: 'system'
		},
		{
			key: 'trekking_challenging_180',
			name: 'Trekking Exigente 3h',
			category: 'body',
			descr: 'Ruta montañosa difícil',
			estimated_minutes: 180,
			difficulty: 5,
			reward_xp: 200,
			default_params: { type: 'trekking' },
			created_by: 'system'
		},
		{
			key: 'tennis_60',
			name: 'Tenis 60min',
			category: 'body',
			descr: 'Partido o práctica de tenis',
			estimated_minutes: 60,
			difficulty: 4,
			reward_xp: 110,
			default_params: { type: 'tennis' },
			created_by: 'system'
		},
		{
			key: 'basketball_60',
			name: 'Básquetbol 60min',
			category: 'body',
			descr: 'Juego o entrenamiento',
			estimated_minutes: 60,
			difficulty: 4,
			reward_xp: 110,
			default_params: { type: 'basketball' },
			created_by: 'system'
		},
		{
			key: 'soccer_90',
			name: 'Fútbol 90min',
			category: 'body',
			descr: 'Partido completo de fútbol',
			estimated_minutes: 90,
			difficulty: 4,
			reward_xp: 130,
			default_params: { type: 'soccer' },
			created_by: 'system'
		},
		{
			key: 'volleyball_60',
			name: 'Voleibol 60min',
			category: 'body',
			descr: 'Juego de voleibol',
			estimated_minutes: 60,
			difficulty: 3,
			reward_xp: 90,
			default_params: { type: 'volleyball' },
			created_by: 'system'
		},
		{
			key: 'climbing_gym_90',
			name: 'Escalada Indoor 90min',
			category: 'body',
			descr: 'Boulder o escalada con cuerda',
			estimated_minutes: 90,
			difficulty: 5,
			reward_xp: 145,
			default_params: { type: 'climbing' },
			created_by: 'system'
		},
		// Wellness & Recovery (10)
		{
			key: 'sauna_20',
			name: 'Sesión de Sauna',
			category: 'body',
			descr: 'Recuperación con calor',
			estimated_minutes: 20,
			difficulty: 1,
			reward_xp: 35,
			default_params: { type: 'sauna' },
			created_by: 'system'
		},
		{
			key: 'ice_bath_10',
			name: 'Baño de Hielo',
			category: 'body',
			descr: 'Crioterapia recovery',
			estimated_minutes: 10,
			difficulty: 3,
			reward_xp: 50,
			default_params: { type: 'ice_bath' },
			created_by: 'system'
		},
		{
			key: 'massage_therapy_60',
			name: 'Masaje Terapéutico',
			category: 'body',
			descr: 'Relajación muscular profunda',
			estimated_minutes: 60,
			difficulty: 1,
			reward_xp: 70,
			default_params: { type: 'massage' },
			created_by: 'system'
		},
		{
			key: 'acupuncture_45',
			name: 'Acupuntura',
			category: 'body',
			descr: 'Terapia de medicina china',
			estimated_minutes: 45,
			difficulty: 1,
			reward_xp: 65,
			default_params: { type: 'acupuncture' },
			created_by: 'system'
		},
		{
			key: 'sleep_quality_480',
			name: 'Sueño de Calidad 8h',
			category: 'body',
			descr: 'Descanso reparador completo',
			estimated_minutes: 480,
			difficulty: 1,
			reward_xp: 100,
			default_params: { type: 'sleep' },
			created_by: 'system'
		},
		{
			key: 'nap_power_20',
			name: 'Power Nap 20min',
			category: 'body',
			descr: 'Siesta energizante',
			estimated_minutes: 20,
			difficulty: 1,
			reward_xp: 30,
			default_params: { type: 'nap' },
			created_by: 'system'
		},
		{
			key: 'breath_work_15',
			name: 'Respiración Wim Hof',
			category: 'body',
			descr: 'Técnica de respiración potente',
			estimated_minutes: 15,
			difficulty: 3,
			reward_xp: 50,
			default_params: { type: 'wim_hof' },
			created_by: 'system'
		},
		{
			key: 'cold_shower_5',
			name: 'Ducha Fría',
			category: 'body',
			descr: 'Activación y recuperación',
			estimated_minutes: 5,
			difficulty: 3,
			reward_xp: 40,
			default_params: { type: 'cold_shower' },
			created_by: 'system'
		},
		{
			key: 'posture_correction_30',
			name: 'Corrección Postural',
			category: 'body',
			descr: 'Ejercicios de alineación',
			estimated_minutes: 30,
			difficulty: 2,
			reward_xp: 55,
			default_params: { type: 'posture' },
			created_by: 'system'
		},
		{
			key: 'nutrition_planning_45',
			name: 'Planificación Nutricional',
			category: 'body',
			descr: 'Organiza tu dieta semanal',
			estimated_minutes: 45,
			difficulty: 2,
			reward_xp: 60,
			default_params: { type: 'meal_planning' },
			created_by: 'system'
		}
	];
}

/**
 * Convert backend template to UI format with icons
 */
function templateToUI(template: CreateTaskTemplateData) {
	// Icon mapping based on template key prefixes
	const iconMap: Record<string, string> = {
		meditation: '🧘',
		reading: '📚',
		learning: '🎓',
		creativity: '🎨',
		exercise: '💪',
		yoga: '🕉️',
		running: '🏃',
		swimming: '🏊',
		cycling: '🚴',
		nutrition: '🥗',
		hiking: '🥾',
		trekking: '⛰️',
		tennis: '🎾',
		basketball: '🏀',
		soccer: '⚽',
		volleyball: '🏐',
		climbing: '🧗',
		sauna: '🧖',
		ice_bath: '🧊',
		massage: '💆',
		acupuncture: '📍',
		sleep: '😴',
		nap: '💤',
		breath: '🌬️',
		cold_shower: '🚿',
		posture: '🦴',
		foam_rolling: '🎯',
		stretching: '🤸'
	};
	
	// Get icon based on template key prefix
	const prefix = template.key.split('_')[0];
	const icon = iconMap[prefix] || (template.category === 'mind' ? '🧠' : '💪');
	
	return {
		id: template.key,
		name: template.name,
		description: template.descr,
		category: template.category,
		duration: template.estimated_minutes,
		difficulty: template.difficulty,
		icon: icon
	};
}

/**
 * Get recommended templates based on selected activities (EXPANDED)
 */
export function getRecommendedTemplates(activityIds: string[]): any[] {
	const allTemplates = getPredefinedTemplates();
	const activityTemplateMap: Record<string, string[]> = {
		meditation: [
			'meditation_breathing_10', 'meditation_mindfulness_20', 'meditation_body_scan',
			'meditation_loving_kindness', 'meditation_visualization', 'meditation_walking',
			'meditation_chakras', 'meditation_sound_healing'
		],
		reading: [
			'reading_personal_development', 'reading_fiction', 'reading_philosophy',
			'reading_biography', 'reading_poetry'
		],
		learning: [
			'learning_online_course', 'learning_language', 'learning_coding',
			'learning_music_theory', 'learning_instrument', 'learning_history',
			'learning_science', 'learning_podcast', 'learning_documentary'
		],
		creativity: [
			'creativity_journaling', 'creativity_art_practice', 'creativity_drawing',
			'creativity_painting', 'creativity_photography', 'creativity_video_editing',
			'creativity_music_composition', 'creativity_writing_fiction', 'creativity_poetry_writing',
			'creativity_blog_writing', 'creativity_crafts', 'creativity_design',
			'creativity_architecture', 'creativity_cooking', 'creativity_gardening'
		],
		exercise: [
			'exercise_cardio_30', 'exercise_strength_45', 'stretching_full_body_15',
			'exercise_hiit_20', 'exercise_tabata_15', 'exercise_crossfit_60',
			'exercise_calisthenics', 'exercise_pilates_45', 'exercise_boxing_30',
			'exercise_kickboxing_45', 'exercise_abs_core_20', 'exercise_legs_45',
			'exercise_upper_body_40', 'exercise_full_body_50'
		],
		yoga: [
			'yoga_hatha_30', 'yoga_vinyasa_45', 'mobility_routine_20',
			'yoga_yin_60', 'yoga_restorative_45', 'yoga_power_60',
			'yoga_ashtanga_75', 'yoga_kundalini_50', 'yoga_nidra_30',
			'stretching_morning_10', 'stretching_evening_15', 'foam_rolling_20'
		],
		running: [
			'running_easy_30', 'running_intervals_45', 'running_long_90',
			'running_tempo_40', 'running_fartlek_45', 'hiking_moderate_120',
			'trekking_challenging_180'
		],
		swimming: [
			'swimming_technique_30', 'swimming_endurance_45', 'swimming_openwater_60',
			'swimming_drills_40'
		],
		cycling: [
			'cycling_recovery_45', 'cycling_hill_training_60', 'cycling_spin_45',
			'cycling_mountain_90', 'cycling_road_120'
		],
		nutrition: [
			'nutrition_meal_prep', 'nutrition_hydration_tracking', 'nutrition_planning_45',
			'creativity_cooking', 'cold_shower_5', 'sauna_20', 'sleep_quality_480',
			'nap_power_20', 'breath_work_15', 'ice_bath_10', 'massage_therapy_60',
			'acupuncture_45', 'posture_correction_30'
		]
	};
	
	const recommendedKeys = new Set<string>();
	for (const activityId of activityIds) {
		const templateKeys = activityTemplateMap[activityId] || [];
		templateKeys.forEach(key => recommendedKeys.add(key));
	}
	
	// If no activities selected, show a diverse selection
	if (recommendedKeys.size === 0) {
		return allTemplates.slice(0, 30).map(templateToUI); // Show first 30 templates
	}
	
	const filtered = allTemplates.filter(template => recommendedKeys.has(template.key));
	return filtered.map(templateToUI);
}

/**
 * Calculate XP reward based on difficulty and duration
 */
export function calculateXP(difficulty: number, duration: number): number {
	// Base XP: difficulty * 20
	// Bonus: duration / 10 * 5
	const baseXP = difficulty * 20;
	const durationBonus = Math.floor(duration / 10) * 5;
	return baseXP + durationBonus;
}
