import React, { useEffect, useRef, useState } from 'react';
import './styles/index.css';
import logo from './assets/images/header/Lolo_tunk_1.svg';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const initialText = "Сайт на ремонте!\n\nВсе запросы на почту — t.project5585@gmail.com\n\n2026 <3 =)";

const getCaretPosition = (text, index) => {
  const before = text.slice(0, index);
  const lines = before.split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
};

const App = () => {
  const resizableRef = useRef(null);
  const textareaRef = useRef(null);
  const [size, setSize] = useState({ width: 920, height: 520 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [restoreSize, setRestoreSize] = useState(null);
  const [restorePosition, setRestorePosition] = useState(null);
  const [text, setText] = useState(initialText);
  const [caretIndex, setCaretIndex] = useState(0);

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
    const media = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMaximized) return;
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMaximized]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!event.target.closest('.menu-group')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    setCaretIndex(el.selectionStart || 0);
  }, []);

  const startResize = (direction) => (event) => {
    if (isMobile || isMaximized) return;
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
    if (isMobile || isMaximized) return;
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

      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;

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

  const toggleMaximize = () => {
    if (isMobile) return;
    if (!isMaximized) {
      setRestoreSize(size);
      setRestorePosition(position);
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    } else {
      if (restoreSize) setSize(restoreSize);
      if (restorePosition) setPosition(restorePosition);
      setIsMaximized(false);
    }
  };

  const handleTextChange = (event) => {
    const nextText = event.target.value;
    setText(nextText);
    setCaretIndex(event.target.selectionStart || 0);
  };

  const handleCaretUpdate = (event) => {
    setCaretIndex(event.target.selectionStart || 0);
  };

  const { line, column } = getCaretPosition(text, caretIndex);
  const totalLines = text.split('\n').length;

  return (
    <div className="page">
      <div
        className="notepad-resizable"
        ref={resizableRef}
        style={
          isMobile
            ? { width: '100%', height: 'auto', position: 'static' }
            : {
                width: `${size.width}px`,
                height: `${size.height}px`,
                left: `${position.x}px`,
                top: `${position.y}px`,
                position: 'absolute'
              }
        }
      >
        <div className="notepad-shell">
          <header className="titlebar" onPointerDown={startDrag}>
            <div className="title-left">
              <img className="app-logo" src={logo} alt="TUNK5585 logo" />
              <span className="app-title">tunk5585</span>
            </div>
            <div className="window-controls">
              <button type="button" className="control-dot control-button" aria-label="Закрыть" />
              <button
                type="button"
                className="control-dot control-button"
                aria-label={isMaximized ? 'Восстановить' : 'Развернуть'}
                onClick={toggleMaximize}
              />
              <button type="button" className="control-dot control-button" aria-label="Свернуть" />
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
                ref={textareaRef}
                className="paper-input"
                value={text}
                onChange={handleTextChange}
                onClick={handleCaretUpdate}
                onKeyUp={handleCaretUpdate}
                onSelect={handleCaretUpdate}
                aria-label="Текст"
                spellCheck={false}
              />
            </div>
          </main>

          <footer className="statusbar" aria-label="Статус">
            <div className="status-left">Готово · {totalLines} строк</div>
            <div className="status-right">UTF-8 · Строка {line}, Столбец {column}</div>
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
