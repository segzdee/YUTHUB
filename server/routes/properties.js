import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';
import { success, created, notFound, error as apiError } from '../utils/apiResponse.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/properties - List all properties with nested rooms and occupancy
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req;

    // Get all properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (propertiesError) throw propertiesError;

    // Get rooms for each property
    const propertiesWithRooms = await Promise.all(
      (properties || []).map(async (property) => {
        const { data: rooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', property.id);

        if (roomsError) {
          console.error('Error fetching rooms:', roomsError);
        }

        const allRooms = rooms || [];
        const occupiedCount = allRooms.filter(r => r.is_occupied).length;
        const totalCapacity = property.total_capacity || allRooms.length;
        const occupancyRate = totalCapacity > 0
          ? Math.round((occupiedCount / totalCapacity) * 100)
          : 0;

        return {
          ...property,
          rooms: allRooms,
          occupiedCount,
          totalCapacity,
          occupancyRate,
        };
      })
    );

    return success(res, propertiesWithRooms);
  } catch (error) {
    console.error('Get properties error:', error);
    return apiError(res, 'Failed to fetch properties', 500, error.message);
  }
});

// GET /api/properties/:id - Get single property with details
router.get('/:id', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        manager:manager_id(id, first_name, last_name, email, phone)
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (propertyError) throw propertyError;
    if (!property) {
      return notFound(res, 'Property not found');
    }

    // Get rooms with current residents
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select(`
        *,
        resident:current_resident_id(id, first_name, last_name, reference_number)
      `)
      .eq('property_id', id);

    if (roomsError) throw roomsError;

    const allRooms = rooms || [];
    const occupiedCount = allRooms.filter(r => r.is_occupied).length;
    const totalCapacity = property.total_capacity || allRooms.length;
    const occupancyRate = totalCapacity > 0
      ? Math.round((occupiedCount / totalCapacity) * 100)
      : 0;

    return success(res, {
      ...property,
      rooms: allRooms,
      occupiedCount,
      totalCapacity,
      occupancyRate,
    });
  } catch (error) {
    console.error('Get property error:', error);
    return apiError(res, 'Failed to fetch property', 500, error.message);
  }
});

// POST /api/properties - Create property with auto-generated rooms
router.post('/', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const {
      property_name,
      property_type,
      address_line1,
      address_line2,
      city,
      county,
      postcode,
      country = 'United Kingdom',
      total_capacity,
      manager_id,
      contact_phone,
      contact_email,
      description,
      facilities,
      accessibility_features,
      status = 'active',
      auto_generate_rooms = true,
    } = req.body;

    // Create property
    const propertyData = {
      organization_id: organizationId,
      property_name,
      property_type,
      address_line1,
      address_line2,
      city,
      county,
      postcode,
      country,
      total_capacity: parseInt(total_capacity) || 1,
      current_occupancy: 0,
      status,
      manager_id,
      contact_phone,
      contact_email,
      description,
      facilities: facilities || [],
      accessibility_features: accessibility_features || [],
      created_by: userId,
    };

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (propertyError) throw propertyError;

    // Auto-generate rooms if requested
    const rooms = [];
    if (auto_generate_rooms && property.id) {
      const roomsToCreate = [];
      const totalUnits = parseInt(total_capacity) || 1;

      for (let i = 1; i <= totalUnits; i++) {
        roomsToCreate.push({
          property_id: property.id,
          room_number: `Room ${i}`,
          room_type: 'single',
          is_occupied: false,
          is_available: true,
          max_occupancy: 1,
          created_by: userId,
        });
      }

      const { data: createdRooms, error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsToCreate)
        .select();

      if (roomsError) {
        console.error('Error creating rooms:', roomsError);
      } else {
        rooms.push(...(createdRooms || []));
      }
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'create',
      entity_type: 'property',
      entity_id: property.id,
      description: `Created property: ${property.property_name}`,
    }).catch(() => {});

    return created(res, {
      ...property,
      rooms,
      occupiedCount: 0,
      totalCapacity: property.total_capacity,
      occupancyRate: 0,
    }, 'Property created successfully');
  } catch (error) {
    console.error('Create property error:', error);
    return apiError(res, 'Failed to create property', 500, error.message);
  }
});

// PATCH /api/properties/:id - Update property
router.patch('/:id', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const updates = req.body;

    // Remove protected fields
    delete updates.id;
    delete updates.organization_id;
    delete updates.created_at;
    delete updates.created_by;
    delete updates.current_occupancy; // Managed by system

    const { data: property, error: updateError } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!property) {
      return notFound(res, 'Property not found');
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'update',
      entity_type: 'property',
      entity_id: property.id,
      description: `Updated property: ${property.property_name}`,
    }).catch(() => {});

    return success(res, property, 'Property updated successfully');
  } catch (error) {
    console.error('Update property error:', error);
    return apiError(res, 'Failed to update property', 500, error.message);
  }
});

