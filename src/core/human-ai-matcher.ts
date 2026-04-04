export interface SpecialistProfile {
  id: string;
  role: string;
  verticals: string[];
  rating: number;
  aiFluency: number;
}

export interface MatchRequest {
  vertical: string;
  role: string;
  priority: 'speed' | 'quality' | 'balanced';
}

export class HumanAiMatcher {
  match(
    request: MatchRequest,
    specialists: SpecialistProfile[],
  ): SpecialistProfile[] {
    return [...specialists]
      .filter(
        (specialist) =>
          specialist.role === request.role &&
          specialist.verticals.includes(request.vertical),
      )
      .sort((a, b) => this.score(request, b) - this.score(request, a));
  }

  private score(request: MatchRequest, specialist: SpecialistProfile): number {
    const qualityWeight = request.priority === 'quality' ? 0.7 : 0.5;
    const speedWeight = request.priority === 'speed' ? 0.7 : 0.5;
    return specialist.rating * qualityWeight + specialist.aiFluency * speedWeight;
  }
}
