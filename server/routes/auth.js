import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // If organization name provided, create organization
    if (organizationName) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          display_name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
          organization_type: 'housing_association',
          status: 'active',
          subscription_tier: 'trial',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (!orgError && org) {
        // Link user to organization
        await supabase.from('user_organizations').insert({
          user_id: authData.user.id,
          organization_id: org.id,
          role: 'owner',
          status: 'active',
        });
      }
    }

    res.status(201).json({
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out
router.post('/signout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/user', authenticateUser, async (req, res) => {
  try {
    // Get user organization info
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select(`
        organization_id,
        role,
        status,
        organizations (
          name,
          display_name,
          subscription_tier,
          subscription_status,
          max_residents,
          max_properties
        )
      `)
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.user_metadata?.first_name,
      lastName: req.user.user_metadata?.last_name,
      name: req.user.user_metadata?.name,
      role: userOrg?.role || 'user',
      organizationId: userOrg?.organization_id,
      subscriptionTier: userOrg?.organizations?.subscription_tier,
      subscriptionStatus: userOrg?.organizations?.subscription_status,
      maxResidents: userOrg?.organizations?.max_residents,
      maxProperties: userOrg?.organizations?.max_properties,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      session: data.session,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
