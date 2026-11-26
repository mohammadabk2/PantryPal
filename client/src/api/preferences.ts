import { apiFetch } from './client'

// Mirrors TagGroup / PreferenceOptions in backend/app/schemas/preferences.py
export interface TagGroup {
  name: string
  tags: string[]
}

export interface PreferenceOptions {
  dietary_restrictions: string[]
  tag_groups: TagGroup[]
}

// Mirrors PreferencesRead in backend/app/schemas/preferences.py
export interface Preferences {
  dietary_restrictions: string[]
  tag_weights: Record<string, number>
  feature_weights: Record<string, number>
}

// Weight saved when a user picks a tag they like. Weights go from -1 to 1;
// starting at 0.5 leaves room for ratings to push it up or down later.
export const LIKED_TAG_WEIGHT = 0.5

export function getPreferenceOptions() {
  return apiFetch<PreferenceOptions>('/preferences/options')
}

export function getPreferences() {
  return apiFetch<Preferences>('/me/preferences')
}

export function setTagWeight(tag: string, weight: number) {
  return apiFetch<{ tag: string; weight: number }>(`/me/preferences/tags/${encodeURIComponent(tag)}`, {
    method: 'PUT',
    body: { weight },
  })
}

export function deleteTagWeight(tag: string) {
  return apiFetch<void>(`/me/preferences/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' })
}

/** Tags the user likes (positive weight), e.g. to pre-select them in <TagPicker>. */
export function likedTags(preferences: Preferences): Set<string> {
  return new Set(
    Object.entries(preferences.tag_weights)
      .filter(([, weight]) => weight > 0)
      .map(([tag]) => tag),
  )
}

/**
 * Saves a <TagPicker> selection: newly picked tags are liked, unpicked ones are removed.
 * Tags in both sets are left alone, so weights learned from ratings aren't overwritten.
 */
export async function saveLikedTags(before: Set<string>, after: Set<string>) {
  const added = [...after].filter((tag) => !before.has(tag))
  const removed = [...before].filter((tag) => !after.has(tag))
  await Promise.all([
    ...added.map((tag) => setTagWeight(tag, LIKED_TAG_WEIGHT)),
    ...removed.map((tag) => deleteTagWeight(tag)),
  ])
}
