/* ============================================================================
   Configuration Rick
   ----------------------------------------------------------------------------
   Ce fichier est commité et déployé : n'y mets QUE des valeurs publiques.
   Les secrets de développement vont dans config.local.js (gitignoré).

   Mise en route Supabase :
   1. Crée un projet sur https://supabase.com (gratuit).
   2. Exécute supabase/schema.sql dans Studio > SQL Editor.
   3. Studio > Project Settings > API : copie l'URL du projet et la clé "anon".
   4. Colle-les ci-dessous.

   La clé "anon" est publique par conception : c'est le Row Level Security
   (défini dans schema.sql) qui protège les données, pas le secret de la clé.
   Ne colle JAMAIS ici la clé "service_role" ni la clé AssemblyAI.
============================================================================ */
window.RICK_CONFIG = {
  supabaseUrl: 'https://jjpkzrvkdqjryqyicqaa.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqcGt6cnZrZHFqcnlxeWljcWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNDE0NDUsImV4cCI6MjEwMjYxNzQ0NX0.Mx1QQgk9bB7zVb31s8ThkCfv1yVqTp1ilx2ZpvsY_Ic',

  assemblyai: {
    // true = le jeton de streaming est délivré par l'Edge Function Supabase
    // "assemblyai-token" (la clé reste un secret serveur). À activer en production.
    useSupabaseFunction: true,
    // Développement : endpoint local qui fabrique le jeton (voir config.local.js).
    // La clé AssemblyAI n'apparaît jamais dans le navigateur.
    tokenUrl: '',
    // Langue(s) attendues. 'fr' évite que le modèle dérive vers l'anglais ;
    // 'fr,en' autorise l'alternance dans une même réunion.
    languageCodes: 'fr',
    // Nombre d'interlocuteurs attendus côté visio (indice pour la diarisation).
    maxSpeakers: 4,
  },
};

/* Fusion des réglages locaux (config.local.js), s'ils existent. */
(function mergeLocal(){
  const local = window.RICK_LOCAL;
  if(!local) return;
  for(const [key, value] of Object.entries(local)){
    if(value && typeof value === 'object' && !Array.isArray(value)){
      window.RICK_CONFIG[key] = Object.assign({}, window.RICK_CONFIG[key], value);
    } else {
      window.RICK_CONFIG[key] = value;
    }
  }
})();
