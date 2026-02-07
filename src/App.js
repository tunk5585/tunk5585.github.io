import React, { useEffect, useRef, useState } from 'react';
import './styles/index.css';
import logo from './assets/images/header/Lolo_tunk_1.svg';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const App = () => {
  const resizableRef = useRef(null);
  const [size, setSize] = useState({ width: 920, height: 520 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const node = resizableRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    setSize({
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });

    const centerX = Math.round((window.innerWidth - rect.width) / 2);
    const centerY = Math.round((window.innerHeight - rect.height) / 2);
    setPosition({ x: centerX, y: centerY });
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!event.target.closest('.menu-group')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const startResize = (direction) => (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startSize = { ...size };
    const startPos = { ...position };

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const rawWidth = startSize.width + (direction.includes('e') ? dx : 0) - (direction.includes('w') ? dx : 0);
      const rawHeight = startSize.height + (direction.includes('s') ? dy : 0) - (direction.includes('n') ? dy : 0);

      const nextWidth = clamp(rawWidth, 320, 1200);
      const nextHeight = clamp(rawHeight, 360, 900);

      let nextX = startPos.x;
      let nextY = startPos.y;

      if (direction.includes('w')) {
        const rightEdge = startPos.x + startSize.width;
        nextX = rightEdge - nextWidth;
      }

      if (direction.includes('n')) {
        const bottomEdge = startPos.y + startSize.height;
        nextY = bottomEdge - nextHeight;
      }

      const maxX = window.innerWidth - nextWidth;
      const maxY = window.innerHeight - nextHeight;
      nextX = clamp(nextX, 0, Math.max(0, maxX));
      nextY = clamp(nextY, 0, Math.max(0, maxY));

      setSize({ width: nextWidth, height: nextHeight });
      setPosition({ x: nextX, y: nextY });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const toggleMenu = (key) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const startDrag = (event) => {
    if (event.target.closest('.window-controls')) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...position };

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const maxX = window.innerWidth - size.width - 16;
      const maxY = window.innerHeight - size.height - 16;

      const nextX = clamp(startPos.x + dx, 0, Math.max(0, maxX));
      const nextY = clamp(startPos.y + dy, 0, Math.max(0, maxY));

      setPosition({ x: nextX, y: nextY });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="page">
      <div
        className="notepad-resizable"
        ref={resizableRef}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: 'absolute'
        }}
      >
        <div className="notepad-shell">
          <header className="titlebar" onPointerDown={startDrag}>
            <div className="title-left">
              <img className="app-logo" src={logo} alt="TUNK5585 logo" />
              <span className="app-title">tunk5585 - портфолио</span>
            </div>
            <div className="window-controls" aria-hidden="true">
              <span className="control-dot" />
              <span className="control-dot" />
              <span className="control-dot" />
            </div>
          </header>

          <nav className="menubar" aria-label="Меню">
            {[
              { key: 'file', label: 'Файл', count: 5 },
              { key: 'edit', label: 'Правка', count: 3 },
              { key: 'view', label: 'Вид', count: 4 },
              { key: 'help', label: 'Справка', count: 5 }
            ].map((item) => (
              <div className="menu-group" key={item.key}>
                <button
                  type="button"
                  className="menu-item"
                  aria-haspopup="menu"
                  aria-expanded={openMenu === item.key}
                  onClick={() => toggleMenu(item.key)}
                >
                  {item.label}
                </button>
                {openMenu === item.key && (
                  <div className="menu-dropdown" role="menu">
                    {Array.from({ length: item.count }).map((_, index) => (
                      <button
                        key={`${item.key}-${index}`}
                        type="button"
                        role="menuitem"
                        className="menu-action"
                      >
                        Ремонт!
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <main className="editor" role="main">
            <div className="paper">
              <textarea
                className="paper-input"
                defaultValue={"Ремонт!\n\nВсе запросы на почту — t.project5585@gmail.com\n\n2026 <3 =)"}
                aria-label="Текст"
                spellCheck={false}
              />
            </div>
          </main>

          <footer className="statusbar" aria-label="Статус">
            <div className="status-left">Готово</div>
            <div className="status-right">UTF-8 · Строка 1, Столбец 28</div>
          </footer>
        </div>

        <span className="resize-handle handle-n" onPointerDown={startResize('n')} />
        <span className="resize-handle handle-e" onPointerDown={startResize('e')} />
        <span className="resize-handle handle-s" onPointerDown={startResize('s')} />
        <span className="resize-handle handle-w" onPointerDown={startResize('w')} />
        <span className="resize-handle handle-ne" onPointerDown={startResize('ne')} />
        <span className="resize-handle handle-se" onPointerDown={startResize('se')} />
        <span className="resize-handle handle-sw" onPointerDown={startResize('sw')} />
        <span className="resize-handle handle-nw" onPointerDown={startResize('nw')} />
      </div>
    </div>
  );
};

export default App;
