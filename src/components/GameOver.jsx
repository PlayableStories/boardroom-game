import { useGameStore } from '../store/gameStore'
import content from '../lib/content.js'

export default function GameOver() {
  const status = useGameStore((s) => s.status)
  const reason = useGameStore((s) => s.gameOverReason)
  const cardIndex = useGameStore((s) => s.cardIndex)
  const resetGame = useGameStore((s) => s.resetGame)

  if (status !== 'game_over' || !reason) return null

  const lasted =
    cardIndex === 1
      ? content.ui.youLastedSingular
      : content.ui.youLastedPlural.replace('{n}', cardIndex)

  return (
    <div className="game-over-overlay" role="dialog" aria-modal="true">
      <div className="game-over-card">
        <h2 className="game-over-name">{reason.name}</h2>
        <p className="game-over-epitaph">{reason.epitaph}</p>
        <p className="game-over-count">{lasted}</p>
        <button className="game-over-button" onClick={() => resetGame()}>
          {content.ui.playAgain}
        </button>
      </div>
    </div>
  )
}