// PATCH /api/properties/:propertyId/rooms/:roomId/allocate - Allocate room to resident
router.patch('/:propertyId/rooms/:roomId/allocate', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { propertyId, roomId } = req.params;
    const { residentId } = req.body;

    if (!residentId) {
      return apiError(res, 'Resident ID is required', 400);
    }

    // Verify room exists and belongs to property
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, properties!inner(organization_id)')
      .eq('id', roomId)
      .eq('property_id', propertyId)
      .eq('properties.organization_id', organizationId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) {
      return notFound(res, 'Room not found');
    }

    if (room.is_occupied) {
      return apiError(res, 'Room is already occupied', 409);
    }

    // Verify resident exists
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('id, first_name, last_name, current_room_id')
      .eq('id', residentId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (residentError) throw residentError;
    if (!resident) {
      return notFound(res, 'Resident not found');
    }

    // If resident was in another room, free it up
    if (resident.current_room_id) {
      await supabase
        .from('rooms')
        .update({
          is_occupied: false,
          current_resident_id: null,
        })
        .eq('id', resident.current_room_id);

      // Decrease old property occupancy
      const { data: oldRoom } = await supabase
        .from('rooms')
        .select('property_id')
        .eq('id', resident.current_room_id)
        .single();

      if (oldRoom) {
        await supabase.rpc('decrement_property_occupancy', {
          property_id: oldRoom.property_id
        }).catch(() => {
          // Fallback: manual decrement
          supabase
            .from('properties')
            .select('current_occupancy')
            .eq('id', oldRoom.property_id)
            .single()
            .then(({ data: oldProperty }) => {
              if (oldProperty && oldProperty.current_occupancy > 0) {
                supabase
                  .from('properties')
                  .update({ current_occupancy: oldProperty.current_occupancy - 1 })
                  .eq('id', oldRoom.property_id);
              }
            });
        });
      }
    }

    // Allocate new room
    const { data: updatedRoom, error: updateRoomError } = await supabase
      .from('rooms')
      .update({
        is_occupied: true,
        current_resident_id: residentId,
      })
      .eq('id', roomId)
      .select()
      .single();

    if (updateRoomError) throw updateRoomError;

    // Update resident's current room and property
    const { error: updateResidentError } = await supabase
      .from('residents')
      .update({
        current_room_id: roomId,
        current_property_id: propertyId,
      })
      .eq('id', residentId);

    if (updateResidentError) throw updateResidentError;

    // Increase property occupancy
    const { data: property } = await supabase
      .from('properties')
      .select('current_occupancy')
      .eq('id', propertyId)
      .single();

    if (property) {
      await supabase
        .from('properties')
        .update({
          current_occupancy: (property.current_occupancy || 0) + 1,
        })
        .eq('id', propertyId);
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'allocate_room',
      entity_type: 'room',
      entity_id: roomId,
      description: `Allocated room ${room.room_number} to ${resident.first_name} ${resident.last_name}`,
    }).catch(() => {});

    return success(res, updatedRoom, 'Room allocated successfully');
  } catch (error) {
    console.error('Allocate room error:', error);
    return apiError(res, 'Failed to allocate room', 500, error.message);
  }
});

// PATCH /api/properties/:propertyId/rooms/:roomId/deallocate - Deallocate room
router.patch('/:propertyId/rooms/:roomId/deallocate', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { propertyId, roomId } = req.params;

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, properties!inner(organization_id)')
      .eq('id', roomId)
      .eq('property_id', propertyId)
      .eq('properties.organization_id', organizationId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) {
      return notFound(res, 'Room not found');
    }

    const previousResidentId = room.current_resident_id;

    // Deallocate room
    const { data: updatedRoom, error: updateError } = await supabase
      .from('rooms')
      .update({
        is_occupied: false,
        current_resident_id: null,
      })
      .eq('id', roomId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update resident if they were in this room
    if (previousResidentId) {
      await supabase
        .from('residents')
        .update({
          current_room_id: null,
          current_property_id: null,
        })
        .eq('id', previousResidentId)
        .eq('current_room_id', roomId);
    }

    // Decrease property occupancy
    const { data: property } = await supabase
      .from('properties')
      .select('current_occupancy')
      .eq('id', propertyId)
      .single();

    if (property && property.current_occupancy > 0) {
      await supabase
        .from('properties')
        .update({
          current_occupancy: property.current_occupancy - 1,
        })
        .eq('id', propertyId);
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'deallocate_room',
      entity_type: 'room',
      entity_id: roomId,
      description: `Deallocated room ${room.room_number}`,
    }).catch(() => {});

    return success(res, updatedRoom, 'Room deallocated successfully');
  } catch (error) {
    console.error('Deallocate room error:', error);
    return apiError(res, 'Failed to deallocate room', 500, error.message);
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;

    // Check if property has residents
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('property_id', id)
      .eq('is_occupied', true);

    if (rooms && rooms.length > 0) {
      return apiError(res, 'Cannot delete property with occupied rooms', 409);
    }

    // Delete associated rooms first
    await supabase
      .from('rooms')
      .delete()
      .eq('property_id', id);

    // Delete property
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (deleteError) throw deleteError;

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'delete',
      entity_type: 'property',
      entity_id: id,
      description: 'Deleted property',
    }).catch(() => {});

    return success(res, null, 'Property deleted successfully');
  } catch (error) {
    console.error('Delete property error:', error);
    return apiError(res, 'Failed to delete property', 500, error.message);
  }
});

export default router;
