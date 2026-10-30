import { useState } from "react";
import { Chess } from "chess.js";

const SAMPLE_SAN = [
  "e4", "e5", "Nf3", "Nc6", "Bb5", "a6",
  "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5",
];

const SAMPLE_GAME = (() => {
  const chess = new Chess();
  const positions = [chess.fen()];
  const moves = [];

  for (const san of SAMPLE_SAN) {
    const move = chess.move(san);
    moves.push({ san: move.san, from: move.from, to: move.to });
    positions.push(chess.fen());
  }

  return { positions, moves };
})();

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PIECES = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
const PIECE_NAMES = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};
const MOVE_NOTES = [
  "White’s e-pawn claims central space and opens lines for the queen and bishop.",
  "Black contests the center with the e-pawn.",
  "The knight develops and puts pressure on Black’s e-pawn.",
  "Black develops a knight and supports the central pawn.",
  "The bishop pins the knight to the king’s side of the board.",
  "Black challenges the bishop and prepares to expand on the queenside.",
  "The bishop keeps pressure on the center from a safer square.",
  "Black develops a knight and adds support to the central position.",
  "White castles, bringing the king to safety and connecting the rooks.",
  "Black develops the bishop and prepares to castle.",
  "The rook moves to the open e-file, supporting White’s central play.",
  "Black gains queenside space and asks the bishop to decide where to go.",
];

function Board({ fen, lastMove }) {
  const rows = new Chess(fen).board();

  return (
    <div className="board" role="grid" aria-label="Sample chessboard">
      {rows.map((row, rowIndex) => (
        <div className="board-row" role="row" key={`row-${rowIndex}`}>
          {row.map((piece, fileIndex) => {
            const square = `${FILES[fileIndex]}${8 - rowIndex}`;
            const isLight = (rowIndex + fileIndex) % 2 === 0;
            const isLastMove =
              lastMove && (square === lastMove.from || square === lastMove.to);
            const pieceName = piece
              ? `${piece.color === "w" ? "white" : "black"} ${PIECE_NAMES[piece.type]}`
              : "empty";

            return (
              <div
                className={[
                  "square",
                  isLight ? "light" : "dark",
                  isLastMove ? "last-move" : "",
                ].filter(Boolean).join(" ")}
                role="gridcell"
                aria-label={`${square}, ${pieceName}`}
                key={square}
              >
                {piece ? (
                  <span className={`piece ${piece.color === "w" ? "white-piece" : "black-piece"}`}>
                    {PIECES[piece.color][piece.type]}
                  </span>
                ) : null}
                {fileIndex === 0 ? (
                  <span className="coordinate" aria-hidden="true">{8 - rowIndex}</span>
                ) : null}
                {rowIndex === 7 ? (
                  <span className="coordinate file-coordinate" aria-hidden="true">
                    {FILES[fileIndex]}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [ply, setPly] = useState(0);
  const currentMove = ply > 0 ? SAMPLE_GAME.moves[ply - 1] : null;
  const note = ply > 0
    ? MOVE_NOTES[ply - 1]
    : "Choose a move to see a prepared teaching note for that position.";

  function moveLabel(index) {
    const number = Math.ceil(index / 2);
    return `${number}${index % 2 === 1 ? "." : "..."} ${SAMPLE_GAME.moves[index - 1].san}`;
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Move Learner home">
          <span className="brand-mark" aria-hidden="true">♞</span>
          <span>Move Learner</span>
        </a>
        <span className="preview-tag">Classroom preview</span>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">A chess study experience in progress</p>
          <h1 id="page-title">Play through the game. Pause on a move.</h1>
          <p className="intro-copy">
            This small React preview demonstrates how Move Learner will help
            players revisit a game and think about their choices.
          </p>
        </section>

        <p className="notice" role="note">
          <strong>Sample only:</strong> This page uses a built-in game and prepared
          notes. It does not sign in, import or save games, run Stockfish, or call AI.
        </p>

        <section className="study-layout" aria-label="Interactive sample study">
          <article className="card board-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Sample game</p>
                <h2>Ruy Lopez</h2>
              </div>
              <span className="status-tag">Prepared line</span>
            </div>

            <Board
              fen={SAMPLE_GAME.positions[ply]}
              lastMove={currentMove}
            />

            <div className="board-controls">
              <div className="button-group">
                <button
                  className="control-button"
                  type="button"
                  onClick={() => setPly(value => Math.max(0, value - 1))}
                  disabled={ply === 0}
                  aria-label="Go to previous position"
                >
                  ← Previous
                </button>
                <button
                  className="control-button primary-control"
                  type="button"
                  onClick={() => setPly(value => Math.min(SAMPLE_GAME.moves.length, value + 1))}
                  disabled={ply === SAMPLE_GAME.moves.length}
                  aria-label="Go to next position"
                >
                  Next →
                </button>
              </div>
              <p className="position-status" aria-live="polite">
                {ply === 0
                  ? "Starting position"
                  : `After ${moveLabel(ply)}`}
              </p>
            </div>

            <nav className="move-list" aria-label="Choose a move">
              {SAMPLE_GAME.moves.map((move, index) => {
                const movePly = index + 1;
                return (
                  <button
                    className="move-button"
                    type="button"
                    key={`${movePly}-${move.san}`}
                    onClick={() => setPly(movePly)}
                    aria-current={ply === movePly ? "step" : undefined}
                    aria-label={`Show position after ${moveLabel(movePly)}`}
                  >
                    {moveLabel(movePly)}
                  </button>
                );
              })}
            </nav>
          </article>

          <aside className="card note-card" aria-labelledby="note-heading">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Move-focused learning</p>
                <h2 id="note-heading">Sample teaching note</h2>
              </div>
              <span className="note-icon" aria-hidden="true">✦</span>
            </div>

            <div className="selected-move">
              <span>Selected position</span>
              <strong>{currentMove ? moveLabel(ply) : "Starting position"}</strong>
            </div>

            <p className="note-copy" aria-live="polite">{note}</p>
            <p className="note-footnote">
              In the full app, engine evidence and guided coaching will be separate
              features. This note is written for the classroom sample.
            </p>
          </aside>
        </section>

        <section className="feature-strip" aria-label="Preview features">
          <article className="feature-card">
            <span aria-hidden="true">01</span>
            <h2>See the position</h2>
            <p>The board updates as you move through the sample game.</p>
          </article>
          <article className="feature-card">
            <span aria-hidden="true">02</span>
            <h2>Choose a move</h2>
            <p>Use the controls or move list to revisit a specific moment.</p>
          </article>
          <article className="feature-card">
            <span aria-hidden="true">03</span>
            <h2>Consider an idea</h2>
            <p>A prepared note follows the selected move in this prototype.</p>
          </article>
        </section>
      </main>

      <footer>
        Move Learner classroom preview · Sample content only
      </footer>
    </div>
  );
}
