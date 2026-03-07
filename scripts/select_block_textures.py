#!/usr/bin/env python3
"""Interactive block texture selector with tkinter GUI.

Displays each texture from the texture pack one-by-one, letting you
accept or deny it for inclusion in public/blocks/. Progress is saved
to a JSON state file so you can quit and resume later.

Keyboard shortcuts:
    y / Enter  - Accept texture
    n          - Deny texture
    z          - Undo last decision
    q          - Quit and save progress

Usage:
    python scripts/select_block_textures.py
"""

import json
import shutil
import tkinter as tk
from pathlib import Path

from PIL import Image, ImageTk

PROJECT_ROOT = Path(__file__).parent.parent
SOURCE_DIR = PROJECT_ROOT / "texture_pack" / "assets" / "minecraft" / "textures" / "block"
DEST_DIR = PROJECT_ROOT / "public" / "blocks"
STATE_FILE = Path(__file__).parent / ".select_progress.json"

PREVIEW_SIZE = 256


def load_state() -> dict:
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"accepted": [], "denied": []}


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def finalize(state: dict) -> None:
    """Clear public/blocks/ and copy all accepted textures."""
    if DEST_DIR.exists():
        shutil.rmtree(DEST_DIR)
    DEST_DIR.mkdir(parents=True)

    for name in state["accepted"]:
        src = SOURCE_DIR / name
        if src.exists():
            shutil.copy2(src, DEST_DIR / name)

    # Clean up state file
    STATE_FILE.unlink(missing_ok=True)

    print(f"Done! Copied {len(state['accepted'])} textures to {DEST_DIR}")
    print(f"Denied {len(state['denied'])} textures.")


class TextureSelector:
    def __init__(self, all_files: list[str], state: dict) -> None:
        self.all_files = all_files
        self.state = state
        self.total = len(all_files)

        # Build list of unreviewed textures
        reviewed = set(state["accepted"]) | set(state["denied"])
        self.queue = [f for f in all_files if f not in reviewed]
        self.queue_index = 0

        # Undo stack: list of (filename, decision) tuples
        self.undo_stack: list[tuple[str, str]] = []

        self.root = tk.Tk()
        self.root.title("Block Texture Selector")
        self.root.configure(bg="#1e1e2e")
        self.root.resizable(False, False)

        # Header label
        self.header = tk.Label(
            self.root, text="", font=("monospace", 14),
            bg="#1e1e2e", fg="#cdd6f4",
        )
        self.header.pack(pady=(16, 8))

        # Texture preview
        self.canvas = tk.Label(self.root, bg="#313244", relief="flat")
        self.canvas.pack(padx=32, pady=8)

        # Button frame
        btn_frame = tk.Frame(self.root, bg="#1e1e2e")
        btn_frame.pack(pady=(8, 16))

        self.accept_btn = tk.Button(
            btn_frame, text="Accept (y)", command=self.accept,
            bg="#a6e3a1", fg="#1e1e2e", font=("monospace", 12),
            width=12, relief="flat", cursor="hand2",
        )
        self.accept_btn.pack(side="left", padx=8)

        self.deny_btn = tk.Button(
            btn_frame, text="Deny (n)", command=self.deny,
            bg="#f38ba8", fg="#1e1e2e", font=("monospace", 12),
            width=12, relief="flat", cursor="hand2",
        )
        self.deny_btn.pack(side="left", padx=8)

        self.undo_btn = tk.Button(
            btn_frame, text="Undo (z)", command=self.undo,
            bg="#89b4fa", fg="#1e1e2e", font=("monospace", 12),
            width=12, relief="flat", cursor="hand2",
        )
        self.undo_btn.pack(side="left", padx=8)

        # Keybindings
        self.root.bind("y", lambda e: self.accept())
        self.root.bind("<Return>", lambda e: self.accept())
        self.root.bind("n", lambda e: self.deny())
        self.root.bind("z", lambda e: self.undo())
        self.root.bind("q", lambda e: self.quit_save())
        self.root.protocol("WM_DELETE_WINDOW", self.quit_save)

        # Keep a reference to prevent GC
        self._photo = None

        self.show_current()

    def reviewed_count(self) -> int:
        return len(self.state["accepted"]) + len(self.state["denied"])

    def current_file(self) -> str | None:
        if self.queue_index < len(self.queue):
            return self.queue[self.queue_index]
        return None

    def show_current(self) -> None:
        filename = self.current_file()
        if filename is None:
            self.finish()
            return

        count = self.reviewed_count() + 1
        self.header.config(text=f"{filename}    ({count} / {self.total})")

        img = Image.open(SOURCE_DIR / filename)
        img = img.resize(
            (PREVIEW_SIZE, PREVIEW_SIZE), resample=Image.NEAREST,
        )
        self._photo = ImageTk.PhotoImage(img)
        self.canvas.config(image=self._photo)

    def accept(self) -> None:
        filename = self.current_file()
        if filename is None:
            return
        self.state["accepted"].append(filename)
        self.undo_stack.append((filename, "accepted"))
        self.queue_index += 1
        self.show_current()

    def deny(self) -> None:
        filename = self.current_file()
        if filename is None:
            return
        self.state["denied"].append(filename)
        self.undo_stack.append((filename, "denied"))
        self.queue_index += 1
        self.show_current()

    def undo(self) -> None:
        if not self.undo_stack:
            return
        filename, decision = self.undo_stack.pop()
        self.state[decision].remove(filename)
        self.queue_index -= 1
        self.show_current()

    def quit_save(self) -> None:
        save_state(self.state)
        reviewed = self.reviewed_count()
        print(f"Progress saved: {reviewed} / {self.total} reviewed")
        print(f"  Accepted: {len(self.state['accepted'])}")
        print(f"  Denied: {len(self.state['denied'])}")
        print(f"  Remaining: {self.total - reviewed}")
        self.root.destroy()

    def finish(self) -> None:
        self.root.destroy()
        finalize(self.state)

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    if not SOURCE_DIR.exists():
        raise SystemExit(f"Error: source directory not found at {SOURCE_DIR}")

    all_files = sorted(p.name for p in SOURCE_DIR.glob("*.png"))
    if not all_files:
        raise SystemExit(f"No PNG files found in {SOURCE_DIR}")

    state = load_state()
    reviewed = set(state["accepted"]) | set(state["denied"])
    remaining = len(all_files) - len(reviewed)

    if remaining == 0:
        print("All textures already reviewed. Finalizing...")
        finalize(state)
        return

    if reviewed:
        print(f"Resuming: {len(reviewed)} reviewed, {remaining} remaining")
    else:
        print(f"Starting fresh: {len(all_files)} textures to review")

    selector = TextureSelector(all_files, state)
    selector.run()


if __name__ == "__main__":
    main()
