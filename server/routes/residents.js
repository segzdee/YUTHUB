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
      page,
      limit,
      status,
      search,
      propertyId,
      keyWorkerId,
      sortBy,
      sortOrder
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('residents')
      .select('*, properties(id, property_name), room_allocations(id, room_number, status)', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('is_deleted', false);

    if (status) {
      query = query.eq('status', status);
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    if (keyWorkerId) {
      query = query.eq('key_worker_id', keyWorkerId);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

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
        properties(id, property_name, address_line1, city, postcode),
        rooms(id, room_number, floor),
        support_plans(id, plan_name, status, start_date, review_date),
        incidents(id, title, severity, status, incident_date)
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .eq('is_deleted', false)
      .single();

    if (error || !resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json({ resident });
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ error: 'Failed to fetch resident' });
  }
});

// POST /api/residents - Create resident (intake)
router.post('/', requireRole(['owner', 'admin', 'manager']), validateBody(createResidentSchema), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const validatedData = req.body;

    // Flatten multi-step form data if provided
    const residentData = {
      ...validatedData.personalInfo,
      ...validatedData.housingDetails,
      ...validatedData.supportNeeds,
      ...validatedData.emergencyContacts,
      ...validatedData,
      organization_id: organizationId,
      created_by: userId,
      status: validatedData.status || 'active',
    };

    // Remove nested objects
    delete residentData.personalInfo;
    delete residentData.housingDetails;
    delete residentData.supportNeeds;
    delete residentData.emergencyContacts;
    delete residentData.create_support_plan;
    delete residentData.support_plan_name;

    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .insert(residentData)
      .select()
      .single();

    if (residentError) throw residentError;

    // Create initial support plan if requested
    if (validatedData.supportNeeds?.create_support_plan && resident.id) {
      const supportPlanData = {
        organization_id: organizationId,
        resident_id: resident.id,
        plan_name: validatedData.supportNeeds.support_plan_name || `Initial Support Plan - ${resident.first_name} ${resident.last_name}`,
        start_date: resident.admission_date || new Date().toISOString().split('T')[0],
        review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        key_worker_id: resident.key_worker_id,
        support_hours_per_week: validatedData.supportNeeds.support_hours_per_week,
        created_by: userId,
      };

      await supabase.from('support_plans').insert(supportPlanData);
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'create',
      entity_type: 'resident',
      entity_id: resident.id,
      description: `Created resident: ${resident.first_name} ${resident.last_name}`,
    });

    // Emit WebSocket event
    emitResidentCreated(organizationId, resident);

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
      .eq('is_deleted', false)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingResident) {
      return notFound(res, 'Resident not found');
    }

    // Remove protected fields
    delete updates.id;
    delete updates.organization_id;
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
    });

    // Emit WebSocket event
    emitResidentUpdated(organizationId, resident);

    return success(res, resident, 'Resident updated successfully');
  } catch (error) {
    console.error('Update resident error:', error);
    return apiError(res, 'Failed to update resident', 500, error.message);
  }
});

// DELETE /api/residents/:id - Soft delete resident
router.delete('/:id', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;

    const { data: resident, error } = await supabase
      .from('residents')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'delete',
      entity_type: 'resident',
      entity_id: resident.id,
      description: `Deleted resident: ${resident.first_name} ${resident.last_name}`,
    });

    res.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Delete resident error:', error);
    res.status(500).json({ error: 'Failed to delete resident' });
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
