/*
  # Populate Demo Data - Success
*/

DO $$
DECLARE
  org_id UUID; p1 UUID; p2 UUID; r1 UUID; r2 UUID; r3 UUID; r4 UUID;
  s1 UUID; s2 UUID; res1 UUID; res2 UUID; res3 UUID; res4 UUID;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'demo-care-org' LIMIT 1;
  IF org_id IS NOT NULL THEN
    DELETE FROM progress_notes WHERE organization_id = org_id;
    DELETE FROM support_plans WHERE organization_id = org_id;
    DELETE FROM incidents WHERE organization_id = org_id;
    DELETE FROM residents WHERE organization_id = org_id;
    DELETE FROM rooms WHERE property_id IN (SELECT id FROM properties WHERE organization_id = org_id);
    DELETE FROM staff_members WHERE organization_id = org_id;
    DELETE FROM properties WHERE organization_id = org_id;
    DELETE FROM organizations WHERE id = org_id;
  END IF;

  INSERT INTO organizations (name, display_name, slug, contact_email, contact_phone, address, organization_type, status, subscription_tier, subscription_status, max_residents, max_properties)
  VALUES ('Demo Care Organization', 'Demo Care Organization', 'demo-care-org', 'demo@yuthub.com', '+44 20 1234 5678',
    '{"street": "123 Care Street", "city": "London"}'::jsonb, 'housing_association', 'active', 'professional', 'active', 100, 10) RETURNING id INTO org_id;

  INSERT INTO properties (organization_id, property_name, address_line1, city, postcode, property_type, total_capacity, current_occupancy, status)
  VALUES (org_id, 'Sunrise House', '45 Oak Avenue', 'Manchester', 'M1 2AB', 'house', 12, 4, 'active') RETURNING id INTO p1;
  INSERT INTO properties (organization_id, property_name, address_line1, city, postcode, property_type, total_capacity, current_occupancy, status)
  VALUES (org_id, 'Maple Lodge', '78 Elm Road', 'Birmingham', 'B5 7HG', 'hostel', 8, 2, 'active') RETURNING id INTO p2;

  INSERT INTO rooms (property_id, room_number, room_type, is_occupied) VALUES (p1, '101', 'single', false) RETURNING id INTO r1;
  INSERT INTO rooms (property_id, room_number, room_type, is_occupied) VALUES (p1, '102', 'single', false) RETURNING id INTO r2;
  INSERT INTO rooms (property_id, room_number, room_type, is_occupied) VALUES (p2, 'M1', 'single', false) RETURNING id INTO r3;
  INSERT INTO rooms (property_id, room_number, room_type, is_occupied) VALUES (p2, 'M2', 'single', false) RETURNING id INTO r4;

  INSERT INTO staff_members (organization_id, first_name, last_name, email, phone, staff_role, employment_status, start_date)
  VALUES (org_id, 'Emma', 'Williams', 'emma.w@demo.com', '+44 7700 900003', 'key_worker', 'active', '2024-01-15') RETURNING id INTO s1;
  INSERT INTO staff_members (organization_id, first_name, last_name, email, phone, staff_role, employment_status, start_date)
  VALUES (org_id, 'James', 'Brown', 'james.b@demo.com', '+44 7700 900004', 'key_worker', 'active', '2024-02-01') RETURNING id INTO s2;

  INSERT INTO residents (organization_id, reference_number, first_name, last_name, date_of_birth, gender, contact_email, contact_phone,
    current_property_id, current_room_id, key_worker_id, status, support_level, risk_level, admission_date)
  VALUES (org_id, 'RES-001', 'Alice', 'Thompson', '2005-03-15', 'female', 'alice.t@email.com', '+44 7700 900101',
    p1, r1, s1, 'active', 'medium', 'low', '2024-09-01') RETURNING id INTO res1;
  INSERT INTO residents (organization_id, reference_number, first_name, last_name, date_of_birth, gender, contact_email, contact_phone,
    current_property_id, current_room_id, key_worker_id, status, support_level, risk_level, admission_date)
  VALUES (org_id, 'RES-002', 'Ben', 'Martinez', '2006-07-22', 'male', 'ben.m@email.com', '+44 7700 900102',
    p1, r2, s1, 'active', 'high', 'medium', '2024-08-15') RETURNING id INTO res2;
  INSERT INTO residents (organization_id, reference_number, first_name, last_name, date_of_birth, gender, contact_email, contact_phone,
    current_property_id, current_room_id, key_worker_id, status, support_level, risk_level, admission_date)
  VALUES (org_id, 'RES-003', 'Charlie', 'Evans', '2004-11-08', 'non_binary', 'charlie.e@email.com', '+44 7700 900103',
    p2, r3, s2, 'active', 'medium', 'low', '2024-07-10') RETURNING id INTO res3;
  INSERT INTO residents (organization_id, reference_number, first_name, last_name, date_of_birth, gender, contact_email, contact_phone,
    current_property_id, current_room_id, key_worker_id, status, support_level, risk_level, admission_date)
  VALUES (org_id, 'RES-004', 'Diana', 'Patel', '2005-05-30', 'female', 'diana.p@email.com', '+44 7700 900104',
    p2, r4, s2, 'active', 'medium', 'low', '2024-10-01') RETURNING id INTO res4;

  UPDATE rooms SET is_occupied = true, current_resident_id = res1 WHERE id = r1;
  UPDATE rooms SET is_occupied = true, current_resident_id = res2 WHERE id = r2;
  UPDATE rooms SET is_occupied = true, current_resident_id = res3 WHERE id = r3;
  UPDATE rooms SET is_occupied = true, current_resident_id = res4 WHERE id = r4;

  INSERT INTO incidents (organization_id, incident_reference, title, description, incident_type, severity, status,
    resident_id, property_id, reported_by_id, incident_date, incident_time)
  VALUES 
    (org_id, 'INC-001', 'Verbal altercation', 'Minor disagreement over TV remote.', 'behavioral', 'low', 'resolved', res2, p1, s1, CURRENT_DATE - 5, '14:30:00'),
    (org_id, 'INC-002', 'Late return', 'Returned 2 hours past curfew.', 'other', 'medium', 'resolved', res3, p2, s2, CURRENT_DATE - 3, '23:15:00'),
    (org_id, 'INC-003', 'Property damage', 'Hole in bedroom wall.', 'property_damage', 'low', 'under_investigation', res2, p1, s1, CURRENT_DATE - 2, '10:00:00');

  INSERT INTO support_plans (organization_id, resident_id, plan_type, goals, start_date, review_date, status, created_by_id)
  VALUES 
    (org_id, res1, 'ongoing', '[{"goal": "Cook independently"}]'::jsonb, '2024-09-01', '2025-01-01', 'active', s1),
    (org_id, res2, 'ongoing', '[{"goal": "Anger management"}]'::jsonb, '2024-08-15', '2024-12-15', 'active', s1),
    (org_id, res3, 'ongoing', '[{"goal": "Part-time job"}]'::jsonb, '2024-07-10', '2025-02-10', 'active', s1),
    (org_id, res4, 'ongoing', '[{"goal": "Attend college"}]'::jsonb, '2024-10-01', '2025-04-01', 'active', s2);

  INSERT INTO progress_notes (organization_id, resident_id, author_id, title, note_type, note_date, content)
  VALUES 
    (org_id, res1, s1, 'Kitchen Skills', 'daily', CURRENT_DATE - 2, 'Cooked spaghetti independently.'),
    (org_id, res1, s1, 'Budget Management', 'weekly', CURRENT_DATE - 7, 'Tracked spending for 3 weeks.'),
    (org_id, res2, s1, 'Education Progress', 'daily', CURRENT_DATE - 1, 'Attending classes regularly.'),
    (org_id, res2, s1, 'Behavior Improvement', 'daily', CURRENT_DATE - 4, 'Used de-escalation techniques.'),
    (org_id, res3, s1, 'Employment Success', 'achievement', CURRENT_DATE - 10, 'Started working at cafe!'),
    (org_id, res3, s1, 'Savings Progress', 'weekly', CURRENT_DATE - 3, 'Saved £300 towards goal.'),
    (org_id, res4, s2, 'Social Development', 'achievement', CURRENT_DATE - 5, 'Joined youth club, made friends.');
END $$;
