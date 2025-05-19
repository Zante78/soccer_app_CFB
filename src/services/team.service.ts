import { supabase, handleDatabaseError } from './database';
import { Team, TeamMembership } from '../types/core/team';
import { EventBus } from './events/EventBus';

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
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw this.handleMembershipError(err);
    }
  }

  async uploadTeamPhoto(teamId: string, file: File): Promise<string> {
    try {
      if (!this.isValidUUID(teamId)) {
        throw new Error('Ungültige Team ID');
      }

      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        throw new Error('Nur JPEG, PNG und GIF Dateien sind erlaubt');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Die Datei darf maximal 5MB groß sein');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('teams')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('teams')
        .getPublicUrl(fileName);

      // Update team record with new photo URL
      const { error: updateError } = await supabase
        .from('teams')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', teamId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    } catch (err) {
      throw this.handleTeamError(err);
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[0-9+() -]{8,}$/.test(phone);
  }
}