import React, { useEffect, useRef, useState } from 'react';
import './styles/index.css';
import logo from './assets/images/header/Lolo_tunk_1.svg';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const initialText = "Сайт на ремонте!\n\nВсе запросы на почту — t.project5585@gmail.com\n\n2026 <3 =)";
const warningText = "Хватит тыкать!\nНеси проекты!";

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
  const [initialSize, setInitialSize] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);
  const [text, setText] = useState(initialText);
  const [caretIndex, setCaretIndex] = useState(0);
  const [greenTriggered, setGreenTriggered] = useState(false);
  const greenClickCount = useRef(0);
  const greenClickTimer = useRef(null);
  const typingTimer = useRef(null);
  const backspaceTimer = useRef(null);
  const isAnimating = useRef(false);
  const animationToken = useRef(0);

  useEffect(() => {
    const node = resizableRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const startSize = {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };

    const centerX = Math.round((window.innerWidth - rect.width) / 2);
    const centerY = Math.round((window.innerHeight - rect.height) / 2);
    const startPosition = { x: centerX, y: centerY };

    setSize(startSize);
    setPosition(startPosition);
    setInitialSize(startSize);
    setInitialPosition(startPosition);
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
      const maxWidth = Math.max(320, window.innerWidth - 96);
      const maxHeight = Math.max(360, window.innerHeight - 96);
      setSize({ width: maxWidth, height: maxHeight });
      setPosition({ x: 48, y: 48 });
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

  useEffect(() => () => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    if (backspaceTimer.current) clearInterval(backspaceTimer.current);
    if (greenClickTimer.current) clearTimeout(greenClickTimer.current);
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
      setSize({ width: Math.max(320, window.innerWidth - 96), height: Math.max(360, window.innerHeight - 96) });
      setPosition({ x: 48, y: 48 });
      setIsMaximized(true);
    } else {
      if (restoreSize) setSize(restoreSize);
      if (restorePosition) setPosition(restorePosition);
      setIsMaximized(false);
    }
  };

  const stopAnimation = () => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    if (backspaceTimer.current) clearInterval(backspaceTimer.current);
    if (greenClickTimer.current) clearTimeout(greenClickTimer.current);
    typingTimer.current = null;
    backspaceTimer.current = null;
    greenClickTimer.current = null;
    isAnimating.current = false;
    animationToken.current += 1;
  };

  const resetToInitial = () => {
    if (!initialSize || !initialPosition) return;
    stopAnimation();
    greenClickCount.current = 0;
    setSize(initialSize);
    setPosition(initialPosition);
    setIsMaximized(false);
    setText(initialText);
    setCaretIndex(0);
    setGreenTriggered(false);
  };

  const animateTextReplace = (nextText) => {
    stopAnimation();
    isAnimating.current = true;
    const token = animationToken.current;

    backspaceTimer.current = setInterval(() => {
      if (animationToken.current !== token) return;
      setText((prev) => {
        if (prev.length <= 0) {
          clearInterval(backspaceTimer.current);
          let index = 0;
          typingTimer.current = setInterval(() => {
            if (animationToken.current !== token) return;
            index += 1;
            setText(nextText.slice(0, index));
            if (index >= nextText.length) {
              clearInterval(typingTimer.current);
              isAnimating.current = false;
            }
          }, 35);
          return '';
        }
        return prev.slice(0, -1);
      });
    }, 18);
  };

  const handleGreenClick = () => {
    if (greenTriggered || isAnimating.current) return;
    greenClickCount.current += 1;
    if (greenClickTimer.current) clearTimeout(greenClickTimer.current);
    greenClickTimer.current = setTimeout(() => {
      greenClickCount.current = 0;
    }, 600);

    if (greenClickCount.current >= 3) {
      greenClickCount.current = 0;
      setGreenTriggered(true);
      animateTextReplace(warningText);
    }
  };

  const handleTextChange = (event) => {
    if (isAnimating.current) return;
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
              <button
                type="button"
                className="control-dot control-button"
                aria-label="Сбросить размер"
                onClick={resetToInitial}
              />
              <button
                type="button"
                className="control-dot control-button"
                aria-label={isMaximized ? 'Восстановить' : 'Развернуть'}
                onClick={toggleMaximize}
              />
              <button
                type="button"
                className="control-dot control-button"
                aria-label="Пасхалка"
                onClick={handleGreenClick}
              />
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
