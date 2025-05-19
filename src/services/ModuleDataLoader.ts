import { TeamService } from './team.service';
import { PlayerService } from './player.service';
import { StatisticsService } from './statistics.service';
import { NotesService } from './notes.service';
import { HistoryService } from './history.service';
import { ExportService } from './export.service';
import { MessageService } from './message.service';
import { AnalysisService } from './analysis.service';

export class ModuleDataLoader {
  private static instance: ModuleDataLoader;

  private constructor() {}

  public static getInstance(): ModuleDataLoader {
    if (!ModuleDataLoader.instance) {
      ModuleDataLoader.instance = new ModuleDataLoader();
    }
    return ModuleDataLoader.instance;
  }

  async loadModuleData(moduleId: string, params: Record<string, any> = {}) {
    try {
      switch (moduleId) {
        case 'statistics':
          return await this.loadStatisticsData(params.playerId);
        case 'notes':
          return await this.loadNotesData(params.playerId);
        case 'history':
          return await this.loadHistoryData(params.playerId);
        case 'export':
          return await this.loadExportData(params.userId);
        case 'team':
          return await this.loadTeamData(params.teamId);
        case 'messages':
          return await this.loadMessageData(params.userId);
        case 'analysis':
          return await this.loadAnalysisData(params.playerId);
        default:
          throw new Error(`Unbekanntes Modul: ${moduleId}`);
      }
    } catch (error) {
      console.error(`Fehler beim Laden von Modul ${moduleId}:`, error);
      throw error;
    }
  }

  private async loadStatisticsData(playerId: string) {
    const service = new StatisticsService();
    return await service.getPlayerStatistics(playerId);
  }

  private async loadNotesData(playerId: string) {
    const service = NotesService.getInstance();
    return await service.getPlayerNotes(playerId);
  }

  private async loadHistoryData(playerId: string) {
    const service = HistoryService.getInstance();
    return await service.getPlayerHistory(playerId);
  }

  private async loadExportData(userId: string) {
    const service = ExportService.getInstance();
    return await service.getUserExportJobs(userId);
  }

  private async loadTeamData(teamId: string) {
    const service = TeamService.getInstance();
    return await service.getTeamMembers(teamId);
  }

  private async loadMessageData(userId: string) {
    const service = MessageService.getInstance();
    return await service.getConversations(userId);
  }

  private async loadAnalysisData(playerId: string) {
    const service = new AnalysisService();
    return await service.getPlayerMetrics(playerId);
  }
}