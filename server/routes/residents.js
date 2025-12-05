import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { createResidentSchema, updateResidentSchema, listResidentsQuerySchema } from '../validators/schemas.js';
import { success, created, notFound, error as apiError } from '../utils/apiResponse.js';
import { emitResidentCreated, emitResidentUpdated } from '../websocket.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/residents - List residents with pagination and filtering
router.get('/', validateQuery(listResidentsQuerySchema), async (req, res) => {
  try {
    const { organizationId } = req;
    const {
      page = 1,
      limit = 20,
      status,
      search,
      propertyId,
      keyWorkerId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('residents')
      .select(`
        *,
        properties:current_property_id(id, property_name, postcode),
        rooms:current_room_id(id, room_number),
        staff_members:key_worker_id(id, first_name, last_name)
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Filter by status (default to active)
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['pending', 'active', 'on_leave']);
    }

    // Filter by property
    if (propertyId) {
      query = query.eq('current_property_id', propertyId);
    }

    // Filter by key worker
    if (keyWorkerId) {
      query = query.eq('key_worker_id', keyWorkerId);
    }

    // Full-text search on name and email
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,contact_email.ilike.%${search}%,reference_number.ilike.%${search}%`);
    }

    // Sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: residents, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    return success(res, residents || [], null, 200, {
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages
      }
    });
  } catch (error) {
    console.error('List residents error:', error);
    return apiError(res, 'Failed to fetch residents', 500, error.message);
  }
});

