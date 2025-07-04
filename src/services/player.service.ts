import { supabase, handleDatabaseError, testDatabaseConnection } from './database';
import { Player, defaultSkills, PlayerSkill } from '../types/player';
import { uploadFileToSupabaseStorage } from '../utils/storageUtils';

export class PlayerService {
  private static instance: PlayerService | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  
  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
      }

      this.initialized = true;
    } catch (err) {
      this.initialized = false;
      throw err;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
      this.initPromise = null;
    }
  }

  async getPlayers(): Promise<Player[]> {
    try {
      await this.ensureInitialized();
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          team_memberships (
            id,
            team_id,
            role,
            start_date,
            end_date,
            teams:team_id (
              id,
              name
            )
          )
        `)
        .order('last_name');
      
      if (error) throw error;
      return (data || []).map(player => this.parsePlayerData(player));
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getPlayer(id: string): Promise<Player | null> {
    try {
      await this.ensureInitialized();
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          team_memberships (
            id,
            team_id,
            role,
            start_date,
            end_date,
            teams:team_id (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return this.parsePlayerData(data);
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    try {
      await this.ensureInitialized();

      // Validate and format date
      const dateOfBirth = player.dateOfBirth?.trim() 
        ? new Date(player.dateOfBirth).toISOString().split('T')[0]
        : null;

      const { data, error } = await supabase
        .from('players')
        .insert([{
          first_name: player.firstName.trim(),
          last_name: player.lastName.trim(),
          position: player.position?.trim() || null,
          date_of_birth: dateOfBirth,
          email: player.email?.trim() || null,
          phone: player.phone?.trim() || null,
          skills: player.skills || defaultSkills
        }])
        .select()
        .single();

      if (error) throw error;
      return this.parsePlayerData(data);
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    try {
      await this.ensureInitialized();

      // Validate and format date
      const dateOfBirth = updates.dateOfBirth?.trim() 
        ? new Date(updates.dateOfBirth).toISOString().split('T')[0]
        : null;

      const updateData: any = {
        first_name: updates.firstName?.trim(),
        last_name: updates.lastName?.trim(),
        position: updates.position?.trim() || null,
        date_of_birth: dateOfBirth,
        email: updates.email?.trim() || null,
        phone: updates.phone?.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Only include defined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      if (updates.skills) {
        const validatedSkills = this.validateSkills(updates.skills);
        updateData.skills = validatedSkills;
      }

      if (updates.photoUrl !== undefined) {
        updateData.photo_url = updates.photoUrl;
      }

      if (updates.height !== undefined) {
        updateData.height = updates.height;
      }

      if (updates.weight !== undefined) {
        updateData.weight = updates.weight;
      }

      if (updates.strongFoot !== undefined) {
        updateData.strong_foot = updates.strongFoot;
      }

      const { data, error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.parsePlayerData(data);
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async deletePlayer(id: string): Promise<void> {
    try {
      await this.ensureInitialized();

      // Delete old photo if exists
      const { data: player } = await supabase
        .from('players')
        .select('photo_url')
        .eq('id', id)
        .single();

      if (player?.photo_url) {
        const fileName = player.photo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('players')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async uploadPlayerPhoto(playerId: string, file: File): Promise<string> {
    try {
      await this.ensureInitialized();

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Generate unique filename with player ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `players/${playerId}-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      const { data: player } = await supabase
        .from('players')
        .select('photo_url')
        .eq('id', playerId)
        .single();

      if (player?.photo_url) {
        const oldFileName = player.photo_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('players')
            .remove([`players/${oldFileName}`]);
        }
      }

      // Use the centralized storage utility to upload the file
      const publicUrl = await uploadFileToSupabaseStorage(
        'players',
        file,
        {
          path: fileName,
          validateFileType: true,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maxSizeBytes: 5 * 1024 * 1024 // 5MB
        }
      );

      // Update player record with new photo URL
      const { error: updateError } = await supabase
        .from('players')
        .update({ photo_url: publicUrl })
        .eq('id', playerId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async mergePlayers(masterPlayer: Player, duplicatePlayers: Player[]): Promise<Player> {
    try {
      await this.ensureInitialized();
      
      // Execute operations sequentially without explicit transaction management
      // Supabase will handle individual operation consistency
      
      // 1. Update the master player with the merged data
      const { data: updatedMaster, error: updateError } = await supabase
        .from('players')
        .update({
          first_name: masterPlayer.firstName,
          last_name: masterPlayer.lastName,
          position: masterPlayer.position || null,
          date_of_birth: masterPlayer.dateOfBirth || null,
          email: masterPlayer.email || null,
          phone: masterPlayer.phone || null,
          skills: masterPlayer.skills || defaultSkills,
          updated_at: new Date().toISOString()
        })
        .eq('id', masterPlayer.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // 2. For each duplicate player, update related records to point to the master player
      for (const duplicatePlayer of duplicatePlayers) {
        // Update evaluations
        const { error: evalError } = await supabase
          .from('evaluations')
          .update({ player_id: masterPlayer.id })
          .eq('player_id', duplicatePlayer.id);
        
        if (evalError) throw evalError;
        
        // Update notes
        const { error: notesError } = await supabase
          .from('notes')
          .update({ player_id: masterPlayer.id })
          .eq('player_id', duplicatePlayer.id);
        
        if (notesError) throw notesError;
        
        // Update player_history
        const { error: historyError } = await supabase
          .from('player_history')
          .update({ player_id: masterPlayer.id })
          .eq('player_id', duplicatePlayer.id);
        
        if (historyError) throw historyError;
        
        // Handle team memberships - only transfer if master player doesn't have an active membership
        const { data: masterMemberships } = await supabase
          .from('team_memberships')
          .select('*')
          .eq('player_id', masterPlayer.id)
          .is('end_date', null);
        
        if (!masterMemberships || masterMemberships.length === 0) {
          // Master has no active membership, so we can transfer active memberships from duplicate
          const { error: membershipError } = await supabase
            .from('team_memberships')
            .update({ player_id: masterPlayer.id })
            .eq('player_id', duplicatePlayer.id)
            .is('end_date', null);
          
          if (membershipError) throw membershipError;
        } else {
          // Master already has an active membership, so end any active memberships from duplicate
          const { error: endMembershipError } = await supabase
            .from('team_memberships')
            .update({ end_date: new Date().toISOString().split('T')[0] })
            .eq('player_id', duplicatePlayer.id)
            .is('end_date', null);
          
          if (endMembershipError) throw endMembershipError;
        }
        
        // Transfer inactive memberships
        const { error: inactiveMembershipError } = await supabase
          .from('team_memberships')
          .update({ player_id: masterPlayer.id })
          .eq('player_id', duplicatePlayer.id)
          .not('end_date', 'is', null);
        
        if (inactiveMembershipError) throw inactiveMembershipError;
        
        // Delete the duplicate player
        const { error: deleteError } = await supabase
          .from('players')
          .delete()
          .eq('id', duplicatePlayer.id);
        
        if (deleteError) throw deleteError;
      }
      
      return this.parsePlayerData(updatedMaster);
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async deletePlayers(playerIds: string[]): Promise<void> {
    try {
      await this.ensureInitialized();
      
      // Delete players one by one to handle photo deletion properly
      for (const id of playerIds) {
        await this.deletePlayer(id);
      }
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  private validateSkills(skills: PlayerSkill[]): PlayerSkill[] {
    return skills.map(skill => ({
      name: skill.name,
      value: Math.max(0, Math.min(20, skill.value)),
      category: skill.category,
      weight: skill.weight
    }));
  }

  private parsePlayerData(data: any): Player {
    // Parse team memberships
    const teamMemberships = data.team_memberships?.map((tm: any) => ({
      id: tm.id,
      teamId: tm.team_id,
      role: tm.role,
      startDate: tm.start_date,
      endDate: tm.end_date
    })) || [];

    // Find active team membership (where end_date is null)
    const activeTeamMembership = teamMemberships.find((tm: any) => !tm.endDate);
    
    // Extract team name from active membership if it exists
    let teamName = null;
    let teamId = null;
    
    if (activeTeamMembership) {
      const teamData = data.team_memberships?.find((tm: any) => 
        tm.id === activeTeamMembership.id && tm.teams
      )?.teams;
      
      if (teamData) {
        teamName = teamData.name;
        teamId = teamData.id;
      }
    }

    // Parse skills with validation
    const skills = Array.isArray(data.skills) ? data.skills : defaultSkills;

    return {
      id: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      position: data.position || '',
      dateOfBirth: data.date_of_birth || null,
      photoUrl: data.photo_url || null,
      email: data.email || null,
      phone: data.phone || null,
      height: data.height || null,
      weight: data.weight || null,
      strongFoot: data.strong_foot || null,
      skills,
      teamMemberships,
      teamId,
      teamName,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}