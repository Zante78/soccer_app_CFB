import { supabase, handleDatabaseError } from './database';
import { Team, TeamMembership } from '../types/core/team';
import { EventBus } from './events/EventBus';
import { uploadFileToSupabaseStorage } from '../utils/storageUtils';

export class TeamService {
  private static instance: TeamService;
  private eventBus: EventBus;
  
  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  private isValidUUID(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  }

  private handleTeamError(error: any): never {
    if (error.code === '23505') {
      throw new Error('Ein Team mit diesem Namen existiert bereits');
    }
    if (error.code === '23503') {
      throw new Error('Ungültige Referenz (z.B. nicht existierendes Team)');
    }
    if (error.code === '42501') {
      throw new Error('Sie haben keine Berechtigung für diese Aktion');
    }
    throw handleDatabaseError(error);
  }

  private handleMembershipError(error: any): never {
    if (error.code === '23505') {
      throw new Error('Spieler ist bereits Mitglied eines Teams');
    }
    if (error.code === '23503') {
      throw new Error('Team oder Spieler existiert nicht');
    }
    if (error.code === '42501' || error.code === 'P0001') {
      throw new Error('Sie haben keine Berechtigung, Teammitglieder zu verwalten');
    }
    if (error.message?.includes('Player already has an active team membership')) {
      throw new Error('Spieler ist bereits Mitglied eines anderen Teams');
    }
    throw handleDatabaseError(error);
  }