// GET /api/residents/:id - Get resident details
router.get('/:id', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: resident, error } = await supabase
      .from('residents')
      .select(`
        *,
        properties:current_property_id(id, property_name, address_line1, city, postcode),
        rooms:current_room_id(id, room_number, floor_number),
        key_worker:key_worker_id(id, first_name, last_name, email, phone),
        support_plans(id, plan_type, status, start_date, review_date, overall_progress),
        incidents(id, title, severity, status, incident_date)
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    if (!resident) {
      return notFound(res, 'Resident not found');
    }

    return success(res, resident, 'Resident retrieved successfully');
  } catch (error) {
    console.error('Get resident error:', error);
    return apiError(res, 'Failed to fetch resident', 500, error.message);
  }
});

// POST /api/residents - Create resident (intake)
router.post('/', requireRole(['owner', 'admin', 'manager']), validateBody(createResidentSchema), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { personalInfo, housingDetails, supportNeeds, emergencyContacts } = req.body;

    // Generate unique reference number (format: RES-YYYYMMDD-XXXX)
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const reference_number = `RES-${datePart}-${randomPart}`;

    // Prepare resident data according to schema
    const residentData = {
      organization_id: organizationId,
      reference_number,

      // Personal info
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      preferred_name: personalInfo.preferredName,
      date_of_birth: personalInfo.dateOfBirth, // Expected in YYYY-MM-DD format from backend
      gender: personalInfo.gender,
      nationality: personalInfo.nationality,
      ethnicity: personalInfo.ethnicity,
      primary_language: personalInfo.primaryLanguage || 'English',
      contact_phone: personalInfo.phone,
      contact_email: personalInfo.email,

      // Housing details
      current_property_id: housingDetails.propertyId || null,
      current_room_id: housingDetails.roomId || null,
      admission_date: housingDetails.moveInDate || null,

      // Support needs
      key_worker_id: supportNeeds.keyWorkerId || null,
      risk_level: supportNeeds.riskLevel,
      support_level: supportNeeds.supportLevel,
      support_needs: supportNeeds.categories || [],

      // Emergency contacts
      emergency_contacts: emergencyContacts || [],

      // Status
      status: 'active',
      created_by: userId,
    };

    // Insert resident
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .insert(residentData)
      .select(`
        *,
        properties:current_property_id(id, property_name),
        rooms:current_room_id(id, room_number),
        key_worker:key_worker_id(id, first_name, last_name)
      `)
      .single();

    if (residentError) throw residentError;

    // Create initial support plan if requested
    if (supportNeeds.createSupportPlan && resident.id) {
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + 28); // 4 weeks default review

      const supportPlanData = {
        organization_id: organizationId,
        resident_id: resident.id,
        plan_type: 'initial',
        start_date: housingDetails.moveInDate || new Date().toISOString().split('T')[0],
        review_date: reviewDate.toISOString().split('T')[0],
        next_review_date: reviewDate.toISOString().split('T')[0],
        status: 'active',
        goals: [], // Empty initially, to be filled via support plans module
        created_by: userId,
        created_by_id: supportNeeds.keyWorkerId || null,
      };

      await supabase.from('support_plans').insert(supportPlanData);
    }

    // Update room occupancy if room assigned
    if (housingDetails.roomId) {
      await supabase
        .from('rooms')
        .update({
          is_occupied: true,
          current_resident_id: resident.id,
        })
        .eq('id', housingDetails.roomId);

      // Update property occupancy count
      if (housingDetails.propertyId) {
        const { data: property } = await supabase
          .from('properties')
          .select('current_occupancy')
          .eq('id', housingDetails.propertyId)
          .single();

        if (property) {
          await supabase
            .from('properties')
            .update({
              current_occupancy: (property.current_occupancy || 0) + 1,
            })
            .eq('id', housingDetails.propertyId);
        }
      }
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'create',
      entity_type: 'resident',
      entity_id: resident.id,
      description: `Created resident: ${resident.first_name} ${resident.last_name}`,
    }).catch(() => {}); // Silently fail if team_activity_log doesn't exist

    // Emit WebSocket event
    try {
      emitResidentCreated(organizationId, resident);
    } catch (wsError) {
      // WebSocket errors shouldn't fail the request
      console.warn('WebSocket emission failed:', wsError);
    }

    return created(res, resident, 'Resident created successfully');
  } catch (error) {
    console.error('Create resident error:', error);
    return apiError(res, 'Failed to create resident', 500, error.message);
  }
});

// PATCH /api/residents/:id - Update resident
router.patch('/:id', requireRole(['owner', 'admin', 'manager', 'staff']), validateBody(updateResidentSchema), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: existingResident, error: fetchError } = await supabase
      .from('residents')
      .select('id, first_name, last_name')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingResident) {
      return notFound(res, 'Resident not found');
    }

    // Remove protected fields
    delete updates.id;
    delete updates.organization_id;
    delete updates.reference_number;
    delete updates.created_at;
    delete updates.created_by;

    const { data: resident, error: updateError } = await supabase
      .from('residents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Audit logging
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'update',
      entity_type: 'resident',
      entity_id: resident.id,
      description: `Updated resident: ${resident.first_name} ${resident.last_name}`,
      metadata: { updated_fields: Object.keys(updates) },
    }).catch(() => {});

    // Emit WebSocket event
    try {
      emitResidentUpdated(organizationId, resident);
    } catch (wsError) {
      console.warn('WebSocket emission failed:', wsError);
    }

    return success(res, resident, 'Resident updated successfully');
  } catch (error) {
    console.error('Update resident error:', error);
    return apiError(res, 'Failed to update resident', 500, error.message);
  }
});

// PATCH /api/residents/:id/archive - Archive resident (soft delete)
router.patch('/:id/archive', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const { reason } = req.body;

    const { data: resident, error } = await supabase
      .from('residents')
      .update({
        status: 'discharged',
        discharge_date: new Date().toISOString().split('T')[0],
        discharge_reason: reason || 'Archived',
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select('id, first_name, last_name')
      .single();

    if (error) throw error;

    if (!resident) {
      return notFound(res, 'Resident not found');
    }

    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'archive',
      entity_type: 'resident',
      entity_id: resident.id,
      description: `Archived resident: ${resident.first_name} ${resident.last_name}`,
    }).catch(() => {});

    return success(res, resident, 'Resident archived successfully');
  } catch (error) {
    console.error('Archive resident error:', error);
    return apiError(res, 'Failed to archive resident', 500, error.message);
  }
});

// GET /api/residents/:id/support-plans - Get resident's support plans
router.get('/:id/support-plans', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: plans, error } = await supabase
      .from('support_plans')
      .select('*, support_plan_goals(*)')
      .eq('resident_id', id)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ plans: plans || [] });
  } catch (error) {
    console.error('Get support plans error:', error);
    res.status(500).json({ error: 'Failed to fetch support plans' });
  }
});

// GET /api/residents/:id/incidents - Get resident's incidents
router.get('/:id/incidents', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: incidents, error} = await supabase
      .from('incidents')
      .select('*')
      .eq('resident_id', id)
      .eq('organization_id', organizationId)
      .order('incident_date', { ascending: false });

    if (error) throw error;

    res.json({ incidents: incidents || [] });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/residents/:id/progress - Get progress history
router.get('/:id/progress', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: progress, error } = await supabase
      .from('progress_notes')
      .select('*')
      .eq('resident_id', id)
      .eq('organization_id', organizationId)
      .order('note_date', { ascending: false });

    if (error) throw error;

    res.json({ progress: progress || [] });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
