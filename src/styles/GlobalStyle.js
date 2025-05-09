import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, html {
    user-select: none;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none;    /* Firefox */
    -ms-user-select: none;     /* Internet Explorer/Edge */
  }

  /* Разрешаем выделение для всех стандартных элементов ввода и текстовых областей */
  input,
  textarea {
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
  }
  
  /* Для элементов с contenteditable (например, в WYSIWYG редакторах), если они используются */
  [contenteditable="true"] {
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
  }
`;

export default GlobalStyle; 