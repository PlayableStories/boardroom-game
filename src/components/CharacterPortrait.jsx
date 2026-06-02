export default function CharacterPortrait({ character }) {
  if (!character) return null
  const background = `var(--char-${character.id})`
  return (
    <div className="character-portrait">
      <div className="character-avatar" style={{ background }}>
        {character.initials}
      </div>
      <div className="character-text">
        <div className="character-name">{character.name}</div>
        <div className="character-role">{character.role}</div>
      </div>
    </div>
  )
}
