import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// Get all residents
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select(`
        *,
        properties:current_property_id(id, property_name, address_line1, city),
        rooms:current_room_id(id, room_number),
        staff_members:key_worker_id(id, first_name, last_name, email)
      `)
      .eq('organization_id', req.organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

// Get single resident
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select(`
        *,
        properties:current_property_id(*),
        rooms:current_room_id(*),
        staff_members:key_worker_id(*)
      `)
      .eq('id', req.params.id)
      .eq('organization_id', req.organizationId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ error: 'Failed to fetch resident' });
  }
});

// Create resident
router.post('/', async (req, res) => {
  try {
    const residentData = {
      ...req.body,
      organization_id: req.organizationId,
    };

    const { data, error } = await supabase
      .from('residents')
      .insert(residentData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create resident error:', error);
    res.status(500).json({ error: 'Failed to create resident' });
  }
});

// Update resident
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('organization_id', req.organizationId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update resident error:', error);
    res.status(500).json({ error: 'Failed to update resident' });
  }
});

// Delete resident
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', req.params.id)
      .eq('organization_id', req.organizationId);

    if (error) throw error;

    res.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Delete resident error:', error);
    res.status(500).json({ error: 'Failed to delete resident' });
  }
});

export default router;
