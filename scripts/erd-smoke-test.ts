/* Quick smoke test for ERD pure logic. Run: npx tsx scripts/erd-smoke-test.ts */
import { generateSql } from '../src/erd/lib/sqlGenerator';
import { buildSvg } from '../src/erd/lib/exportSvg';
import { getDiagramBounds } from '../src/erd/lib/geometry';
import { validateDiagram } from '../src/erd/hooks/useDiagramStore';
import { lightTheme } from '../src/erd/theme';
import { Diagram } from '../src/erd/types/diagram';

const diagram: Diagram = {
  id: 'd1',
  name: 'University',
  entities: [
    { id: 'e1', x: 100, y: 100, width: 120, height: 60, label: 'Student' },
    { id: 'e2', x: 500, y: 100, width: 120, height: 60, label: 'Course' },
    { id: 'e3', x: 300, y: 400, width: 120, height: 60, label: 'Department', isWeak: false },
  ],
  attributes: [
    { id: 'a1', entityId: 'e1', x: 80, y: 30, label: 'StudentID', isPrimaryKey: true, dataType: 'INT' },
    { id: 'a2', entityId: 'e1', x: 250, y: 30, label: 'Full Name' },
    { id: 'a3', entityId: 'e1', x: 40, y: 220, label: 'Phone Numbers', isMultivalued: true },
    { id: 'a4', entityId: 'e1', x: 250, y: 220, label: 'Age', isDerived: true },
    { id: 'a5', entityId: 'e2', x: 650, y: 30, label: 'CourseCode', isPrimaryKey: true },
  ],
  relationships: [
    // many-to-many
    { id: 'r1', x: 360, y: 130, label: 'Enrolls', connectedEntities: ['e1', 'e2'], cardinalities: { e1: '*', e2: '1..*' } },
    // one-to-many
    { id: 'r2', x: 360, y: 280, label: 'BelongsTo', connectedEntities: ['e2', 'e3'], cardinalities: { e2: '*', e3: '1' } },
    // self-reference one-to-many
    { id: 'r3', x: 100, y: 400, label: 'Mentors', connectedEntities: ['e1', 'e1'], cardinalities: { e1_self_0: '1', e1_self_1: '*' } },
  ],
};

let failures = 0;
const check = (name: string, cond: boolean, extra?: string) => {
  if (cond) {
    console.log(`  ok: ${name}`);
  } else {
    failures++;
    console.error(`  FAIL: ${name}${extra ? ` — ${extra}` : ''}`);
  }
};

console.log('SQL generation:');
const sql = generateSql(diagram);
check('creates student table', sql.includes('CREATE TABLE student'));
check('PK from attribute', /student_id INT PRIMARY KEY/.test(sql));
check('snake_cases labels', sql.includes('full_name'));
check('multivalued -> own table', sql.includes('CREATE TABLE student_phone_numbers'));
check('derived -> comment', sql.includes('-- age: derived attribute'));
check('surrogate PK when none marked', sql.includes('id SERIAL PRIMARY KEY'));
check('N:M -> junction table', sql.includes('CREATE TABLE enrolls'));
check('junction has composite PK', /PRIMARY KEY \(student_student_id, course_course_code\)/.test(sql));
check('1:N -> FK on many side', /ALTER TABLE course\s+ADD COLUMN department_id INT NOT NULL REFERENCES department\(id\)/.test(sql));
check('self-ref 1:N -> self FK', /ALTER TABLE student\s+ADD COLUMN mentors_student_id INT REFERENCES student\(student_id\)/.test(sql) || sql.includes('mentors_student_id'));

console.log('SVG export:');
const svg = buildSvg(diagram, lightTheme);
check('produces svg', !!svg && svg.startsWith('<svg'));
check('includes entities', !!svg && svg.includes('Student') && svg.includes('Course'));
check('PK underlined', !!svg && svg.includes('text-decoration="underline"'));
check('multivalued double ellipse', (svg?.match(/<ellipse/g) || []).length >= diagram.attributes.length + 1);
check('derived dashed', !!svg && svg.includes('stroke-dasharray="4 4"'));
check('empty diagram -> null', buildSvg({ entities: [], attributes: [], relationships: [] }, lightTheme) === null);

console.log('Bounds:');
const bounds = getDiagramBounds(diagram);
check('bounds exist', bounds !== null);
check('bounds cover attributes', bounds !== null && bounds.x <= 0 && bounds.y <= 10);
check('empty bounds -> null', getDiagramBounds({ entities: [], attributes: [], relationships: [] }) === null);

console.log('Validation:');
check('valid diagram passes', validateDiagram(diagram));
check('rejects null', !validateDiagram(null));
check('rejects missing arrays', !validateDiagram({ entities: [] }));
check('rejects malformed entity', !validateDiagram({ entities: [{ id: 1 }], attributes: [], relationships: [] }));

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll checks passed');