  async getTeams(): Promise<Team[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw this.handleTeamError(err);
    }
  }

  async createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    try {
      if (!team.name?.trim()) {
        throw new Error('Teamname ist erforderlich');
      }
      if (!team.category?.trim()) {
        throw new Error('Kategorie ist erforderlich');
      }
      if (!team.season?.trim()) {
        throw new Error('Saison ist erforderlich');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: team.name.trim(),
          category: team.category.trim(),
          season: team.season.trim(),
          photo_url: team.photo_url,
          colors: team.colors,
          venue: team.venue?.trim(),
          training_time: team.trainingTime?.trim(),
          contact_email: team.contactEmail?.trim(),
          contact_phone: team.contactPhone?.trim(),
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      this.eventBus.emit('team:created', data);
      return data;
    } catch (err) {
      throw this.handleTeamError(err);
    }
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    try {
      if (!this.isValidUUID(id)) {
        throw new Error('Ungültige Team ID');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      const updateData: any = {};
      
      if (updates.name !== undefined) {
        if (!updates.name.trim()) throw new Error('Teamname darf nicht leer sein');
        updateData.name = updates.name.trim();
      }
      if (updates.category !== undefined) {
        if (!updates.category.trim()) throw new Error('Kategorie darf nicht leer sein');
        updateData.category = updates.category.trim();
      }
      if (updates.season !== undefined) {
        if (!updates.season.trim()) throw new Error('Saison darf nicht leer sein');
        updateData.season = updates.season.trim();
      }
      
      if (updates.photo_url !== undefined) updateData.photo_url = updates.photo_url;
      if (updates.colors !== undefined) updateData.colors = updates.colors;
      if (updates.venue !== undefined) updateData.venue = updates.venue.trim();
      if (updates.trainingTime !== undefined) updateData.training_time = updates.trainingTime.trim();
      
      if (updates.contactEmail !== undefined) {
        if (updates.contactEmail && !this.isValidEmail(updates.contactEmail)) {
          throw new Error('Ungültige Email-Adresse');
        }
        updateData.contact_email = updates.contactEmail.trim();
      }
      if (updates.contactPhone !== undefined) {
        if (updates.contactPhone && !this.isValidPhone(updates.contactPhone)) {
          throw new Error('Ungültige Telefonnummer');
        }
        updateData.contact_phone = updates.contactPhone.trim();
      }

      const { data: updatedTeam, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      this.eventBus.emit('team:updated', updatedTeam);
      return updatedTeam;
    } catch (err) {
      throw this.handleTeamError(err);
    }
  }

  async deleteTeam(id: string): Promise<void> {
    try {
      if (!this.isValidUUID(id)) {
        throw new Error('Ungültige Team ID');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Delete team photo if exists
      const { data: teamData } = await supabase
        .from('teams')
        .select('photo_url')
        .eq('id', id)
        .single();

      if (teamData?.photo_url) {
        const fileName = teamData.photo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('teams')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      this.eventBus.emit('team:deleted', id);
    } catch (err) {
      throw this.handleTeamError(err);
    }
  }

  async getTeamMembers(teamId: string): Promise<TeamMembership[]> {
    try {
      if (!this.isValidUUID(teamId)) {
        throw new Error('Ungültige Team ID');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // First check if user has permission to view team memberships
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.warn('Could not fetch user profile:', userError);
        // If we can't get user profile, return empty array instead of throwing
        return [];
      }

      // Check if user has required role
      const allowedRoles = ['admin', 'coach', 'manager'];
      if (!userProfile?.role || !allowedRoles.includes(userProfile.role)) {
        // User doesn't have permission, return empty array instead of throwing
        console.warn('User does not have permission to view team memberships');
        return [];
      }

      const { data, error } = await supabase
        .from('team_memberships')
        .select(`
          id,
          team_id,
          player_id,
          role,
          start_date,
          end_date,
          created_at,
          updated_at,
          player:players (
            id,
            first_name,
            last_name,
            position,
            photo_url
          )
        `)
        .eq('team_id', teamId)
        .is('end_date', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        // If it's a permission error, return empty array instead of throwing
        if (error.code === 'P0001' || error.code === '42501') {
          console.warn('Permission denied for team memberships:', error.message);
          return [];
        }
        throw error;
      }
      
      return data || [];
    } catch (err) {
      // For permission errors, return empty array instead of throwing
      if (err instanceof Error && (err.message.includes('Berechtigung') || err.message.includes('permission'))) {
        console.warn('Permission error in getTeamMembers:', err.message);
        return [];
      }
      throw this.handleMembershipError(err);
    }
  }

  async addTeamMember(teamId: string, playerId: string, role: string): Promise<TeamMembership> {
    try {
      if (!this.isValidUUID(teamId)) {
        throw new Error('Ungültige Team ID');
      }

      if (!this.isValidUUID(playerId)) {
        throw new Error('Ungültige Spieler ID');
      }

      if (!['player', 'captain', 'viceCaptain'].includes(role)) {
        throw new Error('Ungültige Rolle');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Check user permissions first
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.role) {
        throw new Error('Benutzerrolle konnte nicht ermittelt werden');
      }

      const allowedRoles = ['admin', 'coach', 'manager'];
      if (!allowedRoles.includes(userProfile.role)) {
        throw new Error('Sie haben keine Berechtigung, Teammitglieder zu verwalten');
      }

      // Check if player already has an active membership
      const { data: existingMemberships, error: checkError } = await supabase
        .from('team_memberships')
        .select('id, team_id')
        .eq('player_id', playerId)
        .is('end_date', null);
      
      if (checkError) throw checkError;

      // If player has an active membership in another team, end it
      if (existingMemberships && existingMemberships.length > 0) {
        const existingMembership = existingMemberships[0];
        
        // If player is already in this team, just update the role
        if (existingMembership.team_id === teamId) {
          const { data: updatedMembership, error: updateError } = await supabase
            .from('team_memberships')
            .update({ role })
            .eq('id', existingMembership.id)
            .select()
            .single();
          
          if (updateError) throw updateError;
          return updatedMembership;
        }
        
        // End the current membership
        const { error: endError } = await supabase
          .from('team_memberships')
          .update({ end_date: new Date().toISOString().split('T')[0] })
          .eq('id', existingMembership.id);
        
        if (endError) throw endError;
      }

      // Create new membership
      const { data: newMembership, error: createError } = await supabase
        .from('team_memberships')
        .insert([{
          team_id: teamId,
          player_id: playerId,
          role,
          start_date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Get team name for the response
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
      
      if (teamError) throw teamError;
      
      // Return membership with team name
      return {
        ...newMembership,
        team: {
          name: team.name
        }
      };
    } catch (err) {
      throw this.handleMembershipError(err);
    }
  }

  async removeMember(membershipId: string): Promise<void> {
    try {
      if (!this.isValidUUID(membershipId)) {
        throw new Error('Ungültige Mitgliedschafts-ID');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Check user permissions first
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.role) {
        throw new Error('Benutzerrolle konnte nicht ermittelt werden');
      }

      const allowedRoles = ['admin', 'coach', 'manager'];
      if (!allowedRoles.includes(userProfile.role)) {
        throw new Error('Sie haben keine Berechtigung, Teammitglieder zu verwalten');
      }

      const { error } = await supabase
        .from('team_memberships')
        .update({ end_date: new Date().toISOString().split('T')[0] })
        .eq('id', membershipId);
      
      if (error) throw error;
    } catch (err) {
      throw this.handleMembershipError(err);
    }
  }

  async removePlayerFromTeam(playerId: string): Promise<void> {
    try {
      if (!this.isValidUUID(playerId)) {
        throw new Error('Ungültige Spieler ID');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Check user permissions first
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.role) {
        throw new Error('Benutzerrolle konnte nicht ermittelt werden');
      }

      const allowedRoles = ['admin', 'coach', 'manager'];
      if (!allowedRoles.includes(userProfile.role)) {
        throw new Error('Sie haben keine Berechtigung, Teammitglieder zu verwalten');
      }

      // Find active membership
      const { data: memberships, error: findError } = await supabase
        .from('team_memberships')
        .select('id')
        .eq('player_id', playerId)
        .is('end_date', null);
      
      if (findError) throw findError;
      
      if (!memberships || memberships.length === 0) {
        throw new Error('Spieler ist keinem Team zugewiesen');
      }

      // End the membership
      const { error: updateError } = await supabase
        .from('team_memberships')
        .update({ end_date: new Date().toISOString().split('T')[0] })
        .eq('id', memberships[0].id);
      
      if (updateError) throw updateError;
    } catch (err) {
      throw this.handleMembershipError(err);
    }
  }

  async uploadTeamPhoto(teamId: string, file: File): Promise<string> {
    try {
      if (!this.isValidUUID(teamId)) {
        throw new Error('Ungültige Team ID');
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Generate unique filename with team ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      const { data: team } = await supabase
        .from('teams')
        .select('photo_url')
        .eq('id', teamId)
        .single();

      if (team?.photo_url) {
        const oldFileName = team.photo_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('teams')
            .remove([oldFileName]);
        }
      }

      // Use the centralized storage utility to upload the file
      const publicUrl = await uploadFileToSupabaseStorage(
        'teams',
        session.user.id,
        file,
        {
          fileName,
          validateFileType: true,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maxSizeBytes: 5 * 1024 * 1024 // 5MB
        }
      );

      // Update team record with new photo URL
      const { error: updateError } = await supabase
        .from('teams')
        .update({ photo_url: publicUrl })
        .eq('id', teamId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (err) {
      throw this.handleTeamError(err);
    }
  }

  // Helper method to check if user can manage team members
  async canManageTeamMembers(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !userProfile?.role) return false;

      const allowedRoles = ['admin', 'coach', 'manager'];
      return allowedRoles.includes(userProfile.role);
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[0-9+() -]{8,}$/.test(phone);
  }
}