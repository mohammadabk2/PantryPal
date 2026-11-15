import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPreferenceOptions, type TagGroup } from '../api/preferences'
import en from '../locales/en/translation.json'

type TagKey = keyof typeof en.tags
type GroupKey = keyof typeof en.tagGroups

interface TagPickerProps {
  /** Selected tags. */
  value: Set<string>
  /** Called with the new selection whenever a tag is toggled. */
  onChange: (next: Set<string>) => void
  /** Focus the first tag once the list loads. */
  autoFocus?: boolean
  /** id of the element that describes this picker (e.g. a question heading). */
  labelledBy?: string
}

/**
 * Lets the user pick tags they like, as tappable chips grouped by type.
 * Loads the choices from the server; saving is up to the parent (see saveLikedTags).
 *
 *   const [tags, setTags] = useState(new Set<string>())
 *   <TagPicker value={tags} onChange={setTags} />
 */
function TagPicker({ value, onChange, autoFocus = false, labelledBy }: TagPickerProps) {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<TagGroup[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0) // bump to retry loading
  const firstChip = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let cancelled = false
    getPreferenceOptions()
      .then((options) => {
        if (!cancelled) setGroups(options.tag_groups)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  useEffect(() => {
    if (autoFocus && groups) firstChip.current?.focus()
  }, [autoFocus, groups])

  // A tag the client has no translation for yet still shows, as readable text.
  const tagLabel = (tag: string) =>
    tag in en.tags ? t(`tags.${tag as TagKey}`) : tag.replaceAll('_', ' ')
  const groupLabel = (name: string) =>
    name in en.tagGroups ? t(`tagGroups.${name as GroupKey}`) : name.replaceAll('_', ' ')

  function toggle(tag: string) {
    const next = new Set(value)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)
    onChange(next)
  }

  if (failed) {
    return (
      <div className="tag-picker-status">
        <p className="form-error" role="alert">
          {t('tagPicker.loadFailed')}
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFailed(false)
            setAttempt((a) => a + 1)
          }}
        >
          {t('tagPicker.retry')}
        </button>
      </div>
    )
  }

  if (!groups) {
    return (
      <p className="tag-picker-status" aria-live="polite">
        {t('tagPicker.loading')}
      </p>
    )
  }

  return (
    <div className="tag-picker" role="group" aria-labelledby={labelledBy}>
      {groups.map((group, groupIndex) => (
        <div key={group.name} role="group" aria-labelledby={`tag-group-${group.name}`}>
          <h3 id={`tag-group-${group.name}`} className="tag-group-title">
            {groupLabel(group.name)}
          </h3>
          <div className="chips">
            {group.tags.map((tag, tagIndex) => (
              <button
                key={tag}
                ref={groupIndex === 0 && tagIndex === 0 ? firstChip : undefined}
                type="button"
                className="chip"
                aria-pressed={value.has(tag)}
                onClick={() => toggle(tag)}
              >
                {tagLabel(tag)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TagPicker
