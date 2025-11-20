-- docs/seed.sql
-- Dataset mínimo para smoke/e2e. Requiere ejecutar con la clave service_role.
-- 1) Crea/asegura el usuario con scripts/seedTestData.ts (usa auth.admin).
-- 2) Reemplaza {{TEST_USER_ID}} por el ID del usuario test@azahar.app si quieres correr SQL manual.

begin;

-- Limpieza defensiva (por si no se eliminó el usuario antes)
delete from task_checklist_items where task_id in (select id from tasks where user_id = '{{TEST_USER_ID}}');
delete from task_labels where task_id in (select id from tasks where user_id = '{{TEST_USER_ID}}');
delete from tasks where user_id = '{{TEST_USER_ID}}';
delete from project_headings where user_id = '{{TEST_USER_ID}}';
delete from projects where user_id = '{{TEST_USER_ID}}';
delete from areas where user_id = '{{TEST_USER_ID}}';
delete from labels where user_id = '{{TEST_USER_ID}}';

-- Área y proyecto base
insert into areas (user_id, name, sort_order)
values ('{{TEST_USER_ID}}', 'Smoke Area', 0);

insert into projects (user_id, name, color, area_id, sort_order)
values (
  '{{TEST_USER_ID}}',
  'Smoke Project',
  '#5b79a1',
  (select id from areas where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Area' limit 1),
  0
);

insert into project_headings (user_id, project_id, name, sort_order)
values (
  '{{TEST_USER_ID}}',
  (select id from projects where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Project' limit 1),
  'Smoke Section',
  0
);

-- Etiqueta y tareas
insert into labels (user_id, name, color)
values ('{{TEST_USER_ID}}', 'Smoke Label', '#a855f7');

insert into tasks (user_id, title, status, priority, project_id, area_id, heading_id, due_at, completed_at)
values
('{{TEST_USER_ID}}', 'SMOKE - Inbox abierta', 'open', 1, null, null, null, null, null),
('{{TEST_USER_ID}}', 'SMOKE - Proyecto hoy', 'open', 2,
  (select id from projects where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Project' limit 1),
  (select id from areas where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Area' limit 1),
  (select id from project_headings where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Section' limit 1),
  now(), null),
('{{TEST_USER_ID}}', 'SMOKE - Mañana', 'open', 0, null, null, null, now() + interval '1 day', null),
('{{TEST_USER_ID}}', 'SMOKE - Ya completada', 'done', 0,
  (select id from projects where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Project' limit 1),
  null, null, null, now());

-- Relacionar etiqueta y checklist de ejemplo
insert into task_labels (task_id, label_id)
values (
  (select id from tasks where user_id = '{{TEST_USER_ID}}' and title = 'SMOKE - Inbox abierta' limit 1),
  (select id from labels where user_id = '{{TEST_USER_ID}}' and name = 'Smoke Label' limit 1)
);

insert into task_checklist_items (user_id, task_id, text, completed, sort_order)
values
('{{TEST_USER_ID}}', (select id from tasks where user_id = '{{TEST_USER_ID}}' and title = 'SMOKE - Proyecto hoy' limit 1), 'Primer paso', false, 0),
('{{TEST_USER_ID}}', (select id from tasks where user_id = '{{TEST_USER_ID}}' and title = 'SMOKE - Proyecto hoy' limit 1), 'Listo', true, 1);

commit;
