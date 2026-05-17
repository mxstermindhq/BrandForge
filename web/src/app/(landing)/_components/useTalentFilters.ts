"use client";

import { create } from "zustand";

export const CATEGORY_FILTERS = ["all", "ai-automation", "web-apps", "design", "growth", "data", "web3"] as const;
export const AVAILABILITY_FILTERS = ["all", "available-now", "available", "limited"] as const;
export const SORT_FILTERS = ["default", "amanah", "years"] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number];
export type SortFilter = (typeof SORT_FILTERS)[number];

type TalentFilterState = {
  category: CategoryFilter;
  availability: AvailabilityFilter;
  sort: SortFilter;
  setCategory: (value: CategoryFilter) => void;
  setAvailability: (value: AvailabilityFilter) => void;
  setSort: (value: SortFilter) => void;
  hydrate: (payload: { category: CategoryFilter; availability: AvailabilityFilter; sort: SortFilter }) => void;
};

export const useTalentFilters = create<TalentFilterState>((set) => ({
  category: "all",
  availability: "all",
  sort: "default",
  setCategory: (value) => set({ category: value }),
  setAvailability: (value) => set({ availability: value }),
  setSort: (value) => set({ sort: value }),
  hydrate: (payload) => set(payload),
}));
