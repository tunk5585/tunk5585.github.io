import React from 'react';
import './styles/notepad.css';
import appLogo from './assets/images/header/Lolo_tunk_1.svg';

const App = () => {
  return (
    <div className="notepad-app">
      <div className="notepad-window" role="application" aria-label="Блокнот">
        <div className="notepad-titlebar">
          <div className="notepad-title">
            <img className="notepad-icon" src={appLogo} alt="Логотип" />
            <span>Блокнот</span>
          </div>
          <div className="notepad-controls" aria-hidden="true">
            <span className="control control-minimize" />
            <span className="control control-maximize" />
            <span className="control control-close" />
          </div>
        </div>
        <div className="notepad-menubar" role="menubar" aria-label="Меню">
          <button type="button" role="menuitem">Файл</button>
          <button type="button" role="menuitem">Правка</button>
          <button type="button" role="menuitem">Вид</button>
          <button type="button" role="menuitem">Справка</button>
        </div>
        <div className="notepad-editor">
          <textarea
            readOnly
            aria-label="Текстовый блокнот"
            defaultValue="думаем, размышляем, работаем.."
          />
        </div>
      </div>
    </div>
  );
};

export default App;
