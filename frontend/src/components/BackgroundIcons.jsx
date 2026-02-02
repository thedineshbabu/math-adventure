/**
 * Background Icons Component
 * SVG icons for floating background decorations
 */

import React from 'react';

// SVG Icon Components
const MathIcons = {
  pencil: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/>
    </svg>
  ),
  ruler: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5 18l-1.5-1.5v-9l1.5-1.5h1v12h-1zm-4 0H3.5l-1.5-1.5v-9L3.5 5h13v13zm-11-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V6h-2v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V6h-2v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V6h-2v2z"/>
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7zm0 2c2.8 0 5 2.2 5 5 0 1.8-1 3.4-2.5 4.2V16h-5v-2.8C8 12.4 7 10.8 7 9c0-2.8 2.2-5 5-5z"/>
      <circle cx="9" cy="9" r="1"/>
      <circle cx="15" cy="9" r="1"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 13H5v-2h14v2z"/>
    </svg>
  ),
  multiply: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  ),
  divide: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="6" r="1.5"/>
      <rect x="5" y="11" width="14" height="2" rx="1"/>
      <circle cx="12" cy="18" r="1.5"/>
    </svg>
  ),
  numbers: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 21H3v-4.5h4.5V21zm0-6H3v-4.5h4.5V15zm0-6H3V4.5h4.5V9zm6 12h-4.5v-4.5H13.5V21zm0-6h-4.5v-4.5H13.5V15zm0-6h-4.5V4.5H13.5V9zm6 12H15v-4.5h4.5V21zm0-6H15v-4.5h4.5V15zm0-6H15V4.5h4.5V9z"/>
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
    </svg>
  ),
  abacus: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
};

// Array of icon keys for background decorations
export const BG_ICONS = [
  'pencil', 'ruler', 'brain', 'book', 'calculator', 
  'plus', 'minus', 'multiply', 'divide', 'numbers',
  'lightbulb', 'abacus', 'chart', 'star'
];

// Background Decorations Component
export const BackgroundDecorations = () => (
  <div className="bg-decorations">
    {BG_ICONS.map((iconKey, i) => (
      <span key={i} className="bg-icon" aria-hidden="true">
        {MathIcons[iconKey]}
      </span>
    ))}
  </div>
);

export default BackgroundDecorations;
