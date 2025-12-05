import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';
import { success, created, notFound, error as apiError } from '../utils/apiResponse.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/support-plans - List all support plans
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req;
    const { residentId, status } = req.query;

    let query = supabase
      .from('support_plans')
      .select(`
        *,
        resident:resident_id(id, first_name, last_name, reference_number),
        key_worker:created_by_id(id, first_name, last_name)
      `)
      .eq('organization_id', organizationId);

    if (residentId) query = query.eq('resident_id', residentId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate progress for each plan
    const plansWithProgress = (data || []).map(plan => {
      const goals = plan.goals || [];
      const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0);
      const avgProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;
      const achievedGoals = goals.filter(g => g.status === 'achieved').length;

      return {
        ...plan,
        calculatedProgress: avgProgress,
        totalGoals: goals.length,
        achievedGoals,
      };
    });

    return success(res, plansWithProgress);
  } catch (error) {
    console.error('List support plans error:', error);
    return apiError(res, 'Failed to fetch support plans', 500, error.message);
  }
});

// GET /api/support-plans/:id - Get plan details with goals
router.get('/:id', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data: plan, error } = await supabase
      .from('support_plans')
      .select(`
        *,
        resident:resident_id(
          id,
          first_name,
          last_name,
          reference_number,
          date_of_birth,
          current_property_id,
          key_worker_id
        ),
        key_worker:created_by_id(id, first_name, last_name, email),
        reviewer:reviewed_by_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    if (!plan) {
      return notFound(res, 'Support plan not found');
    }

    // Get progress history (progress notes related to this plan)
    const { data: progressHistory } = await supabase
      .from('progress_notes')
      .select('*')
      .eq('support_plan_id', id)
      .order('note_date', { ascending: false })
      .limit(20);

    // Calculate overall progress
    const goals = plan.goals || [];
    const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0);
    const avgProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;
    const achievedGoals = goals.filter(g => g.status === 'achieved').length;

    return success(res, {
      ...plan,
      calculatedProgress: avgProgress,
      totalGoals: goals.length,
      achievedGoals,
      progressHistory: progressHistory || [],
    });
  } catch (error) {
    console.error('Get support plan error:', error);
    return apiError(res, 'Failed to fetch support plan', 500, error.message);
  }
});

// POST /api/support-plans - Create support plan with SMART goals
router.post('/', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const {
      residentId,
      planType = 'initial',
      startDate,
      reviewScheduleWeeks = 4,
      goals = [],
      strengths = [],
      risks = [],
    } = req.body;

    // Validate resident
    const { data: resident } = await supabase
      .from('residents')
      .select('id, first_name, last_name, key_worker_id')
      .eq('id', residentId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (!resident) {
      return notFound(res, 'Resident not found');
    }

    // Calculate review date
    const start = startDate ? new Date(startDate) : new Date();
    const reviewDate = new Date(start);
    reviewDate.setDate(reviewDate.getDate() + (reviewScheduleWeeks * 7));

    // Prepare goals with IDs and initial status
    const preparedGoals = goals.map((goal, index) => ({
      id: `goal_${Date.now()}_${index}`,
      category: goal.category,
      title: goal.title,
      description: goal.description,
      specific: goal.specific || goal.title,
      measurable: goal.measurable || '',
      achievable: goal.achievable || '',
      relevant: goal.relevant || '',
      timeBound: goal.timeBound || reviewDate.toISOString().split('T')[0],
      progress: 0,
      status: 'not_started',
      evidence: [],
      notes: [],
      createdAt: new Date().toISOString(),
    }));

    const planData = {
      organization_id: organizationId,
      resident_id: residentId,
      plan_type: planType,
      start_date: start.toISOString().split('T')[0],
      review_date: reviewDate.toISOString().split('T')[0],
      next_review_date: reviewDate.toISOString().split('T')[0],
      status: 'active',
      goals: preparedGoals,
      strengths,
      risks,
      overall_progress: 'not_started',
      created_by: userId,
      created_by_id: resident.key_worker_id,
    };

    const { data: plan, error: planError } = await supabase
      .from('support_plans')
      .insert(planData)
      .select(`
        *,
        resident:resident_id(id, first_name, last_name, reference_number)
      `)
      .single();

    if (planError) throw planError;

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'create',
      entity_type: 'support_plan',
      entity_id: plan.id,
      description: `Created ${planType} support plan for ${resident.first_name} ${resident.last_name}`,
    }).catch(() => {});

    return created(res, plan, 'Support plan created successfully');
  } catch (error) {
    console.error('Create support plan error:', error);
    return apiError(res, 'Failed to create support plan', 500, error.message);
  }
});

// PATCH /api/support-plans/:id - Update plan
router.patch('/:id', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const updates = req.body;

    // Remove protected fields
    delete updates.id;
    delete updates.organization_id;
    delete updates.resident_id;
    delete updates.created_at;
    delete updates.created_by;

    const { data: plan, error } = await supabase
      .from('support_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    if (!plan) {
      return notFound(res, 'Support plan not found');
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'update',
      entity_type: 'support_plan',
      entity_id: plan.id,
      description: 'Updated support plan',
    }).catch(() => {});

    return success(res, plan, 'Support plan updated successfully');
  } catch (error) {
    console.error('Update support plan error:', error);
    return apiError(res, 'Failed to update support plan', 500, error.message);
  }
});

// PATCH /api/support-plans/:planId/goals/:goalId/progress - Update goal progress
router.patch('/:planId/goals/:goalId/progress', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { planId, goalId } = req.params;
    const { progress, notes, evidence } = req.body;

    // Get current plan
    const { data: plan, error: fetchError } = await supabase
      .from('support_plans')
      .select('*')
      .eq('id', planId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!plan) {
      return notFound(res, 'Support plan not found');
    }

    // Find and update the specific goal
    const goals = plan.goals || [];
    const goalIndex = goals.findIndex(g => g.id === goalId);

    if (goalIndex === -1) {
      return notFound(res, 'Goal not found in this support plan');
    }

    const updatedGoal = {
      ...goals[goalIndex],
      progress: parseInt(progress),
      status: parseInt(progress) === 100 ? 'achieved' :
              parseInt(progress) >= 75 ? 'on_track' :
              parseInt(progress) >= 50 ? 'in_progress' :
              parseInt(progress) > 0 ? 'some_progress' : 'not_started',
      lastUpdated: new Date().toISOString(),
    };

    // Add notes if provided
    if (notes) {
      updatedGoal.notes = [
        ...(updatedGoal.notes || []),
        {
          date: new Date().toISOString(),
          userId,
          content: notes,
        },
      ];
    }

    // Add evidence if provided
    if (evidence) {
      updatedGoal.evidence = [
        ...(updatedGoal.evidence || []),
        {
          date: new Date().toISOString(),
          userId,
          description: evidence,
        },
      ];
    }

    goals[goalIndex] = updatedGoal;

    // Calculate overall progress
    const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / goals.length);
    const overallProgress =
      avgProgress === 100 ? 'achieved' :
      avgProgress >= 75 ? 'good_progress' :
      avgProgress >= 50 ? 'some_progress' :
      avgProgress > 0 ? 'minimal' : 'not_started';

    // Update plan with modified goals and overall progress
    const { data: updatedPlan, error: updateError } = await supabase
      .from('support_plans')
      .update({
        goals,
        overall_progress: overallProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'update_goal_progress',
      entity_type: 'support_plan',
      entity_id: planId,
      description: `Updated progress for goal: ${updatedGoal.title}`,
      metadata: { goalId, progress, status: updatedGoal.status },
    }).catch(() => {});

    // If goal achieved, could emit celebration notification here
    if (updatedGoal.status === 'achieved') {
      console.log(`🎉 Goal achieved: ${updatedGoal.title}`);
      // TODO: Implement notification system for celebrations
    }

    return success(res, {
      plan: updatedPlan,
      goal: updatedGoal,
    }, 'Goal progress updated successfully');
  } catch (error) {
    console.error('Update goal progress error:', error);
    return apiError(res, 'Failed to update goal progress', 500, error.message);
  }
});

// POST /api/support-plans/:planId/goals - Add new goal to existing plan
router.post('/:planId/goals', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { planId } = req.params;
    const goalData = req.body;

    // Get current plan
    const { data: plan, error: fetchError } = await supabase
      .from('support_plans')
      .select('*')
      .eq('id', planId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!plan) {
      return notFound(res, 'Support plan not found');
    }

    // Create new goal
    const newGoal = {
      id: `goal_${Date.now()}_${(plan.goals || []).length}`,
      category: goalData.category,
      title: goalData.title,
      description: goalData.description,
      specific: goalData.specific || goalData.title,
      measurable: goalData.measurable || '',
      achievable: goalData.achievable || '',
      relevant: goalData.relevant || '',
      timeBound: goalData.timeBound || plan.review_date,
      progress: 0,
      status: 'not_started',
      evidence: [],
      notes: [],
      createdAt: new Date().toISOString(),
    };

    // Add goal to plan
    const updatedGoals = [...(plan.goals || []), newGoal];

    const { data: updatedPlan, error: updateError } = await supabase
      .from('support_plans')
      .update({
        goals: updatedGoals,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'add_goal',
      entity_type: 'support_plan',
      entity_id: planId,
      description: `Added new goal: ${newGoal.title}`,
    }).catch(() => {});

    return created(res, {
      plan: updatedPlan,
      goal: newGoal,
    }, 'Goal added successfully');
  } catch (error) {
    console.error('Add goal error:', error);
    return apiError(res, 'Failed to add goal', 500, error.message);
  }
});

// DELETE /api/support-plans/:planId/goals/:goalId - Remove goal from plan
router.delete('/:planId/goals/:goalId', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { planId, goalId } = req.params;

    // Get current plan
    const { data: plan, error: fetchError } = await supabase
      .from('support_plans')
      .select('*')
      .eq('id', planId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!plan) {
      return notFound(res, 'Support plan not found');
    }

    // Remove goal
    const updatedGoals = (plan.goals || []).filter(g => g.id !== goalId);

    const { error: updateError } = await supabase
      .from('support_plans')
      .update({
        goals: updatedGoals,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'remove_goal',
      entity_type: 'support_plan',
      entity_id: planId,
      description: 'Removed goal from support plan',
    }).catch(() => {});

    return success(res, null, 'Goal removed successfully');
  } catch (error) {
    console.error('Remove goal error:', error);
    return apiError(res, 'Failed to remove goal', 500, error.message);
  }
});

export default router;
