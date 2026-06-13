import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private db: DatabaseService) {}

  async getSearchAnalytics() {
    // Get last 7 days of search events
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const searches = await this.db.searchEvent.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'asc' }
    });

    // Group by day
    const grouped = searches.reduce((acc, curr) => {
      const dateStr = curr.createdAt.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, successful: 0, failed: 0 };
      }
      if (curr.success) acc[dateStr].successful++;
      else acc[dateStr].failed++;
      return acc;
    }, {} as Record<string, { date: string; successful: number; failed: number }>);

    // If no data, fill some dummy baseline points so Recharts renders a pretty empty graph instead of collapsing
    const result = Object.values(grouped);
    if (result.length === 0) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push({
          date: d.toISOString().split('T')[0],
          successful: 0,
          failed: 0,
        });
      }
    }

    return result;
  }
}
